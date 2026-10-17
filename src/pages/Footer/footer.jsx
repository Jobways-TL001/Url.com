import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faYoutube,
  faInstagram,
  faLinkedinIn,
} from "@fortawesome/free-brands-svg-icons";
import { faClock, faEnvelope, faPhone } from "@fortawesome/free-solid-svg-icons";
import { COMPANY, telHref } from "../../constants/company";
import { ROUTES } from "../../constants/routes";
import { TRACK_GROUPS } from "../../components/ui/trackGroups";
import Logo from "../../components/ui/Logo";
import "./footer.css";

const COMPANY_LINKS = [
  { key: "courses", to: ROUTES.courses, label: "All courses" },
  { key: "finder", to: { pathname: ROUTES.home, hash: "#finder" }, label: "Course finder" },
  { key: "about", to: ROUTES.about, label: "About us" },
  { key: "contact", to: ROUTES.contact, label: "Contact" },
];

const LEGAL_LINKS = [
  { to: ROUTES.terms, label: "Terms and conditions" },
  { to: ROUTES.privacy, label: "Privacy policy" },
  { to: ROUTES.disclaimer, label: "Disclaimer" },
];

// Only profiles with a URL in src/constants/company.js are shown.
const SOCIALS = [
  { href: COMPANY.socials.linkedin, icon: faLinkedinIn, label: "LinkedIn" },
  { href: COMPANY.socials.instagram, icon: faInstagram, label: "Instagram" },
  { href: COMPANY.socials.youtube, icon: faYoutube, label: "YouTube" },
  { href: COMPANY.socials.facebook, icon: faFacebookF, label: "Facebook" },
].filter((s) => s.href);

const Footer = () => (
  <footer className="footer section-dark">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to={ROUTES.home} className="footer-logo" aria-label={`${COMPANY.name} home`}>
            <Logo variant="light" />
          </Link>
          <p>
            {COMPANY.name} runs live online AI courses, taught Monday to Friday by industry
            mentors, with career and job support when you finish.
          </p>
          {SOCIALS.length > 0 && (
            <ul className="footer-socials">
              {SOCIALS.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${COMPANY.name} on ${s.label}`}
                  >
                    <FontAwesomeIcon icon={s.icon} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav className="footer-col footer-col-courses" aria-label="Courses">
          <h2 className="footer-heading">Courses</h2>
          <div className="footer-tracks">
            {TRACK_GROUPS.map((group) => (
              <div key={group.value} className="footer-track">
                <p className="footer-track-name">{group.label}</p>
                <ul className="footer-links">
                  {group.courses.map((course) => (
                    <li key={course.id}>
                      <Link to={ROUTES.course(course.id)}>{course.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </nav>

        <nav className="footer-col footer-col-company" aria-label="Company">
          <h2 className="footer-heading">Company</h2>
          <ul className="footer-links">
            {COMPANY_LINKS.map((link) => (
              <li key={link.key}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer-col footer-col-contact">
          <h2 className="footer-heading">Get in touch</h2>
          <ul className="footer-contact">
            {COMPANY.email && (
              <li>
                <FontAwesomeIcon icon={faEnvelope} className="footer-contact-icon" />
                <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
              </li>
            )}
            {COMPANY.phone && (
              <li>
                <FontAwesomeIcon icon={faPhone} className="footer-contact-icon" />
                <a href={telHref(COMPANY.phone)}>{COMPANY.phone}</a>
              </li>
            )}
            {COMPANY.hours && (
              <li>
                <FontAwesomeIcon icon={faClock} className="footer-contact-icon" />
                <span>{COMPANY.hours}</span>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Bottom bar: copyright on the left, legal links on the right. */}
      <div className="footer-bottom">
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} {COMPANY.legalName}. All rights reserved.
        </p>
        <nav className="footer-legal" aria-labelledby="footer-legal-heading">
          <h2 className="visually-hidden" id="footer-legal-heading">
            Legal
          </h2>
          <ul>
            {LEGAL_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  </footer>
);

export default Footer;
