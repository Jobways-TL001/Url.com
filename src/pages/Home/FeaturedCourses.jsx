import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faClock, faSignal, faVideo } from "@fortawesome/free-solid-svg-icons";
import SectionHead from "../../components/ui/SectionHead";
import { COURSES, TRACKS } from "../../constants/courses";
import { ROUTES } from "../../constants/routes";

const trackLabel = (value) => (TRACKS.find((t) => t.value === value) || {}).label || "";

// Only offer filters for tracks that have courses.
const FILTERS = TRACKS.filter(
  (t) => t.value === "all" || COURSES.some((c) => c.track === t.value)
);

// The course catalogue as a card grid, with a row of filter pills by track.
// Each card is one link (the title), stretched over the whole card.
const FeaturedCourses = ({ titleId }) => {
  const [track, setTrack] = useState("all");
  const shown = track === "all" ? COURSES : COURSES.filter((c) => c.track === track);

  return (
    <>
      <SectionHead
        eyebrow="Courses"
        title={`Choose from ${COURSES.length} AI courses`}
        id={titleId}
        aside={
          <Link to={ROUTES.courses} className="btn btn-secondary">
            Compare all courses
          </Link>
        }
      >
        Every course runs for six months, with live classes Monday to Friday. Each course page
        lists the full curriculum, tools and capstone project.
      </SectionHead>

      <div className="course-filters" role="group" aria-label="Filter courses by track">
        {FILTERS.map((t) => (
          <button
            key={t.value}
            type="button"
            className={`course-filter${track === t.value ? " is-active" : ""}`}
            aria-pressed={track === t.value}
            onClick={() => setTrack(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="visually-hidden" aria-live="polite">
        Showing {shown.length} {shown.length === 1 ? "course" : "courses"}
      </p>

      <ul className="course-grid">
        {shown.map((course) => (
          <li key={course.id} className="course-card">
            <div className="course-card-media">
              <img
                src={course.image}
                alt=""
                width="1200"
                height="750"
                loading="lazy"
                decoding="async"
              />
              <span className="course-card-badges">
                <span className="course-card-track">{trackLabel(course.track)}</span>
                {course.tagline && <span className="course-card-tag">{course.tagline}</span>}
              </span>
            </div>
            <div className="course-card-body">
              <h3>
                <Link to={ROUTES.course(course.id)} className="course-card-link">
                  {course.title}
                </Link>
              </h3>
              <p className="course-card-summary">{course.summary}</p>
              <ul className="course-card-meta">
                <li>
                  <FontAwesomeIcon icon={faClock} aria-hidden="true" />
                  {course.duration}
                </li>
                <li>
                  <FontAwesomeIcon icon={faSignal} aria-hidden="true" />
                  {course.level}
                </li>
              </ul>
              <div className="course-card-foot">
                <span className="course-card-mode">
                  <FontAwesomeIcon icon={faVideo} aria-hidden="true" />
                  {course.mode}
                </span>
                <span className="course-card-cta" aria-hidden="true">
                  View course
                  <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" />
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default FeaturedCourses;
