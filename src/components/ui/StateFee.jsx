// The course fee for the visitor's US state, shared by the catalogue, the
// course pages and anywhere else a price is shown. The fee is the same for
// every course and comes from /admin -> State tax via /api/course-fees; the
// state is detected from the IP address on a first visit or picked by the
// visitor (src/utils/userState.js), and one choice prices the whole site.
import { useCourseFees, feeForState, formatFee } from "../../utils/courseFees";
import { useUserState } from "../../utils/userState";
import { STATE_OPTIONS, OUTSIDE_US } from "../../constants/usStates";
import "./ui.css";

// {
//   state, chooseState   the visitor's state code ("" until known) and setter
//   fee                  number, or null when there is no fee to show
//   label                what to print where the price goes:
//                        "$1,658", "Select your state", "Confirmed by our team"
//                        (outside the US, or no fee set for the state yet),
//                        or "…" while the fees load
//   known                true when `label` is an actual price
// }
export function useStateFee() {
  const courseFees = useCourseFees();
  const [state, chooseState] = useUserState();
  const fee = feeForState(courseFees, state);

  let label;
  if (fee !== null) label = formatFee(fee);
  else if (!state) label = "Select your state";
  else if (courseFees || state === OUTSIDE_US) label = "Confirmed by our team";
  else label = "…";

  return { state, chooseState, fee, label, known: fee !== null };
}

// A labelled state picker. Changing it re-prices every fee on the site.
export function StateSelect({ id, state, onChange, label = "Fees for", className = "", hideLabel = false }) {
  return (
    <div className={`state-fee-select ${className}`.trim()}>
      <label htmlFor={id} className={hideLabel ? "visually-hidden" : "state-fee-label"}>
        {label}
      </label>
      <select
        id={id}
        className={`select state-fee-input${state ? "" : " is-empty"}`}
        value={state}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="address-level1"
      >
        <option value="">Select your state</option>
        {STATE_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
