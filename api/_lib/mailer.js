// SMTP sending shared by api/send-email.js (enquiries) and
// api/stripe-webhook.js (payment emails).
const nodemailer = require("nodemailer");

// SMTP server, from the environment (see .env.example). The fallbacks are the
// current mail server, so a missing variable does not stop enquiries.
const SMTP_HOST =
  process.env.SMTP_HOST || "p3plzcpnl505439.prod.phx3.secureserver.net";
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
const MAIL_TO = "contactus@url.com";
// Messages are sent AS the authenticated mailbox, not as the visitor. See
// notificationMail below.
const MAIL_FROM = process.env.AUTH_USER;

// Strip CR/LF before anything reaches a mail header. A newline in a header
// value is the classic header-injection vector, and `name` flows into both
// the subject and the From display name.
function headerSafe(value) {
  return String(value).replace(/[\r\n]+/g, " ").trim();
}

// One pooled connection per request, carrying both messages.
//
// Previously each message opened its own connection, so a submission made
// two in quick succession — and this mailbox does not like that. The second
// connection intermittently timed out, and a retry immediately afterwards
// was answered with non-TLS data on the implicit-TLS port ("wrong version
// number"), which is what a server does when it is shedding connections.
// Pooling sends both messages down a single authenticated connection.
//
// Deliberately created per request rather than cached in module scope: a
// serverless instance is frozen between invocations, so a pooled socket
// held across them is dead by the time it is reused. The handler closes it
// in a finally block, which also lets the function exit promptly.
function createTransporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    // 465 is implicit TLS; anything else (587) starts plaintext and
    // upgrades with STARTTLS, which nodemailer does on its own.
    secure: SMTP_PORT === 465,
    auth: {
      user: process.env.AUTH_USER,
      pass: process.env.AUTH_PASSWORD,
    },
    pool: true,
    maxConnections: 1,
    maxMessages: 10,
    // This server's TLS handshake has been measured taking over 7s. An
    // earlier attempt to tighten these to 7s to make room for a retry
    // turned every send into an ETIMEDOUT; maxDuration in vercel.json was
    // raised to 30s instead so the generous values below still leave room.
    connectionTimeout: 15000,
    greetingTimeout: 10000,
    socketTimeout: 20000,
  });
}

// Each submission opens two SMTP connections, one per message, and the
// second has been observed to time out while the first succeeded. Treat
// only transport-level failures as retryable: a rejection from the server
// (a bad recipient, a policy block) will fail again just as fast, and
// retrying it wastes the budget.
const TRANSIENT = new Set([
  "ETIMEDOUT",
  "ECONNECTION",
  "ESOCKET",
  "ECONNRESET",
  "EDNS",
  "EAI_AGAIN",
]);

function isTransient(error) {
  if (TRANSIENT.has(error?.code)) return true;
  // 4xx is SMTP for "try again later"; 5xx is permanent.
  const reply = Number(error?.responseCode);
  return reply >= 400 && reply < 500;
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendWithRetry(mailer, mail, label) {
  try {
    return await mailer.sendMail(mail);
  } catch (error) {
    if (!isTransient(error)) throw error;
    console.warn(
      `send-email: ${label} hit a transient error (${error.code || error.responseCode}); retrying once.`
    );
    await wait(1500);
    return mailer.sendMail(mail);
  }
}

// Names typed entirely in capitals or lower case ("SIRIMILLA") read as a
// shout or a typo in a greeting, so those are put into title case. Mixed
// case is left exactly as the visitor wrote it ("McDonald", "de Silva").
function greetingName(name) {
  const first = headerSafe(name).split(/\s+/)[0] || "";
  if (!first) return "there";
  if (first === first.toUpperCase() || first === first.toLowerCase()) {
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  }
  return first;
}

module.exports = {
  MAIL_TO,
  MAIL_FROM,
  headerSafe,
  createTransporter,
  sendWithRetry,
  greetingName,
};
