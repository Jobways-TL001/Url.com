import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DEFAULT_COUNTRY } from "../../constants/countries";
import {
  EXPERIENCE_LEVELS,
  BATCH_OPTIONS,
  labelOf,
} from "../../constants/courses";
import { STATE_OPTIONS } from "../../constants/usStates";
import { useCourseFees, feeForState, formatFee } from "../../utils/courseFees";
import { useUserState } from "../../utils/userState";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faXmark,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import CountrySelect from "../../components/CountrySelect/CountrySelect";
import {
  filters,
  validators,
  validateEnrollment,
  requiredPhone,
  composePhone,
} from "../../utils/formValidation";
import { saveEnrolment } from "../../utils/enrolmentSession";
// The enrolment panel is the enquiry modal with a different set of fields,
// so it reuses that dialog's focus handling and stylesheet rather than
// restating overlay, field, error and button rules that would then have to
// be kept in step.
import { useDialogFocus, SuccessMark } from "../Modal/modal";
import "../Modal/Modal.css";
import "./enroll.css";
import { COMPANY } from "../../constants/company";

const EMPTY = {
  name: "",
  email: "",
  number: "",
  state: "",
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
  state: (value) => (value ? "" : "Please choose your state."),
  experience: (value) =>
    value ? "" : "Please tell us where you are starting from.",
  batch: (value) => (value ? "" : "Please choose a batch."),
};

// What the team receives. The structured answers are folded into the message
// body because /api/send-email takes an enquiry shape: one endpoint, one set
// of anti-spam and header-safety rules, rather than a second one to maintain.
function describeEnrollment(course, data) {
  return [
    `Course enrolment request: ${course.title}`,
    ``,
    // Name, email and phone are not repeated here: the endpoint already
    // prints them as their own lines above the message.
    `State : ${labelOf(STATE_OPTIONS, data.state)}`,
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
  const dialogRef = useRef(null);
  const continueRef = useRef(null);

  useDialogFocus(isOpen, dialogRef);

  const sending = status === "sending";

  // The fee depends on the learner's state and is not shown until one is
  // chosen. Fees are fetched again each time the form opens.
  const courseFees = useCourseFees(isOpen);
  const stateFee = feeForState(courseFees, formData.state);
  const feeText =
    stateFee !== null
      ? formatFee(stateFee)
      : formData.state
        ? courseFees
          ? "Confirmed by our team"
          : "…"
        : null;

  // The state picked on the course cards, or detected from the IP address,
  // pre-fills the form; picking one here updates the cards too.
  const [userState, chooseState] = useUserState();
  useEffect(() => {
    if (isOpen && userState) {
      setFormData((prev) => (prev.state ? prev : { ...prev, state: userState }));
    }
  }, [isOpen, userState]);

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
    // The form has been replaced by the confirmation: put focus on its button.
    if (continueRef.current) continueRef.current.focus();
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
      if (
        e.key === "Escape" &&
        !e.defaultPrevented &&
        status !== "sending" &&
        status !== "ready"
      ) {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, status, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const key = name === "number" ? "phone" : name;
    const next = filters[key] ? filters[key](value) : value;

    setFormData((prev) => ({ ...prev, [name]: next }));
    if (name === "state") chooseState(next);

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
      state: true,
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
            state: labelOf(STATE_OPTIONS, formData.state),
            stateCode: formData.state,
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
        state: labelOf(STATE_OPTIONS, formData.state),
        // The payment page looks the fee up again by code, so it shows the
        // current figure rather than whatever was on screen here.
        stateCode: formData.state,
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
    `field modal-field${errorFor(field) ? " field-invalid modal-field-invalid" : ""}`;
  const done = status === "ready";

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`modal-container enroll-dialog${done ? " is-done" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="enroll-title"
        aria-describedby={done ? undefined : "enroll-desc"}
        aria-busy={sending || undefined}
      >
        {!done && (
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
            disabled={sending}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}

        {/* "Step 1 of 2" plus a thin progress bar: each step is one
            segment of the bar, labelled beneath. */}
        <div className="enroll-steps">
          <p className="enroll-step-count" aria-hidden="true">
            Step {done ? 2 : 1} of 2
          </p>
          <ol className="enroll-progress" aria-label="Enrolment steps">
            <li
              className={done ? "is-done" : "is-current"}
              aria-current={done ? undefined : "step"}
            >
              <span className="enroll-progress-label">Your details</span>
              {done && <span className="visually-hidden"> (completed)</span>}
            </li>
            <li
              className={done ? "is-current" : undefined}
              aria-current={done ? "step" : undefined}
            >
              <span className="enroll-progress-label">Payment</span>
            </li>
          </ol>
        </div>

        {done ? (
          /* The details are saved; payment is the required next step, so
             confirm and move straight on to the payment page. */
          <div className="modal-success enroll-done" role="status" aria-live="polite">
            <SuccessMark />
            <h2 id="enroll-title">Thanks, we've got your application</h2>
            <p>
              We've saved your details for {course.title}. Next, you'll pay
              securely on the payment page to confirm your place.
            </p>
            <p>
              Once you've paid, an advisor will contact you within one
              business day to confirm your batch and introduce your mentor.
            </p>
            <div className="enroll-countdown" aria-hidden="true">
              <span style={{ animationDuration: `${REDIRECT_SECONDS}s` }} />
            </div>
            <button
              type="button"
              ref={continueRef}
              className="btn btn-primary btn-lg"
              onClick={() => navigate(paymentPath)}
            >
              <FontAwesomeIcon icon={faLock} aria-hidden="true" />
              Continue to payment
            </button>
            <p className="enroll-pay-note">
              {countdown > 0
                ? `Taking you to secure payment in ${countdown}…`
                : "Taking you to secure payment…"}
            </p>
          </div>
        ) : (
          <>
            {/* Course summary, so the learner can see what they are enrolling
                in without leaving the form. */}
            <header className="modal-head enroll-head">
              <div className="enroll-thumb">
                <img
                  src={course.image}
                  alt=""
                  width="160"
                  height="160"
                  decoding="async"
                />
              </div>
              <div className="enroll-head-text">
                <h2 id="enroll-title">Apply for {course.title}</h2>
                <p className="enroll-facts">
                  {course.duration} · {course.mode}, Mon–Fri
                </p>
              </div>
              {stateFee !== null && (
                <p className="enroll-price">
                  <span className="enroll-price-label">Course fee</span>
                  <strong className="enroll-price-value">{formatFee(stateFee)}</strong>
                </p>
              )}
            </header>
            <p className="enroll-intro" id="enroll-desc">
              Tell us a little about yourself. It takes about a minute, and
              you'll pay on the next step to confirm your place.
            </p>

            <form
              className="modal-form modal-grid"
              onSubmit={handleSubmit}
              ref={formRef}
              noValidate
            >
              <div className={fieldClass("name")}>
                <label htmlFor="enroll-name" className="field-label">
                  Full name{" "}
                  <span className="field-required" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="enroll-name"
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
                  aria-describedby={
                    errorFor("name") ? "enroll-name-error" : undefined
                  }
                />
                {errorFor("name") && (
                  <span className="field-error" id="enroll-name-error">
                    {errorFor("name")}
                  </span>
                )}
              </div>

              <div className={fieldClass("email")}>
                <label htmlFor="enroll-email" className="field-label">
                  Email{" "}
                  <span className="field-required" aria-hidden="true">
                    *
                  </span>
                </label>
                <input
                  id="enroll-email"
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
                  aria-describedby={
                    errorFor("email") ? "enroll-email-error" : undefined
                  }
                />
                {errorFor("email") && (
                  <span className="field-error" id="enroll-email-error">
                    {errorFor("email")}
                  </span>
                )}
              </div>

              <div className={`${fieldClass("number")} modal-span`}>
                <label htmlFor="enroll-phone" className="field-label">
                  Phone{" "}
                  <span className="field-required" aria-hidden="true">
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
                    aria-required="true"
                    aria-invalid={Boolean(errorFor("number"))}
                    aria-describedby={
                      errorFor("number")
                        ? "enroll-phone-error"
                        : "enroll-phone-hint"
                    }
                  />
                </div>
                {errorFor("number") ? (
                  <span className="field-error" id="enroll-phone-error">
                    {errorFor("number")}
                  </span>
                ) : (
                  <span className="field-hint" id="enroll-phone-hint">
                    An advisor will call to confirm your batch
                  </span>
                )}
              </div>

              <div className={`${fieldClass("state")} modal-span`}>
                <label htmlFor="enroll-state" className="field-label">
                  State{" "}
                  <span className="field-required" aria-hidden="true">
                    *
                  </span>
                </label>
                <select
                  id="enroll-state"
                  className={`select${formData.state ? "" : " modal-select-placeholder"}`}
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={sending}
                  autoComplete="address-level1"
                  aria-required="true"
                  aria-invalid={Boolean(errorFor("state"))}
                  aria-describedby={
                    errorFor("state") ? "enroll-state-error" : "enroll-state-fee"
                  }
                >
                  <option value="">Select your state</option>
                  {STATE_OPTIONS.map((state) => (
                    <option key={state.value} value={state.value}>
                      {state.label}
                    </option>
                  ))}
                </select>
                {errorFor("state") ? (
                  <span className="field-error" id="enroll-state-error">
                    {errorFor("state")}
                  </span>
                ) : (
                  <span className="field-hint" id="enroll-state-fee" aria-live="polite">
                    {feeText
                      ? <>Course fee for your state: <strong>{feeText}</strong></>
                      : "Course fees are set by state."}
                  </span>
                )}
              </div>

              <div className={fieldClass("experience")}>
                <label htmlFor="enroll-experience" className="field-label">
                  Current level{" "}
                  <span className="field-required" aria-hidden="true">
                    *
                  </span>
                </label>
                <select
                  id="enroll-experience"
                  className={`select${
                    formData.experience ? "" : " modal-select-placeholder"
                  }`}
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={sending}
                  aria-required="true"
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
                  <span className="field-error" id="enroll-experience-error">
                    {errorFor("experience")}
                  </span>
                )}
              </div>

              <div className={fieldClass("batch")}>
                <label htmlFor="enroll-batch" className="field-label">
                  Preferred batch{" "}
                  <span className="field-required" aria-hidden="true">
                    *
                  </span>
                </label>
                <select
                  id="enroll-batch"
                  className={`select${formData.batch ? "" : " modal-select-placeholder"}`}
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={sending}
                  aria-required="true"
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
                  <span className="field-error" id="enroll-batch-error">
                    {errorFor("batch")}
                  </span>
                )}
              </div>

              <div className="field modal-field modal-span">
                <label htmlFor="enroll-message" className="field-label">
                  Anything we should know?{" "}
                  <span className="modal-optional">(optional)</span>
                </label>
                <textarea
                  id="enroll-message"
                  className="textarea"
                  name="message"
                  placeholder="Your goals, when you'd like to start, or any questions"
                  value={formData.message}
                  onChange={handleChange}
                  rows="3"
                  disabled={sending}
                />
              </div>

              {status === "error" && (
                <p className="notice notice-error modal-span" role="alert">
                  We couldn't save your details just now, so we've held off on
                  sending you to payment. Please try again, or email us at{" "}
                  <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
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
                      Saving your details…
                    </>
                  ) : (
                    <>
                      Continue to payment
                      <FontAwesomeIcon icon={faArrowRight} className="btn-arrow" aria-hidden="true" />
                    </>
                  )}
                </button>
                <p className="modal-foot enroll-secure">
                  <FontAwesomeIcon icon={faLock} aria-hidden="true" />
                  You'll pay on the next step through Stripe's secure checkout.
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default EnrollModal;
