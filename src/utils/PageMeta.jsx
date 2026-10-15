import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Per-route title and description. A single-page app only has the one
// index.html, so without this every route shares one <title> — bad for
// browser tabs, bookmarks, shared links and search results.
const META = {
  "/": {
    title: "URL — AI Courses and Career Services",
    description:
      "URL offers six-month, live online AI courses — machine learning, generative AI, data science, MLOps and more — with career support, in more than 50 countries.",
  },
  "/about-us": {
    title: "About Us — URL",
    description:
      "URL is a global IT services company founded in 2017, offering AI courses, career counselling and job support in more than 50 countries.",
  },
  "/ai-courses": {
    title: "AI Courses — URL",
    description:
      "Live, mentor-led AI courses: machine learning, generative AI and LLMs, data science, MLOps, AI for cybersecurity and Python for AI.",
  },
  "/contact-us": {
    title: "Contact Us — URL",
    description:
      "Get in touch with the URL team in the United States or India. We usually reply within one business day.",
  },
  "/TermsAndConditions": {
    title: "Terms and Conditions — URL",
    description: "The terms and conditions governing use of the URL website and services.",
  },
  "/Privacypolicy": {
    title: "Privacy Policy — URL",
    description: "How URL collects, uses and protects your personal information.",
  },
  "/payment": {
    title: "Complete Your Enrolment — URL",
    description: "Complete payment to confirm your seat in a URL AI course.",
  },
  "/payment/success": {
    title: "Payment Received — URL",
    description: "Thank you for enrolling with URL.",
  },
  "/admin": {
    title: "Admin — URL",
    description: "URL admin dashboard.",
  },
  "/Disclaimer": {
    title: "Disclaimer — URL",
    description: "Disclaimer for the URL website and the information published on it.",
  },
};

const FALLBACK = META["/"];

const PageMeta = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = META[pathname] || FALLBACK;
    document.title = meta.title;

    let tag = document.querySelector('meta[name="description"]');
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", "description");
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", meta.description);
  }, [pathname]);

  return null;
};

export default PageMeta;
