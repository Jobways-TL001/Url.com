import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DEFAULT_COUNTRY } from "../../constants/countries";
import {
  EXPERIENCE_LEVELS,
  BATCH_OPTIONS,
  labelOf,
  COURSE_FEE,
} from "../../constants/courses";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import CountrySelect from "../../components/CountrySelect/CountrySelect";
import {
  filters,
  validators,
  validateEnrollment,
  requiredPhone,
  composePhone,
} from "../../utils/formValidation";
// The enrolment panel is the enquiry modal with a different set of fields,
// so it reuses that stylesheet rather than restating overlay, field, error
// and button rules that would then have to be kept in step.
import { saveEnrolment } from "../../utils/enrolmentSession";
import "../Modal/Modal.css";
import "./enroll.css";

const EMPTY = {
  name: "",
  email: "",
  number: "",
  experience: "",
  batch: "weekday", // the only batch, so it starts selected
  message: "",
};

// Form field name -> the validator that owns it, for the per-field checks
// that run on blur. The whole-form pass uses validateEnrollment.
const FIELD_VALIDATOR = {
  name: validators.name,
  email: validators.email,
  number: requiredPhone,
  experience: (value) =>
    value ? "" : "Please tell us where you are starting from.",
  batch: (value) => (value ? "" : "Please choose a batch."),
};

// What the team receives. The structured answers are folded into the message
// body because /api/send-email takes an enquiry shape — one endpoint, one set
// of anti-spam and header-safety rules, rather than a second one to maintain.
function describeEnrollment(course, data) {
  return [
    `Course enrolment request: ${course.title}`,
    ``,
    // Name, email and phone are not repeated here: the endpoint already
    // prints them as their own lines above the message.
    `Current level : ${labelOf(EXPERIENCE_LEVELS, data.experience)}`,
    `Preferred batch : ${labelOf(BATCH_OPTIONS, data.batch)}`,
    ``,
    data.message.trim()
      ? `Notes from the learner:\n${data.message.trim()}`
      : `No additional notes.`,
    ``,
    `The learner was sent to the payment page after submitting this form.`,
  ].join("\n");
}

// How long the "details received" confirmation shows before the learner is
// taken to the payment page. Long enough to read, short enough not to wait.
const REDIRECT_SECONDS = 3;

const EnrollModal = ({ course, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const [formData, setFormData] = useState(EMPTY);
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [errors, setErrors] = useState({});
  // A field only shows an error once it has been left or the form submitted,
  // so a freshly opened panel is not covered in red.
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState(null); // null | "sending" | "ready" | "error"
  const formRef = useRef(null);

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

  const paymentPath = `/payment?course=${encodeURIComponent(course?.id || "")}`;

  // Payment is the mandatory next step: once the details are saved, count
  // down and move to the payment page.
  useEffect(() => {
    if (status !== "ready") return undefined;
    setCountdown(REDIRECT_SECONDS);
    const tick = setInterval(() => setCountdown((n) => Math.max(0, n - 1)), 1000);
    const go = setTimeout(() => navigate(paymentPath), REDIRECT_SECONDS * 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(go);
    };
  }, [status, navigate, paymentPath]);

  // Close on Escape, unless a send is in flight.
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => {
      if (e.key === "Escape" && status !== "sending" && status !== "ready") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, status, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const key = name === "number" ? "phone" : name;
    const next = filters[key] ? filters[key](value) : value;

    setFormData((prev) => ({ ...prev, [name]: next }));

    // Clear an error as soon as it is fixed, rather than making the learner
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

    const { errors: found, isValid, firstInvalid } = validateEnrollment(formData, country);
    setErrors(found);
    setTouched({
      name: true,
      email: true,
      number: true,
      experience: true,
      batch: true,
    });

    if (!isValid) {
      // Put the cursor on the first problem so it is obvious what to fix.
      const el = formRef.current?.elements?.[firstInvalid];
      if (el && typeof el.focus === "function") el.focus();
      return;
    }

    setStatus("sending");
    const phone = composePhone(country, formData.number);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          number: phone,
          service: "e-learning",
          // The team's notification reads this summary...
          message: describeEnrollment(course, formData),
          source: "course-enrollment",
          // ...and the learner's confirmation lists these as separate rows.
          enrolment: {
            course: course.title,
            courseId: course.id,
            experience: labelOf(EXPERIENCE_LEVELS, formData.experience),
            batch: labelOf(BATCH_OPTIONS, formData.batch),
            notes: formData.message.trim(),
          },
        }),
      });

      // The details are captured before payment on purpose: if someone
      // abandons checkout, we still know who wanted a place and can follow
      // it up. A failed capture is therefore worth retrying rather than
      // waving through.
      if (!response.ok) {
        setStatus("error");
        return;
      }
      const result = await response.json().catch(() => ({}));
      saveEnrolment({
        courseId: course.id,
        submissionId: result.id || null,
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone,
        experience: labelOf(EXPERIENCE_LEVELS, formData.experience),
        batch: labelOf(BATCH_OPTIONS, formData.batch),
      });
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && status !== "sending" && status !== "ready") onClose();
  };

  if (!isOpen) return null;

  // Only render an error once the field has been touched, so a pristine form
  // opens clean.
  const errorFor = (field) => (touched[field] ? errors[field] : "");
  const fieldClass = (field) =>
    `modal-field${errorFor(field) ? " modal-field-invalid" : ""}`;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        className={`modal-container modal-wide${status === "ready" ? " is-done" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="enroll-title"
      >
        {status !== "ready" && (
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
            disabled={sending}
          >
            &times;
          </button>
        )}

        {status === "ready" ? (
          /* The details are saved; payment is the required next step, so
             confirm and move straight on to the payment page. */
          <div className="enroll-done" role="status" aria-live="polite">
            <div className="modal-success-icon" aria-hidden="true">
              &#10003;
            </div>
            <h2 id="enroll-title">Details submitted successfully</h2>
            <p>
              Thank you, {formData.name.trim().split(/\s+/)[0] || "there"}. We
              have your details for {course.title}. Complete your payment on
              the next page to confirm your seat.
            </p>
            <button
              type="button"
              className="enroll-pay-btn"
              onClick={() => navigate(paymentPath)}
            >
              Continue to Payment
            </button>
            <p className="enroll-pay-note">
              {countdown > 0
                ? `Taking you to secure payment in ${countdown}…`
                : "Taking you to secure payment…"}
            </p>
          </div>
        ) : (
          <div className="modal-split">
            {/* Course summary, so the learner can see what they are enrolling
                in without leaving the form. */}
            <aside className="modal-aside enroll-summary">
              <div className="enroll-summary-media">
                <img src={course.image} alt="" />
              </div>
              <div className="enroll-summary-body">
                <span className="enroll-summary-level">{course.level}</span>
                <h3>{course.title}</h3>
                <dl className="enroll-summary-facts">
                  <div>
                    <dt>Duration</dt>
                    <dd>{course.duration}</dd>
                  </div>
                  <div>
                    <dt>Format</dt>
                    <dd>{course.mode}</dd>
                  </div>
                  <div>
                    <dt>Schedule</dt>
                    <dd>Monday – Friday</dd>
                  </div>
                  <div>
                    <dt>Course fee</dt>
                    <dd>{COURSE_FEE}</dd>
                  </div>
                </dl>
                <p className="enroll-summary-secure">
                  <FontAwesomeIcon icon={faLock} />
                  Secure payment by Stripe
                </p>
              </div>
            </aside>

            <div className="modal-main">
            <ol className="enroll-steps" aria-label="Enrolment steps">
              <li className="is-current" aria-current="step">
                <span>1</span> Your details
              </li>
              <li>
                <span>2</span> Payment
              </li>
            </ol>

            <div className="modal-heading">
              <h2 id="enroll-title">Enrol in {course.title}</h2>
              <p>
                Tell us a little about yourself. You will complete payment on
                the next step to confirm your seat.
              </p>
            </div>

            <form
              className="modal-form modal-grid"
              onSubmit={handleSubmit}
              ref={formRef}
              noValidate
            >
              <div className={fieldClass("name")}>
                <label htmlFor="enroll-name">
                  Full name{" "}
                  <span className="modal-required" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="enroll-name"
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={sending}
                  autoComplete="name"
                  aria-invalid={Boolean(errorFor("name"))}
                  aria-describedby={
                    errorFor("name") ? "enroll-name-error" : undefined
                  }
                />
                {errorFor("name") && (
                  <span className="modal-field-error" id="enroll-name-error">
                    {errorFor("name")}
                  </span>
                )}
              </div>

              <div className={fieldClass("email")}>
                <label htmlFor="enroll-email">
                  Email{" "}
                  <span className="modal-required" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="enroll-email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={sending}
                  autoComplete="email"
                  aria-invalid={Boolean(errorFor("email"))}
                  aria-describedby={
                    errorFor("email") ? "enroll-email-error" : undefined
                  }
                />
                {errorFor("email") && (
                  <span className="modal-field-error" id="enroll-email-error">
                    {errorFor("email")}
                  </span>
                )}
              </div>

              <div className={`${fieldClass("number")} modal-span`}>
                <label htmlFor="enroll-phone">
                  Phone{" "}
                  <span className="modal-required" aria-hidden="true">
                    *
                  </span>
                </label>
                <div className="modal-phone-group">
                  <CountrySelect
                    id="enroll-country"
                    value={country}
                    onChange={handleCountryChange}
                    disabled={sending}
                  />
                  <input
                    id="enroll-phone"
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
                      errorFor("number")
                        ? "enroll-phone-error"
                        : "enroll-phone-hint"
                    }
                  />
                </div>
                {errorFor("number") ? (
                  <span className="modal-field-error" id="enroll-phone-error">
                    {errorFor("number")}
                  </span>
                ) : (
                  <span className="modal-field-hint" id="enroll-phone-hint">
                    A mentor will call to confirm your batch
                  </span>
                )}
              </div>

              <div className={fieldClass("experience")}>
                <label htmlFor="enroll-experience">
                  Current level{" "}
                  <span className="modal-required" aria-hidden="true">
                    *
                  </span>
                </label>
                <select
                  id="enroll-experience"
                  className={
                    formData.experience ? "" : "modal-select-placeholder"
                  }
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={sending}
                  aria-invalid={Boolean(errorFor("experience"))}
                  aria-describedby={
                    errorFor("experience")
                      ? "enroll-experience-error"
                      : undefined
                  }
                >
                  <option value="">Where are you starting from?</option>
                  {EXPERIENCE_LEVELS.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                {errorFor("experience") && (
                  <span
                    className="modal-field-error"
                    id="enroll-experience-error"
                  >
                    {errorFor("experience")}
                  </span>
                )}
              </div>

              <div className={fieldClass("batch")}>
                <label htmlFor="enroll-batch">
                  Preferred batch{" "}
                  <span className="modal-required" aria-hidden="true">
                    *
                  </span>
                </label>
                <select
                  id="enroll-batch"
                  className={formData.batch ? "" : "modal-select-placeholder"}
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={sending}
                  aria-invalid={Boolean(errorFor("batch"))}
                  aria-describedby={
                    errorFor("batch") ? "enroll-batch-error" : undefined
                  }
                >
                  {BATCH_OPTIONS.map((batch) => (
                    <option key={batch.value} value={batch.value}>
                      {batch.label}
                    </option>
                  ))}
                </select>
                {errorFor("batch") && (
                  <span className="modal-field-error" id="enroll-batch-error">
                    {errorFor("batch")}
                  </span>
                )}
              </div>

              <div className="modal-field modal-span">
                <label htmlFor="enroll-message">
                  Anything we should know?{" "}
                  <span className="enroll-optional">(optional)</span>
                </label>
                <textarea
                  id="enroll-message"
                  name="message"
                  placeholder="Your goals, timing, or questions about the programme"
                  value={formData.message}
                  onChange={handleChange}
                  rows="3"
                  disabled={sending}
                />
              </div>

              {status === "error" && (
                <p className="modal-error" role="alert">
                  We couldn't save your details just now, so we've held off on
                  sending you to payment. Please try again, or email us at
                  contactus@url.com.
                </p>
              )}

              <button type="submit" className="modal-submit modal-submit-full" disabled={sending}>
                {sending ? "Submitting..." : "Continue to Payment"}
              </button>
            </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollModal;
