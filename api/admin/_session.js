// GET /api/admin/session
// Who is signed in. 200 { email } for an admin, otherwise 401/403.
const { requireAdmin } = require("../_lib/adminAuth");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }
  const user = await requireAdmin(req, res);
  if (!user) return;
  return res.status(200).json({ email: user.email });
};
