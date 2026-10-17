import React, { useCallback, useEffect, useRef, useState } from "react";
import "./header.css";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faBrain,
  faChartLine,
  faChevronDown,
  faCompass,
  faGraduationCap,
  faLayerGroup,
  faPlus,
  faMinus,
  faWandMagicSparkles,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import Logo from "../../components/ui/Logo";
import { COMPANY } from "../../constants/company";
import { COURSES } from "../../constants/courses";
import { ROUTES } from "../../constants/routes";
import { TRACK_GROUPS } from "../../components/ui/trackGroups";

const FINDER_LINK = { pathname: ROUTES.home, hash: "#finder" };

// Decorative icon per track in the mega menu (any new track falls back to
// the cap).
const TRACK_ICONS = {
  foundations: faLayerGroup,
  core: faBrain,
  genai: faWandMagicSparkles,
  data: faChartLine,
};

// "Courses" comes first and opens the mega menu on desktop (an accordion in
// the mobile drawer); the rest are plain links.
const NAV_LINKS = [
  { key: "finder", to: FINDER_LINK, label: "Course finder" },
  { key: "about", to: ROUTES.about, label: "About" },
  { key: "contact", to: ROUTES.contact, label: "Contact" },
];

// Above this width the inline nav is shown and the drawer is never used.
const DESKTOP_QUERY = "(min-width: 961px)";
// Hover intent: the pointer must rest on "Courses" briefly before the mega
// menu opens (so sweeping across the header does not flash it), and may
// leave the menu briefly without it closing (so a diagonal move from the
// button to the panel does not shut it).
const HOVER_OPEN_MS = 120;
const HOVER_CLOSE_MS = 220;
// Pixels from the top of the page after which the header condenses.
const SCROLL_THRESHOLD = 12;

const Header = () => {
  const [isNavVisible, setNavVisibility] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [drawerCoursesOpen, setDrawerCoursesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const wrapperRef = useRef(null);
  const toggleRef = useRef(null);
  const drawerRef = useRef(null);
  const coursesItemRef = useRef(null);
  const coursesBtnRef = useRef(null);
  const openTimer = useRef(0);
  const closeTimer = useRef(0);
  const openedByHover = useRef(false);
  const location = useLocation();
  const { pathname } = location;

  const closeNav = useCallback(() => setNavVisibility(false), []);
  const closeCourses = useCallback(() => setCoursesOpen(false), []);

  // Publish the header's visible height as --header-h, so sticky elements
  // and anchor jumps sit exactly beneath it. The bar keeps one height in the
  // page flow (no layout shift); when condensed, its top `--header-condense`
  // pixels slide above the viewport (see header.css), so that much is taken
  // off.
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return undefined;
    const set = () => {
      const condense = parseFloat(getComputedStyle(el).getPropertyValue("--header-condense")) || 0;
      const visible = el.offsetHeight - (scrolled ? condense : 0);
      document.documentElement.style.setProperty("--header-h", `${visible}px`);
    };
    set();
    if (typeof ResizeObserver === "undefined") return undefined;
    const observer = new ResizeObserver(set);
    observer.observe(el);
    return () => observer.disconnect();
  }, [scrolled]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Any navigation — a new page or a jump to a section — closes both menus.
  useEffect(() => {
    closeNav();
    closeCourses();
  }, [location.pathname, location.hash, location.key, closeNav, closeCourses]);

  useEffect(
    () => () => {
      clearTimeout(openTimer.current);
      clearTimeout(closeTimer.current);
    },
    []
  );

  // Desktop mega menu: Escape closes it (focus back on its button), and a
  // click or focus move anywhere outside it closes it.
  useEffect(() => {
    if (!coursesOpen) return undefined;

    const inside = (node) => coursesItemRef.current?.contains(node);

    const onKey = (e) => {
      if (e.key !== "Escape") return;
      const hadFocus = inside(document.activeElement);
      closeCourses();
      if (hadFocus) coursesBtnRef.current?.focus();
    };
    const onPointer = (e) => {
      if (!inside(e.target)) closeCourses();
    };
    const onFocus = (e) => {
      if (!inside(e.target)) closeCourses();
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("focusin", onFocus);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("focusin", onFocus);
    };
  }, [coursesOpen, closeCourses]);

  // While the mobile drawer is open: lock the page behind it, move focus
  // into it, keep Tab inside it, and let Escape close it (returning focus
  // to the toggle). Widening the window to desktop closes it.
  useEffect(() => {
    if (!isNavVisible) return undefined;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const drawer = drawerRef.current;
    const focusables = () =>
      Array.from(drawer?.querySelectorAll("a[href], button:not([disabled])") || []).filter(
        (el) => el.getClientRects().length > 0
      );

    // Wait a frame: the drawer becomes visible (and focusable) only once the
    // open class has been applied.
    const frame = requestAnimationFrame(() => {
      drawer?.querySelector(".drawer-close")?.focus({ preventScroll: true });
    });

    const onKey = (e) => {
      if (e.key === "Escape") {
        closeNav();
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (!drawer.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const mq = typeof window.matchMedia === "function" ? window.matchMedia(DESKTOP_QUERY) : null;
    const onWiden = (e) => {
      if (e.matches) closeNav();
    };

    document.addEventListener("keydown", onKey);
    mq?.addEventListener?.("change", onWiden);
    return () => {
      cancelAnimationFrame(frame);
      body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      mq?.removeEventListener?.("change", onWiden);
    };
  }, [isNavVisible, closeNav]);

  const isActive = (to) =>
    typeof to === "string" && (pathname === to || pathname.startsWith(`${to}/`));
  const coursesActive = isActive(ROUTES.courses);
  const courseCurrent = (id) => (pathname === ROUTES.course(id) ? "page" : undefined);

  // Opening the drawer starts with the courses accordion expanded when the
  // visitor is already in the catalogue.
  const openDrawer = () => {
    setDrawerCoursesOpen(coursesActive);
    setNavVisibility(true);
  };
  const closeDrawer = () => {
    closeNav();
    toggleRef.current?.focus();
  };

  // Hover opens the mega menu for mouse users (after a short intent delay);
  // the button still toggles it for keyboard and touch. A click right after
  // a hover-open keeps it open rather than shutting what just appeared.
  const onCoursesEnter = (e) => {
    if (e.pointerType && e.pointerType !== "mouse") return;
    clearTimeout(closeTimer.current);
    if (coursesOpen) return;
    clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => {
      openedByHover.current = true;
      setCoursesOpen(true);
    }, HOVER_OPEN_MS);
  };
  const onCoursesLeave = (e) => {
    if (e.pointerType && e.pointerType !== "mouse") return;
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      openedByHover.current = false;
      // Keep it open if the keyboard is inside it.
      if (!coursesItemRef.current?.contains(document.activeElement)) closeCourses();
    }, HOVER_CLOSE_MS);
  };
  const onCoursesClick = () => {
    clearTimeout(openTimer.current);
    if (openedByHover.current) {
      openedByHover.current = false;
      setCoursesOpen(true);
      return;
    }
    setCoursesOpen((open) => !open);
  };
  // Arrow down on the button opens the menu and moves into its first link.
  const onCoursesKeyDown = (e) => {
    if (e.key !== "ArrowDown") return;
    e.preventDefault();
    setCoursesOpen(true);
    requestAnimationFrame(() => {
      coursesItemRef.current?.querySelector(".mega a")?.focus();
    });
  };

  const wrapperClass = [
    "header-wrapper",
    scrolled && "header-scrolled",
    coursesOpen && "header-mega-open",
    isNavVisible && "header-open",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={wrapperRef} className={wrapperClass}>
      {/* First thing a keyboard or screen-reader user reaches: a way past
          the nav straight to the page content. */}
      <a className="skip-link" href="#main">
        Skip to main content
      </a>

      <header className="header">
        <div className="container header-bar">
          <Link to={ROUTES.home} className="header-logo" aria-label={`${COMPANY.name} home`}>
            <Logo />
          </Link>

          <nav id="site-nav" className="header-nav" aria-label="Main">
            <ul className="header-links">
              <li
                ref={coursesItemRef}
                className="header-courses"
                onPointerEnter={onCoursesEnter}
                onPointerLeave={onCoursesLeave}
              >
                <button
                  ref={coursesBtnRef}
                  type="button"
                  className={`header-link header-courses-btn${coursesActive ? " is-active" : ""}${
                    coursesOpen ? " is-open" : ""
                  }`}
                  aria-expanded={coursesOpen}
                  aria-controls="courses-menu"
                  onClick={onCoursesClick}
                  onKeyDown={onCoursesKeyDown}
                >
                  Courses
                  <FontAwesomeIcon icon={faChevronDown} className="header-courses-caret" />
                </button>

                {/* The mega menu: a full-width panel under the bar. It sits
                    inside this list item so hover and focus tracking cover
                    both the button and the panel. */}
                <div id="courses-menu" className="mega" hidden={!coursesOpen}>
                  <div className="container mega-inner">
                    <div className="mega-tracks">
                      {TRACK_GROUPS.map((group) => (
                        <div key={group.value} className="mega-track">
                          <div className="mega-track-head">
                            <span className="mega-track-icon" aria-hidden="true">
                              <FontAwesomeIcon icon={TRACK_ICONS[group.value] || faGraduationCap} />
                            </span>
                            <div className="mega-track-text">
                              <p className="mega-track-name" id={`mega-track-${group.value}`}>
                                {group.label}
                              </p>
                              {group.blurb && <p className="mega-track-blurb">{group.blurb}</p>}
                            </div>
                          </div>
                          <ul aria-labelledby={`mega-track-${group.value}`}>
                            {group.courses.map((course) => (
                              <li key={course.id}>
                                <Link
                                  to={ROUTES.course(course.id)}
                                  aria-current={courseCurrent(course.id)}
                                  className="mega-link"
                                >
                                  <span className="mega-link-title">{course.title}</span>
                                  <span className="mega-link-level">{course.level}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="mega-feature">
                      <span className="mega-feature-icon" aria-hidden="true">
                        <FontAwesomeIcon icon={faCompass} />
                      </span>
                      <p className="mega-feature-title">Not sure which course is right for you?</p>
                      <p className="mega-feature-text">
                        Answer three quick questions and we&rsquo;ll suggest a course that fits
                        your background and goals.
                      </p>
                      <Link to={FINDER_LINK} className="btn btn-secondary btn-sm mega-feature-btn">
                        Try the course finder
                      </Link>
                      <Link
                        to={ROUTES.courses}
                        className="mega-all"
                        aria-current={pathname === ROUTES.courses ? "page" : undefined}
                      >
                        View all {COURSES.length} courses
                        <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" />
                      </Link>
                    </div>
                  </div>
                </div>
              </li>
              {NAV_LINKS.map((link) => {
                const active = isActive(link.to);
                return (
                  <li key={link.key}>
                    <Link
                      to={link.to}
                      className={`header-link${active ? " is-active" : ""}`}
                      aria-current={active ? "page" : undefined}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="header-actions">
            <Link to={ROUTES.contact} className="btn btn-secondary btn-sm header-call">
              Book a free call
            </Link>
            <Link to={ROUTES.courses} className="btn btn-primary btn-sm header-apply">
              Apply now
            </Link>

            <button
              ref={toggleRef}
              type="button"
              className="nav-toggle"
              onClick={() => (isNavVisible ? closeNav() : openDrawer())}
              aria-label="Open menu"
              aria-expanded={isNavVisible}
              aria-controls="mobile-menu"
            >
              <span className="nav-toggle-bars" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
              <span className="nav-toggle-label" aria-hidden="true">
                Menu
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer. While closed it is visibility: hidden, which takes
          it out of the tab order and the accessibility tree. */}
      <div
        className={`drawer-backdrop${isNavVisible ? " is-open" : ""}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />
      <div
        id="mobile-menu"
        ref={drawerRef}
        className={`drawer${isNavVisible ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
      >
        <div className="drawer-top">
          <Link to={ROUTES.home} className="drawer-logo" aria-label={`${COMPANY.name} home`}>
            <Logo />
          </Link>
          <button
            type="button"
            className="drawer-close"
            onClick={closeDrawer}
            aria-label="Close menu"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <nav className="drawer-body" aria-label="Main mobile">
          <ul className="drawer-links">
            <li className="drawer-item">
              <button
                type="button"
                className={`drawer-link drawer-accordion${coursesActive ? " is-active" : ""}`}
                aria-expanded={drawerCoursesOpen}
                aria-controls="drawer-courses"
                onClick={() => setDrawerCoursesOpen((open) => !open)}
              >
                Courses
                <FontAwesomeIcon icon={drawerCoursesOpen ? faMinus : faPlus} />
              </button>
              <div id="drawer-courses" className="drawer-courses" hidden={!drawerCoursesOpen}>
                {TRACK_GROUPS.map((group) => (
                  <div key={group.value} className="drawer-track">
                    <p className="drawer-track-name" id={`drawer-track-${group.value}`}>
                      {group.label}
                    </p>
                    <ul aria-labelledby={`drawer-track-${group.value}`}>
                      {group.courses.map((course) => (
                        <li key={course.id}>
                          <Link
                            to={ROUTES.course(course.id)}
                            aria-current={courseCurrent(course.id)}
                            className="drawer-course"
                          >
                            <span>{course.title}</span>
                            <span className="drawer-course-level">{course.level}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <Link
                  to={ROUTES.courses}
                  className="drawer-all"
                  aria-current={pathname === ROUTES.courses ? "page" : undefined}
                >
                  View all {COURSES.length} courses
                  <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" />
                </Link>
              </div>
            </li>
            {NAV_LINKS.map((link) => {
              const active = isActive(link.to);
              return (
                <li key={link.key} className="drawer-item">
                  <Link
                    to={link.to}
                    className={`drawer-link${active ? " is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="drawer-actions">
            <Link to={ROUTES.courses} className="btn btn-primary btn-lg btn-block">
              Apply now
            </Link>
            <Link to={ROUTES.contact} className="btn btn-secondary btn-lg btn-block">
              Book a free call
            </Link>
            {COMPANY.email && (
              <a href={`mailto:${COMPANY.email}`} className="drawer-mail">
                {COMPANY.email}
              </a>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Header;
