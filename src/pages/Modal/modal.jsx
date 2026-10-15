import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
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
import { COMPANY } from "../../constants/company";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Shared by both dialogs (this one and the enrolment panel): moves focus
// into the dialog when it opens, keeps Tab / Shift+Tab inside it, and hands
// focus back to whatever opened it when it closes.
export function useDialogFocus(isOpen, dialogRef) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    if (dialog) dialog.focus({ preventScroll: true });

    const onKeyDown = (e) => {
      const root = dialogRef.current;
      if (e.key !== "Tab" || !root) return;
      const items = Array.from(root.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.getClientRects().length > 0
      );
      if (!items.length) {
        e.preventDefault();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const outside = !root.contains(active) || active === root;
      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previous && typeof previous.focus === "function" && document.contains(previous)) {
        previous.focus({ preventScroll: true });
      }
    };
  }, [isOpen, dialogRef]);
}

// The check icon shown when a form has gone through: a white tick in a
// soft circle. Callers may still pass an `id`; it is not needed.
export const SuccessMark = () => (
  <div className="modal-check" aria-hidden="true">
    <FontAwesomeIcon icon={faCheck} />
  </div>
);

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
  const dialogRef = useRef(null);
  const doneRef = useRef(null);

  useDialogFocus(isOpen, dialogRef);

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

  // The form is replaced by the confirmation, so move focus onto it rather
  // than leaving it on a button that no longer exists.
  useEffect(() => {
    if (status === "success" && doneRef.current) doneRef.current.focus();
  }, [status]);

  // Close on Escape, unless a send is in flight. An Escape that a control
  // inside the dialog already handled (the country list) is left alone.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape" && !e.defaultPrevented && status !== "sending") onClose();
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
    `field modal-field${errorFor(field) ? " field-invalid modal-field-invalid" : ""}`;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`modal-container${status === "success" ? " is-done" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={status === "success" ? undefined : "modal-desc"}
        aria-busy={sending || undefined}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
          disabled={sending}
        >
          <FontAwesomeIcon icon={faXmark} />
        </button>

        {status === "success" ? (
          /* The confirmation replaces the whole panel, header included.
             Leaving "Fill out the form" above a sent message contradicts it. */
          <div className="modal-success" role="status">
            <SuccessMark />
            <h2 id="modal-title">Thanks, we've got your question</h2>
            <p>
              We've sent a confirmation to your inbox. One of our advisors
              will reply by email, usually within one business day.
            </p>
            <button
              type="button"
              ref={doneRef}
              className="btn btn-primary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <header className="modal-head">
              <h2 id="modal-title">Ask an advisor</h2>
              <p id="modal-desc">
                Send us your question about fees, batches or which course
                suits you, and an advisor will reply by email within one
                business day.
              </p>
            </header>

            <form
              className="modal-form modal-grid"
              onSubmit={handleSubmit}
              ref={formRef}
              noValidate
            >
              <div className={fieldClass("name")}>
                <label htmlFor="modal-name" className="field-label">
                  Name{" "}
                  <span className="field-required" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="modal-name"
                  className="input"
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={sending}
                  autoComplete="name"
                  aria-required="true"
                  aria-invalid={Boolean(errorFor("name"))}
                  aria-describedby={errorFor("name") ? "modal-name-error" : undefined}
                />
                {errorFor("name") && (
                  <span className="field-error" id="modal-name-error">
                    {errorFor("name")}
                  </span>
                )}
              </div>

              <div className={fieldClass("email")}>
                <label htmlFor="modal-email" className="field-label">
                  Email{" "}
                  <span className="field-required" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="modal-email"
                  className="input"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={sending}
                  autoComplete="email"
                  aria-required="true"
                  aria-invalid={Boolean(errorFor("email"))}
                  aria-describedby={errorFor("email") ? "modal-email-error" : undefined}
                />
                {errorFor("email") && (
                  <span className="field-error" id="modal-email-error">
                    {errorFor("email")}
                  </span>
                )}
              </div>

              <div className={fieldClass("number")}>
                <label htmlFor="modal-phone" className="field-label">
                  Phone <span className="modal-optional">(optional)</span>
                </label>
                <div className="modal-phone-group">
                  <CountrySelect
                    id="modal-country"
                    value={country}
                    onChange={handleCountryChange}
                    disabled={sending}
                  />
                  <input
                    id="modal-phone"
                    className="input"
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
                    aria-describedby={
                      errorFor("number") ? "modal-phone-error" : "modal-phone-hint"
                    }
                  />
                </div>
                {errorFor("number") ? (
                  <span className="field-error" id="modal-phone-error">
                    {errorFor("number")}
                  </span>
                ) : (
                  <span className="field-hint" id="modal-phone-hint">
                    Digits only
                  </span>
                )}
              </div>

              <div className={fieldClass("service")}>
                <label htmlFor="modal-service" className="field-label">
                  Service{" "}
                  <span className="field-required" aria-hidden="true">
                    *
                  </span>
                </label>
                <select
                  id="modal-service"
                  className={`select${formData.service ? "" : " modal-select-placeholder"}`}
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={sending}
                  aria-required="true"
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
                  <span className="field-error" id="modal-service-error">
                    {errorFor("service")}
                  </span>
                )}
              </div>

              <div className={`${fieldClass("message")} modal-span`}>
                <label htmlFor="modal-message" className="field-label">
                  Message{" "}
                  <span className="field-required" aria-hidden="true">
                    *
                  </span>
                </label>
                <textarea
                  id="modal-message"
                  className="textarea"
                  name="message"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  rows="4"
                  disabled={sending}
                  aria-required="true"
                  aria-invalid={Boolean(errorFor("message"))}
                  aria-describedby={errorFor("message") ? "modal-message-error" : undefined}
                />
                {errorFor("message") && (
                  <span className="field-error" id="modal-message-error">
                    {errorFor("message")}
                  </span>
                )}
              </div>

              {status === "error" && (
                <p className="notice notice-error modal-span" role="alert">
                  We couldn't send your message just now. Please try again, or
                  email us directly at {COMPANY.email}.
                </p>
              )}

              <div className="modal-actions modal-span">
                <button
                  type="submit"
                  className="btn btn-primary btn-lg btn-block modal-submit"
                  disabled={sending}
                >
                  {sending ? (
                    <>
                      <span className="modal-spinner" aria-hidden="true" />
                      Sending…
                    </>
                  ) : (
                    <>
                      Send question
                      <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" />
                    </>
                  )}
                </button>
                <p className="modal-foot">
                  Prefer email?{" "}
                  <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Modal;
