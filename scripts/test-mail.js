#!/usr/bin/env node
//
// Check whether contact-form email is working.
//
//   npm run test:mail          connect + authenticate only, sends nothing
//   npm run test:mail -- --send   also send one real test message
//
// Reads AUTH_USER / AUTH_PASSWORD from .env.local via node --env-file.
// A 535 means the credentials are wrong, not the host: the server only
// replies to AUTH after the connection and TLS handshake have succeeded.
//
// Note: repeated failed logins can trip the mail server's brute-force
// protection and block your IP, so fix the credentials rather than retrying.

const nodemailer = require("nodemailer");

// Same settings and fallbacks as api/send-email.js.
const HOST =
  process.env.SMTP_HOST || "p3plzcpnl505439.prod.phx3.secureserver.net";
const PORT = Number(process.env.SMTP_PORT) || 465;
const MAIL_TO = "contactus@url.com";
const send = process.argv.includes("--send");

function mask(value) {
  if (!value) return "(unset)";
  return value.replace(/(.{2}).*(@.*)/, "$1***$2");
}

async function main() {
  console.log("host :", HOST);
  console.log("port :", PORT, `(secure: ${PORT === 465})`);
  console.log("user :", mask(process.env.AUTH_USER));
  console.log(
    "pass :",
    process.env.AUTH_PASSWORD
      ? `set (${process.env.AUTH_PASSWORD.length} chars)`
      : "(unset)"
  );
  console.log();

  if (!process.env.AUTH_USER || !process.env.AUTH_PASSWORD) {
    console.log("FAIL  AUTH_USER / AUTH_PASSWORD are not set.");
    console.log("      Copy .env.example to .env.local and fill them in.");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    secure: PORT === 465,
    auth: {
      user: process.env.AUTH_USER,
      pass: process.env.AUTH_PASSWORD,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  try {
    console.log("1/2  authenticating (nothing is sent)...");
    await transporter.verify();
    console.log("     PASS  the server accepted the login.\n");
  } catch (error) {
    console.log(`     FAIL  ${error.message || error}`);
    console.log(
      `     code: ${error.code || "-"}  responseCode: ${
        error.responseCode || "-"
      }`
    );
    if (error.responseCode === 535) {
      console.log(
        "\n     A 535 means the host is reachable but the username or"
      );
      console.log(
        "     password is wrong. Reset the mailbox password with your mail"
      );
      console.log("     provider, then update .env.local and Vercel.");
    }
    transporter.close();
    process.exit(1);
  }

  if (!send) {
    console.log("2/2  skipped. Re-run with --send to deliver a test message.");
    transporter.close();
    return;
  }

  try {
    console.log(`2/2  sending a test message to ${MAIL_TO}...`);
    const stamp = new Date().toISOString();
    const info = await transporter.sendMail({
      from: process.env.AUTH_USER,
      to: MAIL_TO,
      replyTo: process.env.AUTH_USER,
      subject: `URL mail test ${stamp}`,
      text: `Test message sent by scripts/test-mail.js at ${stamp}.\nIf you are reading this, contact-form delivery is working.`,
    });
    console.log(`     PASS  accepted: ${info.response || info.messageId}`);
    console.log(`\nCheck the ${MAIL_TO} inbox, including spam.`);
  } catch (error) {
    console.log(`     FAIL  ${error.message || error}`);
    console.log(
      `     code: ${error.code || "-"}  responseCode: ${
        error.responseCode || "-"
      }`
    );
    process.exit(1);
  } finally {
    transporter.close();
  }
}

main();
