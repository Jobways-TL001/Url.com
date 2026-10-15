import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

// Reveal-on-scroll for anything marked data-reveal.
//
// Two rules this follows, because getting them wrong hides content:
//
// 1. Fail open. The hidden state is applied by JS, never by the stylesheet
//    alone, so if JS does not run, IntersectionObserver is missing, or this
//    hook throws, the markup renders fully visible. Nothing is ever hidden
//    by CSS that only JS can undo.
// 2. Honour prefers-reduced-motion. If the visitor asked for less motion the
//    hook does nothing at all, leaving the content in its normal state.
//
// It is applied with useLayoutEffect so the starting state lands before the
// browser paints; in an effect the content would flash in, then hide, then
// animate back.

const STAGGER_MS = 80;
const MAX_STAGGER_STEPS = 5;

const useScrollReveal = () => {
  const { pathname, hash } = useLocation();

  useLayoutEffect(() => {
    const reduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || typeof IntersectionObserver === "undefined") return undefined;

    // Only content below the fold is animated. Anything already on screen
    // when a page opens is left visible: hiding it and fading it back in
    // made every page switch look like a blank or washed-out flash.
    const fold = window.innerHeight;
    const targets = Array.from(document.querySelectorAll("[data-reveal]")).filter(
      // A link to a section (/ai-courses#courses) scrolls the page after this
      // runs, so what is "below the fold" now is what will be on screen.
      // Nothing is hidden on those visits.
      (el) => !hash && el.getBoundingClientRect().top >= fold
    );

    // [data-animate] marks decoration that plays once when it comes into
    // view (the steps connector drawing across, say). Unlike data-reveal it
    // never hides content, so it also runs for elements already on screen.
    const animated = Array.from(document.querySelectorAll("[data-animate]"));
    animated.forEach((el) => el.classList.add("anim-pending"));
    const animObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          animObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.3 }
    );
    animated.forEach((el) => animObserver.observe(el));
    const cleanUpAnimated = () => {
      animObserver.disconnect();
      animated.forEach((el) => el.classList.remove("anim-pending", "in-view"));
    };

    if (!targets.length) return cleanUpAnimated;

    const timers = [];

    // Siblings animate in sequence rather than all at once.
    const seen = new Map();
    targets.forEach((el) => {
      const parent = el.parentElement;
      const index = seen.get(parent) ?? 0;
      seen.set(parent, index + 1);
      const step = Math.min(index, MAX_STAGGER_STEPS);
      el.style.setProperty("--reveal-delay", `${step * STAGGER_MS}ms`);
      el.classList.add("reveal");
    });

    // Once an element has finished revealing, drop the classes entirely.
    // While .reveal is applied it overrides the component's own transition
    // (that is the point), so leaving it on would make hover effects run at
    // the 0.7s reveal timing instead of their own.
    const cleanUp = (el) => {
      el.classList.remove("reveal", "reveal-in");
      el.style.removeProperty("--reveal-delay");
    };

    const settle = (el) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        el.removeEventListener("transitionend", onEnd);
        cleanUp(el);
      };
      const onEnd = (e) => {
        if (e.target === el && e.propertyName === "opacity") finish();
      };
      el.addEventListener("transitionend", onEnd);
      // transitionend does not fire if the element is never painted (a
      // background tab, say), so do not rely on it alone.
      const timer = setTimeout(finish, 1800);
      timers.push(timer);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("reveal-in");
          settle(entry.target);
          // One-shot: re-animating on every scroll past is distracting.
          observer.unobserve(entry.target);
        });
      },
      // Start slightly before the element reaches the viewport edge so the
      // motion is finishing as it comes into view, not starting.
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    targets.forEach((el) => observer.observe(el));

    return () => {
      cleanUpAnimated();
      observer.disconnect();
      timers.forEach(clearTimeout);
      // Leave nothing hidden behind on unmount or route change.
      targets.forEach(cleanUp);
    };
    // Re-run per page only; a hash change within a page must not reset it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
};

export default useScrollReveal;
