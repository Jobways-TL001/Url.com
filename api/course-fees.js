// GET /api/course-fees — the course fee in each US state, for the public
// course pages and enrolment form.
//   200 { fees: { [stateCode]: number }, min, max, checkout }
//
// Only the final fee leaves the server: pay rates, taxes and margins stay in
// /admin -> State tax. States without enough data are left out. The fee is
// the same for every course (api/_lib/courseFee.js has the formula).
//
// `checkout` says whether Stripe can charge these fees yet (api/checkout.js
// needs STRIPE_SECRET_KEY). Until it can, the payment page offers no Pay
// button and the team follows up by email.
const { getSupabase } = require("./_lib/supabase");
const { courseFeeOf } = require("./_lib/courseFee");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ message: "Course fees are not configured" });

  const { data, error } = await supabase
    .from("state_tax_rates")
    .select("state_code, pay_rate, hours_per_month, employer_tax_pct, company_margin");
  if (error) {
    console.error("course-fees:", error.message || error);
    return res.status(500).json({ message: "Could not load course fees" });
  }

  const fees = {};
  for (const row of data) {
    const fee = courseFeeOf(row);
    if (fee !== null) fees[row.state_code] = fee;
  }
  const values = Object.values(fees);

  // Very short CDN cache, so a value saved in /admin -> State tax reaches the
  // course pages within about ten seconds (checkout always prices from the
  // database directly).
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=10");
  return res.status(200).json({
    fees,
    min: values.length ? Math.min(...values) : null,
    max: values.length ? Math.max(...values) : null,
    checkout: Boolean(process.env.STRIPE_SECRET_KEY),
  });
};
