// /api/admin/submissions — enquiries for the admin dashboard.
//
//   GET    ?q=&status=&source=&delivery=&period=&page=   one page of rows + total
//   GET    ...same filters...&format=csv                 every matching row as CSV
//   PATCH  { id, status }                                 change follow-up status
//
// Admin-only (api/_lib/adminAuth.js). Reads with the service role key, which
// is the only key Row Level Security lets through.
const { getSupabase } = require("../_lib/supabase");
const { readBody, requireAdmin, requireJson } = require("../_lib/adminAuth");

const STATUSES = ["new", "contacted", "paid", "enrolled", "closed"];
const SOURCES = ["contact-page", "home-modal", "course-enrollment"];
const PERIOD_DAYS = { today: 0, "7d": 7, "30d": 30, "90d": 90 };
const PAGE_SIZE = 25;
const CSV_LIMIT = 5000;

const BASE_COLUMNS =
  "id, created_at, name, email, number, message, service, source, enrolment, " +
  "status, updated_at, email_sent, email_error, acknowledged, ip, user_agent";
const COLUMNS =
  BASE_COLUMNS + ", payment_status, paid_at, amount_paid, payment_currency, stripe_session_id";
const PAYMENTS = ["paid", "failed", "expired"];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// The search term goes into a PostgREST or=() filter, where commas,
// parentheses and quotes are syntax, and % and * are wildcards. Strip them
// so the term is matched literally and cannot alter the filter.
function searchTerm(raw) {
  return String(raw || "")
    .replace(/[,()"'\\%*:]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

function periodStart(period) {
  if (!Object.hasOwn(PERIOD_DAYS, period)) return null;
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  start.setUTCDate(start.getUTCDate() - PERIOD_DAYS[period]);
  return start.toISOString();
}

function applyFilters(query, params) {
  const q = searchTerm(params.q);
  if (q) {
    const like = `%${q}%`;
    query = query.or(
      `name.ilike.${like},email.ilike.${like},number.ilike.${like},message.ilike.${like}`
    );
  }
  if (STATUSES.includes(params.status)) query = query.eq("status", params.status);
  if (SOURCES.includes(params.source)) query = query.eq("source", params.source);
  if (params.delivery === "failed") query = query.eq("email_sent", false);
  if (PAYMENTS.includes(params.payment)) query = query.eq("payment_status", params.payment);
  // Enrolments that have not reached a payment outcome yet.
  if (params.payment === "pending") {
    query = query.eq("source", "course-enrollment").is("payment_status", null);
  }
  const since = periodStart(params.period);
  if (since) query = query.gte("created_at", since);
  return query;
}

// Visitor-typed text opened in Excel: a cell starting with = + - @ is run as
// a formula. Prefix those with an apostrophe so they display as text.
function csvCell(value) {
  if (value === null || value === undefined) return "";
  let text = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(rows) {
  const header = [
    "Received (UTC)", "Name", "Email", "Phone", "Service", "Source", "Status",
    "Course", "Experience", "Batch", "Notes", "Message",
    "Email sent", "Acknowledged", "Email error",
    "Payment", "Paid at (UTC)", "Amount paid", "Currency", "Stripe session",
  ];
  const lines = rows.map((r) =>
    [
      r.created_at, r.name, r.email, r.number, r.service, r.source, r.status,
      r.enrolment?.course, r.enrolment?.experience, r.enrolment?.batch, r.enrolment?.notes,
      r.message, r.email_sent, r.acknowledged, r.email_error,
      r.payment_status, r.paid_at,
      r.amount_paid === null || r.amount_paid === undefined ? "" : r.amount_paid / 100,
      r.payment_currency, r.stripe_session_id,
    ]
      .map(csvCell)
      .join(",")
  );
  // The BOM makes Excel read the file as UTF-8, so names keep their accents.
  return "\uFEFF" + [header.join(","), ...lines].join("\r\n");
}

// Runs the query with the payment columns, and again without them if the
// database predates migration 0006, so the dashboard keeps working while that
// migration is pending. Payment filters need the columns, so they still fail.
async function withColumns(build) {
  const result = await build(COLUMNS);
  if (result.error?.code === "42703") return build(BASE_COLUMNS);
  return result;
}

async function list(req, res) {
  const params = req.query || {};
  const supabase = getSupabase();

  if (params.format === "csv") {
    const { data, error } = await withColumns((columns) =>
      applyFilters(supabase.from("contact_submissions").select(columns), params)
        .order("created_at", { ascending: false })
        .limit(CSV_LIMIT)
    );
    if (error) throw error;
    const day = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="url-enquiries-${day}.csv"`);
    return res.status(200).send(toCsv(data));
  }

  const page = Math.max(1, Math.min(10000, parseInt(params.page, 10) || 1));
  const from = (page - 1) * PAGE_SIZE;
  const { data, error, count } = await withColumns((columns) =>
    applyFilters(supabase.from("contact_submissions").select(columns, { count: "exact" }), params)
      .order("created_at", { ascending: false })
      .range(from, from + PAGE_SIZE - 1)
  );
  // Asking for a page past the end is a 416 from PostgREST; treat it as empty.
  if (error && error.code !== "PGRST103") throw error;

  return res.status(200).json({
    rows: data || [],
    total: count || 0,
    page,
    pageSize: PAGE_SIZE,
  });
}

async function updateStatus(req, res, user) {
  if (!requireJson(req, res)) return;
  const body = readBody(req);
  const id = String(body.id || "");
  const status = String(body.status || "");
  if (!UUID.test(id) || !STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid id or status." });
  }

  const { data, error } = await getSupabase()
    .from("contact_submissions")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, status, updated_at")
    .maybeSingle();
  if (error) throw error;
  if (!data) return res.status(404).json({ message: "Enquiry not found." });

  console.log(`admin: ${user.email} set ${id} to ${status}`);
  return res.status(200).json(data);
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "PATCH") {
    res.setHeader("Allow", "GET, PATCH");
    return res.status(405).json({ message: "Method not allowed" });
  }
  const user = await requireAdmin(req, res);
  if (!user) return;

  try {
    return req.method === "GET" ? await list(req, res) : await updateStatus(req, res, user);
  } catch (error) {
    console.error("admin/submissions:", error.message || error);
    // 42703 = undefined column: the status migration has not been applied.
    const hint =
      error.code === "42703"
        ? " Apply the latest supabase/migrations (0004 and 0006)."
        : "";
    return res.status(500).json({ message: `Could not load enquiries.${hint}` });
  }
};
