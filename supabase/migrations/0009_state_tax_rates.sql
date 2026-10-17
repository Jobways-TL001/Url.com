-- Per-state W2 cost inputs, managed from /admin -> State tax.
--
-- One row per US state (two-letter code, plus DC). A state with no row has
-- simply not been filled in yet. Every figure is optional so the team can
-- enter what they know and come back for the rest.
--
-- Units:
--   hours_per_month     hours
--   pay_rate            US dollars per hour
--   employee_tax_pct    percent (e.g. 7.65 = 7.65%)
--   employer_tax_pct    percent
--   company_margin_pct  percent
--
-- Read and written only by api/admin/state-taxes.js with the service role
-- key; Row Level Security below denies the anon and authenticated keys.

create table if not exists public.state_tax_rates (
  state_code         text          primary key check (state_code ~ '^[A-Z]{2}$'),
  hours_per_month    numeric(6, 2) check (hours_per_month between 0 and 744),
  pay_rate           numeric(10, 2) check (pay_rate between 0 and 100000),
  employee_tax_pct   numeric(6, 3) check (employee_tax_pct between 0 and 100),
  employer_tax_pct   numeric(6, 3) check (employer_tax_pct between 0 and 100),
  company_margin_pct numeric(6, 3) check (company_margin_pct between 0 and 100),
  updated_at         timestamptz   not null default now(),
  updated_by         text
);

comment on table public.state_tax_rates is
  'Per-state hours, pay rate, employee/employer tax and company margin, edited in the admin dashboard.';

alter table public.state_tax_rates enable row level security;
revoke all on public.state_tax_rates from anon, authenticated;
