import React, { useState, useRef } from "react";
import "./contact.css";
import { SERVICES } from "../../constants/services";
import { DEFAULT_COUNTRY } from "../../constants/countries";
import CountrySelect from "../../components/CountrySelect/CountrySelect";
import {
  filters,
  validators,
  validateForm,
  composePhone,
} from "../../utils/formValidation";
import Header from "../Header/header";
import Footer from "../Footer/footer";
import PageHero from "../../components/ui/PageHero";
import SectionHead from "../../components/ui/SectionHead";

const locations = [
  {
    city: "United States",
    company: "URL LLC",
    address: "8 The Green Ste R, Dover, DE 19901",
    phoneNumber: "+1 240 525 0547",
    email: "hr@url.com",
    map: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1637.5372693701577!2d-75.5249159!3d39.1565906!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c7657e0f270c79%3A0x3cc77cd9d14827e8!2s8%20The%20Green%2C%20Dover%2C%20DE%2019901%2C%20USA!5e1!3m2!1sen!2sin!4v1704897311255!5m2!1sen!2sin",
  },
  {
    city: "India",
    company: "URL Point LLP",
    address: "Unit 7-140/2, E5, Nagendra Nagar, Habsiguda, Hyderabad 500007",
    phoneNumber: "+91 88010 91975",
    email: "hr.india@url.com",
    map: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d237.92794854114504!2d78.5434038!3d17.4191202!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99747f2c917b%3A0x276db082437dbb00!2sBDI%20INDIA%20Pvt%20ltd%20Hyderabad!5e0!3m2!1sen!2sin!4v1704899088577!5m2!1sen!2sin",
  },
  
];

const EMPTY = { name: "", number: "", email: "", service: "", message: "" };

// Form field name -> the validator that owns it. Shared with the homepage
// modal through src/utils/formValidation.js, so the two forms accept exactly
// the same input.
const FIELD_VALIDATOR = {
  name: validators.name,
  email: validators.email,
  number: validators.phone,
  service: validators.service,
  message: validators.message,
};

const ContactUsPage = () => {
  const [activeMap, setActiveMap] = useState(locations[0].map);
  const [activeCity, setActiveCity] = useState(locations[0].city);
  const [formData, setFormData] = useState(EMPTY);
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [errors, setErrors] = useState({});
  // A field only shows an error once it has been left or the form submitted,
  // so the page does not scold someone mid-typing.
  const [touched, setTouched] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const formRef = useRef(null);

  const sending = submitStatus === "sending";

  // A number valid for one country may not be for another, so recheck it
  // as soon as the country changes.
  const handleCountryChange = (code) => {
    setCountry(code);
    if (touched.number) {
      setErrors((prev) => ({
        ...prev,
        number: FIELD_VALIDATOR.number(formData.number, code),
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const key = name === "number" ? "phone" : name;
    const next = filters[key] ? filters[key](value) : value;

    setFormData((prev) => ({ ...prev, [name]: next }));

    // Clear an error as soon as it is fixed, rather than making the visitor
    // leave the field to find out.
    if (touched[name] && FIELD_VALIDATOR[name]) {
      setErrors((prev) => ({ ...prev, [name]: FIELD_VALIDATOR[name](next, country) }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!FIELD_VALIDATOR[name]) return;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: FIELD_VALIDATOR[name](value, country) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { errors: found, isValid, firstInvalid } = validateForm(formData, country);
    setErrors(found);
    setTouched({ name: true, email: true, number: true, service: true, message: true });

    if (!isValid) {
      // Put the cursor on the first problem so it is obvious what to fix.
      const el = formRef.current?.elements?.[firstInvalid];
      if (el && typeof el.focus === "function") el.focus();
      return;
    }

    setSubmitStatus("sending");
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          number: composePhone(country, formData.number),
          source: "contact-page",
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData(EMPTY);
        setErrors({});
        setTouched({});
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    }
  };

  // Only render an error once the field has been touched.
  const errorFor = (field) => (touched[field] ? errors[field] : "");
  const fieldClass = (field) =>
    `contact-field${errorFor(field) ? " contact-field-invalid" : ""}`;

  const handleLocationClick = (location) => {
    setActiveMap(location.map);
    setActiveCity(location.city);
  };

  return (
    <>
      <Header />

      <PageHero eyebrow="Contact us" title="Let's talk about your AI career" center>
        Our counsellors are here to answer your questions about AI courses,
        fees, batches and enrolment.
      </PageHero>

      {/* Info + Form */}
      <section className="section contact-main">
        <div className="container contact-main-grid">
          {/* What happens next */}
          <aside className="contact-info" data-reveal>
            <h2>What happens next</h2>
            <p>
              Send us your question about courses, fees, batches or enrolment.
            </p>
            <ol className="contact-next">
              <li>
                <strong>We reply within one business day</strong>
                <span>A member of our team reviews every enquiry personally.</span>
              </li>
              <li>
                <strong>A counsellor discusses your goals</strong>
                <span>We learn about your background and the role you want.</span>
              </li>
              <li>
                <strong>You receive a recommendation</strong>
                <span>We suggest the course and batch that suit you best.</span>
              </li>
            </ol>
          </aside>

          {/* Form */}
          <div className="contact-form-card" data-reveal>
            <h2>Send us a message</h2>
            <p className="contact-form-intro">
              Fields marked <span className="contact-required">*</span> are
              required.
            </p>
            <form
              onSubmit={handleSubmit}
              className="contact-form"
              ref={formRef}
              noValidate
            >
              <div className={fieldClass("name")}>
                <label htmlFor="contact-name">
                  Name <span className="contact-required" aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={sending}
                  autoComplete="name"
                  aria-invalid={Boolean(errorFor("name"))}
                  aria-describedby={errorFor("name") ? "contact-name-error" : undefined}
                />
                {errorFor("name") && (
                  <span className="contact-field-error" id="contact-name-error">
                    {errorFor("name")}
                  </span>
                )}
              </div>

              <div className={fieldClass("number")}>
                <label htmlFor="contact-phone">Phone Number</label>
                <div className="contact-phone-group">
                  <CountrySelect
                    id="contact-country"
                    value={country}
                    onChange={handleCountryChange}
                    disabled={sending}
                  />
                  <input
                    id="contact-phone"
                    type="tel"
                    inputMode="numeric"
                    name="number"
                    placeholder="Phone number"
                    value={formData.number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={sending}
                    autoComplete="tel-national"
                    aria-invalid={Boolean(errorFor("number"))}
                    aria-describedby={errorFor("number") ? "contact-phone-error" : undefined}
                  />
                </div>
                {errorFor("number") ? (
                  <span className="contact-field-error" id="contact-phone-error">
                    {errorFor("number")}
                  </span>
                ) : (
                  <span className="contact-field-hint">Optional — digits only</span>
                )}
              </div>

              <div className={fieldClass("email")}>
                <label htmlFor="contact-email">
                  Email <span className="contact-required" aria-hidden="true">*</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={sending}
                  autoComplete="email"
                  aria-invalid={Boolean(errorFor("email"))}
                  aria-describedby={errorFor("email") ? "contact-email-error" : undefined}
                />
                {errorFor("email") && (
                  <span className="contact-field-error" id="contact-email-error">
                    {errorFor("email")}
                  </span>
                )}
              </div>

              <div className={fieldClass("service")}>
                <label htmlFor="contact-service">
                  Service <span className="contact-required" aria-hidden="true">*</span>
                </label>
                <select
                  id="contact-service"
                  className={formData.service ? "" : "contact-select-placeholder"}
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={sending}
                  aria-invalid={Boolean(errorFor("service"))}
                  aria-describedby={errorFor("service") ? "contact-service-error" : undefined}
                >
                  <option value="">Select a service</option>
                  {SERVICES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {errorFor("service") && (
                  <span className="contact-field-error" id="contact-service-error">
                    {errorFor("service")}
                  </span>
                )}
              </div>

              <div className={fieldClass("message")}>
                <label htmlFor="contact-message">
                  Message <span className="contact-required" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows="5"
                  disabled={sending}
                  aria-invalid={Boolean(errorFor("message"))}
                  aria-describedby={errorFor("message") ? "contact-message-error" : undefined}
                />
                {errorFor("message") && (
                  <span className="contact-field-error" id="contact-message-error">
                    {errorFor("message")}
                  </span>
                )}
              </div>

              <button type="submit" className="contact-submit-btn" disabled={sending}>
                {sending ? "Sending..." : "Send Message"}
              </button>

              {submitStatus === "success" && (
                <div className="contact-status contact-status-success" role="status">
                  <strong>Thank you for getting in touch.</strong>
                  <span>
                    Your enquiry has reached our team and a confirmation is on
                    its way to your inbox. We usually reply within one business
                    day.
                  </span>
                </div>
              )}
              {submitStatus === "error" && (
                <div className="contact-status contact-status-error" role="alert">
                  <strong>We couldn't send your message.</strong>
                  <span>
                    Please try again, or email us directly at
                    {" "}contactus@url.com.
                  </span>
                </div>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* Offices + Map */}
      <section className="section section-alt contact-locations">
        <div className="container">
          <SectionHead eyebrow="Our offices" title="Visit us">
            Select an office to see it on the map.
          </SectionHead>
          <div className="contact-offices">
        <div className="contact-locations-grid">
          {locations.map((location, index) => (
            // Button, not div: these switch the map, so they must be
            // reachable and activatable from the keyboard.
            <button
              type="button"
              key={index}
              data-reveal
              className={`contact-location-card ${
                activeCity === location.city ? "contact-location-active" : ""
              }`}
              onClick={() => handleLocationClick(location)}
              aria-pressed={activeCity === location.city}
            >
              <h3>{location.city}</h3>
              <div className="contact-location-detail">
                <span className="contact-detail-label">Company</span>
                <span>{location.company}</span>
              </div>
              <div className="contact-location-detail">
                <span className="contact-detail-label">Address</span>
                <span>{location.address}</span>
              </div>
              <div className="contact-location-detail">
                <span className="contact-detail-label">Phone</span>
                <span>{location.phoneNumber}</span>
              </div>
              <div className="contact-location-detail">
                <span className="contact-detail-label">Email</span>
                <span>{location.email}</span>
              </div>
            </button>
          ))}
        </div>

            <div className="contact-map-card" data-reveal>
              <iframe
                src={activeMap}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title={`Map of the URL office in ${activeCity}`}
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default ContactUsPage;
