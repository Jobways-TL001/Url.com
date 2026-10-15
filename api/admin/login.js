// POST /api/admin/login  { email, password }
// Checks the ADMIN_EMAIL / ADMIN_PASSWORD environment variables and sets the
// session cookie. See api/_lib/adminAuth.js.
const { isConfigured } = require("../_lib/supabase");
const {
  adminConfigured,
  checkCredentials,
  noStore,
  notConfigured,
  readBody,
  requireJson,
  setSessionCookie,
} = require("../_lib/adminAuth");

// A wrong guess costs the caller a second, which makes scripted password
// guessing slow without bothering a person who mistypes once.
const FAILURE_DELAY_MS = 1000;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = async function handler(req, res) {
  noStore(res);
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }
  if (!requireJson(req, res)) return;
  if (!adminConfigured() || !isConfigured()) return notConfigured(res);

  const body = readBody(req);
  const email = String(body.email || "").trim().slice(0, 320);
  const password = String(body.password || "").slice(0, 200);
  if (!email || !password) {
    return res.status(400).json({ message: "Enter your email and password." });
  }

  if (!checkCredentials(email, password)) {
    console.warn(`admin: failed sign-in for ${email}`);
    await wait(FAILURE_DELAY_MS);
    return res.status(401).json({ message: "Incorrect email or password." });
  }

  const adminEmail = process.env.ADMIN_EMAIL.trim();
  setSessionCookie(req, res, adminEmail);
  console.log(`admin: sign-in ${adminEmail}`);
  return res.status(200).json({ email: adminEmail });
};
