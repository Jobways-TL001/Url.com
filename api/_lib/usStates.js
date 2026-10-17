// US state codes and names (50 states plus DC), for the server. Mirrors
// src/constants/usStates.js, which the browser uses.
const US_STATES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan",
  MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota",
  OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

// The code for an enrolment's state: its stored code, or (for enquiries made
// before codes were stored) the code whose name matches. null if neither.
function stateCodeOf(enrolment) {
  const code = String(enrolment?.stateCode || "").toUpperCase();
  if (US_STATES[code]) return code;
  const name = String(enrolment?.state || "").trim().toLowerCase();
  return Object.keys(US_STATES).find((c) => US_STATES[c].toLowerCase() === name) || null;
}

module.exports = { US_STATES, stateCodeOf };
