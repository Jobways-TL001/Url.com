// /api/admin/login, /api/admin/logout and /api/admin/session, served by one
// function. vercel.json rewrites each of those URLs here with ?action=, so
// the admin page's requests are unchanged.
//
// Why one function: the Vercel Hobby plan deploys at most 12 serverless
// functions, and every file under api/ counts as one unless its name starts
// with "_". The three handlers live in _login.js, _logout.js and _session.js.
const ACTIONS = {
  login: require("./_login"),
  logout: require("./_logout"),
  session: require("./_session"),
};

module.exports = function handler(req, res) {
  // ?action= from the rewrite; otherwise the last part of the URL path, in
  // case the original URL is passed through.
  const fromQuery = String(req.query?.action || "");
  const fromPath = String(req.url || "").split("?")[0].split("/").pop();
  const route = ACTIONS[fromQuery] || ACTIONS[fromPath];
  if (!route) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(404).json({ message: "Not found" });
  }
  return route(req, res);
};
