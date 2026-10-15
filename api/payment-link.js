// GET /api/payment-link?course=<course id>
// The Stripe payment link for a course, as set in /admin -> Payment links.
//   200 { url }    404 when no link is set    503 when Supabase is not set up
const { getSupabase } = require("./_lib/supabase");
const { isCourseId } = require("./_lib/paymentLinks");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const course = String(req.query?.course || "");
  if (!isCourseId(course)) {
    return res.status(400).json({ message: "Unknown course" });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ message: "Payments are not configured" });
  }

  const { data, error } = await supabase
    .from("course_payment_links")
    .select("url")
    .eq("course_id", course)
    .maybeSingle();

  if (error) {
    console.error("payment-link:", error.message || error);
    return res.status(500).json({ message: "Could not load the payment link" });
  }

  // Short CDN cache: an edit in the admin shows up within half a minute.
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=30, stale-while-revalidate=30");
  if (!data) return res.status(404).json({ message: "No payment link for this course yet" });
  return res.status(200).json({ url: data.url });
};
