import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faChalkboardUser,
  faUserTie,
  faLaptopCode,
  faCalendarDays,
  faCompass,
  faBriefcase,
  faUserGraduate,
  faCode,
  faRotate,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import Header from "../Header/header";
import Footer from "../Footer/footer";
import PageHero from "../../components/ui/PageHero";
import SectionHead from "../../components/ui/SectionHead";
import CtaBand from "../../components/ui/CtaBand";
import Modal from "../Modal/modal";
import EnrollModal from "./EnrollModal";
import { COURSES, COURSE_FEE } from "../../constants/courses";
import "./learning.css";

// What comes with every course, whichever one a learner picks.
const INCLUDED = [
  {
    icon: faChalkboardUser,
    title: "Live online classes",
    text: "Interactive sessions with your instructor — ask questions, get answers and learn alongside your batch in real time.",
  },
  {
    icon: faUserTie,
    title: "A dedicated mentor",
    text: "An industry mentor who reviews your work, unblocks you when you are stuck and keeps you on track for the full 6 months.",
  },
  {
    icon: faLaptopCode,
    title: "Hands-on projects",
    text: "Practical projects in every module and a capstone you can show employers, so you finish with a portfolio, not just notes.",
  },
  {
    icon: faCalendarDays,
    title: "Weekday classes",
    text: "Classes run Monday to Friday, with a schedule planned around work and study commitments.",
  },
  {
    icon: faCompass,
    title: "Career counselling",
    text: "One-to-one guidance on which roles to target, how to position yourself and how to present your new AI skills.",
  },
  {
    icon: faBriefcase,
    title: "Interview & job support",
    text: "Resume and portfolio reviews, mock interviews and job support as you apply — 100% placement support with every course.",
  },
];

const AUDIENCE = [
  {
    icon: faUserGraduate,
    title: "Students & fresh graduates",
    text: "Start your career with AI skills that set you apart from other entry-level candidates.",
  },
  {
    icon: faCode,
    title: "Working IT professionals",
    text: "Move from development, testing or support into machine learning, data and AI engineering roles.",
  },
  {
    icon: faRotate,
    title: "Career switchers",
    text: "Coming from a non-technical background? Python for AI and Data Science courses start from the basics.",
  },
  {
    icon: faChartLine,
    title: "Data & analytics teams",
    text: "Add machine learning, generative AI and MLOps to the analysis skills you already use every day.",
  },
];

const FAQS = [
  {
    q: "Do I need coding experience?",
    a: "Not for every course. Python for AI and Data Science & AI Analytics start from the basics. Generative AI & LLM Engineering and MLOps & Cloud AI expect some programming experience. A counsellor can help you choose.",
  },
  {
    q: "How is my exact course fee confirmed?",
    a: "Fees vary by course within the range shown. A counsellor confirms the exact fee for your course and batch before you pay.",
  },
  {
    q: "How do I pay?",
    a: "After you submit the enrolment form, you complete payment through a secure Stripe payment link. URL never sees or stores your card details.",
  },
  {
    q: "What happens after I enrol?",
    a: "A counsellor contacts you within one business day to confirm your batch, introduce your mentor and share your start date.",
  },
];

const Learning = () => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [enrollCourse, setEnrollCourse] = useState(null);
  const [activeCourse, setActiveCourse] = useState(COURSES[0].id);
  const { hash } = useLocation();

  // Highlight the quick link for whichever course is in the middle of the
  // screen, so the pinned bar doubles as a "you are here" marker.
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveCourse(entry.target.id.replace("course-", ""));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    COURSES.forEach((course) => {
      const el = document.getElementById(`course-${course.id}`);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Links such as /ai-courses#courses or #course-gen-ai (from the home page,
  // header and footer) land on that section rather than the top of the page.
  useEffect(() => {
    if (!hash) return;
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target) target.scrollIntoView();
  }, [hash]);

  return (
    <>
      <Header />

      <PageHero
        eyebrow="AI Courses"
        title="AI courses that prepare you for employment"
        actions={
          <>
            <a href="#courses" className="btn btn-primary btn-lg">
              Browse Courses
              <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" />
            </a>
            <button
              type="button"
              className="btn btn-outline-light btn-lg"
              onClick={() => setModalOpen(true)}
            >
              Speak with a Counsellor
            </button>
          </>
        }
      >
        From Python fundamentals to machine learning, generative AI and MLOps —
        each course combines live teaching, a dedicated mentor and career
        support.
      </PageHero>

      {/* ---------------- Courses ---------------- */}
      <section className="section" id="courses">
        <div className="container">
          <SectionHead eyebrow="Our courses" title="Choose your AI course">
            All courses run for six months and are taught live online.
          </SectionHead>

          <nav className="course-jump" aria-label="Jump to a course">
            {COURSES.map((course) => (
              <a
                key={course.id}
                href={`#course-${course.id}`}
                className={activeCourse === course.id ? "is-active" : undefined}
                aria-current={activeCourse === course.id ? "location" : undefined}
              >
                {course.title}
              </a>
            ))}
          </nav>

          <div className="course-list">
            {COURSES.map((course) => (
              <article
                key={course.id}
                id={`course-${course.id}`}
                className="course-row"
                data-reveal
              >
                {/* A real button, not a clickable div: the image is the first
                    thing people aim at, and a div gets no keyboard focus. */}
                <button
                  type="button"
                  className="course-row-media"
                  onClick={() => setEnrollCourse(course)}
                  aria-label={`Enrol in ${course.title}`}
                >
                  <img src={course.image} alt="" loading="lazy" decoding="async" />
                  <span className="course-row-tag">{course.tagline}</span>
                </button>

                <div className="course-row-body">
                  <span className="course-row-level">{course.level}</span>
                  <h3>{course.title}</h3>
                  <p className="course-row-summary">{course.summary}</p>

                  <h4 className="course-row-subhead">What you'll learn</h4>
                  <ul className="check-list course-row-list">
                    {course.highlights.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>

                  <div className="course-row-footer">
                    <div className="course-row-fee">
                      <span>Course fee</span>
                      <strong>{COURSE_FEE}</strong>
                    </div>
                    <div className="course-row-actions">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setModalOpen(true)}
                      >
                        Ask a Question
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setEnrollCourse(course)}
                      >
                        Enrol Now
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Included ---------------- */}
      <section className="section section-alt">
        <div className="container">
          <SectionHead eyebrow="Included" title="What every course includes">
            Whichever course you choose, you get the same complete package of
            teaching, mentoring and career support.
          </SectionHead>
          <div className="grid grid-3">
            {INCLUDED.map((item) => (
              <div key={item.title} className="card card-hover" data-reveal>
                <span className="icon-tile">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Audience ---------------- */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="Who it's for" title="Built for every starting point">
            Whether you are just starting out or already working in tech, there
            is a course that meets you where you are.
          </SectionHead>
          <div className="grid grid-4">
            {AUDIENCE.map((item) => (
              <div key={item.title} className="card card-hover" data-reveal>
                <span className="icon-tile icon-tile-teal">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section className="section">
        <div className="container learn-faq">
          <div className="learn-faq-intro">
            <SectionHead eyebrow="FAQ" title="Frequently asked questions" left>
              Have another question? Our counsellors will be glad to help.
            </SectionHead>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setModalOpen(true)}
            >
              Ask a Counsellor
            </button>
          </div>
          <div className="faq-list">
            {FAQS.map((item) => (
              <details key={item.q} className="faq-item">
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Not sure which course is right for you?"
        text="A URL counsellor will review your background and recommend the most suitable course."
        onPrimary={() => setModalOpen(true)}
        primaryLabel="Speak with a Counsellor"
        showCourses={false}
      />

      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
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

export default Learning;
