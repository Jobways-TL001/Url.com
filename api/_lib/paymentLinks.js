// Shared rules for the per-course Stripe payment links stored in
// public.course_payment_links (supabase/migrations/0005_course_payment_links.sql).

const COURSE_ID = /^[a-z0-9-]{1,60}$/;

// Only Stripe-hosted pages are accepted, so the /payment page can never be
// pointed at a look-alike checkout. buy.stripe.com is where Payment Links
// live; checkout.stripe.com and donate.stripe.com are Stripe's other hosted
// payment pages.
const STRIPE_HOSTS = new Set(["buy.stripe.com", "checkout.stripe.com", "donate.stripe.com"]);

function isCourseId(value) {
  return COURSE_ID.test(String(value || ""));
}

// Returns the cleaned URL, or null if it is not an https Stripe link.
function cleanStripeUrl(value) {
  let url;
  try {
    url = new URL(String(value || "").trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || !STRIPE_HOSTS.has(url.hostname)) return null;
  if (url.username || url.password) return null;
  return url.toString().slice(0, 500);
}

module.exports = { isCourseId, cleanStripeUrl };
