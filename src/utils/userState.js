// The learner's US state, shared by the course cards, the enrolment form and
// the payment page, so every price on the site is for the same state.
//
// On a first visit it is guessed from the IP address (/api/locate). Once the
// learner picks a state themselves, that choice wins and is remembered in
// localStorage on this device. "" means not known yet: prices stay hidden
// until a state is chosen.
import { useEffect, useState } from "react";
import { STATE_OPTIONS } from "../constants/usStates";

const KEY = "url:state";
const VALID = new Set(STATE_OPTIONS.map((s) => s.value));

let current = read(); // { code, source: "picked" | "detected" } or null
const listeners = new Set();
let detecting = null;

function read() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || "null");
    return saved && VALID.has(saved.code) ? saved : null;
  } catch {
    return null;
  }
}

function set(next) {
  current = next;
  try {
    if (next) localStorage.setItem(KEY, JSON.stringify(next));
    else localStorage.removeItem(KEY);
  } catch {
    // Private mode: the choice lasts for this page only.
  }
  listeners.forEach((fn) => fn(current));
}

// Guess once per page load, and only if nothing is known yet. A detected
// state never overrides one the learner picked.
function detect() {
  if (current || detecting) return;
  detecting = fetch("/api/locate", { cache: "no-store" })
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!current && data?.state && VALID.has(data.state)) {
        set({ code: data.state, source: "detected" });
      }
    })
    .catch(() => {});
}

// [stateCode, setStateCode, source]. stateCode is "" until known.
export function useUserState() {
  const [value, setValue] = useState(current);
  useEffect(() => {
    listeners.add(setValue);
    setValue(current);
    detect();
    // Keep other open tabs in step.
    const onStorage = (e) => {
      if (e.key === KEY) {
        current = read();
        listeners.forEach((fn) => fn(current));
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(setValue);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const choose = (code) => set(code && VALID.has(code) ? { code, source: "picked" } : null);
  return [value?.code || "", choose, value?.source || null];
}
