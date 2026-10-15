// Session handling for the /admin dashboard.
//
// There is one admin login, set by two environment variables:
//   ADMIN_EMAIL     the email typed on the sign-in screen
//   ADMIN_PASSWORD  its password
// The enquiries themselves still come from Supabase (./supabase).
//
// After a correct sign-in the browser gets a signed session token in an
// HttpOnly cookie scoped to /api/admin, so page scripts cannot read it and no
// other route receives it. SameSite=Strict keeps it off cross-site requests,
// which together with the JSON-only bodies below rules out CSRF.
//
// The token is signed with a key derived from ADMIN_PASSWORD and the
// Supabase service role key, so no extra secret is needed, and changing
// ADMIN_PASSWORD in Vercel signs every existing session out.
const crypto = require("crypto");
const { isConfigured } = require("./supabase");

const COOKIE = "jw_admin";
const COOKIE_PATH = "/api/admin";
// How long an admin stays signed in without entering the password again.
const SESSION_SECONDS = 12 * 60 * 60;

function adminConfigured() {
  return Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
}

function signingKey() {
  return crypto
    .createHash("sha256")
    .update(
      `url-admin-session\0${process.env.ADMIN_PASSWORD}\0${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`
    )
    .digest();
}

function sign(payload) {
  return crypto.createHmac("sha256", signingKey()).update(payload).digest("base64url");
}

// Hash both sides first so timingSafeEqual gets equal-length buffers and the
// comparison time does not reveal how much of the input matched.
function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

// Email is matched case-insensitively; the password exactly. Both
// comparisons always run, so a wrong email takes as long as a wrong password.
function checkCredentials(email, password) {
  const emailOk = safeEqual(
    String(email).trim().toLowerCase(),
    String(process.env.ADMIN_EMAIL).trim().toLowerCase()
  );
  const passwordOk = safeEqual(password, process.env.ADMIN_PASSWORD);
  return emailOk && passwordOk;
}

function createToken(email) {
  const payload = Buffer.from(
    JSON.stringify({ sub: email, exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function readToken(token) {
  const [payload, signature] = String(token || "").split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.exp || data.exp < Date.now() / 1000) return null;
    // A token for an email that is no longer ADMIN_EMAIL is no longer valid.
    if (String(data.sub).toLowerCase() !== String(process.env.ADMIN_EMAIL).trim().toLowerCase()) {
      return null;
    }
    return { email: data.sub };
  } catch {
    return null;
  }
}

function parseCookies(req) {
  const out = {};
  for (const part of String(req.headers?.cookie || "").split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const key = part.slice(0, i).trim();
    if (!key) continue;
    try {
      out[key] = decodeURIComponent(part.slice(i + 1).trim());
    } catch {
      // A malformed cookie is ignored rather than failing the request.
    }
  }
  return out;
}

// Browsers drop Secure cookies set over plain http, except on localhost in
// some and not others, so leave the flag off only for local development.
function isLocal(req) {
  const host = String(req.headers?.host || "");
  return /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host);
}

function cookie(req, value, maxAge) {
  return [
    `${COOKIE}=${encodeURIComponent(value)}`,
    `Path=${COOKIE_PATH}`,
    `Max-Age=${maxAge}`,
    "HttpOnly",
    "SameSite=Strict",
    isLocal(req) ? null : "Secure",
  ]
    .filter(Boolean)
    .join("; ");
}

function setSessionCookie(req, res, email) {
  res.setHeader("Set-Cookie", cookie(req, createToken(email), SESSION_SECONDS));
}

function clearSessionCookie(req, res) {
  res.setHeader("Set-Cookie", cookie(req, "", 0));
}

// Admin responses carry personal data; never let a browser or CDN cache them.
function noStore(res) {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
}

function notConfigured(res) {
  return res.status(503).json({
    message:
      "Admin is not configured: set ADMIN_EMAIL, ADMIN_PASSWORD, SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
  });
}

// State-changing requests must be JSON. A cross-site HTML form cannot send
// application/json without a CORS preflight, which this API never grants.
function requireJson(req, res) {
  if (/application\/json/i.test(req.headers?.["content-type"] || "")) return true;
  res.status(415).json({ message: "Expected application/json" });
  return false;
}

function readBody(req) {
  const body = req.body || {};
  if (typeof body !== "string") return body;
  try {
    return JSON.parse(body);
  } catch {
    return {};
  }
}

// Resolve the signed-in admin for this request. Returns { email }, or sends a
// 401/503 and returns null — callers just `if (!user) return;`.
function requireAdmin(req, res) {
  noStore(res);
  if (!adminConfigured() || !isConfigured()) {
    notConfigured(res);
    return null;
  }
  const user = readToken(parseCookies(req)[COOKIE]);
  if (!user) {
    clearSessionCookie(req, res);
    res.status(401).json({ message: "Please sign in." });
    return null;
  }
  return user;
}

module.exports = {
  adminConfigured,
  checkCredentials,
  clearSessionCookie,
  noStore,
  notConfigured,
  readBody,
  requireAdmin,
  requireJson,
  setSessionCookie,
};
