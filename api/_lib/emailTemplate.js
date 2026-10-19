// HTML layout for the confirmation emails, styled to match the website:
// deep-navy hero with the white logo, a blue-to-violet accent rule,
// rounded white cards on a pale mist page, Inter / Plus Jakarta Sans
// type, and the same blue gradient buttons.
//
// Built with tables and inline styles, because that is still the only thing
// every mail client agrees on. Outlook ignores border-radius, gradients and
// web fonts, so each of those has a solid fallback and the layout holds up
// without them.

const { BRAND, COMPANY, LOGO } = require("./brand");

const SITE_URL = COMPANY.siteUrl;
const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");

const FONT_BODY =
  "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";
const FONT_HEAD =
  "'Plus Jakarta Sans','Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

// Everything the visitor typed is escaped before it reaches the HTML, so
// their input cannot inject markup into their own inbox.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Label and value sit side by side on desktop. On a phone the media query in
// the <head> turns each cell into a block, so the label sits above its value
// and long values (emails, messages) get the full width.
function detailRows(rows) {
  return rows
    .map(([label, value], i) => {
      const rule = i ? `border-top:1px solid ${BRAND.border};` : "";
      return `<tr>
                  <td class="em-label" style="padding:14px 12px 14px 0;${rule}width:130px;vertical-align:top;font-family:${FONT_BODY};font-size:13px;color:${BRAND.textMuted}">${escapeHtml(label)}</td>
                  <td class="em-value" style="padding:14px 0;${rule}vertical-align:top;font-family:${FONT_BODY};font-size:14px;line-height:1.6;font-weight:600;color:${BRAND.textDark};white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere">${escapeHtml(value)}</td>
                </tr>`;
    })
    .join("\n");
}

function stepRows(steps) {
  return steps
    .map(
      ([title, text], i) => `<tr>
                  <td style="width:44px;padding:0 0 18px;vertical-align:top">
                    <div style="width:30px;height:30px;line-height:30px;border-radius:50%;background:${BRAND.blueSoft};color:${BRAND.accentDark};font-family:${FONT_HEAD};font-size:14px;font-weight:700;text-align:center">${i + 1}</div>
                  </td>
                  <td style="padding:4px 0 18px;vertical-align:top;font-family:${FONT_BODY}">
                    <div style="font-size:15px;font-weight:600;color:${BRAND.textDark}">${escapeHtml(title)}</div>
                    <div style="margin-top:3px;font-size:14px;line-height:1.6;color:${BRAND.textMuted}">${escapeHtml(text)}</div>
                  </td>
                </tr>`
    )
    .join("\n");
}

// {
//   preheader, eyebrow, title, intro,   strings
//   detailsHeading, rows: [[label, value]],
//   stepsHeading, steps: [[title, text]],
//   cta: { label, href },
//   contactEmail, footerNote
// }
function renderConfirmation(m) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta name="format-detection" content="telephone=no,address=no,email=no,date=no" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${escapeHtml(m.title)}</title>
    <!-- Honoured by Apple Mail and some others; everyone else falls back to
         the system font stack in the inline styles. -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet" />
    <!-- Desktop is the inline-styled default: a 600px card. The layout is
         fluid (width:100%; max-width:600px), so it already shrinks on a
         phone; this query, honoured by Gmail, Apple Mail, iOS and Android
         mail apps, then tightens spacing and stacks the detail rows. Clients
         that strip <style> still get the fluid layout. -->
    <style>
      @media only screen and (max-width: 620px) {
        .em-outer { padding: 16px 8px 24px !important; }
        .em-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .em-hero { padding-top: 26px !important; padding-bottom: 28px !important; }
        .em-body { padding-top: 28px !important; }
        .em-title { font-size: 24px !important; }
        .em-intro { font-size: 14px !important; }
        .em-details { padding-left: 16px !important; padding-right: 16px !important; }
        .em-label { display: block !important; width: auto !important; padding: 12px 0 2px !important; }
        .em-value { display: block !important; width: auto !important; padding: 0 0 12px !important; border-top: 0 !important; }
        .em-btn-table { width: 100% !important; }
        .em-btn { display: block !important; text-align: center !important; }
        .em-nowrap { display: block !important; }
        .em-sep { display: none !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.bgLight};-webkit-font-smoothing:antialiased">
    <!-- Preheader: the line of preview text in the inbox list. -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all">
      ${escapeHtml(m.preheader)}
      &#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;&#8203;
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.bgLight}">
      <tr>
        <td class="em-outer" align="center" style="padding:32px 12px 40px">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">

            <!-- Hero -->
            <tr>
              <td class="em-pad em-hero" style="background:${BRAND.navy};border-radius:16px 16px 0 0;padding:32px 40px 36px">
                <img src="cid:${LOGO.cid}" width="${LOGO.width}" height="${LOGO.height}" alt="URL" style="display:block;border:0;outline:none;text-decoration:none" />
                <div style="margin-top:32px">
                  <span style="display:inline-block;padding:5px 12px;border-radius:999px;background:rgba(142,168,255,.14);color:${BRAND.accent};font-family:${FONT_BODY};font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">${escapeHtml(m.eyebrow)}</span>
                </div>
                <h1 class="em-title" style="margin:16px 0 0;font-family:${FONT_HEAD};font-size:28px;line-height:1.2;font-weight:800;letter-spacing:-.02em;color:${BRAND.white}">${escapeHtml(m.title)}</h1>
                <p class="em-intro" style="margin:12px 0 0;font-family:${FONT_BODY};font-size:15px;line-height:1.65;color:${BRAND.textOnDark}">${escapeHtml(m.intro)}</p>
              </td>
            </tr>
            <!-- Accent rule: solid blue where gradients are not supported. -->
            <tr>
              <td style="height:4px;line-height:4px;font-size:0;background:${BRAND.blue};background-image:linear-gradient(90deg,#2e5bff,#6d4cff);">&nbsp;</td>
            </tr>

            <!-- Body -->
            <tr>
              <td class="em-pad em-body" style="background:${BRAND.white};border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};padding:36px 40px 12px">

                <div style="font-family:${FONT_BODY};font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${BRAND.textDark}">${escapeHtml(m.stepsHeading)}</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px">
                ${stepRows(m.steps)}
                </table>

                <div style="margin-top:14px;font-family:${FONT_BODY};font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${BRAND.textDark}">${escapeHtml(m.detailsHeading)}</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;background:${BRAND.bgLight};border:1px solid ${BRAND.border};border-radius:12px">
                  <tr><td class="em-details" style="padding:6px 22px">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${detailRows(m.rows)}
                    </table>
                  </td></tr>
                </table>

                <p style="margin:22px 0 0;font-family:${FONT_BODY};font-size:14px;line-height:1.65;color:${BRAND.textMuted}">
                  If anything above is wrong, simply reply to this email and we will correct it.
                </p>

                <!-- Button: a table cell so it keeps its padding in Outlook. -->
                <table class="em-btn-table" role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 32px">
                  <tr>
                    <td style="border-radius:12px;background:${BRAND.blue};background-image:linear-gradient(135deg,#2e5bff,#6d4cff)">
                      <a class="em-btn" href="${escapeHtml(m.cta.href)}" style="display:inline-block;padding:14px 26px;font-family:${FONT_BODY};font-size:15px;font-weight:600;color:${BRAND.white};text-decoration:none;border-radius:12px">${escapeHtml(m.cta.label)} &rarr;</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="em-pad" style="background:${BRAND.navyDeep};border-radius:0 0 16px 16px;padding:28px 40px;font-family:${FONT_BODY};font-size:13px;line-height:1.8;color:${BRAND.textOnDark}">
                <div style="font-family:${FONT_HEAD};font-size:15px;font-weight:700;color:${BRAND.white}">The ${COMPANY.name} Team</div>
                <!-- Each item is unbreakable on desktop and gets its own line
                     on a phone, instead of wrapping mid-number. -->
                <span class="em-nowrap" style="white-space:nowrap"><a href="mailto:${escapeHtml(m.contactEmail)}" style="color:${BRAND.accent};text-decoration:none">${escapeHtml(m.contactEmail)}</a></span>
                <span class="em-sep">&nbsp;&middot;&nbsp;</span>
                <span class="em-nowrap" style="white-space:nowrap"><a href="${SITE_URL}" style="color:${BRAND.accent};text-decoration:none">${escapeHtml(SITE_HOST)}</a></span>${COMPANY.phone ? `<br class="em-sep" />
                <span class="em-nowrap" style="white-space:nowrap"><a href="tel:${escapeHtml(COMPANY.phone.replace(/[^\d+]/g, ""))}" style="color:${BRAND.textOnDark};text-decoration:none">${escapeHtml(COMPANY.phone)}</a></span>` : ""}
                <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,.1);font-size:12px;color:#8a93a6">
                  ${escapeHtml(m.footerNote)}<br />
                  &copy; ${new Date().getFullYear()} ${escapeHtml(COMPANY.legalName)}. All rights reserved.
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// The plain-text part, for clients that do not render HTML and for the
// spam filters that compare the two.
function renderConfirmationText(m) {
  return [
    m.title,
    ``,
    m.intro,
    ``,
    m.stepsHeading.toUpperCase(),
    ...m.steps.map(([title, text], i) => `${i + 1}. ${title} — ${text}`),
    ``,
    m.detailsHeading.toUpperCase(),
    ...m.rows.map(([label, value]) => `${label}: ${value}`),
    ``,
    `If anything above is wrong, simply reply to this email and we will correct it.`,
    ``,
    `${m.cta.label}: ${m.cta.href}`,
    ``,
    `The ${COMPANY.name} Team`,
    `${m.contactEmail} | ${SITE_HOST}`,
    ...(COMPANY.phone ? [COMPANY.phone] : []),
    ``,
    m.footerNote,
  ].join("\n");
}

module.exports = { renderConfirmation, renderConfirmationText, escapeHtml, SITE_URL };
