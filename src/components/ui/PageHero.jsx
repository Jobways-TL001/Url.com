import React from "react";
import "./ui.css";

// The heading block at the top of every inner page: an optional kicker,
// the page title and an intro line on a cool mist band with a soft brand glow. It carries
// id="main" so the skip link in the header lands on it.
//
// Props (all optional except title):
//   eyebrow   optional short kicker above the heading (use sparingly)
//   title     the page's h1
//   children  intro line (wrapped in a <p>)
//   chips     list of short strings shown as chips
//   actions   buttons / links shown under the intro
//   extra     any further content rendered below the actions
//   center    centre-align the content
const PageHero = ({ eyebrow, title, children, actions, chips, extra, center = false }) => (
  <section
    className={`page-hero${center ? " page-hero-center" : ""}`}
    id="main"
    tabIndex={-1}
  >
    <div className="container">
      <div className="page-hero-inner">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {children && <p>{children}</p>}
        {chips && chips.length > 0 && (
          <ul className="chip-list">
            {chips.map((chip) => (
              <li key={chip} className="chip">
                {chip}
              </li>
            ))}
          </ul>
        )}
        {actions && <div className="page-hero-actions">{actions}</div>}
        {extra && <div className="page-hero-extra">{extra}</div>}
      </div>
    </div>
  </section>
);

export default PageHero;
