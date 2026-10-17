import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBriefcase,
  faCalendarDays,
  faComments,
  faHandshake,
  faLaptopCode,
  faUserTie,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import Footer from "../Footer/footer";
import Header from "../Header/header";
import SectionHead from "../../components/ui/SectionHead";
import CtaBand from "../../components/ui/CtaBand";
import CourseFinder from "../../components/CourseFinder/CourseFinder";
import { COURSES } from "../../constants/courses";
import { ROUTES } from "../../constants/routes";
import FeaturedCourses from "./FeaturedCourses";
import "./home.css";

const FINDER_LINK = { pathname: ROUTES.home, hash: "#finder" };

// Only facts the business already states (see src/constants/company.js and
// courses.js): live online Mon to Fri, 6 months, a dedicated industry
// mentor, projects and a capstone, career advice, interview and job support.
const HERO_FACTS = [
  { icon: faCalendarDays, text: "6-month courses" },
  { icon: faVideo, text: "Live classes Monday to Friday" },
  { icon: faBriefcase, text: "100% placement support" },
];

const INCLUDED = [
  {
    icon: faUserTie,
    title: "A dedicated mentor",
    text: "An industry mentor follows your progress and reviews your work for the whole course.",
  },
  {
    icon: faLaptopCode,
    title: "Hands-on projects and a capstone",
    text: "You build projects as you learn and finish with a capstone you can show employers.",
  },
  {
    icon: faComments,
    title: "Career advice",
    text: "Advice on the roles that suit your skills and how to present the work you've done.",
  },
  {
    icon: faHandshake,
    title: "Interview and job support",
    text: "Help preparing for interviews and with your job search, with 100% placement support.",
  },
];

const STEPS = [
  {
    title: "Book a free call",
    text: "Tell an advisor about your background and goals, and ask anything about courses, fees and batches.",
  },
  {
    title: "Choose your course and batch",
    text: "Pick the course that suits you and the batch you'd like to join, then apply online.",
  },
  {
    title: "Learn live with your mentor",
    text: "Join live classes Monday to Friday for six months, work on projects and finish with a capstone.",
  },
  {
    title: "Get career and job support",
    text: "Get career advice and support with interviews and your job search.",
  },
];

// An example week. It describes only what every course includes: a live
// class each weekday, hands-on project work and reviews with a mentor.
const WEEK = [
  {
    day: "Monday",
    title: "Live class",
    text: "A new topic is introduced, with time for questions.",
  },
  {
    day: "Tuesday",
    title: "Live class and exercises",
    text: "You practise the new topic with hands-on exercises.",
  },
  {
    day: "Wednesday",
    title: "Live class and project work",
    text: "You apply the week's topic to your course project.",
  },
  {
    day: "Thursday",
    title: "Live class and mentor review",
    text: "Your mentor looks at your work and gives you feedback.",
  },
  {
    day: "Friday",
    title: "Live class and recap",
    text: "A recap of the week and open questions before the weekend.",
  },
];

const FAQS = [
  {
    q: "How are classes taught?",
    a: "Classes are live and online, Monday to Friday. You learn with an instructor in real time from wherever you are, and work on projects between sessions.",
  },
  {
    q: "How long is each course?",
    a: "Every course runs for six months and ends with a capstone project you can show to employers.",
  },
  {
    q: "Do I need coding experience?",
    a: "Not for every course. Python for AI: Foundations starts from zero, and Prompt Engineering & AI Productivity needs no coding at all. The course finder above can help you choose the right level.",
  },
  {
    q: "How much does a course cost?",
    a: "The fee is the same for every course and depends on the US state you live in. Pick your state on the Courses page to see it, or ask an advisor on a free call.",
  },
  {
    q: "What career support is included?",
    a: "Every course includes career advice and interview and job support, and we offer 100% placement support. You also have a dedicated industry mentor for the whole course.",
  },
];

const Home = () => (
  <>
    <Header />

    {/* ---------------- Hero ---------------- */}
    <section className="home-hero" id="main" tabIndex={-1} aria-labelledby="home-hero-title">
      <div className="container home-hero-grid">
        <div className="home-hero-copy">
          <h1 id="home-hero-title">Live online AI courses, taught by industry mentors</h1>
          <p className="home-hero-lead">
            Choose from {COURSES.length} six-month courses in machine learning, generative AI,
            data science and MLOps. You join live classes Monday to Friday, build projects with
            a dedicated mentor, and get career and job support along the way.
          </p>
          <div className="home-hero-actions">
            <Link to={FINDER_LINK} className="btn btn-primary btn-lg">
              Find the right course
            </Link>
            <Link to={ROUTES.courses} className="btn btn-secondary btn-lg">
              Browse all courses
            </Link>
          </div>
          <ul className="home-hero-facts">
            {HERO_FACTS.map((fact) => (
              <li key={fact.text}>
                <FontAwesomeIcon icon={fact.icon} className="home-hero-fact-icon" />
                {fact.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="home-hero-media">
          <img
            src="/images/courses/home-hero.webp"
            alt="Three people talking around a table with their laptops in a shared workspace."
            width="1600"
            height="900"
            fetchpriority="high"
            decoding="async"
          />
        </div>
      </div>
    </section>

    {/* ---------------- What's included ---------------- */}
    <section className="home-included" aria-labelledby="included-title">
      <div className="container">
        <h2 id="included-title" className="home-included-title">
          Included in every course
        </h2>
        <ul className="home-included-list">
          {INCLUDED.map((item) => (
            <li key={item.title}>
              <span className="icon-tile" aria-hidden="true">
                <FontAwesomeIcon icon={item.icon} />
              </span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>

    {/* ---------------- Courses ---------------- */}
    <section className="section home-courses" aria-labelledby="courses-title">
      <div className="container">
        <FeaturedCourses titleId="courses-title" />
      </div>
    </section>

    {/* ---------------- Course finder ---------------- */}
    <section
      className="section section-alt home-finder"
      id="finder"
      tabIndex={-1}
      aria-labelledby="finder-title"
    >
      <div className="container home-finder-grid">
        <div className="home-finder-intro">
          <SectionHead title="Not sure where to start?" left id="finder-title">
            Answer three quick questions about your experience and goals, and we'll suggest a
            course to start with, plus two others worth a look.
          </SectionHead>
          <p className="home-finder-note">
            Prefer to talk to someone? <Link to={ROUTES.contact}>Book a free call</Link> with
            one of our advisors.
          </p>
        </div>
        <CourseFinder />
      </div>
    </section>

    {/* ---------------- How it works ---------------- */}
    <section className="section home-how" aria-labelledby="how-title">
      <div className="container">
        <SectionHead title="How it works" left id="how-title">
          From your first call to your first interview, this is what to expect.
        </SectionHead>
        <ol className="steps" data-reveal>
          {STEPS.map((step, i) => (
            <li key={step.title} className="step">
              <span className="step-num" aria-hidden="true">
                {i + 1}
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
        <div className="home-how-actions">
          <Link to={ROUTES.contact} className="btn btn-primary">
            Book a free call
          </Link>
        </div>
      </div>
    </section>

    {/* ---------------- An example week ---------------- */}
    <section className="section section-alt home-week" aria-labelledby="week-title">
      <div className="container">
        <SectionHead title="A typical week" left id="week-title">
          Classes are live online, Monday to Friday. Here's an example week. Your batch's
          exact timetable is shared with you when you join.
        </SectionHead>
        <ul className="week">
          {WEEK.map((item) => (
            <li key={item.day} className="week-day">
              <p className="week-name">{item.day}</p>
              <h3>{item.title}</h3>
              <p className="week-text">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>

    {/* ---------------- FAQ ---------------- */}
    <section className="section home-faq" aria-labelledby="faq-title">
      <div className="container home-faq-grid">
        <SectionHead title="Frequently asked questions" left id="faq-title">
          Can't find your answer here? <Link to={ROUTES.contact}>Contact us</Link> and an
          advisor will get back to you.
        </SectionHead>
        <div className="faq-list" data-reveal>
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
      eyebrow=""
      title="Talk to an advisor"
      text="Book a free call to ask about courses, fees and batches. An advisor will help you choose the course that suits your background and goals."
      primaryLabel="Book a free call"
      showCourses={false}
    />

    <Footer />
  </>
);

export default Home;
