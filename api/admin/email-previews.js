// GET /api/admin/email-previews — every email the site sends, rendered with
// sample data, for /admin/emails. Nothing is sent.
//
//   200 { emails: [{ key, group, label, when, audience, from, to, subject,
//                    html | null, text }] }
//
// Built by the same functions that send the real mail (api/send-email.js
// and api/stripe-webhook.js), so the preview always matches what goes out.
// The logo, attached to real mail as cid:url-logo, is inlined as a data
// URL so it shows in the browser. Admin-only.
const { requireAdmin } = require("../_lib/adminAuth");
const { LOGO } = require("../_lib/brand");
const { notificationMail, acknowledgementMail } = require("../send-email");
const { learnerMail, teamMail } = require("../stripe-webhook");

const SAMPLE = {
  name: "Priya Sharma",
  email: "priya.sharma@example.com",
  number: "+1 312 555 0142",
};

const ENROLMENT = {
  course: "AI & Machine Learning Engineering",
  courseId: "ai-ml",
  state: "Illinois",
  stateCode: "IL",
  experience: "Some programming experience",
  batch: "Monday – Friday",
  notes: "I would like to start in the next batch.",
};

const PAYMENT = {
  name: SAMPLE.name,
  email: SAMPLE.email,
  phone: SAMPLE.number,
  course: ENROLMENT.course,
  amount: "$1,658.00 USD",
  date: "Sat, 17 Oct 2026 10:30:00 UTC",
  sessionId: "cs_live_a1B2c3D4e5F6g7H8i9J0",
  enquiryId: "3f2b8c1e-5d4a-4b6f-9c2d-1a7e8f9b0c3d",
  retryUrl: "https://url.com/api/checkout?enquiry=3f2b8c1e-5d4a-4b6f-9c2d-1a7e8f9b0c3d",
};

const addressOf = (a) =>
  !a ? "" : typeof a === "string" ? a : a.name ? `${a.name} <${a.address || "(AUTH_USER)"}>` : a.address || "";

function preview(key, group, label, when, audience, mail) {
  const logo = `data:image/png;base64,${LOGO.base64}`;
  return {
    key,
    group,
    label,
    when,
    audience,
    from: addressOf(mail.from),
    to: addressOf(mail.to),
    subject: mail.subject,
    html: mail.html ? mail.html.split(`cid:${LOGO.cid}`).join(logo) : null,
    text: mail.text || "",
  };
}

function build() {
  const contact = {
    ...SAMPLE,
    message: "Hello, I would like to know more about your AI courses and upcoming batches.",
    service: "e-learning",
    source: "contact-page",
  };
  const enrolment = {
    ...SAMPLE,
    message: "Course enrolment request: AI & Machine Learning",
    service: "e-learning",
    source: "course-enrollment",
    enrolment: ENROLMENT,
  };
  return [
    preview("enquiry-learner", "Enquiries", "Enquiry received", "A visitor sends the contact or enquiry form", "Learner", acknowledgementMail(contact)),
    preview("enquiry-team", "Enquiries", "New enquiry (team)", "A visitor sends the contact or enquiry form", "Team", notificationMail(contact)),
    preview("enrolment-learner", "Enrolments", "Enrolment received", "A learner submits the course enrolment form", "Learner", acknowledgementMail(enrolment)),
    preview("enrolment-team", "Enrolments", "New course enrolment (team)", "A learner submits the course enrolment form", "Team", notificationMail(enrolment)),
    preview("paid-learner", "Payments", "Payment received", "Stripe confirms the payment", "Learner", learnerMail("paid", PAYMENT)),
    preview("paid-team", "Payments", "Payment received (team)", "Stripe confirms the payment", "Team", teamMail("paid", PAYMENT)),
    preview("failed-learner", "Payments", "Payment failed", "A delayed payment method (e.g. bank debit) fails", "Learner", learnerMail("failed", PAYMENT)),
    preview("failed-team", "Payments", "Payment failed (team)", "A delayed payment method (e.g. bank debit) fails", "Team", teamMail("failed", PAYMENT)),
    preview("expired-learner", "Payments", "Payment not completed", "The learner leaves Stripe checkout without paying (checkout expires)", "Learner", learnerMail("expired", PAYMENT)),
    preview("expired-team", "Payments", "Payment not completed (team)", "The learner leaves Stripe checkout without paying (checkout expires)", "Team", teamMail("expired", PAYMENT)),
  ];
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }
  const user = await requireAdmin(req, res);
  if (!user) return;
  try {
    return res.status(200).json({ emails: build() });
  } catch (error) {
    console.error("admin/email-previews:", error.message || error);
    return res.status(500).json({ message: "Could not build the email previews." });
  }
};

module.exports.build = build;
