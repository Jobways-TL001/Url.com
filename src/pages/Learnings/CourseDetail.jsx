import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faBriefcase,
  faCalendarDays,
  faChalkboardUser,
  faChevronRight,
  faCode,
  faHandshake,
  faSignal,
  faUserGroup,
  faVideo,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import Header from "../Header/header";
import Footer from "../Footer/footer";
import Modal from "../Modal/modal";
import EnrollModal from "./EnrollModal";
import { COURSES, COURSE_FEE } from "../../constants/courses";
import { COMPANY } from "../../constants/company";
import { ROUTES } from "../../constants/routes";
import {
  INCLUDED,
  LEVELS,
  findCourse,
  levelsOf,
  relatedCourses,
  sentenceCase,
  trackLabel,
} from "./courseUtils";
import "./courseDetail.css";

const SECTIONS = [
  { id: "overview", label: "Overview" },
  { id: "curriculum", label: "Curriculum" },
  { id: "tools", label: "Tools" },
  { id: "capstone", label: "Final project" },
  { id: "faq", label: "FAQ" },
];

// How every course is taught (only claims the business already makes).
const HOW_YOU_LEARN = [
  {
    icon: faVideo,
    title: "Live classes",
    text: "Taught live online, Monday to Friday, so you can ask questions as you go.",
  },
  {
    icon: faChalkboardUser,
    title: "Your own mentor",
    text: "A dedicated industry mentor reviews your work and helps when you get stuck.",
  },
  {
    icon: faCode,
    title: "Hands-on projects",
    text: "Every module has practical work, and the course ends with a final project.",
  },
  {
    icon: faHandshake,
    title: "Career support",
    text: "Career advice, interview preparation and job support while you apply.",
  },
];

const PYTHON_COURSE = COURSES.find((c) => c.id === "python-for-ai");

// Who a course suits, from its level text.
function audienceFor(course) {
  const levels = levelsOf(course);
  if (levels.length === 1 && levels[0] === "beginner") {
    return "Complete beginners, career changers and anyone who wants practical AI skills without a technical background.";
  }
  if (levels.includes("beginner")) {
    return "Beginners who can practise regularly, and developers or analysts who want a structured course that starts from the basics.";
  }
  return "Developers, IT and data professionals with some programming experience who want to move into this area.";
}

// A highlight like "Deep learning with PyTorch: neural networks, CNNs and
// transformers" becomes a module title plus topic chips.
function splitHighlight(text) {
  const at = text.indexOf(":");
  if (at < 0) return { title: text, topics: [] };
  const topics = text
    .slice(at + 1)
    .split(/,\s*|\s+and\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  return { title: text.slice(0, at).trim(), topics };
}

// Course-specific answers, built only from the course data and the claims
// the business already makes.
function faqsFor(course) {
  const levels = levelsOf(course);
  const top = LEVELS.find((l) => l.value === levels[levels.length - 1]);
  let experience;
  if (levels.length === 1 && levels[0] === "beginner") {
    experience = `No. ${course.title} is written for beginners and starts from the basics.`;
  } else if (levels.includes("beginner")) {
    experience = `No. It starts from the basics and builds up to ${(top?.label || "advanced").toLowerCase()} work, so you can join as a beginner.`;
  } else {
    experience = (
      <>
        Some programming experience helps, as the course is pitched at{" "}
        {course.level.toLowerCase()} level. If you're new to code, start with{" "}
        {PYTHON_COURSE ? (
          <Link to={ROUTES.course(PYTHON_COURSE.id)}>{PYTHON_COURSE.title}</Link>
        ) : (
          "a foundations course"
        )}
        , or <Link to={`${ROUTES.contact}?course=${encodeURIComponent(course.id)}`}>book a free call</Link> and
        an advisor will help you decide.
      </>
    );
  }

  return [
    { q: "Do I need prior experience?", a: experience },
    {
      q: "How long is the course, and when are classes?",
      a: `${course.duration}, ${course.mode.toLowerCase()}. Classes run Monday to Friday, and your mentor stays with you for the whole course.`,
    },
    {
      q: "What will I have built by the end?",
      a: `You'll complete hands-on projects in every module and finish with a final project: ${course.project}`,
    },
    {
      q: "Which jobs does it prepare me for?",
      a: `The course is built around the ${course.role} role. You also get career advice, interview preparation and job support while you apply, with 100% placement support.`,
    },
    {
      q: "What does it cost, and how do I pay?",
      a: `Fees are between ${COURSE_FEE}. An advisor confirms the exact fee for this course before you pay. You apply with a short form, then pay securely through Stripe.`,
    },
  ];
}

function setMeta(title, description) {
  document.title = title;
  let tag = document.querySelector('meta[name="description"]');
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", "description");
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", description);
}

// /courses/:courseId
export default function CourseDetail() {
  const { courseId } = useParams();
  const course = findCourse(courseId);
  if (!course) return <CourseNotFound />;
  // Keyed by course, so moving between courses starts with fresh state
  // (closed modals, first module open) and re-runs the arrival effects.
  return <CourseView key={course.id} course={course} />;
}

function CourseView({ course }) {
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const [openModules, setOpenModules] = useState(() => new Set([0]));
  const [active, setActive] = useState(SECTIONS[0].id);
  const [showBar, setShowBar] = useState(false);
  const titleRef = useRef(null);
  const cardRef = useRef(null);
  const subnavRef = useRef(null);
  const { hash } = useLocation();

  const modules = course.highlights.map(splitHighlight);
  const faqs = faqsFor(course);
  const related = relatedCourses(course, 3);
  const allOpen = openModules.size === modules.length;

  // Arriving on a course (or moving to another one): page title, then either
  // the requested section or the top of the page with focus on the heading,
  // so screen-reader and keyboard users start at the new content.
  useEffect(() => {
    setMeta(`${course.title} | ${COMPANY.name}`, `${course.summary} ${course.duration}, ${course.mode.toLowerCase()}, Monday to Friday.`);
    const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
    if (target) {
      // After layout settles; "instant" so the smooth scrolling set on
      // <html> cannot be interrupted part-way.
      const frame = requestAnimationFrame(() => target.scrollIntoView({ behavior: "instant" }));
      return () => cancelAnimationFrame(frame);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    titleRef.current?.focus({ preventScroll: true });
    return undefined;
    // Only on arrival; later hash changes come from the sub-nav.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Highlight the tab for the section being read: the last one whose top
  // has passed 40% of the way down the screen (or the last section once
  // the page is scrolled to the bottom).
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.4;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      let current = SECTIONS[0].id;
      SECTIONS.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      });
      const faqEl = document.getElementById(SECTIONS[SECTIONS.length - 1].id);
      if (atBottom && faqEl && faqEl.getBoundingClientRect().top < window.innerHeight) {
        current = SECTIONS[SECTIONS.length - 1].id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // On small screens the tabs scroll sideways: keep the active tab in view
  // (scrolls the bar only, never the page).
  useEffect(() => {
    const bar = subnavRef.current;
    if (!bar || bar.scrollWidth <= bar.clientWidth) return;
    const tab = bar.querySelector(`[data-section="${active}"]`);
    if (!tab) return;
    const left = tab.offsetLeft - bar.clientWidth / 2 + tab.offsetWidth / 2;
    if (typeof bar.scrollTo === "function") bar.scrollTo({ left, behavior: "smooth" });
    else bar.scrollLeft = left;
  }, [active]);

  // Mobile: the fee + "Apply now" bar shows whenever the enrol card itself
  // is off screen.
  useEffect(() => {
    const card = cardRef.current;
    if (!card || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => setShowBar(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  const goToSection = useCallback((e, id) => {
    const section = document.getElementById(id);
    if (!section) return;
    e.preventDefault();
    setActive(id);
    section.scrollIntoView();
    const heading = section.querySelector("h2");
    if (heading) heading.focus({ preventScroll: true });
  }, []);

  const toggleModule = (index) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleAll = () => {
    setOpenModules(allOpen ? new Set() : new Set(modules.map((_, i) => i)));
  };

  const trackHref = `${ROUTES.courses}?track=${encodeURIComponent(course.track)}`;
  const callHref = `${ROUTES.contact}?course=${encodeURIComponent(course.id)}`;

  const facts = [
    { icon: faCalendarDays, label: "Duration", value: course.duration },
    {
      icon: faVideo,
      label: "Schedule",
      value: (
        <>
          {course.mode}, <span className="cd-nowrap">Mon–Fri</span>
        </>
      ),
    },
    { icon: faSignal, label: "Level", value: sentenceCase(course.level) },
    { icon: faWallet, label: "Fee", value: COURSE_FEE },
    { icon: faBriefcase, label: "Prepares you for", value: course.role },
  ];

  return (
    <>
      <Header />

      <main className="cd" id="main" tabIndex={-1}>
        {/* ---------------- Hero ---------------- */}
        <header className="cd-hero">
          <div className="container cd-hero-grid">
            <div className="cd-hero-copy">
              <nav aria-label="Breadcrumb" className="cd-crumbs">
                <ol>
                  <li>
                    <Link to={ROUTES.courses}>Courses</Link>
                    <FontAwesomeIcon icon={faChevronRight} className="cd-crumb-sep" aria-hidden="true" />
                  </li>
                  <li>
                    <Link to={trackHref}>{trackLabel(course.track)}</Link>
                    <FontAwesomeIcon icon={faChevronRight} className="cd-crumb-sep" aria-hidden="true" />
                  </li>
                  <li aria-current="page">{course.title}</li>
                </ol>
              </nav>

              <h1 className="cd-title" ref={titleRef} tabIndex={-1}>
                {course.title}
              </h1>
              <p className="cd-summary">{course.summary}</p>

              <ul className="cd-facts" aria-label="Key facts">
                {facts.map((f) => (
                  <li key={f.label}>
                    <FontAwesomeIcon icon={f.icon} className="cd-fact-icon" aria-hidden="true" />
                    <span>
                      <span className="cd-fact-label">{f.label}</span>
                      <span className="cd-fact-value">{f.value}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="cd-hero-media">
              <img
                src={course.image}
                alt={`${course.title} course`}
                width="1200"
                height="750"
                decoding="async"
                fetchpriority="high"
              />
            </div>
          </div>
        </header>

        <div className="container cd-layout">
          {/* ---------------- Enrol card ---------------- */}
          <aside className="cd-aside" aria-labelledby="cd-card-title">
            <div className="cd-card" ref={cardRef}>
              <h2 id="cd-card-title" className="cd-card-heading">
                Course fee
              </h2>
              <p className="cd-card-fee">{COURSE_FEE}</p>
              <p className="cd-card-note">
                An advisor confirms your exact fee before you pay.
              </p>

              <h3 className="cd-card-sub">What's included</h3>
              <ul className="check-list cd-card-included">
                {INCLUDED.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className="cd-card-actions">
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={() => setEnrollOpen(true)}
                >
                  Apply now
                </button>
                <Link to={callHref} className="btn btn-secondary btn-block">
                  Book a free call
                </Link>
                <button
                  type="button"
                  className="btn btn-link cd-card-ask"
                  onClick={() => setAskOpen(true)}
                >
                  Ask a question
                </button>
              </div>
            </div>
          </aside>

          {/* ---------------- Sections ---------------- */}
          <div className="cd-body">
            <nav className="cd-subnav" aria-label="Course sections">
              <ul ref={subnavRef}>
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      data-section={s.id}
                      className={active === s.id ? "is-active" : undefined}
                      aria-current={active === s.id ? "location" : undefined}
                      onClick={(e) => goToSection(e, s.id)}
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Overview */}
            <section className="cd-section" id="overview" aria-labelledby="overview-title">
              <h2 id="overview-title" tabIndex={-1}>
                About this course
              </h2>
              <p className="cd-lead">
                The course has {modules.length} modules over {course.duration}.
                Classes are live online, Monday to Friday, and you have a
                dedicated industry mentor from your first week.
              </p>
              <div className="cd-fit-grid">
                <div className="cd-fit">
                  <span className="icon-tile" aria-hidden="true">
                    <FontAwesomeIcon icon={faUserGroup} />
                  </span>
                  <h3>Who it's for</h3>
                  <p>{audienceFor(course)}</p>
                </div>
                <div className="cd-fit">
                  <span className="icon-tile" aria-hidden="true">
                    <FontAwesomeIcon icon={faBriefcase} />
                  </span>
                  <h3>Where it can lead</h3>
                  <p>
                    The course prepares you for work as a {course.role}. You
                    finish with a final project you can show employers.
                  </p>
                </div>
              </div>

              <h3 className="cd-subhead">How you'll learn</h3>
              <ul className="cd-how">
                {HOW_YOU_LEARN.map((item) => (
                  <li key={item.title}>
                    <FontAwesomeIcon icon={item.icon} className="cd-how-icon" aria-hidden="true" />
                    <span>
                      <strong>{item.title}</strong>
                      <span>{item.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Curriculum */}
            <section className="cd-section" id="curriculum" aria-labelledby="curriculum-title">
              <div className="cd-section-head">
                <div>
                  <h2 id="curriculum-title" tabIndex={-1}>
                    Curriculum
                  </h2>
                  <p className="cd-section-sub">
                    {modules.length} modules, taught live over {course.duration}.
                  </p>
                </div>
                <button type="button" className="btn btn-link cd-expand" onClick={toggleAll}>
                  {allOpen ? "Collapse all" : "Expand all"}
                </button>
              </div>

              <ol className="cd-modules">
                {modules.map((mod, i) => {
                  const open = openModules.has(i);
                  const isLast = i === modules.length - 1;
                  return (
                    <li key={course.highlights[i]} className={`cd-module${open ? " is-open" : ""}`}>
                      <h3 className="cd-module-head">
                        <button
                          type="button"
                          id={`module-${i}-btn`}
                          aria-expanded={open}
                          aria-controls={`module-${i}-panel`}
                          onClick={() => toggleModule(i)}
                        >
                          <span className="cd-module-title">
                            Module {i + 1}: {mod.title}
                          </span>
                          <span className="cd-module-sign" aria-hidden="true" />
                        </button>
                      </h3>
                      <div
                        id={`module-${i}-panel`}
                        role="region"
                        aria-labelledby={`module-${i}-btn`}
                        className="cd-module-panel"
                        hidden={!open}
                      >
                        {mod.topics.length > 0 && (
                          <ul className="chip-list cd-module-topics" aria-label="Topics">
                            {mod.topics.map((t) => (
                              <li key={t} className="chip">
                                {t}
                              </li>
                            ))}
                          </ul>
                        )}
                        <p>
                          {isLast
                            ? `This module brings everything together in your final project: ${course.project}`
                            : "Taught in live classes, practised in hands-on exercises and reviewed by your mentor."}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>

            {/* Tools */}
            <section className="cd-section" id="tools" aria-labelledby="tools-title">
              <h2 id="tools-title" tabIndex={-1}>
                Tools you'll use
              </h2>
              <p className="cd-section-sub">
                You'll work with these in class and on your projects.
              </p>
              <ul className="chip-list cd-tools">
                {course.tools.map((tool) => (
                  <li key={tool} className="chip">
                    {tool}
                  </li>
                ))}
              </ul>
            </section>

            {/* Final project */}
            <section className="cd-section" id="capstone" aria-labelledby="capstone-title">
              <div className="cd-capstone">
                <h2 id="capstone-title" tabIndex={-1}>
                  Your final project
                </h2>
                <p className="cd-capstone-project">{course.project}</p>
                <ol className="cd-capstone-steps">
                  <li>
                    <span className="step-num" aria-hidden="true">1</span>
                    <span>
                      <strong>Plan it</strong>
                      Agree the brief and scope with your mentor.
                    </span>
                  </li>
                  <li>
                    <span className="step-num" aria-hidden="true">2</span>
                    <span>
                      <strong>Build it</strong>
                      Use what you learn in each module, with reviews along the way.
                    </span>
                  </li>
                  <li>
                    <span className="step-num" aria-hidden="true">3</span>
                    <span>
                      <strong>Present it</strong>
                      Finish with a working project you can show employers.
                    </span>
                  </li>
                </ol>
              </div>
            </section>

            {/* FAQ */}
            <section className="cd-section" id="faq" aria-labelledby="faq-title">
              <h2 id="faq-title" tabIndex={-1}>
                Frequently asked questions
              </h2>
              <div className="faq-list">
                {faqs.map((item) => (
                  <details key={item.q} className="faq-item">
                    <summary>{item.q}</summary>
                    <p>{item.a}</p>
                  </details>
                ))}
              </div>
              <p className="cd-faq-more">
                Have another question?{" "}
                <button type="button" className="btn btn-link cd-inline-link" onClick={() => setAskOpen(true)}>
                  Ask an advisor
                </button>
              </p>
            </section>
          </div>
        </div>

        {/* ---------------- Related ---------------- */}
        <section className="cd-related" aria-labelledby="related-title">
          <div className="container">
            <div className="cd-related-head">
              <h2 id="related-title">You might also like</h2>
              <Link to={ROUTES.courses} className="btn btn-link cd-related-all">
                See all courses <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" />
              </Link>
            </div>
            <ul className="cd-related-grid">
              {related.map((c) => (
                <li key={c.id} data-reveal>
                  <article className="cd-rel">
                    <div className="cd-rel-media">
                      <img
                        src={c.image}
                        alt=""
                        width="1200"
                        height="750"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <div className="cd-rel-body">
                      <p className="cd-rel-meta">
                        {trackLabel(c.track)} · {sentenceCase(c.level)}
                      </p>
                      <h3>
                        <Link to={ROUTES.course(c.id)} className="cd-rel-link">
                          {c.title}
                        </Link>
                      </h3>
                      <p className="cd-rel-summary">{c.summary}</p>
                      <p className="cd-rel-facts">
                        {c.duration} · {c.mode} · {COURSE_FEE}
                      </p>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      {/* ---------------- Mobile apply bar ---------------- */}
      <div
        className={`cd-mbar${showBar && !enrollOpen && !askOpen ? " is-shown" : ""}`}
        inert={showBar ? undefined : ""}
      >
        <div className="cd-mbar-fee">
          <span>Course fee</span>
          <strong>{COURSE_FEE}</strong>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setEnrollOpen(true)}>
          Apply now
        </button>
      </div>
      <div className="cd-mbar-spacer" aria-hidden="true" />

      <Modal isOpen={askOpen} onClose={() => setAskOpen(false)} />
      {enrollOpen && (
        <EnrollModal course={course} isOpen={enrollOpen} onClose={() => setEnrollOpen(false)} />
      )}
      <Footer />
    </>
  );
}

function CourseNotFound() {
  const titleRef = useRef(null);

  useEffect(() => {
    setMeta(`Course not found | ${COMPANY.name}`, "That course could not be found. Browse every live AI course.");
    titleRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <>
      <Header />
      <main className="cd cd-missing" id="main" tabIndex={-1}>
        <div className="container cd-missing-inner">
          <h1 ref={titleRef} tabIndex={-1}>
            We couldn't find that course
          </h1>
          <p>
            The link may be out of date, or the course may have been renamed.
            Here are all the courses we currently run:
          </p>
          <ul className="cd-missing-list">
            {COURSES.map((c) => (
              <li key={c.id}>
                <Link to={ROUTES.course(c.id)}>
                  <span className="cd-missing-title">{c.title}</span>
                  <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          <Link to={ROUTES.courses} className="btn btn-primary">
            <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
            Browse all courses
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
