import React, { useEffect, useRef, useState } from "react";

const DURATION_MS = 1400;

// Counts a figure such as "50+" or "100%" up from zero the first time it
// scrolls into view. It renders the final value first, so without JS, with
// reduced motion, or before the observer fires, the real figure is shown.
// Years (and anything over 999) are left as they are — counting "2017" up
// from zero reads as a gimmick rather than a statistic.
const CountUp = ({ value }) => {
  const match = /^(\d+)(.*)$/.exec(value);
  const target = match ? Number(match[1]) : NaN;
  const suffix = match ? match[2] : "";
  const animatable = Number.isFinite(target) && target > 0 && target < 1000;

  const [display, setDisplay] = useState(value);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!el || !animatable || reduced || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    let frame;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now) => {
          const t = Math.min((now - start) / DURATION_MS, 1);
          // Ease-out cubic: fast at first, settling onto the final figure.
          const eased = 1 - Math.pow(1 - t, 3);
          setDisplay(`${Math.round(target * eased)}${suffix}`);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        setDisplay(`0${suffix}`);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      setDisplay(value);
    };
  }, [animatable, target, suffix, value]);

  return (
    <strong ref={ref} aria-label={value}>
      <span aria-hidden="true">{display}</span>
    </strong>
  );
};

export default CountUp;
