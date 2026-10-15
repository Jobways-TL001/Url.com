import { useEffect } from "react";
import { matchPath, useLocation } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { COURSES } from "../constants/courses";
import { COMPANY } from "../constants/company";

// Per-route title and description. A single-page app only has the one
// index.html, so without this every route shares one <title> — bad for
// browser tabs, bookmarks, shared links and search results.
const NAME = COMPANY.name;

const META = {
  [ROUTES.home]: {
    title: `${NAME} | Live online AI courses with a dedicated mentor`,
    description:
      "Six-month live online AI courses, from Python foundations to generative AI, data science and MLOps. Classes run Monday to Friday with a dedicated industry mentor, hands-on projects and career support.",
  },
  [ROUTES.courses]: {
    title: `Courses | ${NAME}`,
    description: `${COURSES.length} live, mentor-led AI courses in four tracks: Foundations, Core AI, Generative & Agentic AI, and Data & MLOps. Six months each, classes Monday to Friday.`,
  },
  [ROUTES.about]: {
    title: `About | ${NAME}`,
    description:
      "About URL and how we teach: live online classes, a dedicated industry mentor, hands-on projects and career support.",
  },
  [ROUTES.contact]: {
    title: `Book a free call | ${NAME}`,
    description:
      "Book a free call with a URL advisor to talk through courses, fees and batches, and choose the right course for you.",
  },
  [ROUTES.terms]: {
    title: `Terms and Conditions | ${NAME}`,
    description: "The terms and conditions governing use of the URL website and services.",
  },
  [ROUTES.privacy]: {
    title: `Privacy Policy | ${NAME}`,
    description: "How URL collects, uses and protects your personal information.",
  },
  [ROUTES.disclaimer]: {
    title: `Disclaimer | ${NAME}`,
    description: "Disclaimer for the URL website and the information published on it.",
  },
  [ROUTES.payment]: {
    title: `Complete your enrolment | ${NAME}`,
    description: "Complete payment to confirm your seat in a URL AI course.",
  },
  [ROUTES.paymentSuccess]: {
    title: `Payment received | ${NAME}`,
    description: "Thank you for enrolling with URL.",
  },
  "/admin": {
    title: `Admin | ${NAME}`,
    description: "URL admin dashboard.",
  },
};

const FALLBACK = META[ROUTES.home];

// One page per course: its title and summary. CourseDetail.jsx sets the
// same values itself (its effect runs after this one), so the two agree.
const courseMeta = (pathname) => {
  const match = matchPath(`${ROUTES.courses}/:courseId`, pathname);
  if (!match) return null;
  const course = COURSES.find((c) => c.id === match.params.courseId);
  if (!course) return META[ROUTES.courses];
  return {
    title: `${course.title} | ${NAME}`,
    description: course.summary,
  };
};

const metaFor = (rawPath) => {
  // "/courses/" and "/courses" are the same page.
  const pathname = rawPath.length > 1 ? rawPath.replace(/\/+$/, "") : rawPath;
  return META[pathname] || courseMeta(pathname) || FALLBACK;
};

const setMetaTag = (attr, key, content) => {
  let tag = document.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    if (attr !== "name") return; // only create the plain description tag
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const PageMeta = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = metaFor(pathname);
    document.title = meta.title;
    setMetaTag("name", "description", meta.description);
    // Keep any social preview tags already in index.html in step.
    setMetaTag("property", "og:title", meta.title);
    setMetaTag("property", "og:description", meta.description);
  }, [pathname]);

  return null;
};

export default PageMeta;
