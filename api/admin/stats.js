// GET /api/admin/stats — headline counts for the admin dashboard.
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
