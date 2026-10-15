import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBullseye,
  faEye,
  faHandshake,
  faBuilding,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import Header from "../Header/header";
import Footer from "../Footer/footer";
import PageHero from "../../components/ui/PageHero";
import SectionHead from "../../components/ui/SectionHead";
import CtaBand from "../../components/ui/CtaBand";
import "./about.css";

// This page tells the company's story. Facts that have a home elsewhere are
// not repeated here: the headline figures are on the home page, course
// details on the AI Courses page, and office addresses on the Contact page.
const PRINCIPLES = [
  {
    icon: faBullseye,
    title: "Mission",
    text: "To make AI skills accessible to everyone who wants them, and to support every learner until they secure the role they are working towards.",
  },
  {
    icon: faEye,
    title: "Vision",
    text: "A workforce prepared for the AI era, where professionals are ready for the role they want next, not only the one they hold today.",
  },
  {
    icon: faHandshake,
    title: "Values",
    text: "Honest guidance over hard selling. We are clear about what a career change requires, and we stay with our learners until they achieve it.",
  },
];

const AboutUsPage = () => (
  <>
    <Header />

    <PageHero eyebrow="About us" title="Building careers in artificial intelligence" center>
      A global IT services company helping students and professionals gain the
      AI skills employers need.
    </PageHero>

    {/* ---------------- Story ---------------- */}
    <section className="section">
      <div className="container about-story">
        <div className="about-story-visual" data-reveal>
          <img src="/images/o-team.avif" alt="The URL team" loading="lazy" decoding="async" />
        </div>
        <div className="about-story-text" data-reveal>
          <span className="eyebrow">Our story</span>
          <h2 className="h2">From IT careers to AI careers</h2>
          <p>
            URL was established in 2017 as a global IT services company and
            has since supported learners and job seekers in more than 50
            countries. From the outset, we recognised that the gap between people
            and jobs was rarely the vacancy itself — it was the skills, the
            preparation and the confidence behind each application.
          </p>
          <p>
            As artificial intelligence reshaped the job market, we focused our
            training on the skills employers now value most. Today we offer live,
            mentor-led AI courses combined with career services, so our learners
            finish ready to be hired.
          </p>
          <Link to="/ai-courses" className="btn btn-secondary about-story-btn">
            View our AI courses
            <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" />
          </Link>
        </div>
      </div>
    </section>

    {/* ---------------- Principles ---------------- */}
    <section className="section section-alt">
      <div className="container">
        <SectionHead eyebrow="What drives us" title="Our mission, vision and values" />
        <div className="grid grid-3">
          {PRINCIPLES.map((item) => (
            <div key={item.title} className="card" data-reveal>
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

    {/* ---------------- Corporate update ---------------- */}
    <section className="section">
      <div className="container">
        <div className="about-update" data-reveal>
          <span className="about-update-icon" aria-hidden="true">
            <FontAwesomeIcon icon={faBuilding} />
          </span>
          <div>
            <span className="eyebrow">Corporate update</span>
            <h2>URL Point LLP</h2>
            <p>
              URL Point LLP is now officially established following the
              merger of Geshur Infra Private Limited and Genesis 7 Solutions —
              bringing two established teams, and their combined experience in
              technology services and talent, under one name.
            </p>
          </div>
        </div>
      </div>
    </section>

    <CtaBand alt />

    <Footer />
  </>
);

export default AboutUsPage;
