-- Payment tracking, filled in by api/stripe-webhook.js from Stripe events.
--
-- payment_status on an enquiry:
--   null       no payment attempted (ordinary enquiries, or not reached Stripe)
--   'paid'     Stripe confirmed the payment
--   'failed'   a delayed payment method (e.g. bank debit) failed
--   'expired'  the learner opened checkout but did not pay before it expired
-- The enquiry is matched by the client_reference_id the /payment page sends.

alter table public.contact_submissions
  add column if not exists payment_status    text,
  add column if not exists paid_at           timestamptz,
  add column if not exists amount_paid       bigint,
  add column if not exists payment_currency  text,
  add column if not exists stripe_session_id text;

alter table public.contact_submissions
  drop constraint if exists contact_submissions_payment_status_check;
alter table public.contact_submissions
  add constraint contact_submissions_payment_status_check
  check (payment_status is null or payment_status in ('paid', 'failed', 'expired'));

comment on column public.contact_submissions.payment_status is
  'Stripe outcome for an enrolment: paid, failed or expired. Null if no payment attempted.';
comment on column public.contact_submissions.amount_paid is
  'Amount in the currency''s smallest unit (cents, paise), as Stripe reports it.';

create index if not exists contact_submissions_payment_idx
  on public.contact_submissions (payment_status, created_at desc)
  where payment_status is not null;

-- A successful payment sets the follow-up status to 'paid' automatically;
-- the team moves it to 'enrolled' once the batch is confirmed.
alter table public.contact_submissions
  drop constraint if exists contact_submissions_status_check;
alter table public.contact_submissions
  add constraint contact_submissions_status_check
  check (status in ('new', 'contacted', 'paid', 'enrolled', 'closed'));

-- Every Stripe event id handled, so a retried delivery (Stripe retries until
-- it gets a 2xx) never sends the same email twice.
create table if not exists public.stripe_events (
  id          text        primary key,
  type        text        not null,
  received_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;
revoke all on public.stripe_events from anon, authenticated;
