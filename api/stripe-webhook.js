// POST /api/stripe-webhook — Stripe tells us how a payment ended.
//
// How we know: Stripe sends an event to this URL whenever a checkout made
// from one of our payment links changes state. Each request is signed with
// STRIPE_WEBHOOK_SECRET (Stripe Dashboard -> Developers -> Webhooks), so a
// forged "payment succeeded" is rejected. The /payment page attached the
// enquiry id as client_reference_id, which ties the payment to the learner.
//
// Events handled (subscribe to exactly these in Stripe):
//   checkout.session.completed               card payments: paid
//   checkout.session.async_payment_succeeded delayed methods: paid later
//   checkout.session.async_payment_failed    delayed methods: failed
//   checkout.session.expired                 opened checkout, never paid
//
// For each outcome the learner gets a branded email and the team a plain
// notification; the enquiry row records payment_status (see migration 0006),
// and a paid enrolment moves to status "paid" in /admin automatically.
//
// A declined card does not end a checkout: the learner stays on Stripe's page
// and can try another card, so declines are not emailed one by one. If they
// give up, the session expires (Stripe's default is 24 hours) and the
// "payment not completed" email goes out then, with a link to finish.
const crypto = require("crypto");
const { getSupabase } = require("./_lib/supabase");
const { logoAttachment } = require("./_lib/brand");
const {
  MAIL_TO,
  MAIL_FROM,
  headerSafe,
  createTransporter,
  sendWithRetry,
  greetingName,
} = require("./_lib/mailer");
const { renderConfirmation, renderConfirmationText, SITE_URL } = require("./_lib/emailTemplate");

// Stripe signs a timestamp with each event; older than this is refused, so a
// captured request cannot be replayed later.
const TOLERANCE_SECONDS = 5 * 60;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ZERO_DECIMAL = new Set([
  "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf",
]);

// The signature covers the exact bytes Stripe sent, so read the raw body
// rather than a parsed-and-reserialised copy. scripts/dev-api.js passes it as
// req.rawBody; on Vercel the request stream is still unread here.
async function readRawBody(req) {
  if (typeof req.rawBody === "string") return req.rawBody;
  if (Buffer.isBuffer(req.rawBody)) return req.rawBody.toString("utf8");
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
}

// Stripe-Signature: t=<unix time>,v1=<hex hmac>[,v1=...]
function verifySignature(raw, header, secret) {
  const parts = String(header || "").split(",");
  const timestamp = Number((parts.find((p) => p.startsWith("t=")) || "").slice(2));
  const signatures = parts.filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (!timestamp || !signatures.length) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > TOLERANCE_SECONDS) return false;

  const expected = Buffer.from(
    crypto.createHmac("sha256", secret).update(`${timestamp}.${raw}`).digest("hex")
  );
  return signatures.some((sig) => {
    const given = Buffer.from(sig);
    return given.length === expected.length && crypto.timingSafeEqual(given, expected);
  });
}

function formatAmount(amount, currency) {
  if (amount === null || amount === undefined || !currency) return null;
  const code = String(currency).toLowerCase();
  const value = ZERO_DECIMAL.has(code) ? amount : amount / 100;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: code.toUpperCase() }).format(value);
  } catch {
    return `${value} ${code.toUpperCase()}`;
  }
}

// What happened, from the event type and the session's payment state.
function outcomeOf(event) {
  const session = event.data?.object || {};
  switch (event.type) {
    case "checkout.session.completed":
      // "unpaid" means a delayed method; the async_* event follows later.
      return session.payment_status === "paid" || session.payment_status === "no_payment_required"
        ? "paid"
        : null;
    case "checkout.session.async_payment_succeeded":
      return "paid";
    case "checkout.session.async_payment_failed":
      return "failed";
    case "checkout.session.expired":
      return session.payment_status === "paid" ? null : "expired";
    default:
      return null;
  }
}

async function findEnquiry(supabase, ref) {
  if (!supabase || !UUID.test(String(ref || ""))) return null;
  const { data, error } = await supabase
    .from("contact_submissions")
    .select("id, name, email, number, enrolment, payment_status")
    .eq("id", ref)
    .maybeSingle();
  if (error) {
    console.error("stripe-webhook: enquiry lookup failed:", error.message || error);
    return null;
  }
  return data;
}

// The link that takes the learner back to checkout, prefilled as before.
async function retryUrl(supabase, enquiry, email) {
  const courseId = enquiry?.enrolment?.courseId;
  if (supabase && courseId) {
    const { data } = await supabase
      .from("course_payment_links")
      .select("url")
      .eq("course_id", courseId)
      .maybeSingle();
    if (data?.url) {
      const url = new URL(data.url);
      if (email) url.searchParams.set("prefilled_email", email);
      url.searchParams.set("client_reference_id", enquiry.id);
      return url.toString();
    }
  }
  return `${SITE_URL}/courses`;
}

function learnerMail(kind, p) {
  const first = greetingName(p.name || "");
  const rows = [
    ["Course", p.course],
    ...(p.amount ? [[kind === "paid" ? "Amount paid" : "Amount", p.amount]] : []),
    ...(kind === "paid" ? [["Date", p.date]] : []),
    ["Email", p.email],
    ...(kind === "paid" && p.sessionId ? [["Payment reference", p.sessionId]] : []),
  ];

  const content =
    kind === "paid"
      ? {
          subject: `Payment received: you're enrolled in ${headerSafe(p.course)}`,
          preheader: `Your seat in ${p.course} is confirmed.`,
          eyebrow: "Payment received",
          title: `You're enrolled, ${first}!`,
          intro: `We have received your payment${p.amount ? ` of ${p.amount}` : ""} for ${p.course}. Your seat is confirmed.`,
          stepsHeading: "What happens next",
          steps: [
            ["We confirm your batch", "An advisor will call you within one business day to confirm your batch and start date."],
            ["Meet your mentor", "Before your first class you will be introduced to the industry mentor who will guide you."],
            ["Start learning", "You will receive your class schedule and joining details before day one."],
          ],
          detailsHeading: "Payment details",
          rows,
          cta: { label: "View your course", href: `${SITE_URL}/courses` },
          footerNote: "Stripe emails your official payment receipt separately.",
        }
      : {
          subject: `Your payment for ${headerSafe(p.course)} was not completed`,
          preheader: "Your seat is not confirmed yet — you can finish payment in a minute.",
          eyebrow: "Payment not completed",
          title: `Your seat is still waiting, ${first}`,
          intro:
            kind === "failed"
              ? `Your payment for ${p.course} did not go through, so your enrolment is not confirmed yet. You have not been charged.`
              : `Your checkout for ${p.course} closed before payment was completed, so your enrolment is not confirmed yet. You have not been charged.`,
          stepsHeading: "How to finish",
          steps: [
            ["Complete your payment", "Use the button below to return to secure Stripe checkout. Your details are already saved."],
            ["Need another way to pay?", "Reply to this email and an advisor will help you complete your enrolment."],
          ],
          detailsHeading: "Your enrolment",
          rows,
          cta: { label: "Complete payment", href: p.retryUrl },
          footerNote: "You are receiving this because you started an enrolment on url.com.",
        };

  const model = { ...content, contactEmail: MAIL_TO };
  return {
    from: { name: "URL", address: MAIL_FROM },
    to: { name: headerSafe(p.name || ""), address: p.email },
    replyTo: { name: "URL", address: MAIL_TO },
    subject: content.subject,
    headers: { "Auto-Submitted": "auto-generated", "X-Auto-Response-Suppress": "All" },
    attachments: [logoAttachment()],
    text: renderConfirmationText(model),
    html: renderConfirmation(model),
  };
}

function teamMail(kind, p) {
  const label = { paid: "Payment received", failed: "Payment failed", expired: "Payment not completed" }[kind];
  return {
    from: { name: "URL Payments", address: MAIL_FROM },
    to: MAIL_TO,
    replyTo: p.email ? { name: headerSafe(p.name || ""), address: p.email } : undefined,
    subject: `${label}: ${headerSafe(p.name || p.email || "unknown")} — ${headerSafe(p.course)}${p.amount ? ` (${p.amount})` : ""}`,
    text: [
      `Status : ${label}`,
      `Name : ${p.name || "Unknown"}`,
      `Email : ${p.email || "Unknown"}`,
      `Phone : ${p.phone || "Not provided"}`,
      `Course : ${p.course}`,
      `Amount : ${p.amount || "Unknown"}`,
      ``,
      `Stripe session : ${p.sessionId}`,
      `Enquiry id : ${p.enquiryId || "Not linked (paid outside the /payment page)"}`,
      ``,
      kind === "paid"
        ? "The enquiry has been marked Paid in the admin dashboard. Confirm the learner's batch, then set it to Enrolled."
        : "The learner has been emailed a link to complete payment. Consider a follow-up call.",
      `${SITE_URL}/admin`,
    ].join("\n"),
  };
}

async function handle(event, supabase) {
  const kind = outcomeOf(event);
  if (!kind) return "ignored";

  const session = event.data.object;
  const enquiry = await findEnquiry(supabase, session.client_reference_id);

  // An expired checkout without a linked enquiry could be anyone who opened
  // the link and left; there is nobody sensible to email.
  if (kind === "expired" && !enquiry) return "expired-unlinked";
  // Several checkouts can exist for one enrolment (the link opened twice).
  // Once paid, a later expiry of another session is not news; and a second
  // expiry or failure does not need a second email.
  if (kind !== "paid" && enquiry?.payment_status === "paid") return "already-paid";
  if (kind !== "paid" && enquiry?.payment_status && enquiry.payment_status === kind) return "already-notified";

  const email = session.customer_details?.email || enquiry?.email || session.customer_email || null;
  const p = {
    name: session.customer_details?.name || enquiry?.name || "",
    email,
    phone: enquiry?.number || session.customer_details?.phone || null,
    course: enquiry?.enrolment?.course || "your URL course",
    amount: formatAmount(session.amount_total, session.currency),
    date: new Date((event.created || Date.now() / 1000) * 1000).toUTCString().replace(" GMT", " UTC"),
    sessionId: session.id,
    enquiryId: enquiry?.id || null,
    retryUrl: null,
  };
  if (kind !== "paid") p.retryUrl = await retryUrl(supabase, enquiry, email);

  if (enquiry) {
    const update =
      kind === "paid"
        ? {
            payment_status: "paid",
            paid_at: new Date().toISOString(),
            amount_paid: session.amount_total ?? null,
            payment_currency: session.currency || null,
            stripe_session_id: session.id,
            status: "paid",
            updated_at: new Date().toISOString(),
          }
        : { payment_status: kind, stripe_session_id: session.id };
    const { error } = await supabase.from("contact_submissions").update(update).eq("id", enquiry.id);
    if (error) console.error("stripe-webhook: enquiry update failed:", error.message || error);
  }

  const mailer = createTransporter();
  try {
    // The team's copy matters most; if it fails, the handler fails and
    // Stripe retries the whole event.
    await sendWithRetry(mailer, teamMail(kind, p), "payment notification");
    if (email) {
      try {
        await sendWithRetry(mailer, learnerMail(kind, p), "payment email");
      } catch (error) {
        console.error(`stripe-webhook: email to ${email} failed:`, error.message || error);
      }
    }
  } finally {
    mailer.close();
  }
  console.log(`stripe-webhook: ${kind} ${session.id} enquiry=${enquiry?.id || "-"}`);
  return kind;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("stripe-webhook: STRIPE_WEBHOOK_SECRET is not set");
    return res.status(503).json({ message: "Webhook not configured" });
  }

  let raw;
  try {
    raw = await readRawBody(req);
  } catch {
    return res.status(400).json({ message: "Could not read body" });
  }
  if (!verifySignature(raw, req.headers["stripe-signature"], secret)) {
    console.warn("stripe-webhook: rejected a request with a bad signature");
    return res.status(400).json({ message: "Invalid signature" });
  }

  let event;
  try {
    event = JSON.parse(raw);
  } catch {
    return res.status(400).json({ message: "Invalid JSON" });
  }
  if (!outcomeOf(event)) return res.status(200).json({ received: true, ignored: event.type });

  // Claim the event id first. A duplicate delivery hits the primary key and
  // stops here, so nobody is emailed twice.
  const supabase = getSupabase();
  let claimed = false;
  if (supabase) {
    const { error } = await supabase.from("stripe_events").insert({ id: event.id, type: event.type });
    if (error?.code === "23505") return res.status(200).json({ received: true, duplicate: true });
    if (error) console.error("stripe-webhook: could not record event:", error.message || error);
    else claimed = true;
  }

  try {
    const result = await handle(event, supabase);
    return res.status(200).json({ received: true, result });
  } catch (error) {
    console.error("stripe-webhook: handling failed:", error.message || error);
    // Release the claim so Stripe's retry can try again.
    if (claimed) await supabase.from("stripe_events").delete().eq("id", event.id);
    return res.status(500).json({ message: "Handling failed; Stripe will retry" });
  }
};

// Exposed for tests.
module.exports.verifySignature = verifySignature;
module.exports.formatAmount = formatAmount;
