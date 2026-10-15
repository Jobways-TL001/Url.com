// Single source of truth for everything the site says about the company.
//
// Every value marked TODO is a placeholder: fill it in with your real
// details. Anything left as an empty string (or an empty list) is simply
// not shown — the footer, contact page and legal pages hide that line
// rather than display a made-up value.
//
// The serverless email templates keep their own copy of the contact lines
// in api/_lib/brand.js (they run in Node, outside the React bundle); keep
// the two in step.

export const COMPANY = {
  // Public brand name, used in copy, titles and alt text.
  name: "URL",
  // Domain shown to visitors.
  domain: "url.com",
  siteUrl: "https://url.com",
  // TODO: registered legal entity, e.g. "URL Technologies Pvt Ltd".
  legalName: "URL",
  // One-line description used in the footer and meta description.
  tagline:
    "Live, mentor-led artificial intelligence courses that take you from first principles to job-ready projects.",

  // Inbox that receives contact-form enquiries (also set in api/_lib/mailer.js).
  email: "contactus@url.com",
  // TODO: support inbox quoted in the Terms and Privacy Policy.
  supportEmail: "support@url.com",
  // TODO: main phone in international format, e.g. "+1 555 010 0000".
  phone: "",
  // TODO: e.g. "Mon – Fri, 9:00 – 18:00".
  hours: "Mon – Fri, 9:00 – 18:00",

  // TODO: offices shown on the contact page. Each entry:
  // { city, company, address, phone, email, mapEmbedUrl }
  // `mapEmbedUrl` is the src of a Google Maps "Embed a map" iframe.
  // With no offices, the "Visit us" section is hidden.
  offices: [],

  // TODO: governing law named in the Terms and Conditions.
  jurisdiction: "",

  // TODO: social profiles. Entries with an empty href are hidden.
  socials: {
    linkedin: "",
    instagram: "",
    youtube: "",
    facebook: "",
  },
};

// The phone number as a tel: link, or null when no phone is configured.
export const telHref = (phone) =>
  phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null;
