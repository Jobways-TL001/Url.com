// Create React App picks this up automatically when running `npm start`.
// It forwards /api/* from the dev server on :3000 to the local API server
// started by `npm run dev:api`, so the contact form posts to the same
// /api/send-email path it will use in production.
//
// Not used by `npm run build` — on Vercel the function is served at /api
// directly. http-proxy-middleware comes with react-scripts.
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    "/api",
    createProxyMiddleware({
      target: "http://localhost:3001", // scripts/dev-api.js
      changeOrigin: true,
      // Without the API server running, fail with a clear hint instead of an
      // opaque dev-server stack trace.
      onError: (err, req, res) => {
        console.error(`[setupProxy] ${err.message} — is \`npm run dev:api\` running?`);
        res.writeHead(502, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            message: "Local API server is not running. Start it with: npm run dev:api",
          })
        );
      },
    })
  );
};
