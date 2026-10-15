// Same numbering-plan data the forms use (src/utils/formValidation.js).
const { parsePhoneNumberFromString } = require("libphonenumber-js/max");
const { logoAttachment } = require("./_lib/brand");
const { getSupabase, clientIp } = require("./_lib/supabase");
const {
  MAIL_TO,
  MAIL_FROM,
  headerSafe,
  createTransporter,
  sendWithRetry,
  greetingName,
} = require("./_lib/mailer");
const {
  renderConfirmation,
  renderConfirmationText,
  SITE_URL,
} = require("./_lib/emailTemplate");

// Where a submission came from. Anything not listed falls back to the
// first entry, so the value cannot be set freely from the request body.
const SOURCES = ["contact-page", "home-modal", "course-enrollment"];

// Services a visitor can select. Keep in step with src/constants/services.js.
// Anything not listed here is reported as "Not specified" rather than echoed
// into the mail, so the subject line cannot be driven by the request body.
const SERVICE_LABELS = {
  "e-learning": "AI courses",
  general: "General enquiry",
};

// Caps on the free-text fields. Long enough for a real enquiry, short enough
// that a scripted flood cannot push megabytes through the mail server.
const LIMITS = { name: 200, email: 320, number: 50, message: 5000, field: 120 };

// "General enquiry" already ends in the word, so appending " enquiry" again
// gives "General enquiry enquiry from ...".
function subjectFor(service, name, source) {
  const who = headerSafe(name);
  // A course enrolment is not just another enquiry — the learner is on their
  // way to checkout and expects to hear back before their batch starts — so
  // it is labelled as one in the inbox rather than as "E-Learning enquiry".
  if (source === "course-enrollment") return `Course enrolment from ${who}`;
  if (!service) return `URL enquiry from ${who}`;
  const label = SERVICE_LABELS[service];
  return /enquiry$/i.test(label)
    ? `${label} from ${who}`
    : `${label} enquiry from ${who}`;
}

// What the team receives: plain text, optimised for scanning, with the
// visitor on Reply-To so hitting reply answers them.
function notificationMail({ name, email, number, message, service, source }) {
  return {
    // Send AS the authenticated mailbox. Using the visitor's address as the
    // From header is sender spoofing: our SMTP server is not authorised to
    // send for gmail.com, outlook.com and the rest, so those messages fail
    // SPF and DMARC and get spam-foldered or rejected outright.
    from: { name: `${headerSafe(name)} via URL`, address: MAIL_FROM },
    to: MAIL_TO,
    replyTo: { name: headerSafe(name), address: email },
    subject: subjectFor(service, name, source),
    text: [
      `Name : ${name}`,
      `Email : ${email}`,
      `Number : ${number || "Not provided"}`,
      `Service : ${service ? SERVICE_LABELS[service] : "Not specified"}`,
      ``,
      `Message : ${message}`,
      ``,
      `Source : ${source}`,
    ].join("\n"),
  };
}

// What the visitor receives: confirmation that their submission arrived,
// what happens next, and a copy of what they sent. An enrolment gets its own
// version listing the course details as rows; the internal summary the team
// receives is never shown to the learner.
function acknowledgementMail({ name, email, number, message, service, source, enrolment }) {
  const firstName = greetingName(name);
  const isEnrolment = source === "course-enrollment" && enrolment;

  const content = isEnrolment
    ? {
        subject: `Your enrolment request for ${headerSafe(enrolment.course)} — URL`,
        preheader: `Thanks ${firstName}, we have your enrolment details for ${enrolment.course}.`,
        eyebrow: "Enrolment received",
        title: `Thank you, ${firstName}`,
        intro: `We have received your enrolment request for ${enrolment.course}. Here is what happens next.`,
        stepsHeading: "What happens next",
        steps: [
          [
            "Complete your payment",
            "Your seat is confirmed once payment is complete. If you have not paid yet, an advisor will send you a secure payment link.",
          ],
          [
            "We confirm your batch",
            "An advisor will call you within one business day to confirm your Monday – Friday batch and start date.",
          ],
          [
            "Meet your mentor",
            "Before your first class you will be introduced to the industry mentor who will guide you through the course.",
          ],
        ],
        detailsHeading: "Your enrolment details",
        rows: [
          ["Course", enrolment.course],
          ["Current level", enrolment.experience || "Not provided"],
          ["Preferred batch", enrolment.batch || "Not provided"],
          ["Name", name],
          ["Email", email],
          ["Phone", number || "Not provided"],
          ...(enrolment.notes ? [["Your notes", enrolment.notes]] : []),
        ],
        cta: {
          label: "View course details",
          href: `${SITE_URL}/courses${enrolment.courseId ? `/${enrolment.courseId}` : ""}`,
        },
      }
    : {
        subject: "We've received your enquiry — URL",
        preheader: `Thanks ${firstName}, your enquiry has reached the URL team.`,
        eyebrow: "Enquiry received",
        title: `Thank you, ${firstName}`,
        intro: "Your enquiry has reached our team. A URL advisor will reply within one business day.",
        stepsHeading: "What happens next",
        steps: [
          ["We review your enquiry", "A member of our team reads every enquiry personally."],
          ["An advisor contacts you", "We will talk through your background, goals and questions."],
          ["You receive a recommendation", "We will suggest the AI course that suits you best."],
        ],
        detailsHeading: "A copy of your enquiry",
        rows: [
          ["Name", name],
          ["Email", email],
          ["Phone", number || "Not provided"],
          ["Service", service ? SERVICE_LABELS[service] : "Not specified"],
          ["Message", message],
        ],
        cta: { label: "Explore our AI courses", href: `${SITE_URL}/courses` },
      };

  const model = {
    ...content,
    contactEmail: MAIL_TO,
    footerNote: "This is an automated confirmation. Replies reach our team.",
  };

  return {
    from: { name: "URL", address: MAIL_FROM },
    to: { name: headerSafe(name), address: email },
    replyTo: { name: "URL", address: MAIL_TO },
    subject: content.subject,
    // Mark this as an auto-reply so a visitor's own out-of-office or
    // autoresponder does not answer it and start a mail loop.
    headers: {
      "Auto-Submitted": "auto-replied",
      "X-Auto-Response-Suppress": "All",
    },
    attachments: [logoAttachment()],
    text: renderConfirmationText(model),
    html: renderConfirmation(model),
  };
}

// Insert the enquiry into contact_submissions. Best effort: returns the row
// id, or null if Supabase is not configured or the insert fails, in which
// case the handler still emails the lead.
async function captureSubmission(req, { name, email, number, message, service, source, enrolment }) {
  const supabase = getSupabase();
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("contact_submissions")
      .insert({
        name,
        email,
        number: number || null,
        message,
        service,
        source,
        enrolment,
        ip: clientIp(req),
        user_agent: String(req.headers?.["user-agent"] || "").slice(0, 500) || null,
      })
      .select("id")
      .single();
    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("send-email: supabase insert failed:", error.message || error);
    return null;
  }
}

// Record how delivery went against the stored row. Best effort: the enquiry
// is already safe, so a failed update must not fail the request.
async function recordOutcome(id, outcome) {
  if (!id) return;
  try {
    const { error } = await getSupabase()
      .from("contact_submissions")
      .update(outcome)
      .eq("id", id);
    if (error) throw error;
  } catch (error) {
    console.error("send-email: supabase status update failed:", error.message || error);
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Vercel parses a JSON request body for us, but guard against a string
  // body arriving when the content-type header is missing.
  let body = req.body || {};
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ message: "Invalid JSON body" });
    }
  }

  const name = String(body.name || "").trim().slice(0, LIMITS.name);
  const email = String(body.email || "").trim().slice(0, LIMITS.email);
  const rawNumber = String(body.number || "").trim().slice(0, LIMITS.number);
  const message = String(body.message || "").trim().slice(0, LIMITS.message);
  const source = SOURCES.includes(body.source) ? body.source : SOURCES[0];
  // Unknown or missing values become null rather than being guessed at, so
  // "no service selected" stays distinguishable from a real choice.
  const service = Object.hasOwn(SERVICE_LABELS, body.service)
    ? body.service
    : null;

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ message: "Name, email and message are required" });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  // The forms send "+<country code> <number>". Check it against that
  // country's numbering plan and store it in one international format.
  // Enrolments are followed up by a call, so they must include one.
  let number = "";
  if (rawNumber) {
    const phone = parsePhoneNumberFromString(rawNumber);
    if (!phone || !phone.isValid()) {
      return res
        .status(400)
        .json({ message: "Please enter a valid phone number for the selected country." });
    }
    number = phone.formatInternational();
  } else if (source === "course-enrollment") {
    return res.status(400).json({ message: "A phone number is required to enrol." });
  }

  // Course enrolments also send their answers as separate fields, so the
  // learner's confirmation can list them as rows. Each is capped and
  // flattened to one line; notes keep their line breaks.
  const raw = body.enrolment && typeof body.enrolment === "object" ? body.enrolment : null;
  const enrolment =
    source === "course-enrollment" && raw && raw.course
      ? {
          course: headerSafe(String(raw.course)).slice(0, LIMITS.field),
          // Matches src/constants/courses.js ids; used by the payment emails
          // to find the course's Stripe link. Dropped if malformed.
          courseId: /^[a-z0-9-]{1,60}$/.test(String(raw.courseId || "")) ? raw.courseId : null,
          experience: headerSafe(String(raw.experience || "")).slice(0, LIMITS.field),
          batch: headerSafe(String(raw.batch || "")).slice(0, LIMITS.field),
          notes: String(raw.notes || "").trim().slice(0, LIMITS.message),
        }
      : null;

  const enquiry = { name, email, number, message, service, source, enrolment };

  // Store the enquiry before any mail is attempted, so an SMTP outage cannot
  // lose a lead. Null when Supabase is not configured or the insert failed.
  const submissionId = await captureSubmission(req, enquiry);
  const outcome = { email_sent: false, email_error: null, acknowledged: null };

  // Answer the visitor. A stored row counts as received even if mail failed:
  // asking them to resubmit would only create a duplicate.
  const respond = async () => {
    await recordOutcome(submissionId, outcome);
    if (outcome.email_sent || submissionId) {
      return res.status(200).json({
        message: outcome.email_sent
          ? "Email successfully sent"
          : "Your message was received",
        acknowledged: outcome.acknowledged === true,
        // Lets the enrolment flow tag the Stripe payment with this enquiry
        // (client_reference_id), so a payment can be matched to its learner.
        id: submissionId || null,
      });
    }
    return res.status(500).json({ message: "Error sending email" });
  };

  if (!process.env.AUTH_USER || !process.env.AUTH_PASSWORD) {
    outcome.email_error = "AUTH_USER / AUTH_PASSWORD are not configured";
    console.error(`send-email: ${outcome.email_error}; cannot send.`);
    return respond();
  }

  // One connection, both messages, always closed. The finally block matters
  // on serverless: a pooled socket left open keeps the invocation alive
  // until it times out.
  const mailer = createTransporter();

  try {
    // The internal notification is the one that must not be lost: it carries
    // the lead. Send it first. If it fails and the row was not stored either,
    // the request fails so the visitor is asked to try again.
    try {
      const info = await sendWithRetry(mailer, notificationMail(enquiry), "notification");
      outcome.email_sent = true;
      console.log(
        `send-email: notified ${MAIL_TO} ${info.messageId || "(no id)"} from ${source}`
      );
    } catch (error) {
      // Log the detail for the function log, but keep it out of the response:
      // SMTP errors can name the host and mailbox. The stored email_error is
      // only readable with the service role key.
      outcome.email_error = String(error.message || error).slice(0, 1000);
      console.error("send-email: notification failed:", error);
      // Skip the acknowledgement: the mail server just refused us, and the
      // row (if any) is flagged email_sent = false for follow-up.
      return respond();
    }

    // The acknowledgement is a courtesy. The enquiry has already reached us,
    // so a failure here must not fail the request or ask the visitor to
    // resubmit — that would deliver the lead twice. Log it and move on.
    try {
      const ack = await sendWithRetry(mailer, acknowledgementMail(enquiry), "acknowledgement");
      outcome.acknowledged = true;
      console.log(
        `send-email: acknowledged ${email} ${ack.messageId || "(no id)"}`
      );
    } catch (error) {
      outcome.acknowledged = false;
      console.error(
        `send-email: acknowledgement to ${email} failed:`,
        error.message || error
      );
    }
  } finally {
    mailer.close();
  }

  return respond();
};
