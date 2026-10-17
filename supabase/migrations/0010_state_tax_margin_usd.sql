-- /admin -> State tax: company margin becomes US dollars, and a State tax
-- (percent) column is added after it.
--
-- Additive on purpose: the old company_margin_pct column stays, so the live
-- dashboard keeps working between applying this file and deploying the code
-- that reads the new columns. Existing margin figures are copied across
-- unchanged — check them in the dashboard, since they were entered while the
-- field was labelled as a percentage. company_margin_pct can be dropped in a
-- later migration.
--
-- Safe to run more than once.

alter table public.state_tax_rates
  add column if not exists company_margin numeric(12, 2)
    check (company_margin between 0 and 1000000),
  add column if not exists state_tax_pct  numeric(6, 3)
    check (state_tax_pct between 0 and 100);

update public.state_tax_rates
set company_margin = company_margin_pct
where company_margin is null and company_margin_pct is not null;

comment on column public.state_tax_rates.company_margin is
  'Company margin, US dollars.';
comment on column public.state_tax_rates.state_tax_pct is
  'State tax, percent (e.g. 4.95 = 4.95%).';
comment on column public.state_tax_rates.company_margin_pct is
  'Deprecated: replaced by company_margin (US dollars). Not read by the app.';
