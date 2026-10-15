import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import Footer from "../Footer/footer";
import Header from "../Header/header";
import SectionHead from "../../components/ui/SectionHead";
import CtaBand from "../../components/ui/CtaBand";
import CountUp from "../../components/ui/CountUp";
import { COURSES } from "../../constants/courses";
import "./home.css";

// Each fact on this page appears once: the company figures live only in
// the stats row, course details only on the AI Courses page, and what each
// course includes only there too.
const STATS = [
  { value: "2017", label: "Founded" },
  { value: "50+", label: "Countries served" },
  { value: String(COURSES.length), label: "AI courses" },
  { value: "100%", label: "Placement support" },
];

// Drawn from the course curricula on the AI Courses page.
const TOPICS = [
  "Python for AI",
  "Machine Learning",
  "Deep Learning",
  "Natural Language Processing",
  "Generative AI",
  "Large Language Models",
  "Retrieval-Augmented Generation",
  "AI Agents",
  "Data Science",
  "MLOps",
  "Cloud AI",
  "AI for Cybersecurity",
];

const STEPS = [
  {
    title: "Speak with a counsellor",
    text: "Share your background and goals, and we will recommend the course that fits.",
  },
  {
    title: "Enrol online",
    text: "Complete your enrolment online and join the next Monday – Friday batch.",
  },
  {
    title: "Learn with a mentor",
    text: "Attend live classes, build hands-on projects and receive regular feedback.",
  },
  {
    title: "Move into your new role",
    text: "Prepare with mock interviews and receive job support as you apply.",
  },
];

const Home = () => (
  <>
    <Header />

    {/* ---------------- Hero ---------------- */}
    <section className="home-hero hero-grid" id="main" tabIndex={-1}>
      <div className="container home-hero-grid">
        <div className="home-hero-copy">
          <h1>
            Build a career in <span className="home-hero-accent">Artificial Intelligence</span>
          </h1>
          <p>
            Live online AI courses taught by industry mentors, with the career
            guidance you need to move from learning to employment.
          </p>
          <div className="home-hero-actions">
            <Link to="/ai-courses#courses" className="btn btn-primary btn-lg">
              Explore AI Courses
              <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" />
            </Link>
            <Link to="/contact-us" className="btn btn-outline-light btn-lg">
              Speak with a Counsellor
            </Link>
          </div>
        </div>

        <div className="home-hero-image">
          <img
            src="/images/courses/home-hero.webp"
            alt="A developer's workstation with code on screen"
            fetchpriority="high"
          />
        </div>
      </div>
    </section>

    {/* ---------------- Stats ---------------- */}
    <section className="home-stats" aria-label="URL at a glance">
      <div className="container">
        <ul className="home-stats-card">
          {STATS.map((stat) => (
            <li key={stat.label}>
              <CountUp value={stat.value} />
              <span>{stat.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>

    {/* ---------------- Topics ticker ---------------- */}
    {/* The list is rendered twice so the loop is seamless; the copy is
        hidden from screen readers so the topics are announced once. */}
    <div className="ticker home-ticker" aria-label="Topics covered">
      <ul className="ticker-track">
        {[...TOPICS, ...TOPICS].map((topic, i) => (
          <li key={`${topic}-${i}`} aria-hidden={i >= TOPICS.length || undefined}>
            {topic}
          </li>
        ))}
      </ul>
    </div>

    {/* ---------------- Courses ---------------- */}
    <section className="section">
      <div className="container">
        <SectionHead eyebrow="Our courses" title="Courses designed for the AI job market">
          Every course runs for six months and is taught live online. Select a
          course to see the full curriculum and fees.
        </SectionHead>

        <div className="grid grid-3">
          {COURSES.map((course) => (
            <Link
              key={course.id}
              to={`/ai-courses#course-${course.id}`}
              className="course-card"
              data-reveal
            >
              <div className="course-card-media">
                <img src={course.image} alt="" loading="lazy" decoding="async" />
              </div>
              <div className="course-card-body">
                <span className="course-card-level">{course.level}</span>
                <h3>{course.title}</h3>
                <span className="course-card-link">
                  View curriculum
                  <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>

    {/* ---------------- How it works ---------------- */}
    <section className="section section-alt">
      <div className="container">
        <SectionHead eyebrow="How it works" title="From enquiry to employment" />
        <ol className="steps" data-animate>
          {STEPS.map((step, index) => (
            <li key={step.title} className="step" data-reveal>
              <span className="step-num">{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>

    <CtaBand
      title="Start your AI career with URL"
      text="Our counsellors will review your background and recommend the right course for your goals."
      alt
    />

    <Footer />
  </>
);

export default Home;
