import React, { useEffect, useRef, useState } from "react";
import "./header.css";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/ai-courses", label: "AI Courses" },
  { to: "/about-us", label: "About Us" },
  { to: "/contact-us", label: "Contact Us" },
];

const Header = () => {
  const [isNavVisible, setNavVisibility] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const progressRef = useRef(null);
  const wrapperRef = useRef(null);

  // Publish the header's live height (it changes with the announcement bar
  // and when it slims on scroll) so sticky elements and anchor jumps can sit
  // exactly beneath it.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const set = () =>
      document.documentElement.style.setProperty("--header-h", `${el.offsetHeight}px`);
    set();
    const observer = new ResizeObserver(set);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const location = useLocation();

  const closeNav = () => setNavVisibility(false);

  useEffect(() => {
    if (!sessionStorage.getItem("announcementSeen")) {
      setShowAnnouncement(true);
    }
  }, []);

  const dismissAnnouncement = () => {
    setShowAnnouncement(false);
    sessionStorage.setItem("announcementSeen", "true");
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      // Written straight to the element rather than through state, so the
      // progress bar does not re-render the header on every scroll event.
      const bar = progressRef.current;
      if (bar) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    closeNav();
  }, [location.pathname]);

  // Escape closes the mobile menu, as it would any other disclosure.
  useEffect(() => {
    if (!isNavVisible) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") closeNav();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isNavVisible]);

  return (
    <div
      ref={wrapperRef}
      className={`header-wrapper${scrolled ? " header-scrolled" : ""}${
        isNavVisible ? " header-open" : ""
      }`}
    >
      {/* First thing a keyboard or screen-reader user reaches: a way past
          the announcement bar and nav straight to the page content. */}
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      {showAnnouncement && (
        <div className="announcement-bar">
          <p className="announcement-text">
            <span className="announcement-tag">Corporate Update</span>
            URL Point LLP is now officially established.{" "}
            <Link to="/about-us" className="announcement-link" onClick={dismissAnnouncement}>
              Read more
            </Link>
          </p>
          <button
            type="button"
            className="announcement-close"
            onClick={dismissAnnouncement}
            aria-label="Close announcement"
          >
            &times;
          </button>
        </div>
      )}

      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="header-logo" onClick={closeNav}>
            <img src="/images/URL_header_logo.webp" alt="URL home" />
          </Link>

          <nav
            id="site-nav"
            className={`header-nav${isNavVisible ? " is-open" : ""}`}
            aria-label="Main"
          >
            <ul className="header-links">
              {NAV_LINKS.map((link) => {
                const active = location.pathname === link.to;
                return (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className={active ? "is-active" : undefined}
                      aria-current={active ? "page" : undefined}
                      onClick={closeNav}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Link
              to="/ai-courses#courses"
              className="btn btn-primary btn-sm header-cta"
              onClick={closeNav}
            >
              Enrol Now
            </Link>
          </nav>

          <button
            type="button"
            className={`nav-toggle${isNavVisible ? " is-open" : ""}`}
            onClick={() => setNavVisibility((prev) => !prev)}
            aria-label={isNavVisible ? "Close menu" : "Open menu"}
            aria-expanded={isNavVisible}
            aria-controls="site-nav"
          >
            <span className="bar" />
            <span className="bar" />
            <span className="bar" />
          </button>
        </div>
        <div className="header-progress" ref={progressRef} aria-hidden="true" />
      </header>
    </div>
  );
};

export default Header;
