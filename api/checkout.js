// GET /api/checkout?enquiry=<enquiry id> — send the learner to Stripe to pay
// their course fee.
//
// For a US state with a fee in /admin -> State tax, this creates a Stripe
// Checkout Session for exactly that fee (api/_lib/courseFee.js), worked out
// here from the state saved with the enquiry — never from anything the
// browser sends. The session carries the enquiry id as client_reference_id,
// so api/stripe-webhook.js can match the payment to the enrolment.
//
// This is the only way to pay online. Outside the US, for a state with no
// fee yet, or with STRIPE_SECRET_KEY not set, it sends the learner back to
// /payment, which says the team will confirm the fee and payment by email.
// Used by the Pay button on /payment and by the "complete your payment"
// link in the webhook's emails.
const { getSupabase } = require("./_lib/supabase");
const { courseFeeOf } = require("./_lib/courseFee");
const { US_STATES, stateCodeOf } = require("./_lib/usStates");
const { SITE_URL } = require("./_lib/emailTemplate");

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Send the learner back to the site they came from (the Vercel domain or
// url.com).
function siteOf(req) {
  const host = String(req.headers?.["x-forwarded-host"] || req.headers?.host || "");
  return /^[a-z0-9.-]+(:\d+)?$/i.test(host) ? `https://${host}` : SITE_URL;
}

function redirect(res, url) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Location", url);
  return res.status(303).end();
}

async function stateFee(supabase, code) {
  const { data, error } = await supabase
    .from("state_tax_rates")
    .select("pay_rate, hours_per_month, employer_tax_pct, company_margin")
    .eq("state_code", code)
    .maybeSingle();
  if (error) throw error;
  return data ? courseFeeOf(data) : null;
}

async function createSession({ key, enquiry, code, fee, site }) {
  const courseId = enquiry.enrolment.courseId || "";
  const form = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": "usd",
    "line_items[0][price_data][unit_amount]": String(Math.round(fee * 100)),
    "line_items[0][price_data][product_data][name]": enquiry.enrolment.course || "URL course",
    "line_items[0][price_data][product_data][description]": `Course fee — ${US_STATES[code]}`,
    client_reference_id: enquiry.id,
    success_url: `${site}/payment/success`,
    cancel_url: `${site}/payment?course=${encodeURIComponent(courseId)}`,
    "metadata[source]": "state-fee",
    "metadata[enquiry_id]": enquiry.id,
    "metadata[course_id]": courseId,
    "metadata[state]": code,
  });
  if (enquiry.email) form.set("customer_email", enquiry.email);

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.url) {
    throw new Error(data?.error?.message || `Stripe responded ${response.status}`);
  }
  return data.url;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }
  const site = siteOf(req);
  const id = String(req.query?.enquiry || "");
  const supabase = getSupabase();
  if (!supabase || !UUID.test(id)) return redirect(res, `${site}/courses`);

  const { data: enquiry, error } = await supabase
    .from("contact_submissions")
    .select("id, email, enrolment, payment_status")
    .eq("id", id)
    .maybeSingle();
  if (error) console.error("checkout: enquiry lookup failed:", error.message || error);
  if (!enquiry?.enrolment) return redirect(res, `${site}/courses`);
  if (enquiry.payment_status === "paid") return redirect(res, `${site}/payment/success`);

  const coursePage = `${site}/payment?course=${encodeURIComponent(enquiry.enrolment.courseId || "")}`;
  const key = process.env.STRIPE_SECRET_KEY;
  const code = stateCodeOf(enquiry.enrolment);

  try {
    const fee = key && code ? await stateFee(supabase, code) : null;
    if (fee) {
      const url = await createSession({ key, enquiry, code, fee, site });
      console.log(`checkout: ${enquiry.id} ${code} ${fee.toFixed(2)} USD`);
      return redirect(res, url);
    }
    // No fee for this enrolment's state (or Stripe not set up): back to
    // /payment, which explains that the team will follow up.
    return redirect(res, coursePage);
  } catch (err) {
    console.error("checkout:", err.message || err);
    return redirect(res, `${coursePage}&checkout=error`);
  }
};
