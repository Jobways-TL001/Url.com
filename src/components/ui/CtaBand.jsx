import React from "react";
import { Link } from "react-router-dom";

// The closing call to action shared by every page.
const CtaBand = ({
  title = "Start your AI career with URL",
  text = "Our counsellors will review your background and recommend the right course for your goals.",
  alt = false,
  onPrimary,
  primaryLabel = "Speak with a Counsellor",
  // Off on the AI Courses page, where the courses are already on screen.
  showCourses = true,
}) => (
  <section className={`cta-band${alt ? " cta-band-alt" : ""}`}>
    <div className="container">
      <div className="cta-band-inner" data-reveal>
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div className="cta-band-actions">
          {onPrimary ? (
            <button type="button" className="btn btn-light btn-lg" onClick={onPrimary}>
              {primaryLabel}
            </button>
          ) : (
            <Link to="/contact-us" className="btn btn-light btn-lg">
              {primaryLabel}
            </Link>
          )}
          {showCourses && (
            <Link to="/ai-courses#courses" className="btn btn-outline-light btn-lg">
              View Courses
            </Link>
          )}
        </div>
      </div>
    </div>
  </section>
);

export default CtaBand;
