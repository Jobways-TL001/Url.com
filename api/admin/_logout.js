// POST /api/admin/logout — clears the session cookie.
// To sign out every browser at once, change ADMIN_PASSWORD in Vercel.
const { clearSessionCookie, noStore, requireJson } = require("../_lib/adminAuth");

module.exports = async function handler(req, res) {
  noStore(res);
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }
  if (!requireJson(req, res)) return;
  clearSessionCookie(req, res);
  return res.status(200).json({ ok: true });
};
