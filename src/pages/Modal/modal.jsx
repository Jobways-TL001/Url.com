import React, { useState, useEffect, useRef } from "react";
import { SERVICES } from "../../constants/services";
import { DEFAULT_COUNTRY } from "../../constants/countries";
import CountrySelect from "../../components/CountrySelect/CountrySelect";
import {
  filters,
  validators,
  validateForm,
  composePhone,
} from "../../utils/formValidation";
import "./Modal.css";

const EMPTY = { name: "", email: "", message: "", number: "", service: "" };

// Form field name -> the validator that owns it.
const FIELD_VALIDATOR = {
  name: validators.name,
  email: validators.email,
  number: validators.phone,
  service: validators.service,
  message: validators.message,
};

const Modal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState(EMPTY);
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [errors, setErrors] = useState({});
  // A field is only allowed to show an error once the visitor has left it or
  // tried to submit, so the form does not scold them mid-typing.
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState(null); // null | "sending" | "success" | "error"
  const formRef = useRef(null);


  useEffect(() => {
    if (isOpen) {
      setStatus(null);
      setErrors({});
      setTouched({});
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape, unless a send is in flight.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape" && status !== "sending") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, status, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const key = name === "number" ? "phone" : name;
    const next = filters[key] ? filters[key](value) : value;

    setFormData((prev) => ({ ...prev, [name]: next }));

    // Re-check a field that is already showing an error as soon as it is
    // fixed, rather than making the visitor leave the field to find out.
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

    setStatus("sending");
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          number: composePhone(country, formData.number),
          source: "home-modal",
        }),
      });

      if (response.ok) {
        setStatus("success");
        setFormData(EMPTY);
        setErrors({});
        setTouched({});
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && status !== "sending") onClose();
  };

  if (!isOpen) return null;

  const sending = status === "sending";

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
  // Only render an error once the field has been touched, so a pristine form
  // opens clean.
  const errorFor = (field) => (touched[field] ? errors[field] : "");
  const fieldClass = (field) =>
    `modal-field${errorFor(field) ? " modal-field-invalid" : ""}`;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className={`modal-container modal-wide${status === "success" ? " is-done" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
          disabled={sending}
        >
          &times;
        </button>

        {status === "success" ? (
          /* The confirmation replaces the whole panel, header included.
             Leaving "Fill out the form" above a sent message contradicts it. */
          <div className="modal-success" role="status">
            <div className="modal-success-icon" aria-hidden="true">
              &#10003;
            </div>
            <h2 id="modal-title">Thank you for getting in touch</h2>
            <p>
              Your enquiry has reached our team and a confirmation is on its
              way to your inbox. We usually reply within one business day.
            </p>
            <button type="button" className="modal-success-btn" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <div className="modal-split">
            <aside className="modal-aside enquiry-aside">
              <span className="enquiry-aside-eyebrow">Speak with a counsellor</span>
              <h3>How we can help</h3>
              <p>
                Questions about our AI courses, fees, batches or enrolment? Our
                counsellors are here to guide you.
              </p>
              <ol className="enquiry-aside-steps">
                <li>
                  <span>1</span>
                  <div>
                    <strong>We reply within one business day</strong>
                    Every enquiry is read by a member of our team.
                  </div>
                </li>
                <li>
                  <span>2</span>
                  <div>
                    <strong>We discuss your goals</strong>
                    A counsellor learns about your background and plans.
                  </div>
                </li>
                <li>
                  <span>3</span>
                  <div>
                    <strong>You receive a recommendation</strong>
                    We suggest the course that suits you best.
                  </div>
                </li>
              </ol>
              <p className="enquiry-aside-contact">
                Prefer email?{" "}
                <a href="mailto:contactus@url.com">contactus@url.com</a>
              </p>
            </aside>

            <div className="modal-main">
            <div className="modal-heading">
              <h2 id="modal-title">Get in touch</h2>
              <p>Send us your question and a counsellor will get back to you.</p>
            </div>

            <form
              className="modal-form modal-grid"
              onSubmit={handleSubmit}
              ref={formRef}
              noValidate
            >
              <div className={fieldClass("name")}>
                <label htmlFor="modal-name">
                  Name <span className="modal-required" aria-hidden="true">*</span>
                </label>
                <input
                  id="modal-name"
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={sending}
                  autoComplete="name"
                  aria-invalid={Boolean(errorFor("name"))}
                  aria-describedby={errorFor("name") ? "modal-name-error" : undefined}
                />
                {errorFor("name") && (
                  <span className="modal-field-error" id="modal-name-error">
                    {errorFor("name")}
                  </span>
                )}
              </div>

              <div className={fieldClass("email")}>
                <label htmlFor="modal-email">
                  Email <span className="modal-required" aria-hidden="true">*</span>
                </label>
                <input
                  id="modal-email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={sending}
                  autoComplete="email"
                  aria-invalid={Boolean(errorFor("email"))}
                  aria-describedby={errorFor("email") ? "modal-email-error" : undefined}
                />
                {errorFor("email") && (
                  <span className="modal-field-error" id="modal-email-error">
                    {errorFor("email")}
                  </span>
                )}
              </div>

              <div className={fieldClass("number")}>
                <label htmlFor="modal-phone">Phone</label>
                <div className="modal-phone-group">
                  <CountrySelect
                    id="modal-country"
                    value={country}
                    onChange={handleCountryChange}
                    disabled={sending}
                  />
                  <input
                    id="modal-phone"
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
                    aria-describedby={errorFor("number") ? "modal-phone-error" : undefined}
                  />
                </div>
                {errorFor("number") ? (
                  <span className="modal-field-error" id="modal-phone-error">
                    {errorFor("number")}
                  </span>
                ) : (
                  <span className="modal-field-hint">Optional — digits only</span>
                )}
              </div>

              <div className={fieldClass("service")}>
                <label htmlFor="modal-service">
                  Service <span className="modal-required" aria-hidden="true">*</span>
                </label>
                <select
                  id="modal-service"
                  className={formData.service ? "" : "modal-select-placeholder"}
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={sending}
                  aria-invalid={Boolean(errorFor("service"))}
                  aria-describedby={errorFor("service") ? "modal-service-error" : undefined}
                >
                  <option value="">Select a service</option>
                  {SERVICES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {errorFor("service") && (
                  <span className="modal-field-error" id="modal-service-error">
                    {errorFor("service")}
                  </span>
                )}
              </div>

              <div className={`${fieldClass("message")} modal-span`}>
                <label htmlFor="modal-message">
                  Message <span className="modal-required" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="modal-message"
                  name="message"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows="4"
                  disabled={sending}
                  aria-invalid={Boolean(errorFor("message"))}
                  aria-describedby={errorFor("message") ? "modal-message-error" : undefined}
                />
                {errorFor("message") && (
                  <span className="modal-field-error" id="modal-message-error">
                    {errorFor("message")}
                  </span>
                )}
              </div>

              {status === "error" && (
                <p className="modal-error" role="alert">
                  We couldn't send your message just now. Please try again, or
                  email us directly at contactus@url.com.
                </p>
              )}

              <button type="submit" className="modal-submit modal-submit-full" disabled={sending}>
                {sending ? "Sending..." : "Send Message"}
              </button>
            </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
