# URL

React 18 (Create React App) site deployed on Vercel. A serverless function
emails contact-form enquiries over SMTP via Nodemailer and stores them in
Supabase, and an `/admin` dashboard lets the team review and follow them up.

## Brand and company details

- **Company details** (legal name, emails, phone, hours, offices, socials,
  governing law) live in `src/constants/company.js`. Empty values are hidden
  on the site rather than shown as placeholders. The email templates keep a
  copy in `COMPANY` in `api/_lib/brand.js`; keep the two in step.
- **Colours and type** are design tokens at the top of `src/index.css`
  (forest / emerald / amber palette, Sora + Manrope).
- **Logo**: `src/components/ui/Logo.jsx` (inline SVG). Static copies are in
  `public/brand/`, plus `public/favicon.svg`, `favicon.ico`, `logo192.png`
  and `logo512.png`.

## Layout

```
src/                React app; routes defined in src/App.js
public/             static assets
api/send-email.js     serverless function; emails form submissions
api/admin/*.js        admin dashboard API: login, logout, session, stats, submissions
api/_lib/             shared server code (not routes): Supabase, admin auth, email
src/pages/Admin/      the /admin dashboard (lazy-loaded)
supabase/migrations/  SQL to apply in the Supabase SQL editor, in order
scripts/dev-api.js    serves api/ locally so the form works with npm start
scripts/test-mail.js  checks SMTP credentials from the command line
src/setupProxy.js     dev-only: routes /api from :3000 to scripts/dev-api.js
vercel.json         framework preset, function config and SPA rewrites
.env.example        the environment variables to set
```

Routes (defined once in `src/constants/routes.js`): `/`, `/courses`,
`/courses/:id`, `/about`, `/contact`, `/legal/terms`, `/legal/privacy`,
`/legal/disclaimer`, `/payment`, `/payment/success`, `/admin`.

The old paths (`/ai-courses`, `/about-us`, `/contact-us`,
`/TermsAndConditions`, `/Privacypolicy`, `/Disclaimer`, `/e-learning`) redirect
to their new equivalents, so older links and emails keep working.

## Contact forms

The contact page and the homepage modal both POST this JSON to
`/api/send-email`:

```js
{ name, number, email, service, message, source }
```

- `name`, `email` and `message` are required; the function rejects anything
  else with a 400.
- `service` must be one of the slugs in `src/constants/services.js`; anything
  else is reported as "Not specified". The lists in that file and in
  `api/send-email.js` must be kept in step.
- `number` arrives as a dial code and a national number, e.g. `+91 9876543210`,
  or empty.
- `source` is `contact-page` or `home-modal`, and appears at the foot of the
  mail so you can tell where an enquiry came from.

### Two emails per submission

1. **Notification** to `contactus@url.com` — the lead. Plain text, with the visitor on
   `Reply-To` so hitting reply answers them.
2. **Acknowledgement** to the visitor — confirms the enquiry arrived and
   echoes a copy of what they submitted. Branded HTML with a plain-text
   alternative, and marked `Auto-Submitted: auto-replied` so a visitor's
   out-of-office or ticketing system does not reply and start a mail loop.

The acknowledgement uses the site's own palette (`src/pages/Home/home.css`
`:root`), mirrored in `api/_lib/brand.js`, and carries the real URL logo.
The logo is embedded as base64 in that module and attached with a `cid:`
reference rather than linked from the site, so it renders before the domain
is live, without the recipient having to allow remote images, and without
the serverless bundle needing to ship a binary. Keep the two colour lists in
step if the brand changes.

Both messages go over **one pooled SMTP connection per request**, closed in a
`finally`. Opening a separate connection per message made this mailbox
intermittently time out on the second one. A transport-level failure
(`ETIMEDOUT`, `ESOCKET`, an SMTP 4xx) is retried once after 1.5s; a 5xx is
not, since it will fail again just as fast.

Do not tighten the transporter timeouts in `api/send-email.js` without
testing against the live server: this host's TLS handshake has been measured
taking over 7 seconds, and a 7s `connectionTimeout` turned every send into an
`ETIMEDOUT`. `maxDuration` in `vercel.json` is 30s to leave room for them.

The two are deliberately not treated alike. The notification carries the lead,
so if it fails the function returns a 500 and the visitor is asked to try
again. The acknowledgement is a courtesy: if it fails the request still
succeeds (`{"acknowledged": false}` in the response) rather than prompting a
resubmit, which would deliver the same lead twice. A failed acknowledgement is
only visible in the function logs.

Nothing is persisted, so a failed notification is a lost enquiry — watch the
function logs in Vercel.

Both are sent **as** the authenticated mailbox, never as the visitor. Sending
as `visitor@gmail.com` from our SMTP server fails SPF and DMARC and gets
spam-foldered; `Reply-To` carries the visitor instead, so replies still
reach them.

The acknowledgement HTML (`api/_lib/emailTemplate.js`) is responsive: a
600px card on desktop that shrinks to the screen on a phone, where a media
query also tightens spacing, stacks the enquiry details label-over-value and
makes the button full width. Clients that strip `<style>` still get the fluid
layout.

### Field validation

Both forms validate through `src/utils/formValidation.js`, so they accept
exactly the same input. The server revalidates everything in
`api/send-email.js`, because anything done in the browser can be bypassed by
posting to the endpoint directly.

| Field | Rule |
| --- | --- |
| Name | Required. 2–100 characters, letters only — any script, plus spaces, hyphens, apostrophes and periods. Digits are stripped as typed. |
| Phone | Optional. Country dial code from `src/constants/countries.js` plus 6–15 digits; non-digits are stripped as typed, and the code and number together must fit E.164's 15-digit limit. |
| Email | Required. Same pattern as the server. |
| Service | Required. Must be a slug from `src/constants/services.js`. |
| Message | Required. 10–2000 characters. |

The name rule allows Unicode marks (`\p{M}`) as well as letters. Without them
the combining vowel signs in Devanagari and most Indic scripts are rejected,
so a name like "राहुल" would fail.

The dial code uses `src/components/CountrySelect`, not a native `<select>`.
A select's type-ahead only matches the *start* of an option's label, so with
"+1 United States" there is no way to reach a country by typing its name, and
putting the name first truncates the dial code in the closed control — which
is the part worth seeing. The component shows just the flag and code when
closed, and opens a searchable list: typing matches country name or dial
code, accents are folded ("Turkiye" finds "Türkiye"), and a prefix hit ranks
above a mid-name one. Arrow keys, Home/End, Enter, Escape and click-outside
all work.

Errors appear once a field has been left or the form submitted, never while
someone is still typing in it, and clear as soon as the value is fixed. On a
failed submit the first invalid field takes focus. Each form sets
`noValidate` and validates in JS, so the browser's own bubbles stay out of
the way — which is also why an unselected service is greyed by a
`*-select-placeholder` class rather than by `:invalid`.

## Environment variables

Copy `.env.example` to `.env.local` for local work, and set the same values in
Vercel under Project Settings -> Environment Variables.

| Variable | Used for |
| --- | --- |
| `SMTP_HOST` | mail server, e.g. `p3plzcpnl505439.prod.phx3.secureserver.net` (this is the fallback if unset) |
| `SMTP_PORT` | `465` (implicit TLS, the fallback) or `587` (STARTTLS) |
| `AUTH_USER` | SMTP mailbox login; also the From address |
| `AUTH_PASSWORD` | SMTP mailbox password |
| `ADMIN_EMAIL` | `/admin` sign-in email |
| `ADMIN_PASSWORD` | `/admin` sign-in password |
| `STRIPE_WEBHOOK_SECRET` | verifying Stripe payment events (`whsec_...`) |
| `SUPABASE_URL` | storing enquiries; admin dashboard data |
| `SUPABASE_SERVICE_ROLE_KEY` | as above |

The recipient (`contactus@url.com`) is fixed in `api/send-email.js`.

All are server-only. Never add a `REACT_APP_` prefix to any of them — Create
React App inlines `REACT_APP_*` variables into the public browser bundle,
which would publish the mailbox password.

## Local development

```bash
npm install
npm run dev:api   # terminal 1: serves /api on :3001
npm start         # terminal 2: React dev server on :3000
```

Open http://localhost:3000/contact and submit the form. `src/setupProxy.js`
forwards `/api/*` from :3000 to the API server, so the browser posts to the
same `/api/send-email` path it uses in production, and the mail really goes
out to `contactus@url.com`.

`npm start` on its own does **not** serve `/api`. Submitting the form without
`npm run dev:api` running returns a 502 saying so, rather than an opaque
dev-server error.

`scripts/dev-api.js` re-reads the handler on every request, so edits to
`api/send-email.js` take effect without restarting it. It is a development
convenience only — Vercel serves `api/` itself, and `setupProxy.js` is ignored
by `npm run build`.

`npm run dev` (`vercel dev`) is the alternative, closer to production but
heavier: install the CLI with `npm i -g vercel`, then `vercel link`.

### Testing without a browser

With `npm run dev:api` running, post the same payload the forms send:

```bash
curl -i -X POST http://localhost:3001/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"you@example.com","number":"+91 00000 00000",
       "service":"e-learning","message":"Local test","source":"contact-page"}'
```

Expect `200 {"message":"Email successfully sent","acknowledged":true}`, and
two emails: the notification to `contactus@url.com` and the acknowledgement to the
address in `email`. Put your own address there to see the customer copy. The
function answers `405` to a GET, and `400` to a missing field, a malformed
address or bad JSON.

### Checking SMTP credentials only

```bash
npm run test:mail            # connect and authenticate only, sends nothing
npm run test:mail -- --send  # also deliver one real test message to contactus@url.com
```

Both read `.env.local`. A `535 Incorrect authentication data` means the host is
reachable but the mailbox username or password is wrong — reset it with the
mail provider and update both `.env.local` and Vercel. Do not retry a failing
login repeatedly; mail servers block the source IP after a few attempts.

## Phone numbers

Every form validates the phone number against the selected country's
numbering plan with `libphonenumber-js` (the "max" metadata, which checks
real number patterns, not just length). The same check runs in
`api/send-email.js`, which also stores and emails the number in
international format (`+91 98765 43210`). Typing the country code again in
the number field gets a specific hint; a national trunk prefix (`07911…` in
the UK) is accepted and dropped.

## Course enrolment and payment

Payment is the required second step of an enrolment:

1. The learner submits the enrolment form on `/courses` or a course page. The details are
   stored and emailed as before.
2. A "Details submitted successfully" confirmation shows, then redirects to
   `/payment?course=<id>` after 3 seconds. It cannot be dismissed.
3. `/payment` shows the order and the learner's details (handed over in
   `sessionStorage`, never in the URL) and a "Pay Securely with Stripe"
   button that opens the course's Stripe payment link, with the learner's
   email prefilled and the enquiry id as `client_reference_id`.
4. If a course has no link yet, the page says the team will email one.

Payment links are managed in `/admin` -> Payment links (stored in
`public.course_payment_links`, migration 0005). Only `https` links on
`buy.stripe.com`, `checkout.stripe.com` or `donate.stripe.com` are accepted.
In Stripe, set each link's after-payment redirect to `/payment/success`.

## Admin dashboard

`/admin` lists every enquiry stored in Supabase: headline counts, search,
filters (status, source, period, failed delivery), a detail panel per
enquiry, a follow-up status (new, contacted, enrolled, closed) and CSV
export. It works on desktop and phone.

Setup, once:

1. Apply `supabase/migrations/0004_admin_status.sql` and
   `0005_course_payment_links.sql` (and 0001–0003 if not already applied) in
   the Supabase SQL editor.
2. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Vercel, then redeploy.

There is one admin login. To change it, edit the two variables and redeploy;
changing `ADMIN_PASSWORD` also signs out every open session.

How it is secured: the browser only talks to `/api/admin/*`. Sign-in is
checked against the environment variables with a constant-time comparison
and a one-second delay on failure. A successful sign-in sets a signed,
12-hour session token in an `HttpOnly`, `SameSite=Strict` cookie scoped to
`/api/admin`, checked on every request. Enquiries are read from Supabase
server-side with the service role key. The page is `noindex`.

## Payment emails

Stripe reports how each checkout ended to `POST /api/stripe-webhook`. The
request is signed; the function checks the signature with
`STRIPE_WEBHOOK_SECRET` and ignores anything unsigned. The enquiry is found by
the `client_reference_id` the /payment page attached.

| Stripe event | Learner gets | Team gets | Enquiry |
| --- | --- | --- | --- |
| `checkout.session.completed` (paid) | "You're enrolled" | Payment received | `payment_status = paid`, status Paid (automatic) |
| `checkout.session.async_payment_succeeded` | same | same | same |
| `checkout.session.async_payment_failed` | "Payment not completed" + link to retry | Payment failed | `failed` |
| `checkout.session.expired` (not paid) | same | Payment not completed | `expired` |

A declined card does not end a checkout (the learner can retry on Stripe's
page), so declines are not emailed individually; if they give up, the expiry
email follows. Each event id is stored in `stripe_events`, so Stripe's
retries never send a second email.

Setup: apply `supabase/migrations/0006_payments.sql`; in Stripe ->
Developers -> Webhooks add the endpoint
`https://<your-domain>/api/stripe-webhook` with the four events above; put its
signing secret in `STRIPE_WEBHOOK_SECRET` and redeploy.

## Deploying

```bash
vercel          # preview deployment
vercel --prod   # production
```

Or push to `main` and Vercel builds automatically. Nodemailer 10 needs Node
20+, which `engines.node` in `package.json` pins for the function runtime.
