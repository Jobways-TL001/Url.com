import React from "react";
import "./ui.css";

// Heading + intro line used to open most sections (optional kicker above).
//   left    left-align instead of centring
//   aside   optional content (e.g. a link or filter) placed opposite the
//           heading on wide screens; implies a left-aligned row layout
//   id      optional id for the h2 (for aria-labelledby on the section)
const SectionHead = ({ eyebrow, title, children, left = false, dark = false, aside, id }) => {
  const classes = ["section-head"];
  if (left || aside) classes.push("section-head-left");
  if (aside) classes.push("section-head-row");

  const body = (
    <>
      {eyebrow && <span className={`eyebrow${dark ? " eyebrow-dark" : ""}`}>{eyebrow}</span>}
      <h2 id={id}>{title}</h2>
      {children && <p>{children}</p>}
    </>
  );

  return (
    <div className={classes.join(" ")} data-reveal>
      {aside ? (
        <>
          <div>{body}</div>
          <div className="section-head-aside">{aside}</div>
        </>
      ) : (
        body
      )}
    </div>
  );
};

export default SectionHead;
