import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faYoutube,
  faInstagram,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";
import {
  faPhone,
  faEnvelope,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import { COURSES } from "../../constants/courses";
import "./footer.css";

const COMPANY_LINKS = [
  { to: "/about-us", label: "About Us" },
  { to: "/contact-us", label: "Contact Us" },
];

const LEGAL_LINKS = [
  { to: "/TermsAndConditions", label: "Terms and Conditions" },
  { to: "/Privacypolicy", label: "Privacy Policy" },
  { to: "/Disclaimer", label: "Disclaimer" },
];

const LOCATIONS = ["United States", "Canada", "United Kingdom", "India", "Ethiopia"];

const SOCIALS = [
  { href: "https://www.facebook.com/URLdotcom/", icon: faFacebookF, label: "Facebook" },
  { href: "https://www.youtube.com/@url-official", icon: faYoutube, label: "YouTube" },
  { href: "https://www.instagram.com/url.com_official/", icon: faInstagram, label: "Instagram" },
  { href: "https://www.linkedin.com/company/71205136/", icon: faLinkedinIn, label: "LinkedIn" },
];

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <img
              src="/images/footer-logo.webp"
              alt="URL home"
              loading="lazy"
              decoding="async"
            />
          </Link>
          <p>
            URL is a global IT services company providing live,
            mentor-led training in artificial intelligence.
          </p>
          <div className="footer-socials">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`URL on ${s.label}`}
              >
                <FontAwesomeIcon icon={s.icon} />
              </a>
            ))}
          </div>
        </div>

        <div className="footer-col">
          <h2 className="footer-heading">AI Courses</h2>
          <ul>
            {COURSES.map((course) => (
              <li key={course.id}>
                <Link to={`/ai-courses#course-${course.id}`}>{course.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h2 className="footer-heading">Company</h2>
          <ul>
            {COMPANY_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
          <h2 className="footer-heading footer-heading-spaced">Legal</h2>
          <ul>
            {LEGAL_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h2 className="footer-heading">Get in Touch</h2>
          <ul className="footer-contact">
            <li>
              <FontAwesomeIcon icon={faEnvelope} />
              <a href="mailto:contactus@url.com">contactus@url.com</a>
            </li>
            <li>
              <FontAwesomeIcon icon={faPhone} />
              <a href="tel:+12405588717">+1 240 558 8717</a>
            </li>
            <li>
              <FontAwesomeIcon icon={faClock} />
              <span>Mon–Fri, 9:00 AM – 6:00 PM EST</span>
            </li>
          </ul>
          <p className="footer-locations">
            <span>Serving learners in</span>
            {LOCATIONS.join(" · ")}
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} URL.com — URL Point LLP. All
          rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
