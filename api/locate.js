// GET /api/locate — the visitor's US state, guessed from their IP address.
//   200 { country: "US" | other | null, state: "IL" | null }
//
// Vercel adds the country and region of each request's IP address as
// headers (x-vercel-ip-country, x-vercel-ip-country-region); for the US the
// region is the two-letter state code. Nothing is looked up elsewhere and
// nothing is stored. The site uses it only to pre-select the learner's
// state, which they can change. Never cached: each visitor gets their own.
const { US_STATES } = require("./_lib/usStates");

module.exports = function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }
  res.setHeader("Cache-Control", "private, no-store");

  const header = (name) => {
    const value = req.headers?.[name];
    return typeof value === "string" ? decodeURIComponent(value).trim().toUpperCase() : "";
  };
  const country = header("x-vercel-ip-country") || null;
  const region = header("x-vercel-ip-country-region");
  const state = country === "US" && US_STATES[region] ? region : null;

  return res.status(200).json({ country, state });
};
