// Brand assets and palette for the transactional emails sent by
// api/send-email.js.
//
// The logo is embedded as base64 rather than linked to a URL on the site,
// for three reasons: the mail must render before the site is reachable at
// its final domain, many clients refuse to fetch remote images until the
// recipient clicks "show images", and nothing here then depends on the
// serverless bundle happening to include a binary file at runtime.
//
// Source: public/brand/url-logo-light.png — the white-wordmark logo,
// 264x80, rendered from public/brand/url-logo-light.svg. It sits on the
// dark header band of the emails.

// Taken from the design tokens in src/index.css, so the mail matches the
// site. Keys keep their original names so the template need not change.
const BRAND = {
  navy: "#1c1814",
  navyDeep: "#15120f",
  blue: "#15120f",
  blueSoft: "#f9e2d4",
  accent: "#ff8a50",
  accentDark: "#a8380b",
  accentSoft: "#f9e2d4",
  bgLight: "#f6f3ec",
  textDark: "#15120f",
  text: "#3f3a34",
  textMuted: "#6b635a",
  textOnDark: "#b9b0a3",
  border: "#ded6c8",
  white: "#fffdf8",
};

// Company contact lines printed in every email footer. Mirrors
// src/constants/company.js; empty values are left out.
const COMPANY = {
  name: "URL",
  legalName: "URL",
  siteUrl: "https://url.com",
  email: "contactus@url.com",
  phone: "",
};

// Displayed at 116px wide; the asset is 264px, so it stays sharp on a
// high-density screen.
const LOGO = {
  cid: "url-logo",
  filename: "url-logo.png",
  width: 112,
  height: 35,
  base64:
    "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" +
    "x0apGhLFgP8HyMJ5Ps68MqIAAAAASUVORK5CYII=",
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

module.exports = { BRAND, COMPANY, LOGO, logoAttachment };
