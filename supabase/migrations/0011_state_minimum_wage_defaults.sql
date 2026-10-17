-- /admin -> State tax: fill in each state's default pay rate with its
-- minimum wage per hour ("Statewise W2" sheet, October 2026).
--
-- Only fills blanks: a state with no row gets one holding just the pay rate,
-- and a row whose pay rate is empty gets it set. A pay rate already entered
-- in the dashboard is never overwritten. District of Columbia is not in the
-- sheet, so it is left for the team to enter.
--
-- Data only, no schema change. Safe to run more than once.

with defaults (state_code, pay_rate) as (
  values
  ('AL', 7.25), ('AK', 14.00), ('AZ', 15.15), ('AR', 11.00), ('CA', 16.90),
  ('CO', 15.16), ('CT', 16.94), ('DE', 15.00), ('FL', 15.00), ('GA', 7.25),
  ('HI', 16.00), ('ID', 7.25), ('IL', 15.00), ('IN', 7.25), ('IA', 7.25),
  ('KS', 7.25), ('KY', 7.25), ('LA', 7.25), ('ME', 15.10), ('MD', 15.00),
  ('MA', 15.00), ('MI', 13.73), ('MN', 11.41), ('MS', 7.25), ('MO', 15.00),
  ('MT', 10.85), ('NE', 15.00), ('NV', 12.00), ('NH', 7.25), ('NJ', 15.92),
  ('NM', 12.00), ('NY', 16.00), ('NC', 7.25), ('ND', 7.25), ('OH', 11.00),
  ('OK', 7.25), ('OR', 15.55), ('PA', 7.25), ('RI', 16.00), ('SC', 7.25),
  ('SD', 11.85), ('TN', 7.25), ('TX', 7.25), ('UT', 7.25), ('VT', 14.42),
  ('VA', 12.77), ('WA', 17.13), ('WV', 8.75), ('WI', 7.25), ('WY', 7.25)
)
insert into public.state_tax_rates as t (state_code, pay_rate, updated_by)
select state_code, pay_rate, 'migration 0011 (state minimum wage)'
from defaults
on conflict (state_code) do update
  set pay_rate   = excluded.pay_rate,
      updated_at = now(),
      updated_by = excluded.updated_by
  where t.pay_rate is null;
