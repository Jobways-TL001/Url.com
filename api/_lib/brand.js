// Brand assets and palette for the transactional emails sent by
// api/send-email.js.
//
// The logo is embedded as base64 rather than linked to a URL on the site,
// for three reasons: the mail must render before the site is reachable at
// its final domain, many clients refuse to fetch remote images until the
// recipient clicks "show images", and nothing here then depends on the
// serverless bundle happening to include a binary file at runtime.
//
// Source: public/images/footer-logo.png — the white-on-transparent mark,
// 135x48, which is the one that sits on a dark background on the site.

// Taken from the design tokens in src/index.css, so the mail matches the
// site.
const BRAND = {
  navy: "#0a1630",
  navyDeep: "#050b1c",
  blue: "#2563eb",
  blueSoft: "#eef4ff",
  accent: "#2ee6c1",
  accentDark: "#0f9f84",
  accentSoft: "#e7fbf6",
  bgLight: "#f5f7fb",
  textDark: "#0b1220",
  text: "#3a4559",
  textMuted: "#677489",
  textOnDark: "#a9b6cc",
  border: "#e4e9f1",
  white: "#ffffff",
};

// Displayed at 98px wide; the asset is 135px, so it stays reasonably sharp
// on a high-density screen.
const LOGO = {
  cid: "url-logo",
  filename: "url-logo.png",
  width: 98,
  height: 35,
  base64:
    "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" +
    "TOUFDUlS4v8BCP5sHHBL07EAAAAASUVORK5CYII=",
};

// Nodemailer attachment for the logo. `cid` makes it referenceable from the
// HTML as src="cid:url-logo"; `contentDisposition: inline` keeps mail
// clients from listing it as a downloadable attachment.
function logoAttachment() {
  return {
    filename: LOGO.filename,
    content: Buffer.from(LOGO.base64, "base64"),
    cid: LOGO.cid,
    contentType: "image/png",
    contentDisposition: "inline",
  };
}

module.exports = { BRAND, LOGO, logoAttachment };
