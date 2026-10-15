// /api/admin/payment-links — per-course Stripe payment links.
//
//   GET                       { links: { [courseId]: { url, updated_at } } }
//   PUT { course, url }       set a course's link; an empty url removes it
//
// Admin-only (api/_lib/adminAuth.js).
const { getSupabase } = require("../_lib/supabase");
const { readBody, requireAdmin, requireJson } = require("../_lib/adminAuth");
const { isCourseId, cleanStripeUrl } = require("../_lib/paymentLinks");

const TABLE = "course_payment_links";

function failure(res, error) {
  console.error("admin/payment-links:", error.message || error);
  // 42P01 = undefined table: the migration has not been applied.
  const hint =
    error.code === "42P01" || error.code === "PGRST205"
      ? " Apply supabase/migrations/0005_course_payment_links.sql."
      : "";
  return res.status(500).json({ message: `Could not save payment links.${hint}` });
}

async function list(res) {
  const { data, error } = await getSupabase().from(TABLE).select("course_id, url, updated_at");
  if (error) return failure(res, error);
  const links = {};
  for (const row of data) links[row.course_id] = { url: row.url, updated_at: row.updated_at };
  return res.status(200).json({ links });
}

async function save(req, res, user) {
  if (!requireJson(req, res)) return;
  const body = readBody(req);
  const course = String(body.course || "");
  if (!isCourseId(course)) return res.status(400).json({ message: "Unknown course." });

  const supabase = getSupabase();

  if (!String(body.url || "").trim()) {
    const { error } = await supabase.from(TABLE).delete().eq("course_id", course);
    if (error) return failure(res, error);
    console.log(`admin: ${user.email} removed the payment link for ${course}`);
    return res.status(200).json({ course, url: null, updated_at: null });
  }

  const url = cleanStripeUrl(body.url);
  if (!url) {
    return res.status(400).json({
      message: "Enter a Stripe link starting with https://buy.stripe.com/",
    });
  }

  const { data, error } = await supabase
    .from(TABLE)
    .upsert({ course_id: course, url, updated_at: new Date().toISOString() })
    .select("course_id, url, updated_at")
    .single();
  if (error) return failure(res, error);

  console.log(`admin: ${user.email} set the payment link for ${course}`);
  return res.status(200).json({ course, url: data.url, updated_at: data.updated_at });
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "PUT") {
    res.setHeader("Allow", "GET, PUT");
    return res.status(405).json({ message: "Method not allowed" });
  }
  const user = await requireAdmin(req, res);
  if (!user) return;
  try {
    return req.method === "GET" ? await list(res) : await save(req, res, user);
  } catch (error) {
    return failure(res, error);
  }
};
