import React from "react";

// Eyebrow + heading + intro line used to open most sections.
const SectionHead = ({ eyebrow, title, children, left = false, dark = false }) => (
  <div className={`section-head${left ? " section-head-left" : ""}`} data-reveal>
    {eyebrow && (
      <span className={`eyebrow${dark ? " eyebrow-dark" : ""}`}>{eyebrow}</span>
    )}
    <h2>{title}</h2>
    {children && <p>{children}</p>}
  </div>
);

export default SectionHead;
