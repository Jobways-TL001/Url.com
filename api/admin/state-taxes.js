// /api/admin/state-taxes — per-state W2 cost inputs (admin -> State tax).
//
//   GET                  { rates: { [stateCode]: { hoursPerMonth, payRate,
//                          employeeTax, employerTax, companyMargin, updatedAt } } }
//   PUT { state, hoursPerMonth, payRate, employeeTax, employerTax, companyMargin }
//                        save one state's row; all-empty values remove it
//
// Taxes are percentages; pay rate (per hour) and payable to vendor
// (companyMargin / company_margin) are US dollars. Each value may be null (not filled in yet). Admin-only (api/_lib/adminAuth.js).
const { getSupabase } = require("../_lib/supabase");
const { readBody, requireAdmin, requireJson } = require("../_lib/adminAuth");

const TABLE = "state_tax_rates";

// The 50 states plus DC — the same list as src/constants/usStates.js.
const STATE_CODES = new Set(
  (
    "AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS " +
    "MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY"
  ).split(" ")
);

// Request field -> column, with the allowed range and a label for errors.
const FIELDS = {
  hoursPerMonth: { column: "hours_per_month", min: 0, max: 744, label: "Hours per month" },
  payRate: { column: "pay_rate", min: 0, max: 100000, label: "Pay rate" },
  employeeTax: { column: "employee_tax_pct", min: 0, max: 100, label: "Employee tax" },
  employerTax: { column: "employer_tax_pct", min: 0, max: 100, label: "Employer tax" },
  companyMargin: { column: "company_margin", min: 0, max: 1000000, label: "Payable to Vendor" },
  // state_tax_pct (migration 0010) is no longer shown or edited in the admin;
  // it is left out here so saving a row does not blank stored values.
};

const COLUMNS = ["state_code", ...Object.values(FIELDS).map((f) => f.column), "updated_at"].join(", ");

function failure(res, error) {
  console.error("admin/state-taxes:", error.message || error);
  // 42P01 / PGRST205 = undefined table: the migration has not been applied.
  const hint =
    error.code === "42P01" || error.code === "PGRST205" || error.code === "42703" || error.code === "PGRST204"
      ? " Apply supabase/migrations/0009_state_tax_rates.sql and 0010_state_tax_margin_usd.sql."
      : "";
  return res.status(500).json({ message: `Could not load or save state tax rates.${hint}` });
}

// PostgREST may return numeric columns as strings; hand the page numbers.
function toNumber(value) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toClient(row) {
  const out = { updatedAt: row.updated_at };
  for (const [key, { column }] of Object.entries(FIELDS)) out[key] = toNumber(row[column]);
  return out;
}

async function list(res) {
  const { data, error } = await getSupabase().from(TABLE).select(COLUMNS);
  if (error) return failure(res, error);
  const rates = {};
  for (const row of data) rates[row.state_code] = toClient(row);
  return res.status(200).json({ rates });
}

async function save(req, res, user) {
  if (!requireJson(req, res)) return;
  const body = readBody(req);
  const state = String(body.state || "").toUpperCase();
  if (!STATE_CODES.has(state)) return res.status(400).json({ message: "Unknown state." });

  // Empty means "not filled in"; anything else must be a number in range.
  const values = {};
  for (const [key, { column, min, max, label }] of Object.entries(FIELDS)) {
    const raw = body[key];
    if (raw === null || raw === undefined || String(raw).trim() === "") {
      values[column] = null;
      continue;
    }
    const n = Number(raw);
    if (!Number.isFinite(n) || n < min || n > max) {
      return res.status(400).json({ message: `${label} must be between ${min} and ${max}.` });
    }
    values[column] = Math.round(n * 1000) / 1000;
  }

  const supabase = getSupabase();

  if (Object.values(values).every((v) => v === null)) {
    const { error } = await supabase.from(TABLE).delete().eq("state_code", state);
    if (error) return failure(res, error);
    console.log(`admin: ${user.email} cleared state tax rates for ${state}`);
    return res.status(200).json({ state, rate: null });
  }

  const { data, error } = await supabase
    .from(TABLE)
    .upsert({
      state_code: state,
      ...values,
      updated_at: new Date().toISOString(),
      updated_by: user.email,
    })
    .select(COLUMNS)
    .single();
  if (error) return failure(res, error);

  console.log(`admin: ${user.email} saved state tax rates for ${state}`);
  return res.status(200).json({ state, rate: toClient(data) });
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
