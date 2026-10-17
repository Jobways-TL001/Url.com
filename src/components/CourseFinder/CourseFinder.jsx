import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faBriefcase,
  faCheck,
  faClock,
  faRotateLeft,
  faSignal,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "../../constants/routes";
import { QUESTIONS, rankCourses, joinReasons } from "./scoring";
import "./CourseFinder.css";

const TOTAL = QUESTIONS.length;
const EMPTY = {};

// Three questions, one at a time, then a suggested course and two
// alternatives. Each question is a native radio group (fieldset + legend),
// so arrow keys, screen readers and form semantics all work without custom
// ARIA.
const CourseFinder = () => {
  const [step, setStep] = useState(0); // 0..TOTAL-1 = questions, TOTAL = results
  const [answers, setAnswers] = useState(EMPTY);
  const [announcement, setAnnouncement] = useState("");
  const legendRef = useRef(null);
  const resultsRef = useRef(null);
  // Focus is moved only after the visitor acts, never on first render.
  const moveFocus = useRef(false);

  const showingResults = step >= TOTAL;
  const question = QUESTIONS[Math.min(step, TOTAL - 1)];
  const answered = Boolean(answers[question.id]);

  const ranked = useMemo(
    () => (showingResults ? rankCourses(answers).slice(0, 3) : []),
    [showingResults, answers]
  );

  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    const target = showingResults ? resultsRef.current : legendRef.current;
    target?.focus({ preventScroll: true });
    // Keep the panel in view on small screens, where it is taller than the
    // viewport and the new step's question can end up above the fold.
    const panel = target?.closest(".finder");
    if (panel && panel.getBoundingClientRect().top < 0) {
      panel.scrollIntoView({ block: "start" });
    }
  }, [step, showingResults]);

  useEffect(() => {
    if (!showingResults || ranked.length === 0) return;
    const [top, ...alts] = ranked;
    setAnnouncement(
      `We suggest ${top.course.title}.${
        alts.length ? ` You might also like ${alts.map((r) => r.course.title).join(" and ")}.` : ""
      }`
    );
  }, [showingResults, ranked]);

  const choose = (value) => setAnswers((prev) => ({ ...prev, [question.id]: value }));

  const next = (e) => {
    e.preventDefault();
    if (!answered) return;
    moveFocus.current = true;
    setAnnouncement(step + 1 < TOTAL ? `Question ${step + 2} of ${TOTAL}` : "");
    setStep((s) => s + 1);
  };

  const back = () => {
    moveFocus.current = true;
    setAnnouncement(`Question ${step} of ${TOTAL}`);
    setStep((s) => Math.max(0, s - 1));
  };

  const restart = () => {
    moveFocus.current = true;
    setAnswers(EMPTY);
    setAnnouncement(`Starting again. Question 1 of ${TOTAL}`);
    setStep(0);
  };

  const progress = showingResults ? 1 : (step + 1) / TOTAL;

  return (
    <div className="finder">
      {!showingResults && (
        <div className="finder-top">
          <p className="finder-step">
            Question {step + 1} of {TOTAL}
          </p>
          <div className="finder-bar" aria-hidden="true">
            <span style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>
      )}

      {!showingResults ? (
        <form className="finder-form" onSubmit={next} noValidate>
          <fieldset key={question.id} className="finder-q">
            <legend ref={legendRef} tabIndex={-1} className="finder-legend">
              {question.legend}
            </legend>
            <div className="finder-options">
              {question.options.map((option) => {
                const id = `finder-${question.id}-${option.value}`;
                const checked = answers[question.id] === option.value;
                return (
                  <label
                    key={option.value}
                    htmlFor={id}
                    className={`finder-option${checked ? " is-checked" : ""}`}
                  >
                    <input
                      id={id}
                      type="radio"
                      name={`finder-${question.id}`}
                      value={option.value}
                      checked={checked}
                      onChange={() => choose(option.value)}
                    />
                    <span className="finder-option-body">
                      <span className="finder-option-label">{option.label}</span>
                      <span className="finder-option-detail">{option.detail}</span>
                    </span>
                    <span className="finder-option-check" aria-hidden="true">
                      <FontAwesomeIcon icon={faCheck} />
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="finder-nav">
            {step > 0 ? (
              <button type="button" className="btn btn-secondary" onClick={back}>
                <FontAwesomeIcon icon={faArrowLeft} />
                Back
              </button>
            ) : (
              <span className="finder-hint">Choose one answer to continue.</span>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!answered}
              aria-describedby={answered ? undefined : "finder-next-hint"}
            >
              {step === TOTAL - 1 ? "See my result" : "Next"}
              <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" />
            </button>
            <span id="finder-next-hint" className="visually-hidden">
              Choose an answer first.
            </span>
          </div>
        </form>
      ) : (
        <Results ranked={ranked} headingRef={resultsRef} onRestart={restart} />
      )}

      {/* Step changes and the result are read out here. */}
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  );
};

const Results = ({ ranked, headingRef, onRestart }) => {
  if (ranked.length === 0) return null;
  const [top, ...alts] = ranked;
  const { course } = top;

  return (
    <div className="finder-results">
      <h3 ref={headingRef} tabIndex={-1} className="finder-results-title">
        We suggest this course for you
      </h3>

      <article className="finder-match">
        <div className="finder-match-media">
          <span className="finder-match-badge" aria-hidden="true">
            Best match
          </span>
          <img
            src={course.image}
            alt=""
            width="640"
            height="400"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="finder-match-body">
          <h4>{course.title}</h4>
          <ul className="finder-match-meta">
            <li>
              <FontAwesomeIcon icon={faClock} aria-hidden="true" />
              {course.duration}
            </li>
            <li>
              <FontAwesomeIcon icon={faSignal} aria-hidden="true" />
              {course.level}
            </li>
            <li>
              <FontAwesomeIcon icon={faVideo} aria-hidden="true" />
              {course.mode}
            </li>
          </ul>
          <p className="finder-why">
            {top.reasons.length > 0 && `You said ${joinReasons(top.reasons)}. `}
            {course.summary}
          </p>
          <p className="finder-role">
            <FontAwesomeIcon icon={faBriefcase} aria-hidden="true" />
            <span>
              Prepares you for: <strong>{course.role}</strong>
            </span>
          </p>
          <Link to={ROUTES.course(course.id)} className="btn btn-primary">
            View course
            <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" />
          </Link>
        </div>
      </article>

      {alts.length > 0 && (
        <>
          <h4 className="finder-alts-title">You might also like</h4>
          <ul className="finder-alts">
            {alts.map(({ course: alt }) => (
              <li key={alt.id}>
                <Link to={ROUTES.course(alt.id)} className="finder-alt">
                  <img
                    src={alt.image}
                    alt=""
                    width="160"
                    height="100"
                    loading="lazy"
                    decoding="async"
                  />
                  <span className="finder-alt-body">
                    <span className="finder-alt-title">{alt.title}</span>
                    <span className="finder-alt-meta">
                      {alt.duration} · {alt.level}
                    </span>
                  </span>
                  <FontAwesomeIcon icon={faArrowRight} className="finder-alt-arrow" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="finder-results-foot">
        <button type="button" className="btn btn-secondary" onClick={onRestart}>
          <FontAwesomeIcon icon={faRotateLeft} />
          Start again
        </button>
        <Link to={ROUTES.contact} className="btn btn-link">
          Book a free call with an advisor
        </Link>
      </div>

      <details className="finder-how">
        <summary>How we pick a course</summary>
        <p>
          Each answer adds points to the courses that suit it. Intermediate courses lose
          points if you are new to coding, and beginner courses lose points if you already
          work in data or ML. The course with the most points comes first, and ties follow
          the order of our catalogue. It's a starting point, and an advisor can talk it
          through with you on a free call.
        </p>
      </details>
    </div>
  );
};

export default CourseFinder;
