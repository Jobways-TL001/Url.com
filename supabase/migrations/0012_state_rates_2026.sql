-- /admin -> State tax: 2026 rates for all 50 states and DC, as of
-- 2026-10-17. Updates pay rate, employee tax and employer tax only; hours
-- per month and company margin are left exactly as they are. A state with
-- no row yet (if any) gets one holding just these three values.
--
-- Pay rate      = state minimum wage per hour in effect on 2026-10-17
--                 (US DOL state table, state labour departments). The
--                 federal $7.25 where the state has none or a lower one.
-- Employee tax  = 7.65% FICA (6.2% Social Security + 1.45% Medicare)
--               + mandatory employee payroll contributions (SDI, paid
--                 family/medical leave, employee UI in AK/NJ/PA, WA Cares)
--               + approximate state income tax withholding for a single
--                 filer earning ~$16,000/yr (no city/county taxes, except
--                 Maryland county tax which is withheld with state tax).
-- Employer tax  = 7.65% FICA
--               + FUTA 0.6% (CA 2.1% incl. projected 2026 credit reduction)
--               + 2026 state unemployment (SUTA) new-employer rate incl.
--                 state surcharges
--               + employer share of state paid-leave programs (CO, DE, DC,
--                 ME, MA, MN, NJ TDI, OR, VT child care, WA), assuming the
--                 employer is large enough to owe it.
--
-- Rates are statutory percentages of gross pay. FUTA and SUTA stop once an
-- employee passes the year's wage base, so the real annual cost is a
-- little lower. Lower-confidence figures: LA, UT, WA, WY SUTA (industry
-- based); CA FUTA (2026 credit reduction final in November 2026).
--
-- Data only, no schema change. Safe to run more than once.

with rates (state_code, pay_rate, employee_tax_pct, employer_tax_pct) as (
  values
  ('AL', 7.25, 10.950, 10.950),
  ('AK', 14.00, 8.150, 9.250),
  ('AZ', 15.15, 8.850, 10.250),
  ('AR', 11.00, 8.650, 10.250),
  ('CA', 16.90, 8.950, 13.250),
  ('CO', 15.16, 8.090, 11.740),
  ('CT', 16.94, 8.150, 10.150),
  ('DE', 15.00, 9.850, 9.960),
  ('DC', 18.40, 7.650, 11.900),
  ('FL', 15.00, 7.650, 10.950),
  ('GA', 7.25, 7.950, 10.950),
  ('HI', 16.00, 8.750, 10.660),
  ('ID', 7.25, 7.650, 9.250),
  ('IL', 15.00, 11.650, 11.600),
  ('IN', 7.25, 10.450, 10.750),
  ('IA', 7.25, 7.650, 9.250),
  ('KS', 7.25, 8.750, 10.000),
  ('KY', 7.25, 10.450, 10.950),
  ('LA', 7.25, 8.250, 9.250),
  ('ME', 15.10, 9.050, 11.290),
  ('MD', 15.00, 12.050, 10.850),
  ('MA', 15.00, 11.310, 11.146),
  ('MI', 13.73, 10.350, 10.950),
  ('MN', 11.41, 8.290, 10.390),
  ('MS', 7.25, 7.650, 9.450),
  ('MO', 15.00, 7.650, 10.626),
  ('MT', 10.85, 7.650, 9.530),
  ('NE', 15.00, 7.850, 9.500),
  ('NV', 12.00, 7.650, 11.250),
  ('NH', 7.25, 7.650, 9.950),
  ('NJ', 15.92, 9.795, 11.550),
  ('NM', 12.00, 7.650, 9.250),
  ('NY', 16.00, 10.280, 12.350),
  ('NC', 7.25, 8.450, 9.250),
  ('ND', 7.25, 7.650, 9.250),
  ('OH', 11.00, 7.650, 11.100),
  ('OK', 7.25, 8.750, 9.750),
  ('OR', 15.55, 11.950, 11.050),
  ('PA', 7.25, 10.790, 12.072),
  ('RI', 16.00, 8.750, 9.460),
  ('SC', 7.25, 7.750, 9.310),
  ('SD', 11.85, 7.650, 10.000),
  ('TN', 7.25, 7.650, 10.950),
  ('TX', 7.25, 7.650, 10.950),
  ('UT', 7.25, 7.650, 9.450),
  ('VT', 14.42, 8.360, 9.580),
  ('VA', 12.77, 8.850, 10.800),
  ('WA', 17.13, 9.040, 9.840),
  ('WV', 8.75, 9.750, 10.950),
  ('WI', 7.25, 7.950, 11.300),
  ('WY', 7.25, 7.650, 10.530)
)
insert into public.state_tax_rates
  (state_code, pay_rate, employee_tax_pct, employer_tax_pct, updated_at, updated_by)
select state_code, pay_rate, employee_tax_pct, employer_tax_pct, now(), '2026 rates migration'
from rates
on conflict (state_code) do update
set pay_rate         = excluded.pay_rate,
    employee_tax_pct = excluded.employee_tax_pct,
    employer_tax_pct = excluded.employer_tax_pct,
    updated_at       = excluded.updated_at,
    updated_by       = excluded.updated_by;
