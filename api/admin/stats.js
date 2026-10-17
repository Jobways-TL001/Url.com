// GET /api/admin/stats — headline counts for the admin dashboard.
//   ?view=payments  totals for /admin/payments instead: paid / failed /
//                   not completed / awaiting payment counts, and revenue.
const { getSupabase } = require("../_lib/supabase");
const { requireAdmin } = require("../_lib/adminAuth");

// head: true returns only the count, not the rows.
function count(build) {
  return build(
    getSupabase().from("contact_submissions").select("id", { count: "exact", head: true })
  ).then(({ count: n, error }) => {
    if (error) throw error;
    return n || 0;
  });
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }
  const user = await requireAdmin(req, res);
  if (!user) return;

  if (req.query?.view === "payments") return paymentStats(res);

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const [total, fresh, lastWeek, enrolments, failed, paid] = await Promise.all([
      count((q) => q),
      count((q) => q.eq("status", "new")),
      count((q) => q.gte("created_at", weekAgo)),
      count((q) => q.eq("source", "course-enrollment")),
      count((q) => q.eq("email_sent", false)),
      // Missing column (migration 0006 not applied yet) reads as zero rather
      // than breaking the whole dashboard.
      count((q) => q.eq("payment_status", "paid")).catch(() => 0),
    ]);
    return res.status(200).json({ total, new: fresh, lastWeek, enrolments, failed, paid });
  } catch (error) {
    console.error("admin/stats:", error.message || error);
    const hint =
      error.code === "42703"
        ? " Apply the latest supabase/migrations (0004 and 0006)."
        : "";
    return res.status(500).json({ message: `Could not load stats.${hint}` });
  }
};

// Revenue is summed here rather than in SQL: PostgREST has no SUM without a
// database function, and enrolment volume is small. Grouped by currency in
// case Stripe ever charges in more than one.
async function paymentStats(res) {
  try {
    const [paid, failed, expired, pending, rows] = await Promise.all([
      count((q) => q.eq("payment_status", "paid")),
      count((q) => q.eq("payment_status", "failed")),
      count((q) => q.eq("payment_status", "expired")),
      count((q) => q.eq("source", "course-enrollment").is("payment_status", null)),
      getSupabase()
        .from("contact_submissions")
        .select("amount_paid, payment_currency")
        .eq("payment_status", "paid")
        .limit(10000)
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        }),
    ]);
    const revenue = {};
    for (const r of rows) {
      const cur = String(r.payment_currency || "usd").toLowerCase();
      revenue[cur] = (revenue[cur] || 0) + (Number(r.amount_paid) || 0);
    }
    return res.status(200).json({ paid, failed, expired, pending, revenue });
  } catch (error) {
    console.error("admin/stats payments:", error.message || error);
    const hint = error.code === "42703" ? " Apply supabase/migrations/0006_payments.sql." : "";
    return res.status(500).json({ message: `Could not load payment totals.${hint}` });
  }
}
