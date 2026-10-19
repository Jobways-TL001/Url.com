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
// 256x80, rendered from public/brand/url-logo-light.svg. It sits on the
// dark header band of the emails.

// Taken from the design tokens in src/index.css, so the mail matches the
// site. Keys keep their original names so the template need not change.
const BRAND = {
  navy: "#070d1f",
  navyDeep: "#0f1830",
  blue: "#2e5bff",
  blueSoft: "#e9eeff",
  accent: "#8ea8ff",
  accentDark: "#1f45d6",
  accentSoft: "#e9eeff",
  bgLight: "#f6f8fc",
  textDark: "#0b1324",
  text: "#334155",
  textMuted: "#5a6478",
  textOnDark: "#a9b4cc",
  border: "#e4e9f2",
  white: "#ffffff",
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

// Displayed at 112px wide; the asset is 256px, so it stays sharp on a
// high-density screen.
const LOGO = {
  cid: "url-logo",
  filename: "url-logo.png",
  width: 112,
  height: 35,
  base64:
    "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",
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
