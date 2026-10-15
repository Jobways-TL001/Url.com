import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCompass,
  faHeadset,
  faMagnifyingGlass,
  faTableCellsLarge,
  faList,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import Header from "../Header/header";
import Footer from "../Footer/footer";
import EnrollModal from "./EnrollModal";
import { COURSES, COURSE_FEE, TRACKS } from "../../constants/courses";
import { ROUTES } from "../../constants/routes";
import { LEVELS, levelsOf, matchesQuery, sentenceCase, trackLabel } from "./courseUtils";
import "./learning.css";

const FAQS = [
  {
    q: "Do I need coding experience?",
    a: "Not for every course. Python for AI: Foundations and Prompt Engineering & AI Productivity are written for complete beginners, and Data Science & AI Analytics and AI & Machine Learning Engineering start from the basics. The others expect some programming. You can filter by level above, or book a free call and an advisor will help you pick.",
  },
  {
    q: "How long are the courses, and when are classes?",
    a: "Every course runs for six months. Classes are taught live online, Monday to Friday.",
  },
  {
    q: "What does a course cost?",
    a: `Fees are between ${COURSE_FEE}, depending on the course. An advisor confirms your exact fee with you before you pay.`,
  },
  {
    q: "How do I pay?",
    a: "You apply with a short form, then pay through a secure Stripe payment link. We never see or store your card details.",
  },
  {
    q: "What happens after I apply?",
    a: "An advisor contacts you within one business day to confirm your batch, introduce your mentor and share your start date.",
  },
];

const VIEWS = [
  { value: "grid", label: "Grid", icon: faTableCellsLarge },
  { value: "list", label: "List", icon: faList },
];

// Cards show this many tools, then "+N".
const CARD_TOOLS = 3;

const isTrack = (value) => TRACKS.some((t) => t.value === value);
const countFor = (track) =>
  track === "all" ? COURSES.length : COURSES.filter((c) => c.track === track).length;

const Learning = () => {
  const [enrollCourse, setEnrollCourse] = useState(null);
  const [query, setQuery] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const { hash } = useLocation();
  const navigate = useNavigate();

  // Track, level and layout live in the URL (?track=core&level=beginner&view=list),
  // so links from other pages open the list already filtered and a filtered
  // view can be shared. Unknown values fall back to the defaults.
  const trackParam = searchParams.get("track");
  const track = isTrack(trackParam) ? trackParam : "all";
  const levelParam = searchParams.get("level");
  const level = LEVELS.some((l) => l.value === levelParam) ? levelParam : "all";
  const view = searchParams.get("view") === "list" ? "list" : "grid";

  // Set several params at once; a default value removes the param.
  const setParams = (changes) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(changes).forEach(([key, value]) => {
          if (value === "all" || value === "grid") next.delete(key);
          else next.set(key, value);
        });
        return next;
      },
      { replace: true }
    );
  };
  const setTrack = (value) => setParams({ track: value });
  const setLevel = (value) => setParams({ level: value });
  const setView = (value) => setParams({ view: value });

  const visible = useMemo(
    () =>
      COURSES.filter(
        (c) =>
          (track === "all" || c.track === track) &&
          (level === "all" || levelsOf(c).includes(level)) &&
          matchesQuery(c, query)
      ),
    [track, level, query]
  );

  const filtered = track !== "all" || level !== "all" || query.trim() !== "";

  const clearFilters = () => {
    setQuery("");
    setParams({ track: "all", level: "all" });
  };

  // Old in-page anchors: #course-<id> now has its own page; other hashes
  // (#courses, #faq) scroll to that section.
  useEffect(() => {
    if (!hash) return undefined;
    const id = decodeURIComponent(hash.slice(1));
    if (id.startsWith("course-")) {
      const courseId = id.slice("course-".length);
      if (COURSES.some((c) => c.id === courseId)) {
        navigate(ROUTES.course(courseId), { replace: true });
        return undefined;
      }
    }
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(id);
      if (target) target.scrollIntoView();
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, navigate]);

  const resultText = filtered
    ? `Showing ${visible.length} of ${COURSES.length} courses`
    : `Showing all ${COURSES.length} courses`;

  return (
    <>
      <Header />

      <main className="cat" id="main" tabIndex={-1}>
        {/* ---------------- Page hero ---------------- */}
        <section className="page-hero cat-hero" aria-labelledby="cat-title">
          <div className="container">
            <div className="page-hero-inner">
              <h1 id="cat-title">Our AI courses</h1>
              <p>
                {COURSES.length} live online courses, from your first lines of
                Python to building LLM apps and ML pipelines. Each one runs for
                six months, Monday to Friday, with a dedicated industry mentor.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------- Course list ---------------- */}
        <section className="cat-browse" id="courses" aria-labelledby="cat-browse-title">
          <div className="container">
            <h2 id="cat-browse-title" className="visually-hidden">
              Browse courses
            </h2>

            <div className="cat-toolbar" role="search" aria-label="Filter courses">
              <div className="cat-toolbar-row">
                <div className="cat-search">
                  <label htmlFor="cat-search" className="visually-hidden">
                    Search courses
                  </label>
                  <FontAwesomeIcon icon={faMagnifyingGlass} className="cat-search-icon" />
                  <input
                    id="cat-search"
                    type="search"
                    className="input cat-search-input"
                    placeholder="Search by course, tool or job title"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoComplete="off"
                    spellCheck="false"
                  />
                  {query && (
                    <button
                      type="button"
                      className="cat-search-clear"
                      onClick={() => setQuery("")}
                      aria-label="Clear search"
                    >
                      <FontAwesomeIcon icon={faXmark} />
                    </button>
                  )}
                </div>

                <div className="cat-level">
                  <label htmlFor="cat-level" className="visually-hidden">
                    Level
                  </label>
                  <select
                    id="cat-level"
                    className="select cat-level-select"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  >
                    <option value="all">All levels</option>
                    {LEVELS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="cat-view" role="group" aria-label="Layout">
                  {VIEWS.map((v) => (
                    <button
                      key={v.value}
                      type="button"
                      className={`cat-view-btn${view === v.value ? " is-active" : ""}`}
                      aria-pressed={view === v.value}
                      onClick={() => setView(v.value)}
                    >
                      <FontAwesomeIcon icon={v.icon} aria-hidden="true" />
                      <span>{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="cat-tracks" role="group" aria-label="Track">
                {TRACKS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={`cat-track${track === t.value ? " is-active" : ""}`}
                    aria-pressed={track === t.value}
                    onClick={() => setTrack(t.value)}
                  >
                    {t.label}
                    <span className="cat-track-count" aria-hidden="true">
                      {countFor(t.value)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="cat-status">
              <p className="cat-count" role="status" aria-live="polite">
                {resultText}
              </p>
              {filtered && (
                <button type="button" className="btn btn-link cat-clear" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>

            {visible.length === 0 ? (
              <div className="cat-empty">
                <h3>No courses match your search</h3>
                <p>
                  Try a different word, another track or all levels. You can
                  also book a free call and an advisor will help you choose.
                </p>
                <div className="cat-empty-actions">
                  <button type="button" className="btn btn-primary" onClick={clearFilters}>
                    Clear filters
                  </button>
                  <Link to={ROUTES.contact} className="btn btn-secondary">
                    Book a free call
                  </Link>
                </div>
              </div>
            ) : view === "grid" ? (
              <ul className="cat-grid">
                {visible.map((course) => (
                  <li key={course.id}>
                    <CourseCard course={course} onApply={() => setEnrollCourse(course)} />
                  </li>
                ))}
              </ul>
            ) : (
              <CourseTable courses={visible} onApply={setEnrollCourse} />
            )}
          </div>
        </section>

        {/* ---------------- Help choosing ---------------- */}
        <section className="cat-help" aria-labelledby="cat-help-title">
          <div className="container">
            <div className="cat-help-card" data-reveal>
              <div className="cat-help-copy">
                <h2 id="cat-help-title">Not sure which course to choose?</h2>
                <p>
                  Answer a few short questions to get a suggestion, or talk it
                  through with one of our advisors.
                </p>
              </div>
              <ul className="cat-help-options">
                <li>
                  <Link to={ROUTES.finder} className="cat-help-option">
                    <span className="icon-tile" aria-hidden="true">
                      <FontAwesomeIcon icon={faCompass} />
                    </span>
                    <span className="cat-help-text">
                      <strong>Use the course finder</strong>
                      <span>A quick quiz about your background and goals.</span>
                    </span>
                    <FontAwesomeIcon icon={faArrowRight} className="cat-help-arrow" />
                  </Link>
                </li>
                <li>
                  <Link to={ROUTES.contact} className="cat-help-option">
                    <span className="icon-tile" aria-hidden="true">
                      <FontAwesomeIcon icon={faHeadset} />
                    </span>
                    <span className="cat-help-text">
                      <strong>Book a free call</strong>
                      <span>Ask an advisor about fees, batches and which course suits you.</span>
                    </span>
                    <FontAwesomeIcon icon={faArrowRight} className="cat-help-arrow" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className="cat-faq" id="faq" aria-labelledby="cat-faq-title">
          <div className="container cat-faq-grid">
            <div className="cat-faq-intro">
              <h2 id="cat-faq-title">Frequently asked questions</h2>
              <p>
                Can't find what you're looking for?{" "}
                <Link to={ROUTES.contact}>Ask an advisor</Link>.
              </p>
            </div>
            <div className="faq-list">
              {FAQS.map((item) => (
                <details key={item.q} className="faq-item" data-reveal>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      {enrollCourse && (
        <EnrollModal
          course={enrollCourse}
          isOpen={Boolean(enrollCourse)}
          onClose={() => setEnrollCourse(null)}
        />
      )}
      <Footer />
    </>
  );
};

// One course in the grid: photo, a short track/level line, title, summary,
// a few tools and the two actions.
function CourseCard({ course, onApply }) {
  const extraTools = course.tools.length - CARD_TOOLS;
  return (
    <article className="cat-card">
      <Link
        to={ROUTES.course(course.id)}
        className="cat-card-media"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={course.image}
          alt=""
          width="1200"
          height="750"
          loading="lazy"
          decoding="async"
        />
      </Link>
      <div className="cat-card-body">
        <p className="cat-card-meta">
          {trackLabel(course.track)} · {sentenceCase(course.level)}
        </p>
        <h3 className="cat-card-title">
          <Link to={ROUTES.course(course.id)}>{course.title}</Link>
        </h3>
        <p className="cat-card-summary">{course.summary}</p>
        <ul className="chip-list cat-card-tools" aria-label="Tools">
          {course.tools.slice(0, CARD_TOOLS).map((tool) => (
            <li key={tool} className="chip">
              {tool}
            </li>
          ))}
          {extraTools > 0 && (
            <li className="chip cat-card-more" aria-label={`and ${extraTools} more`}>
              +{extraTools}
            </li>
          )}
        </ul>
        <p className="cat-card-facts">
          {course.duration} · {course.mode || "Live online"} · {COURSE_FEE}
        </p>
      </div>
      <div className="cat-card-foot">
        <Link
          to={ROUTES.course(course.id)}
          className="btn btn-secondary btn-sm"
          aria-label={`View course: ${course.title}`}
        >
          View course
        </Link>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onApply}
          aria-label={`Apply now: ${course.title}`}
        >
          Apply now
        </button>
      </div>
    </article>
  );
}

// Comparison view: one row per course.
function CourseTable({ courses, onApply }) {
  return (
    <div className="cat-table-wrap">
      <table className="cat-table">
        <caption className="visually-hidden">
          Courses compared by track, level, duration and fee
        </caption>
        <thead>
          <tr>
            <th scope="col">Course</th>
            <th scope="col">Track</th>
            <th scope="col">Level</th>
            <th scope="col">Duration</th>
            <th scope="col">Fee</th>
            <th scope="col">
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <th scope="row" className="cat-row-course">
                <Link to={ROUTES.course(course.id)} className="cat-row-title">
                  {course.title}
                </Link>
                <span className="cat-row-role">Prepares you for: {course.role}</span>
              </th>
              <td data-label="Track">{trackLabel(course.track)}</td>
              <td data-label="Level">{sentenceCase(course.level)}</td>
              <td data-label="Duration">{course.duration}</td>
              <td data-label="Fee" className="cat-row-fee">
                {COURSE_FEE}
              </td>
              <td className="cat-row-actions">
                <Link
                  to={ROUTES.course(course.id)}
                  className="btn btn-secondary btn-sm"
                  aria-label={`View course: ${course.title}`}
                >
                  View
                </Link>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => onApply(course)}
                  aria-label={`Apply now: ${course.title}`}
                >
                  Apply now
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Learning;
