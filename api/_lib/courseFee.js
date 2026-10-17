// Course fee for a state, from its row in /admin -> State tax
// (public.state_tax_rates):
//
//   gross salary = pay rate per hour x hours per month
//   payroll      = gross salary + employer tax (% of gross)
//   course fee   = payroll + payable to vendor ($, column company_margin)
//
// Employee tax is withheld from the employee's pay, so it does not change
// what payroll costs and is not part of the fee. Neither is state tax.
// e.g. Illinois: $15 x 90 hrs = 1,350; + 8% employer tax (108) = 1,458;
// + $200 margin = $1,658.
//
// Returns null until the state has both a pay rate and hours; a blank
// employer tax or margin counts as zero.
//
// The admin's Total ($) column uses a copy of this formula, courseFeeFrom in
// src/utils/courseFees.js; change both together.
function courseFeeOf(row) {
  const num = (v) => (v === null || v === undefined || v === "" ? 0 : Number(v));
  const rate = num(row?.pay_rate);
  const hours = num(row?.hours_per_month);
  const employerPct = num(row?.employer_tax_pct);
  const margin = num(row?.company_margin);
  if (![rate, hours, employerPct, margin].every(Number.isFinite)) return null;
  if (rate <= 0 || hours <= 0) return null;

  const cents = (n) => Math.round(n * 100) / 100;
  const gross = cents(rate * hours);
  const payroll = cents(gross + (gross * employerPct) / 100);
  return cents(payroll + margin);
}

module.exports = { courseFeeOf };
