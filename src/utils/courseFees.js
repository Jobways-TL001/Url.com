// Course fees by US state, from /api/course-fees (worked out from the
// figures in /admin -> State tax). Shared by every component that asks, and
// fetched again once the copy is more than a few seconds old, so a change
// saved in the admin shows without reloading the page.
import { useEffect, useState } from "react";

const FRESH_MS = 5000;
let request = null;
let requestedAt = 0;

function loadCourseFees() {
  if (!request || Date.now() - requestedAt > FRESH_MS) {
    requestedAt = Date.now();
    request = fetch("/api/course-fees")
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .then((data) => {
        if (!data || !data.fees || !Object.keys(data.fees).length) {
          request = null; // try again next time
          return null;
        }
        return data;
      });
  }
  return request;
}

// null while loading or if the fees could not be loaded; then
// { fees: { [stateCode]: number }, min, max, checkout } — checkout is true
// once Stripe can charge these fees (see api/course-fees.js).
//
// Fetches when first used and again whenever `refreshKey` changes (the
// enrolment form passes whether it is open). While a refresh is in flight
// the previous figures stay on screen.
export function useCourseFees(refreshKey) {
  const [data, setData] = useState(null);
  useEffect(() => {
    let live = true;
    loadCourseFees().then((d) => live && d && setData(d));
    return () => {
      live = false;
    };
  }, [refreshKey]);
  return data;
}

const usd = (n, digits) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;

// $1,658 for whole dollars, $904.70 otherwise.
export function formatFee(n) {
  return usd(n, Number.isInteger(n) ? 0 : 2);
}

// "$905 - $1,950" across all states, in whole dollars. Falls back to the

// The fee for one state code, or null when that state has no fee yet.
export function feeForState(data, stateCode) {
  const fee = data?.fees?.[stateCode];
  return typeof fee === "number" ? fee : null;
}

// The course fee the customer pays, from one state's figures in /admin ->
// State tax. Must stay the same as courseFeeOf in api/_lib/courseFee.js,
// which prices the real checkout:
//   pay rate x hours per month          = gross salary
//   + employer tax (% of gross)         = payroll
//   + payable to vendor ($)             = course fee
// Employee tax and state tax are withheld from the employee's pay, so they
// do not change the fee. Takes the admin form's values (numbers or text);
// returns null until there is a pay rate and hours. Blank tax/margin = 0.
export function courseFeeFrom({ payRate, hoursPerMonth, employerTax, companyMargin }) {
  const num = (v) => (v === null || v === undefined || String(v).trim() === "" ? 0 : Number(v));
  const rate = num(payRate);
  const hours = num(hoursPerMonth);
  const employerPct = num(employerTax);
  const margin = num(companyMargin);
  if (![rate, hours, employerPct, margin].every(Number.isFinite)) return null;
  if (rate <= 0 || hours <= 0) return null;

  const cents = (n) => Math.round(n * 100) / 100;
  const gross = cents(rate * hours);
  const payroll = cents(gross + (gross * employerPct) / 100);
  return cents(payroll + margin);
}
