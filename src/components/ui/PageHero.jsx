import React from "react";

// The dark banner at the top of every inner page. It carries id="main" so
// the skip link in the header lands on it.
const PageHero = ({ eyebrow, title, children, actions, chips, center = false }) => (
  <section
    className={`page-hero${center ? " page-hero-center" : ""}`}
    id="main"
    tabIndex={-1}
  >
    <div className="container">
      <div className="page-hero-inner">
        {eyebrow && <span className="eyebrow eyebrow-dark">{eyebrow}</span>}
        <h1>{title}</h1>
        {children && <p>{children}</p>}
        {chips && chips.length > 0 && (
          <ul className="chip-list">
            {chips.map((chip) => (
              <li key={chip} className="chip chip-dark">
                {chip}
              </li>
            ))}
          </ul>
        )}
        {actions && <div className="page-hero-actions">{actions}</div>}
      </div>
    </div>
  </section>
);

export default PageHero;
