import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBriefcase,
  faLaptopCode,
  faUserTie,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import Header from "../Header/header";
import Footer from "../Footer/footer";
import CtaBand from "../../components/ui/CtaBand";
import { COMPANY } from "../../constants/company";
import { COURSES, TRACKS } from "../../constants/courses";
import { ROUTES } from "../../constants/routes";
import "./about.css";

// A plain company profile: who we are, how we teach, what the six months
// look like and the courses on offer. Every claim here is one the business
// already makes (live online Mon–Fri, six months, a dedicated industry
// mentor, projects and a capstone, career advice, interview and job
// support, 100% placement support). No founding year, team size, learner
// counts or outcomes are stated, because none are published.

const TEACHING = [
  {
    icon: faVideo,
    title: "Live classes, Monday to Friday",
    text: "Every course is taught live online, Monday to Friday, for six months. You learn with your batch and can ask questions as they come up.",
  },
  {
    icon: faUserTie,
    title: "A dedicated industry mentor",
    text: "You are matched with a mentor who works in the field. They review your work, help when you get stuck and keep you on track.",
  },
  {
    icon: faLaptopCode,
    title: "Hands-on projects and a capstone",
    text: "You build projects in every module and finish with a capstone project you can show to employers.",
  },
  {
    icon: faBriefcase,
    title: "Career advice and job support",
    text: "We help with your CV, interview preparation and job applications. This is what we mean by 100% placement support.",
  },
];

const SIX_MONTHS = [
  {
    title: "Talk to an advisor",
    text: "Book a free call. An advisor helps you choose the course that suits your background and goals.",
  },
  {
    title: "Join your batch and meet your mentor",
    text: "Live online classes run Monday to Friday, and you are matched with a dedicated industry mentor.",
  },
  {
    title: "Build projects as you learn",
    text: "Each module includes practical work with the tools the course is built around.",
  },
  {
    title: "Finish your capstone project",
    text: "In the last part of the course you complete a capstone project for your portfolio.",
  },
  {
    title: "Apply for jobs with our support",
    text: "You get career advice, interview preparation and job support while you apply.",
  },
];

// The four catalogue tracks (TRACKS[0] is the "all courses" filter), each
// with the courses that sit under it.
const PATHS = TRACKS.filter((t) => t.value !== "all")
  .map((track) => ({
    ...track,
    courses: COURSES.filter((c) => c.track === track.value),
  }))
  .filter((path) => path.courses.length > 0);

const AboutUsPage = () => (
  <>
    <Header />

    {/* ---------------- Intro ---------------- */}
    <section className="page-hero about-hero" id="main" tabIndex={-1}>
      <div className="container about-hero-grid">
        <div className="about-hero-text">
          <h1>About {COMPANY.name}</h1>
          <p>
            {COMPANY.name} runs live online courses in artificial intelligence, machine
            learning and data. Each course lasts six months, with classes Monday to
            Friday, and is open to complete beginners as well as people already working
            in tech.
          </p>
          <p>
            Every learner has a dedicated industry mentor who reviews their work and helps
            them through the course. You build hands-on projects, finish with a capstone,
            and get career advice and job support when you start applying.
          </p>
          <div className="page-hero-actions">
            <Link to={ROUTES.contact} className="btn btn-primary">
              Book a free call
            </Link>
            <Link to={ROUTES.courses} className="btn btn-secondary">
              Browse courses
            </Link>
          </div>
        </div>
        <div className="about-hero-media">
          <img
            src="/images/learn-online.webp"
            alt="A learner taking part in a live online class on a laptop"
            width="1400"
            height="1050"
            decoding="async"
          />
        </div>
      </div>
    </section>

    {/* ---------------- How we teach ---------------- */}
    <section className="section about-teach" aria-labelledby="about-teach-title">
      <div className="container">
        <div className="section-head" data-reveal>
          <h2 id="about-teach-title">How we teach</h2>
          <p>
            All of our courses follow the same format, whichever subject you choose.
          </p>
        </div>

        <ul className="grid grid-4 about-teach-grid">
          {TEACHING.map((item) => (
            <li key={item.title} className="card about-teach-card" data-reveal>
              <span className="icon-tile" aria-hidden="true">
                <FontAwesomeIcon icon={item.icon} />
              </span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>

    {/* ---------------- The six months ---------------- */}
    <section className="section section-alt about-months" aria-labelledby="about-months-title">
      <div className="container about-months-grid">
        <div className="about-months-media" data-reveal>
          <img
            src="/images/about-team.webp"
            alt="A group of learners gathered around one laptop, working through a problem together"
            width="1400"
            height="1050"
            loading="lazy"
            decoding="async"
          />
        </div>

        <div className="about-months-body">
          <div data-reveal>
            <h2 id="about-months-title">What to expect in your 6 months</h2>
            <p className="about-months-intro">
              Here is how a course runs, from your first call with us to your job search.
            </p>
          </div>
          <ol className="about-plan">
            {SIX_MONTHS.map((item, index) => (
              <li key={item.title} data-reveal>
                <span className="step-num" aria-hidden="true">
                  {index + 1}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>

    {/* ---------------- Learning paths ---------------- */}
    <section className="section about-paths" aria-labelledby="about-paths-title">
      <div className="container">
        <div className="section-head" data-reveal>
          <h2 id="about-paths-title">Our learning paths</h2>
          <p>
            We offer {COURSES.length} courses in {PATHS.length} areas. Every course is six
            months long, taught live online, with a mentor and a capstone project.
          </p>
        </div>

        <div className="grid grid-4 about-paths-grid">
          {PATHS.map((path) => (
            <section
              key={path.value}
              className="card about-path"
              aria-labelledby={`about-path-${path.value}`}
              data-reveal
            >
              <h3 id={`about-path-${path.value}`}>{path.label}</h3>
              <p className="about-path-count">
                {path.courses.length} {path.courses.length === 1 ? "course" : "courses"}
              </p>
              <ul className="about-path-courses">
                {path.courses.map((course) => (
                  <li key={course.id}>
                    <Link to={ROUTES.course(course.id)} className="about-course">
                      <span className="about-course-title">{course.title}</span>
                      <span className="about-course-level">{course.level}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to={`${ROUTES.courses}?track=${encodeURIComponent(path.value)}`}
                className="btn btn-link about-path-link"
              >
                View courses
                <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" />
                <span className="visually-hidden"> in {path.label}</span>
              </Link>
            </section>
          ))}
        </div>
      </div>
    </section>

    <CtaBand
      eyebrow=""
      title="Have questions? Talk to an advisor"
      text="Book a free call and an advisor will help you choose the right course. We reply within one business day."
    />

    <Footer />
  </>
);

export default AboutUsPage;
