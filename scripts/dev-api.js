#!/usr/bin/env node
//
// Serve the api/ folder locally the way Vercel does, so the contact form can
// be tested end to end without the Vercel CLI or a deployment.
//
//   npm run dev:api     then, in a second terminal, npm start
//
// src/setupProxy.js forwards /api/* from the React dev server on :3000 to
// this process, so the browser can post to /api/send-email as it will in
// production. Reads AUTH_USER / AUTH_PASSWORD from .env.local via
// node --env-file.
//
// Handlers are re-read from disk on every request, so editing
// api/send-email.js takes effect without restarting this server.

const http = require("http");
const path = require("path");
const fs = require("fs");

const PORT = 3001; // src/setupProxy.js forwards /api here.
const API_DIR = path.join(__dirname, "..", "api");

// Collect the raw body, then parse JSON — Vercel hands the handler an already
// parsed req.body, and api/send-email.js is written against that.
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      // Matches Vercel's 4.5MB request limit closely enough to catch abuse.
      if (size > 1_000_000) {
        reject(new Error("request body too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

// Minimal stand-in for Vercel's response helpers.
function decorate(res) {
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body) => {
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(body));
    return res;
  };
  res.send = (body) => {
    res.end(typeof body === "string" ? body : JSON.stringify(body));
    return res;
  };
  return res;
}

const server = http.createServer(async (req, res) => {
  decorate(res);

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const route = url.pathname.replace(/^\/api\//, "").replace(/\/+$/, "");
  const file = path.join(API_DIR, `${route}.js`);

  // Keep the handler inside api/, so a crafted path cannot load another file.
  if (!file.startsWith(API_DIR + path.sep) || !fs.existsSync(file)) {
    console.log(`${req.method} ${url.pathname} -> 404`);
    return res.status(404).json({ message: "Not found" });
  }

  let raw = "";
  try {
    raw = await readBody(req);
  } catch (error) {
    return res.status(413).json({ message: error.message });
  }

  // Vercel parses JSON when the content-type says so, and leaves the raw
  // string otherwise. api/send-email.js copes with both; mirror it here.
  let body = raw;
  if (/application\/json/i.test(req.headers["content-type"] || "")) {
    try {
      body = raw ? JSON.parse(raw) : {};
    } catch {
      body = raw;
    }
  }

  req.body = body;
  // The untouched body, for handlers that verify a signature over it
  // (api/stripe-webhook.js).
  req.rawBody = raw;
  req.query = Object.fromEntries(url.searchParams);

  try {
    // Re-require each time so handler edits apply without a restart.
    delete require.cache[require.resolve(file)];
    const handler = require(file);
    await handler(req, res);
  } catch (error) {
    console.error(`${req.method} ${url.pathname} threw:`, error);
    if (!res.headersSent) res.status(500).json({ message: "Handler error" });
  }

  console.log(`${req.method} ${url.pathname} -> ${res.statusCode}`);
});

server.listen(PORT, () => {
  const routes = fs.existsSync(API_DIR)
    ? fs.readdirSync(API_DIR).filter((f) => f.endsWith(".js"))
    : [];
  console.log(`local api on http://localhost:${PORT}`);
  console.log(
    routes.length
      ? `routes: ${routes.map((f) => `/api/${f.replace(/\.js$/, "")}`).join(", ")}`
      : "routes: none found in api/"
  );
  console.log(
    process.env.AUTH_USER
      ? `smtp user: ${process.env.AUTH_USER}`
      : "WARNING  AUTH_USER is unset; sends will fail with a 500."
  );
  console.log("\nnow run `npm start` in another terminal, then use the form.");
});
