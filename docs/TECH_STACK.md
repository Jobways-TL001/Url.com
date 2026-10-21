# Tech Stack

**Product:** URL (url.com): AI course website, enrolment and payments
**Companion document:** [BRD.md](./BRD.md)
**Date:** 21 October 2026

---

## 1. Summary

| Layer | Technology |
|---|---|
| Frontend | React 18, Create React App (`react-scripts` 5.0.1), React Router 6 |
| UI | Bootstrap 5.3 + React-Bootstrap 2.9, custom "Meridian" design system (CSS custom properties), Font Awesome 6 |
| Backend | Vercel Serverless Functions (Node.js 24.x), plain JavaScript handlers in `api/` |
| Database | Supabase (PostgreSQL) via `@supabase/supabase-js` 2.x, service-role key, server-side only |
| Payments | Stripe Checkout + Webhooks, called over the Stripe REST API with `fetch` (no Stripe SDK) |
| Email | Nodemailer 10 over SMTP (implicit TLS on 465, or STARTTLS on 587) |
| Validation | Shared validation module + `libphonenumber-js` (max metadata) |
| Hosting / CI | Vercel: builds on push to `main`, preview deployments, SPA rewrites |
| Testing | Jest + React Testing Library (via CRA) |

## 2. Architecture

```
                ┌─────────────────────────────── Vercel ───────────────────────────────┐
 Browser ──────▶│ Static SPA (build/)          Serverless functions (api/)              │
 (React SPA)    │  React Router routes  ──▶    send-email   checkout   course-fees      │
                │                              locate       stripe-webhook              │
                │                              admin/{auth, submissions, stats,         │
                │                                     state-taxes, email-previews}      │
                └───────────────┬──────────────────┬──────────────────┬─────────────────┘
                                │                  │                  │
                         Supabase Postgres     Stripe API         SMTP server
                         (enquiries, rates,    (Checkout,         (notifications,
                          events, ledger)       webhooks)          acknowledgements)
                                ▲
                                │ shared DB
                    Accounts dashboard (Jobways.urladmin)
```

- **SPA + functions on one origin.** The React build is served as static files. Any path that is not `/api/*` is rewritten to `index.html`.
- **The browser never talks to Supabase or Stripe directly.** All privileged calls go through `/api/*`, using secrets held only in server environment variables.

## 3. Frontend

| Concern | Choice | Notes |
|---|---|---|
| Framework | React 18.2 | Function components and hooks |
| Build tool | Create React App 5 (`react-scripts`) | ESLint `react-app` config; Babel |
| Routing | `react-router-dom` 6.19 | Routes defined once in `src/constants/routes.js`; legacy-path redirects |
| Code splitting | `React.lazy` | Admin, Payment and Payment Success are lazy-loaded |
| Styling | Bootstrap 5.3, React-Bootstrap 2.9, per-page CSS | Design tokens at the top of `src/index.css` |
| Typography | Google Fonts: Inter (body), Plus Jakarta Sans (display) | Loaded in `public/index.html` |
| Icons | Font Awesome 6 (solid, regular, brands) | `@fortawesome/react-fontawesome` |
| Images | WebP | Credits in `public/images/CREDITS.md` |
| Phone input | Custom `CountrySelect` + `libphonenumber-js` | Searchable, ignores accents, works by keyboard |
| State sharing | Custom hooks (`useUserState`, `useCourseFees`) + `sessionStorage` | No Redux; enrolment hand-off to the payment page goes through `sessionStorage` |
| SEO | `PageMeta` component | Per-page title and description |
| Metrics | `web-vitals` 2.x | |

**Key folders**

```
src/
  App.js                  route table
  constants/              company, courses, services, routes, countries, usStates
  components/             CountrySelect, CourseFinder (+ scoring.js), ui/*
  pages/                  Home, Learnings (catalogue, detail, EnrollModal), About,
                          Contact, Payment, Agreements (legal), Admin, Header, Footer, Modal
  utils/                  formValidation, courseFees, userState, enrolmentSession,
                          PageMeta, useScrollReveal
```

## 4. Backend (serverless API)

Runtime: **Node.js 24.x** (pinned in `engines.node`; Nodemailer 10 needs ≥ 20).
Timeouts: `api/*.js` = 30 s (to allow for slow SMTP TLS), `api/admin/*.js` = 15 s.

| Endpoint | File | Method | Purpose |
|---|---|---|---|
| `/api/send-email` | `api/send-email.js` | POST | Validate, store in Supabase, send notification and acknowledgement |
| `/api/course-fees` | `api/course-fees.js` | GET | Final fee per US state (no rates exposed) |
| `/api/locate` | `api/locate.js` | GET | Country and state from Vercel geo-IP headers |
| `/api/checkout` | `api/checkout.js` | GET | Price the enquiry on the server; create a Stripe Checkout session (USD) |
| `/api/stripe-webhook` | `api/stripe-webhook.js` | POST | Verify signature, process each event once, update the enquiry, send payment emails |
| `/api/admin/login`, `logout`, `session` | `api/admin/auth.js` | POST/GET | One function, reached through `vercel.json` rewrites |
| `/api/admin/submissions` | `api/admin/submissions.js` | GET / PATCH | List enquiries; update follow-up status |
| `/api/admin/stats` | `api/admin/stats.js` | GET | Dashboard counts and payment stats |
| `/api/admin/state-taxes` | `api/admin/state-taxes.js` | GET / PUT | Read and write per-state pricing inputs |
| `/api/admin/email-previews` | `api/admin/email-previews.js` | GET | Render every email template with sample data |

**Shared server code (`api/_lib/`, not deployed as routes):**
`supabase.js` (client), `adminAuth.js` (HMAC sessions), `mailer.js` (Nodemailer transport + retry),
`emailTemplate.js` (responsive HTML email), `brand.js` (palette, company lines, base64 logo),
`courseFee.js` (fee formula), `usStates.js`.

**Function budget:** 10 of the 12 allowed on Vercel Hobby. Files starting with `_` and files in `_lib/` don't count.

## 5. Data layer

- **Supabase (PostgreSQL 15+)**, reached with `@supabase/supabase-js` 2.117 and the **service-role key**, server-side only.
- **Row-level security is enabled** on every table, with no public policies, so the anon key can read nothing.
- **Migrations** are plain SQL in `supabase/migrations/`, applied in order in the Supabase SQL editor:

| # | Migration | Change |
|---|---|---|
| 0001 | contact_submissions | Base enquiries table |
| 0002 | add_service | `service` column |
| 0003 | enrolment_and_ack | `enrolment` JSONB, `acknowledged` |
| 0004 | admin_status | Follow-up `status`, `updated_at` |
| 0005 | course_payment_links | *(obsolete, no longer read)* |
| 0006 | payments | Payment columns + `stripe_events` |
| 0007 | remove_inherited_payment_link | Clean-up |
| 0008 | accounts_ledger | `ledger_events`, `ledger_sessions`, `ledger_charges`, `ledger_disputes`, `ledger_payouts`, `ledger_resolutions` |
| 0009 | state_tax_rates | Per-state pricing table with CHECK constraints |
| 0010 | state_tax_margin_usd | Margin changed from % to USD |
| 0011 | state_minimum_wage_defaults | Fills blank pay rates with each state's minimum wage |
| 0012 | state_rates_2026 | 2026 pay rates and payroll tax figures |

## 6. Third-party integrations

### Stripe
- Checkout Sessions are created with a `POST` to `https://api.stripe.com/v1/checkout/sessions` (form-encoded, `mode=payment`, `currency=usd`, inline `price_data`).
- `client_reference_id` = enquiry ID; `customer_email` is prefilled.
- Webhook events handled: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired`.
- Signatures are verified by hand (HMAC-SHA256 over `timestamp.payload`, `crypto.timingSafeEqual`).
- A second webhook endpoint for the accounts dashboard is configured in Stripe and uses its own secret.

### SMTP (Nodemailer)
- Host defaults to the GoDaddy cPanel server; port 465 (TLS) or 587 (STARTTLS).
- One pooled connection per request, closed in `finally`. One retry after 1.5 s on transient errors.
- The logo is attached inline as a `cid:` image (base64 in code), so it shows without the recipient loading remote images.

### Vercel platform
- Geo-IP headers `x-vercel-ip-country` and `x-vercel-ip-country-region` are used for state detection.
- Rewrites (admin auth, SPA fallback) and headers (`X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store` on `/admin/*`).

## 7. Security

| Area | Implementation |
|---|---|
| Secrets | Server-only environment variables; `REACT_APP_*` is forbidden for secrets |
| Admin auth | Credentials from env; constant-time compare (hash both, then `timingSafeEqual`); 1 s delay on failure |
| Sessions | HMAC-SHA256 signed token (base64url), 12 h lifetime; `HttpOnly`, `SameSite=Strict`, `Path=/api/admin` cookie |
| Webhooks | Stripe signature verification; event IDs stored so each is processed once |
| Input | Validated on both client and server; E.164 phone checks; Unicode-aware name rule |
| Pricing | Fee calculated on the server from stored state; rates and margins never sent to the client |
| Email | Sent as the authenticated mailbox (SPF/DMARC aligned); visitor goes in Reply-To |

## 8. Environment variables

| Variable | Purpose |
|---|---|
| `SMTP_HOST` | Mail server hostname |
| `SMTP_PORT` | `465` (default) or `587` |
| `AUTH_USER` | SMTP login and From address |
| `AUTH_PASSWORD` | SMTP password |
| `ADMIN_EMAIL` | Admin sign-in email |
| `ADMIN_PASSWORD` | Admin sign-in password (also used to sign sessions) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side DB access |
| `STRIPE_SECRET_KEY` | Creating Checkout sessions (online payment is off until this is set) |
| `STRIPE_WEBHOOK_SECRET` | Verifying webhook signatures (`whsec_...`) |

Local: `.env.local` (copied from `.env.example`). Production: Vercel → Project Settings → Environment Variables.

## 9. Development and tooling

| Task | Command |
|---|---|
| Install | `npm install` |
| Local API server (:3001) | `npm run dev:api` (`scripts/dev-api.js`, reloads handlers on each request, applies the same rewrites) |
| React dev server (:3000) | `npm start` (`src/setupProxy.js` forwards `/api/*` to :3001) |
| Full Vercel emulation | `npm run dev` (`vercel dev`) |
| SMTP credential check | `npm run test:mail` / `npm run test:mail -- --send` |
| Tests | `npm test` (Jest + React Testing Library) |
| Production build | `npm run build` → `build/` |

## 10. Deployment

- **Hosting:** Vercel, framework preset `create-react-app`, output `build/`.
- **Continuous deployment:** a push to `main` triggers a production build. Other branches get preview URLs.
- **Manual:** `vercel` (preview), `vercel --prod` (production).
- **Database:** SQL migrations are applied by hand in Supabase before deploying code that depends on them.
- **Stripe:** register the webhook endpoint `https://<domain>/api/stripe-webhook` with the four events above.

## 11. Dependency versions

| Package | Version |
|---|---|
| react / react-dom | ^18.2.0 |
| react-scripts | 5.0.1 |
| react-router-dom | ^6.19.0 |
| bootstrap | ^5.3.2 |
| react-bootstrap | ^2.9.2 |
| @supabase/supabase-js | ^2.117.3 |
| nodemailer | ^10.0.16 |
| libphonenumber-js | ^1.13.15 |
| @fortawesome/* | ^6.5.1 (react-fontawesome ^0.2.0) |
| web-vitals | ^2.1.4 |
| @testing-library/react | ^13.4.0 |
| Node.js (runtime) | 24.x |

## 12. Known technical debt and recommendations

1. **Create React App is deprecated.** Plan a move to Vite (or Next.js if server rendering or SEO becomes a priority).
2. **Test coverage is minimal** (only `App.test.js`). Add unit tests for `formValidation`, `courseFee` and `scoring.js`, and integration tests for `send-email` and `stripe-webhook`.
3. **Duplicated constants.** The services list and brand/company lines exist in both `src/` and `api/_lib/`. Consider one shared module.
4. **Single admin credential.** Consider Supabase Auth or SSO with roles.
5. **Migrations are applied by hand.** Adopt the Supabase CLI (`supabase db push`) in CI.
6. **Function ceiling.** 10 of 12 are used. Keep combining handlers, or move to the Vercel Pro plan.
7. **Unused data.** Drop the obsolete `course_payment_links` table.
