import React, { useEffect, useMemo, useRef, useState } from "react";
import { COUNTRIES, flagOf } from "../../constants/countries";
import "./CountrySelect.css";

// Strip accents so "Turkiye" finds "Türkiye".
function fold(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

// Rank matches so a prefix hit beats one buried mid-name: typing "ind" should
// offer India before British Indian Ocean Territory.
function search(query) {
  const q = fold(query.trim());
  if (!q) return COUNTRIES;

  const digits = q.replace(/\D/g, "");
  const starts = [];
  const contains = [];

  for (const c of COUNTRIES) {
    const name = fold(c.name);
    const dial = c.dial.replace(/\D/g, "");
    if (name.startsWith(q) || (digits && dial.startsWith(digits))) {
      starts.push(c);
    } else if (name.includes(q) || (digits && dial.includes(digits))) {
      contains.push(c);
    }
  }
  return [...starts, ...contains];
}

/**
 * A country dial-code picker.
 *
 * This replaces a native <select>. A select's type-ahead only matches the
 * start of an option's label, so with "+1 United States" there is no way to
 * reach a country by typing its name — and putting the name first truncates
 * the dial code in the closed control, which is the part that matters. A
 * listbox with its own search box fixes both.
 */
const CountrySelect = ({ value, onChange, disabled, id, label = "Country dialling code" }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const results = useMemo(() => search(query), [query]);
  const selected = COUNTRIES.find((c) => c.code === value) || COUNTRIES[0];

  // Open on the current selection so the list starts where the user left it.
  const openList = () => {
    if (disabled) return;
    const index = results.findIndex((c) => c.code === value);
    setActive(index < 0 ? 0 : index);
    setOpen(true);
  };

  const close = ({ refocus = true } = {}) => {
    setOpen(false);
    setQuery("");
    if (refocus) buttonRef.current?.focus();
  };

  const choose = (country) => {
    onChange(country.code);
    close();
  };

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // A new filter invalidates the old highlight position.
  useEffect(() => setActive(0), [query]);

  // Keep the highlighted row visible while arrowing through a long list.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.children?.[active];
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) close({ refocus: false });
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const onKeyDown = (e) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => (results.length ? (i + 1) % results.length : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(Math.max(results.length - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (results[active]) choose(results[active]);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        // Let focus leave naturally, but do not leave the list hanging open.
        close({ refocus: false });
        break;
      default:
        break;
    }
  };

  return (
    <div className="country-select" ref={rootRef}>
      <button
        type="button"
        id={id}
        ref={buttonRef}
        className="country-select-trigger"
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${selected.name} ${selected.dial}`}
      >
        <span className="country-select-flag" aria-hidden="true">
          {flagOf(selected.code)}
        </span>
        <span className="country-select-dial">{selected.dial}</span>
        <span className="country-select-caret" aria-hidden="true" />
      </button>

      {open && (
        <div className="country-select-panel">
          <input
            ref={inputRef}
            type="text"
            className="country-select-search"
            placeholder="Search country or code"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            aria-label="Search for a country"
            aria-controls="country-select-list"
            autoComplete="off"
          />
          <ul
            className="country-select-list"
            id="country-select-list"
            role="listbox"
            ref={listRef}
            aria-label={label}
          >
            {results.map((c, i) => (
              <li
                key={c.code}
                role="option"
                aria-selected={c.code === value}
                className={
                  "country-select-option" +
                  (i === active ? " is-active" : "") +
                  (c.code === value ? " is-selected" : "")
                }
                // mousedown, not click: mousedown fires before the outside
                // handler can close the panel out from under the pointer.
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(c);
                }}
                onMouseEnter={() => setActive(i)}
              >
                <span className="country-select-flag" aria-hidden="true">
                  {flagOf(c.code)}
                </span>
                <span className="country-select-name">{c.name}</span>
                <span className="country-select-code">{c.dial}</span>
              </li>
            ))}
            {!results.length && (
              <li className="country-select-empty">No country matches that.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CountrySelect;
