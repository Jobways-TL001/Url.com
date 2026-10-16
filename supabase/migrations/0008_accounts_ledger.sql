-- Accounts dashboard ledger (Jobways.urladmin) for the URL site.
--
-- These tables belong to the separate accounts dashboard, Jobways.urladmin,
-- which has no database of its own. It keeps URL's Stripe bookkeeping here,
-- next to this site's enquiries: every Stripe event its webhook
-- (https://<dashboard-domain>/api/webhooks/stripe?site=url) receives,
-- checkout sessions, charges, refunds, disputes, payouts and
-- reconciliation notes. This website does not read or write them; it only
-- needs contact_submissions, which the dashboard reads.
--
-- Apply in the Supabase SQL editor like the other migrations. Safe to run
-- more than once. Kept identical to supabase/migrations/0001_ledger.sql in
-- the Jobways.urladmin repo (apart from this header).
--
-- Every table is prefixed ledger_, so nothing clashes with this site's own
-- tables (contact_submissions, stripe_events, course_payment_links).
-- Everything is written and read server-side with the service role key; Row
-- Level Security is on with no policies, and anon/authenticated have no
-- grants at all.
--
-- Amounts are in the currency's smallest unit (cents, paise), exactly as
-- Stripe reports them. Never add amounts of different currencies together.

-- ---------------------------------------------------------------------------
-- Raw events: one row per Stripe event id, so a retried delivery is spotted
-- and a failed one can be replayed from the dashboard.
create table if not exists public.ledger_events (
  id           text        primary key,           -- evt_...
  endpoint     text        not null,              -- site id of the endpoint that received it
  type         text        not null,
  object_type  text,
  object_id    text,
  livemode     boolean     not null default false,
  created_at   timestamptz not null,              -- when Stripe created the event
  received_at  timestamptz not null default now(),
  processed_at timestamptz,
  status       text        not null default 'received',
  result       text,
  error        text,
  attempts     integer     not null default 0,
  payload      jsonb       not null,
  constraint ledger_events_status_check
    check (status in ('received', 'processed', 'ignored', 'failed'))
);
create index if not exists ledger_events_received_idx on public.ledger_events (received_at desc);
create index if not exists ledger_events_endpoint_idx on public.ledger_events (endpoint, received_at desc);
create index if not exists ledger_events_status_idx   on public.ledger_events (status, received_at desc);

-- ---------------------------------------------------------------------------
-- Checkout sessions: what the learner did on a payment link.
-- outcome: paid | pending (async method, or still open) | failed | expired
create table if not exists public.ledger_sessions (
  id                  text primary key,          -- cs_...
  site                text,
  livemode            boolean,
  status              text,                      -- open | complete | expired
  payment_status      text,                      -- paid | unpaid | no_payment_required
  outcome             text not null default 'pending',
  amount_total        bigint,
  currency            text,
  customer_email      text,
  customer_name       text,
  client_reference_id text,                      -- the site's enquiry id
  enquiry_id          uuid,                      -- set when that enquiry was found
  payment_intent      text,
  payment_link        text,
  created_at          timestamptz,
  last_event_at       timestamptz,
  updated_at          timestamptz not null default now(),
  constraint ledger_sessions_outcome_check
    check (outcome in ('paid', 'pending', 'failed', 'expired'))
);
create index if not exists ledger_sessions_site_idx on public.ledger_sessions (site, created_at desc);
create index if not exists ledger_sessions_pi_idx   on public.ledger_sessions (payment_intent);
create index if not exists ledger_sessions_ref_idx  on public.ledger_sessions (client_reference_id);

-- ---------------------------------------------------------------------------
-- Charges: the money movement. fee / net / payout_id are filled when the
-- payout containing the charge is settled (needs <SITE>_STRIPE_SECRET_KEY);
-- fee and net are in settlement_currency, which can differ from currency.
create table if not exists public.ledger_charges (
  id                  text primary key,          -- ch_... / py_...
  site                text,
  livemode            boolean,
  payment_intent      text,
  amount              bigint,
  amount_captured     bigint,
  amount_refunded     bigint not null default 0,
  currency            text,
  status              text,                      -- succeeded | pending | failed
  paid                boolean,
  refunded            boolean,
  disputed            boolean,
  failure_code        text,
  failure_message     text,
  billing_email       text,
  billing_name        text,
  description         text,
  balance_transaction text,
  fee                 bigint,
  net                 bigint,
  settlement_currency text,
  payout_id           text,
  settled_at          timestamptz,
  created_at          timestamptz,
  last_event_at       timestamptz,
  updated_at          timestamptz not null default now()
);
create index if not exists ledger_charges_site_idx   on public.ledger_charges (site, created_at desc);
create index if not exists ledger_charges_pi_idx     on public.ledger_charges (payment_intent);
create index if not exists ledger_charges_payout_idx on public.ledger_charges (payout_id);

-- ---------------------------------------------------------------------------
create table if not exists public.ledger_disputes (
  id              text primary key,              -- dp_...
  site            text,
  livemode        boolean,
  charge_id       text,
  payment_intent  text,
  amount          bigint,
  currency        text,
  reason          text,
  status          text,
  evidence_due_by timestamptz,
  created_at      timestamptz,
  last_event_at   timestamptz,
  updated_at      timestamptz not null default now()
);
create index if not exists ledger_disputes_site_idx on public.ledger_disputes (site, created_at desc);

-- ---------------------------------------------------------------------------
-- Payouts belong to a Stripe account, not a site; account is the site id of
-- the webhook endpoint (or sync) that reported it. The settlement columns
-- summarise the payout's balance transactions.
create table if not exists public.ledger_payouts (
  id              text primary key,              -- po_...
  account         text,
  livemode        boolean,
  amount          bigint,
  currency        text,
  status          text,                          -- pending | in_transit | paid | failed | canceled
  arrival_date    timestamptz,
  method          text,
  automatic       boolean,
  failure_code    text,
  failure_message text,
  created_at      timestamptz,
  last_event_at   timestamptz,
  settled         boolean not null default false,
  gross           bigint,
  fees            bigint,
  refunds         bigint,
  other           bigint,
  item_count      integer,
  settled_at      timestamptz,
  updated_at      timestamptz not null default now()
);
create index if not exists ledger_payouts_account_idx on public.ledger_payouts (account, created_at desc);

-- ---------------------------------------------------------------------------
-- Reconciliation issues an admin has checked and closed, with a note.
-- key is "<kind>:<reference>", as built by api/_lib/reconcile.js.
create table if not exists public.ledger_resolutions (
  key         text primary key,
  site        text,
  kind        text not null,
  note        text,
  resolved_by text,
  resolved_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Insert or update a ledger row only if it is not older than what is stored.
-- Stripe does not deliver events in order, so a late "charge.succeeded" must
-- not undo an earlier-delivered "charge.refunded". Only the keys present in
-- p_row are written, so column defaults apply on insert and absent columns
-- are left alone on update. Returns false when the row was stale.
create or replace function public.ledger_upsert(p_table text, p_row jsonb)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  cols text;
  sets text;
  n    integer;
begin
  if p_table not in ('ledger_sessions', 'ledger_charges', 'ledger_disputes', 'ledger_payouts') then
    raise exception 'ledger_upsert: table % is not allowed', p_table;
  end if;
  if p_row ->> 'id' is null then
    raise exception 'ledger_upsert: row has no id';
  end if;

  select string_agg(format('%I', k), ', '),
         string_agg(format('%1$I = excluded.%1$I', k), ', ') filter (where k <> 'id')
    into cols, sets
    from jsonb_object_keys(p_row) as k;

  execute format(
    'insert into public.%1$I (%2$s) select %2$s from jsonb_populate_record(null::public.%1$I, $1) '
    'on conflict (id) do update set %3$s, updated_at = now() '
    'where %1$I.last_event_at is null or excluded.last_event_at is null '
    'or %1$I.last_event_at <= excluded.last_event_at',
    p_table, cols, coalesce(sets, 'id = excluded.id')
  ) using p_row;
  get diagnostics n = row_count;
  return n > 0;
end;
$$;

-- ---------------------------------------------------------------------------
-- One row per payment: a checkout session joined to its charge. A payment
-- intent can have several charges (declined cards, then a success); the
-- successful one, else the latest, represents it. Charges without a session
-- (dashboard or invoice payments) appear on their own.
create or replace view public.ledger_payments_v
with (security_invoker = true) as
with best_charge as (
  select distinct on (payment_intent) *
    from public.ledger_charges
   where payment_intent is not null
   order by payment_intent, (status = 'succeeded') desc, created_at desc
), charges as (
  select * from best_charge
  union all
  select * from public.ledger_charges where payment_intent is null
)
select
  coalesce(s.id, c.id)                                   as id,
  coalesce(s.site, c.site)                               as site,
  s.id                                                   as session_id,
  c.id                                                   as charge_id,
  coalesce(s.payment_intent, c.payment_intent)           as payment_intent,
  coalesce(s.livemode, c.livemode)                       as livemode,
  case
    when s.id is not null then s.outcome
    when c.status = 'succeeded' then 'paid'
    when c.status = 'failed' then 'failed'
    else 'pending'
  end                                                    as outcome,
  coalesce(s.amount_total, c.amount)                     as amount,
  coalesce(s.currency, c.currency)                       as currency,
  coalesce(c.amount_refunded, 0)                         as amount_refunded,
  c.fee,
  c.net,
  c.settlement_currency,
  c.payout_id,
  coalesce(c.disputed, false)                            as disputed,
  c.failure_message,
  coalesce(s.customer_email, c.billing_email)            as email,
  coalesce(s.customer_name, c.billing_name)              as name,
  s.client_reference_id,
  s.enquiry_id,
  s.payment_link,
  coalesce(s.created_at, c.created_at)                   as created_at
from public.ledger_sessions s
full outer join charges c on c.payment_intent = s.payment_intent;

-- ---------------------------------------------------------------------------
-- Lock everything down to the service role.
alter table public.ledger_events      enable row level security;
alter table public.ledger_sessions    enable row level security;
alter table public.ledger_charges     enable row level security;
alter table public.ledger_disputes    enable row level security;
alter table public.ledger_payouts     enable row level security;
alter table public.ledger_resolutions enable row level security;

revoke all on public.ledger_events, public.ledger_sessions, public.ledger_charges,
              public.ledger_disputes, public.ledger_payouts, public.ledger_resolutions,
              public.ledger_payments_v
  from anon, authenticated;
revoke all on function public.ledger_upsert(text, jsonb) from public, anon, authenticated;
grant execute on function public.ledger_upsert(text, jsonb) to service_role;
