// Server-side Supabase client. Underscore-prefixed paths inside api/ are not
// exposed as routes by Vercel, so this never becomes a public endpoint.
//
// This uses the SERVICE ROLE key, which bypasses Row Level Security. It must
// only ever be read in serverless functions. Never prefix it with REACT_APP_,
// or Create React App will inline it into the public browser bundle.
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client;

function isConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

function getSupabase() {
  if (!isConfigured()) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return client;
}

// x-forwarded-for arrives as "client, proxy1, proxy2". Take the client and
// only return it if it parses as an address, since Postgres `inet` rejects
// anything malformed and a bad value must not fail the capture.
function clientIp(req) {
  const raw = req.headers?.["x-forwarded-for"];
  if (!raw) return null;
  const first = String(raw).split(",")[0].trim();
  const isIpv4 = /^\d{1,3}(\.\d{1,3}){3}$/.test(first);
  const isIpv6 = /^[0-9a-f:]+$/i.test(first) && first.includes(":");
  return isIpv4 || isIpv6 ? first : null;
}

module.exports = { getSupabase, isConfigured, clientIp };
