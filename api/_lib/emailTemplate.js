// HTML layout for the confirmation emails, styled to match the website:
// navy hero with the white logo, a blue-to-teal accent rule, rounded white
// cards on a light grey page, Inter / Plus Jakarta Sans type, and the same
// blue buttons.
//
// Built with tables and inline styles, because that is still the only thing
// every mail client agrees on. Outlook ignores border-radius, gradients and
// web fonts, so each of those has a solid fallback and the layout holds up
// without them.

const { BRAND, LOGO } = require("./brand");

const SITE_URL = "https://url.com";

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
                  <td class="jw-label" style="padding:14px 12px 14px 0;${rule}width:130px;vertical-align:top;font-family:${FONT_BODY};font-size:13px;color:${BRAND.textMuted}">${escapeHtml(label)}</td>
                  <td class="jw-value" style="padding:14px 0;${rule}vertical-align:top;font-family:${FONT_BODY};font-size:14px;line-height:1.6;font-weight:600;color:${BRAND.textDark};white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere">${escapeHtml(value)}</td>
                </tr>`;
    })
    .join("\n");
}

function stepRows(steps) {
  return steps
    .map(
      ([title, text], i) => `<tr>
                  <td style="width:44px;padding:0 0 18px;vertical-align:top">
                    <div style="width:30px;height:30px;line-height:30px;border-radius:50%;background:${BRAND.blueSoft};color:${BRAND.blue};font-family:${FONT_HEAD};font-size:14px;font-weight:700;text-align:center">${i + 1}</div>
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
        .jw-outer { padding: 16px 8px 24px !important; }
        .jw-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .jw-hero { padding-top: 26px !important; padding-bottom: 28px !important; }
        .jw-body { padding-top: 28px !important; }
        .jw-title { font-size: 24px !important; }
        .jw-intro { font-size: 14px !important; }
        .jw-details { padding-left: 16px !important; padding-right: 16px !important; }
        .jw-label { display: block !important; width: auto !important; padding: 12px 0 2px !important; }
        .jw-value { display: block !important; width: auto !important; padding: 0 0 12px !important; border-top: 0 !important; }
        .jw-btn-table { width: 100% !important; }
        .jw-btn { display: block !important; text-align: center !important; }
        .jw-nowrap { display: block !important; }
        .jw-sep { display: none !important; }
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
        <td class="jw-outer" align="center" style="padding:32px 12px 40px">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px">

            <!-- Hero -->
            <tr>
              <td class="jw-pad jw-hero" style="background:${BRAND.navy};background-image:radial-gradient(420px 220px at 100% 0%,rgba(37,99,235,.45),rgba(10,22,48,0) 70%);border-radius:16px 16px 0 0;padding:32px 40px 36px">
                <img src="cid:${LOGO.cid}" width="${LOGO.width}" height="${LOGO.height}" alt="URL" style="display:block;border:0;outline:none;text-decoration:none" />
                <div style="margin-top:32px">
                  <span style="display:inline-block;padding:5px 12px;border-radius:999px;background:rgba(46,230,193,.14);color:${BRAND.accent};font-family:${FONT_BODY};font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">${escapeHtml(m.eyebrow)}</span>
                </div>
                <h1 class="jw-title" style="margin:16px 0 0;font-family:${FONT_HEAD};font-size:28px;line-height:1.2;font-weight:800;letter-spacing:-.02em;color:${BRAND.white}">${escapeHtml(m.title)}</h1>
                <p class="jw-intro" style="margin:12px 0 0;font-family:${FONT_BODY};font-size:15px;line-height:1.65;color:${BRAND.textOnDark}">${escapeHtml(m.intro)}</p>
              </td>
            </tr>
            <!-- Accent rule: solid teal where gradients are not supported. -->
            <tr>
              <td style="height:4px;line-height:4px;font-size:0;background:${BRAND.accent};background-image:linear-gradient(90deg,${BRAND.blue},${BRAND.accent})">&nbsp;</td>
            </tr>

            <!-- Body -->
            <tr>
              <td class="jw-pad jw-body" style="background:${BRAND.white};border-left:1px solid ${BRAND.border};border-right:1px solid ${BRAND.border};padding:36px 40px 12px">

                <div style="font-family:${FONT_BODY};font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${BRAND.textDark}">${escapeHtml(m.stepsHeading)}</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px">
                ${stepRows(m.steps)}
                </table>

                <div style="margin-top:14px;font-family:${FONT_BODY};font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:${BRAND.textDark}">${escapeHtml(m.detailsHeading)}</div>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:14px;background:${BRAND.bgLight};border:1px solid ${BRAND.border};border-radius:12px">
                  <tr><td class="jw-details" style="padding:6px 22px">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                ${detailRows(m.rows)}
                    </table>
                  </td></tr>
                </table>

                <p style="margin:22px 0 0;font-family:${FONT_BODY};font-size:14px;line-height:1.65;color:${BRAND.textMuted}">
                  If anything above is wrong, simply reply to this email and we will correct it.
                </p>

                <!-- Button: a table cell so it keeps its padding in Outlook. -->
                <table class="jw-btn-table" role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0 32px">
                  <tr>
                    <td style="border-radius:12px;background:${BRAND.blue}">
                      <a class="jw-btn" href="${escapeHtml(m.cta.href)}" style="display:inline-block;padding:14px 26px;font-family:${FONT_BODY};font-size:15px;font-weight:600;color:${BRAND.white};text-decoration:none;border-radius:12px">${escapeHtml(m.cta.label)} &rarr;</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="jw-pad" style="background:${BRAND.navyDeep};border-radius:0 0 16px 16px;padding:28px 40px;font-family:${FONT_BODY};font-size:13px;line-height:1.8;color:${BRAND.textOnDark}">
                <div style="font-family:${FONT_HEAD};font-size:15px;font-weight:700;color:${BRAND.white}">The URL Team</div>
                <!-- Each item is unbreakable on desktop and gets its own line
                     on a phone, instead of wrapping mid-number. -->
                <span class="jw-nowrap" style="white-space:nowrap"><a href="mailto:${escapeHtml(m.contactEmail)}" style="color:${BRAND.accent};text-decoration:none">${escapeHtml(m.contactEmail)}</a></span>
                <span class="jw-sep">&nbsp;&middot;&nbsp;</span>
                <span class="jw-nowrap" style="white-space:nowrap"><a href="${SITE_URL}" style="color:${BRAND.accent};text-decoration:none">url.com</a></span><br class="jw-sep" />
                <span class="jw-nowrap" style="white-space:nowrap">US <a href="tel:+12405250547" style="color:${BRAND.textOnDark};text-decoration:none">+1 240 525 0547</a></span>
                <span class="jw-sep">&nbsp;&middot;&nbsp;</span>
                <span class="jw-nowrap" style="white-space:nowrap">India <a href="tel:+918801091975" style="color:${BRAND.textOnDark};text-decoration:none">+91 88010 91975</a></span>
                <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,.1);font-size:12px;color:#6f7d95">
                  ${escapeHtml(m.footerNote)}<br />
                  &copy; ${new Date().getFullYear()} URL Point LLP. All rights reserved.
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
    `The URL Team`,
    `${m.contactEmail} | url.com`,
    `US +1 240 525 0547 | India +91 88010 91975`,
    ``,
    m.footerNote,
  ].join("\n");
}

module.exports = { renderConfirmation, renderConfirmationText, escapeHtml, SITE_URL };
