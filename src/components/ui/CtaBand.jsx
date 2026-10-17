import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { ROUTES } from "../../constants/routes";
import "./ui.css";

// The closing call to action shared by every page: a deep-navy (--night)
// panel with a heading and short line on the left, buttons on the right.
const CtaBand = ({
  title = "Talk to an advisor",
  text = "Book a free call and an advisor will help you choose a course that suits your background and goals.",
  alt = false,
  onPrimary,
  primaryLabel = "Book a free call",
  // Off on the courses pages, where the courses are already on screen.
  showCourses = true,
  // Optional small label above the heading.
  eyebrow = "",
}) => (
  <section className={`cta-band${alt ? " cta-band-alt" : ""}`}>
    <div className="container">
      <div className="cta-band-inner" data-reveal>
        <div>
          {eyebrow && <span className="eyebrow cta-band-eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div className="cta-band-actions">
          {onPrimary ? (
            <button type="button" className="btn btn-primary btn-lg" onClick={onPrimary}>
              {primaryLabel}
              <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" />
            </button>
          ) : (
            <Link to={ROUTES.contact} className="btn btn-primary btn-lg">
              {primaryLabel}
              <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" />
            </Link>
          )}
          {showCourses && (
            <Link to={ROUTES.courses} className="btn btn-secondary btn-lg">
              Browse courses
            </Link>
          )}
        </div>
      </div>
    </div>
  </section>
);

export default CtaBand;
