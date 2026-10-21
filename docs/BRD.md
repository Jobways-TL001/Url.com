# Business Requirements Document (BRD)

**Product:** URL (url.com): AI course website, enrolment and payments
**Repository:** `URL.com` (branch `main`)
**Author:** Chandrasekhar
**Status:** Draft. Describes the system as built at commit `cc4c5dd`.
**Date:** 21 October 2026

---

## 1. Purpose

This document sets out the business requirements for the URL website. The site is a
public storefront for live, mentor-led artificial intelligence courses. It turns visitors
into enquiries, enquiries into enrolments, and enrolments into paid places. It also gives the
internal team one place to follow up leads, track payments and maintain state-based pricing.

The document is meant for product owners, operations and finance staff, and engineers. Each
requirement has an ID so it can be traced to work items and test cases.

## 2. Background

URL sells career-oriented AI training to learners, most of them in the United States. Every
course runs for six months, is taught live online, and ends in a capstone project. A course's
price is not a flat catalogue price. It is worked out from the learner's US state, using that
state's pay rate, hours and employer payroll tax plus a company margin. Pricing therefore has to
be maintained for each state and calculated on the server.

## 3. Business objectives

| ID | Objective | Measure of success |
|---|---|---|
| BO-1 | Capture every lead that reaches the site | 0 lost enquiries: a submission survives if either the database save or the team email succeeds |
| BO-2 | Turn enrolments into payments online, with no manual invoicing for US learners | Share of enrolments reaching `payment_status = paid` |
| BO-3 | Reply to leads quickly | Notification email to the team within seconds of submission; instant acknowledgement to the learner |
| BO-4 | Price each course correctly for each US state | Fee shown = fee charged = fee recorded, for 100% of checkouts |
| BO-5 | Give the team self-service operations | Enquiries, payments, pricing and email previews are all handled in `/admin` without engineering help |
| BO-6 | Help visitors choose the right course | Course Finder use and enrolments that start from a recommendation |

## 4. Scope

### 4.1 In scope

- Public marketing site: Home, Courses catalogue, Course detail, About, Contact, Legal (Terms, Privacy, Disclaimer).
- Course Finder questionnaire that recommends a course.
- General enquiry forms (contact page and homepage modal).
- Course enrolment form with state-based fee display.
- Stripe Checkout payment for US learners, plus payment result emails.
- Transactional emails (team notification, learner acknowledgement, payment outcomes).
- Admin dashboard: Enquiries, Payments, State tax, Email previews.
- Data shared with the separate accounts dashboard (`Jobways-TL001/Jobways.urladmin`) through `ledger_*` tables.

### 4.2 Out of scope

- A learning management system (course delivery, video, assignments, grading).
- Learner accounts, logins and self-service profiles.
- Online payment for learners outside the US, or in states with no rate set (handled offline by email).
- Instalments, coupons, discounts or subscriptions.
- More than one admin user or role-based access.
- Refund processing in the site UI (handled in Stripe, and recorded by the accounts dashboard).

## 5. Stakeholders

| Stakeholder | Interest |
|---|---|
| Business owner / leadership | Revenue, conversion, brand |
| Admissions / sales team | Receive and follow up leads; mark enquiries contacted, enrolled or closed |
| Finance / accounts | Payment records, Stripe reconciliation, state pricing inputs |
| Prospective learners | Find a course, understand the price, enrol and pay securely |
| Engineering | Build, deploy and maintain the site and integrations |
| Payment provider (Stripe) | Checkout sessions and webhooks |
| Mail provider (SMTP host) | Deliver transactional email |

## 6. User personas

1. **Career switcher (beginner).** New to coding. Needs guidance (Course Finder, Foundations track) and a clear price.
2. **Upskilling professional.** Working in IT or data. Compares Core AI, Generative and Agentic AI, and MLOps tracks.
3. **Admissions admin.** Signs in to `/admin` every day to work through new enquiries and check payments.
4. **Finance admin.** Maintains per-state rates and reviews revenue and payment status.

## 7. Business process flows

### 7.1 General enquiry

1. Visitor fills in the contact form or the homepage modal: name, phone (optional), email, service, message.
2. Inputs are validated in the browser and again on the server.
3. The enquiry is **stored first** in Supabase (best effort), then emailed:
   - **Notification** to `contactus@url.com`, with the visitor as Reply-To.
   - **Acknowledgement** to the visitor: branded HTML that echoes what they submitted.
4. The enquiry appears in `/admin/enquiries` with status **New**.

### 7.2 Course enrolment and payment

1. Learner picks a course (catalogue, course page or Course Finder) and opens the enrolment form.
2. The state is detected from the visitor's IP, or chosen by the learner. The state's fee is shown.
3. Learner submits name, email, phone, state, experience level, preferred batch and notes. The record is stored and emailed (as in 7.1).
4. A confirmation shows, then redirects to `/payment?course=<id>` after 3 seconds.
5. `/payment` shows the order summary and the fee. **Pay Securely with Stripe** creates a Checkout session for exactly the server-calculated fee.
6. Stripe returns the learner to `/payment/success`. Stripe webhooks update the enquiry and trigger emails:

| Outcome | Learner email | Team email | Enquiry `payment_status` |
|---|---|---|---|
| Paid (sync or async) | "You're enrolled" | Payment received | `paid` |
| Async payment failed | "Payment not completed" + retry link | Payment failed | `failed` |
| Session expired unpaid | "Payment not completed" + retry link | Payment not completed | `expired` |

7. Not eligible for online payment (outside the US, no rate for the state, or Stripe not configured): the page tells the learner the team will email the fee and payment instructions.

### 7.3 Admin follow-up

1. Admin signs in at `/admin` with the single configured credential.
2. Searches and filters enquiries (status, source, period, failed delivery) and opens the detail panel.
3. Moves the status through New → Contacted → Enrolled → Closed. Paid enrolments move automatically.
4. Exports to CSV when needed.

### 7.4 Pricing maintenance

1. Finance opens `/admin/state-tax`.
2. For each US state and DC, edits hours/month, pay rate/hour, employee tax %, employer tax % and company margin ($).
3. Each row saves on its own. The calculated customer total takes effect on the public site straight away.

## 8. Functional requirements

Priority: **M** = Must, **S** = Should, **C** = Could.

### 8.1 Public site and catalogue

| ID | Requirement | Priority |
|---|---|---|
| FR-01 | The site shall provide the routes `/`, `/courses`, `/courses/:id`, `/about`, `/contact`, `/legal/terms`, `/legal/privacy`, `/legal/disclaimer`, `/payment`, `/payment/success`, `/admin`. | M |
| FR-02 | Legacy URLs (`/ai-courses`, `/about-us`, `/contact-us`, `/TermsAndConditions`, `/Privacypolicy`, `/Disclaimer`, `/e-learning`) shall redirect to their new equivalents. | M |
| FR-03 | The catalogue shall list 9 courses, filterable by track: Foundations, Core AI, Generative & Agentic AI, Data & MLOps. | M |
| FR-04 | Each course page shall show title, summary, duration, level, mode, target role, tools, curriculum highlights and capstone project. | M |
| FR-05 | Course IDs shall be permanent once learners have enrolled, because payments and records refer to them. | M |
| FR-06 | A Course Finder questionnaire shall recommend a course using transparent points-based scoring and explain why it matched. | S |
| FR-07 | Company details (phone, offices, socials, jurisdiction) that are empty shall be hidden rather than shown as placeholders. | M |

### 8.2 Enquiry and enrolment forms

| ID | Requirement | Priority |
|---|---|---|
| FR-10 | Name: required, 2–100 characters, letters from any script including Unicode combining marks, plus spaces, hyphens, apostrophes and periods. | M |
| FR-11 | Phone: optional, a country dial code plus a national number, validated against that country's numbering plan; stored in international format. | M |
| FR-12 | Email: required, valid format. | M |
| FR-13 | Service (enquiry form): required, one of "AI courses" or "General enquiry". | M |
| FR-14 | Message: 10–2000 characters (required on the enquiry form). | M |
| FR-15 | The enrolment form shall also capture US state, experience level and preferred batch. | M |
| FR-16 | All validation shall be repeated on the server; requests failing it get HTTP 400. | M |
| FR-17 | Errors shall show only after a field is left or the form is submitted. The first invalid field gets focus on a failed submit. | S |
| FR-18 | The country picker shall be searchable by name or dial code, ignore accents, and be fully usable by keyboard. | S |
| FR-19 | Each submission shall record its source (`contact-page`, `home-modal`, enrolment). | M |

### 8.3 Notifications

| ID | Requirement | Priority |
|---|---|---|
| FR-20 | Every enquiry shall be stored before any email is attempted. Storage is best effort: if it fails, the emails still go out, so a lead is lost only if both storage and the team notification fail. | M |
| FR-21 | A plain-text notification shall go to `contactus@url.com` with the visitor as Reply-To. If it fails, the visitor is asked to retry. | M |
| FR-22 | A branded, responsive acknowledgement shall go to the visitor, marked `Auto-Submitted: auto-replied`. If it fails, the request still succeeds. | M |
| FR-23 | Emails shall be sent as the authenticated mailbox (never spoofing the visitor), to pass SPF and DMARC. | M |
| FR-24 | Email delivery success or failure shall be recorded on the enquiry and shown in the admin dashboard. | M |
| FR-25 | Admins shall be able to preview every email template with sample data without sending anything. | S |

### 8.4 Pricing and payment

| ID | Requirement | Priority |
|---|---|---|
| FR-30 | Course fee = (pay rate × hours per month) + employer tax % of that gross amount + company margin ($). Employee tax does not change the fee. Every course costs the same in a given state. Example (Illinois): $15 × 90 = $1,350; + 8% = $1,458; + $200 = **$1,658**. | M |
| FR-31 | The public site shall get only the final fee per state, never the underlying rates, taxes or margins. | M |
| FR-32 | No fee shall be shown until a state is known, whether detected from the IP or chosen by the learner. The chosen state is shared across catalogue, course page, enrolment form and payment page. | M |
| FR-33 | The checkout amount shall be calculated on the server from the state stored on the enquiry, not from anything the client sends. | M |
| FR-34 | Checkout shall prefill the learner's email and carry the enquiry ID as `client_reference_id`. | M |
| FR-35 | Learner details shall pass to the payment page in session storage, never in the URL. | M |
| FR-36 | Ineligible learners (outside the US, no rate for the state, Stripe off) shall see an offline-payment message. | M |
| FR-37 | Stripe webhooks shall be verified by signature. Unsigned or invalid events shall be ignored. | M |
| FR-38 | Each Stripe event shall be processed only once (stored event IDs), so retries never send duplicate emails. | M |
| FR-39 | A paid checkout shall set the enquiry's payment status, paid time, amount, currency and Stripe session ID, and move its status to Paid. | M |

### 8.5 Admin dashboard

| ID | Requirement | Priority |
|---|---|---|
| FR-40 | Access shall need sign-in with the configured admin email and password. | M |
| FR-41 | `/admin/enquiries`: headline counts, search, filters (status, source, period, failed delivery), detail panel, status updates, CSV export. | M |
| FR-42 | `/admin/payments`: revenue, counts of paid, failed and not-completed payments, and per-payment rows linking to Stripe. | M |
| FR-43 | `/admin/state-tax`: editable rows for all 50 states and DC with a live calculated total. Each row saves on its own; clearing every value removes the row. | M |
| FR-44 | `/admin/emails`: previews of every email template. | S |
| FR-45 | Each admin section shall have its own URL, so refresh, Back/Forward and bookmarks work. | S |
| FR-46 | The dashboard shall work on desktop and mobile. | S |

### 8.6 Accounts dashboard integration

| ID | Requirement | Priority |
|---|---|---|
| FR-50 | The separate accounts dashboard shall read `contact_submissions` and keep Stripe bookkeeping (charges, refunds, fees, disputes, payouts, reconciliation notes) in `ledger_*` tables in the same Supabase project. | M |
| FR-51 | That dashboard shall receive Stripe events on its own webhook endpoint with its own signing secret. This site's code does not change. | M |

## 9. Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-01 | Security | All secrets are server-only environment variables. None may use the `REACT_APP_` prefix, because that would put them in the browser bundle. |
| NFR-02 | Security | Admin sign-in uses constant-time comparison and a 1-second delay on failure. Sessions are HMAC-signed, last 12 hours, and live in `HttpOnly`, `SameSite=Strict` cookies scoped to `/api/admin`. Changing the password ends every session. |
| NFR-03 | Security | The database is reached only server-side with the service-role key. Row-level security is on for every table. |
| NFR-04 | Privacy | Admin pages are `noindex, nofollow` and `no-store`. Personal data never appears in URLs. |
| NFR-05 | Reliability | SMTP uses one pooled connection per request. Transient failures (timeout, socket error, 4xx) are retried once after 1.5 s; 5xx errors are not retried. |
| NFR-06 | Performance | Admin and payment pages are lazy-loaded. Images are WebP. Function timeouts are 30 s for public endpoints and 15 s for admin endpoints. |
| NFR-07 | Compatibility | Browsers: >0.2% usage, not dead, excluding Opera Mini. The layout is responsive down to mobile. |
| NFR-08 | Accessibility | Forms are fully keyboard-operable, errors are announced, and focus is managed after a failed submit. |
| NFR-09 | Maintainability | Routes, services, courses, company details and states are each defined once in `src/constants/`. Server copies (brand, services list) must be kept in step. |
| NFR-10 | Platform limit | No more than 12 serverless functions (Vercel Hobby). 10 are in use. |
| NFR-11 | Internationalisation | Names in any script and phone numbers from any country are accepted. Prices are in USD. |

## 10. Data requirements

| Entity | Purpose | Key fields |
|---|---|---|
| `contact_submissions` | Every enquiry or enrolment | id, name, email, number, message, service, source, enrolment (JSON: course, state, experience, batch, notes), email_sent, email_error, acknowledged, status, payment_status, paid_at, amount_paid, payment_currency, stripe_session_id, created_at, updated_at |
| `stripe_events` | Processing each webhook only once | id (Stripe event ID), type, received_at |
| `state_tax_rates` | Per-state pricing inputs | state_code, hours_per_month, pay_rate, employee_tax_pct, employer_tax_pct, company_margin, updated_at, updated_by |
| `ledger_*` | Accounts dashboard bookkeeping | events, sessions, charges, disputes, payouts, resolutions |

**Retention:** no automatic deletion is defined. See Open Items.

## 11. Business rules

- BR-1: Payment is the required second step of an enrolment. The learner's details are captured before payment so abandoned checkouts can still be followed up.
- BR-2: A declined card does not end a checkout and is not emailed. If the learner gives up, the expiry email follows.
- BR-3: There are no static Stripe payment links. Every checkout is created on demand (the `course_payment_links` table is obsolete).
- BR-4: There is one admin login. Changing it means updating environment variables and redeploying.
- BR-5: An enquiry whose service slug is not recognised is recorded as "Not specified".

## 12. Assumptions and constraints

- The site is hosted on Vercel (Hobby plan): 12-function limit, serverless runtime on Node 24.x.
- The SMTP host's TLS handshake can take more than 7 s, so SMTP timeouts must not be tightened.
- Stripe test or live mode must match between `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
- State detection depends on Vercel geo-IP headers. VPN users may get the wrong state and have to correct it.
- Database migrations are applied by hand, in order, in the Supabase SQL editor.

## 13. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| SMTP credential or host outage | Leads not notified | Enquiries are stored first; failed delivery is flagged in admin; `npm run test:mail` checks credentials |
| Supabase outage during a submission | Lead held only in the team inbox, missing from admin | Notification email still sent; insert failures logged in Vercel |
| Wrong state rates entered | Learners over- or under-charged | Validation constraints in the DB; live total preview; `updated_by` audit field |
| One shared admin credential | No per-user accountability; credential sharing | Planned multi-user auth (see Open Items) |
| Function limit reached | New endpoints cannot deploy | Shared-handler pattern (`auth.js`); upgrade plan if needed |
| Stripe webhook misconfigured | Payments not reflected, no emails | Signature check; Payments view to spot anomalies |

## 14. Open items

1. Fill in the TODOs in `src/constants/company.js`: registered legal name, phone, offices, governing-law jurisdiction and social links.
2. Decide a data retention and deletion policy for personal data (GDPR/CCPA) and reflect it in the Privacy Policy.
3. Define a process for learners outside the US (pricing and payment method).
4. Consider multi-user admin with roles and an audit log.
5. Drop the obsolete `course_payment_links` table (migration 0005).
6. Add more batch options (only Monday–Friday exists today).

## 15. Glossary

| Term | Meaning |
|---|---|
| Enquiry | Any form submission stored in `contact_submissions` |
| Enrolment | An enquiry made from the course enrolment form, with course and state details |
| Notification | Internal email to the team about a new enquiry |
| Acknowledgement | Automatic confirmation email to the visitor |
| Margin / payable to vendor | The fixed dollar amount added to each state's fee |
| Webhook | Server-to-server message from Stripe reporting a checkout outcome |
