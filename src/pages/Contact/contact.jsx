import React, { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faArrowRight,
  faCheck,
  faClock,
  faEnvelope,
  faLocationDot,
  faPaperPlane,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import "./contact.css";
import { DEFAULT_COUNTRY } from "../../constants/countries";
import CountrySelect from "../../components/CountrySelect/CountrySelect";
import {
  filters,
  validators,
  validateForm,
  composePhone,
  MAX,
} from "../../utils/formValidation";
import Header from "../Header/header";
import Footer from "../Footer/footer";
import { COMPANY, telHref } from "../../constants/company";
import { COURSES, TRACKS } from "../../constants/courses";
import { ROUTES } from "../../constants/routes";

// "Book a free call": a form card that asks three short sets of questions in
// turn (what you are interested in, who you are, anything else) and then
// posts the same enquiry the old single-page form did.
//
// The request sent to /api/send-email keeps exactly the old shape:
//   { name, number, email, service, message, source: "contact-page" }
// The interest chosen in step 1 sets `service` ("e-learning" for any course
// or "not sure", "general" for anything else — the values in
// src/constants/services.js) and is written as the first line of the
// message, so the email says which course the learner meant.

// Offices are configured in src/constants/company.js; with none, nothing
// about offices is rendered.
const locations = COMPANY.offices;

// Step 1 options. Every course, grouped by its catalogue track (TRACKS[0]
// is the "all courses" filter, not a track).
const TRACK_GROUPS = TRACKS.filter((t) => t.value !== "all")
  .map((track) => ({
    ...track,
    courses: COURSES.filter((c) => c.track === track.value),
  }))
  .filter((group) => group.courses.length > 0);

// The two options that are not a course.
const EXTRA_OPTIONS = [
  {
    id: "not-sure",
    title: "Not sure yet, help me choose",
    hint: "Tell us where you're starting from and we'll suggest a course.",
    line: "Not sure yet — help me choose a course",
    service: "e-learning",
  },
  {
    id: "other",
    title: "Something else",
    hint: "Questions about fees, batches, payments or anything else.",
    line: "Something else",
    service: "general",
  },
];

// id -> { title, line, service } for every selectable interest.
const INTERESTS = Object.fromEntries([
  ...COURSES.map((c) => [c.id, { title: c.title, line: c.title, service: "e-learning" }]),
  ...EXTRA_OPTIONS.map((o) => [o.id, o]),
]);

const interestLine = (id) => (INTERESTS[id] ? `Interested in: ${INTERESTS[id].line}` : "");

// The learner's own text, with the interest written above it.
const composeMessage = (id, message) => {
  const line = interestLine(id);
  const text = message.trim();
  return line ? `${line}\n\n${text}` : text;
};

const STEPS = [
  {
    label: "Your interest",
    title: "What are you interested in?",
    intro: "Choose a course, or pick \u201cNot sure yet\u201d and an advisor will help you decide.",
    fields: ["service"],
  },
  {
    label: "Your details",
    title: "Your details",
    intro: "We'll use these to get in touch about your call.",
    fields: ["name", "email", "number"],
  },
  {
    label: "Your message",
    title: "Anything else we should know?",
    intro: "Tell us about your background and goals, or ask about fees and timing.",
    fields: ["message"],
  },
];

// Which step owns each field, so a final check can send someone back to
// the step that needs fixing.
const STEP_OF = { service: 0, name: 1, email: 1, number: 1, message: 2 };

const NEXT_STEPS = [
  {
    title: "We reply within one business day",
    text: "An advisor reads your request and emails you back.",
  },
  {
    title: "We arrange a free call",
    text: "At a time that suits you, to talk about your background and goals.",
  },
  {
    title: "You get a recommendation",
    text: "The course and batch that suit you, and the course fee for your state.",
  },
];

const EMPTY = { name: "", number: "", email: "", service: "", message: "" };

// Form field name -> the validator that owns it. Shared with the homepage
// modal through src/utils/formValidation.js, so the forms accept exactly the
// same input.
const FIELD_VALIDATOR = {
  name: validators.name,
  email: validators.email,
  number: validators.phone,
  service: validators.service,
  message: validators.message,
};

const CHOOSE_ERROR = "Choose one option to continue.";

const ContactUsPage = () => {
  const [searchParams] = useSearchParams();
  // /contact?course=<id> arrives with that course already chosen.
  const preset = INTERESTS[searchParams.get("course")] ? searchParams.get("course") : "";

  const [step, setStep] = useState(0);
  const [interest, setInterest] = useState(preset);
  const [formData, setFormData] = useState({
    ...EMPTY,
    service: preset ? INTERESTS[preset].service : "",
  });
  const [country, setCountry] = useState(DEFAULT_COUNTRY);
  const [errors, setErrors] = useState({});
  // A field only shows an error once it has been left or its step
  // submitted, so the page does not scold someone mid-typing.
  const [touched, setTouched] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [announcement, setAnnouncement] = useState("");
  const [sentTo, setSentTo] = useState("");

  const formRef = useRef(null);
  const panelRef = useRef(null);
  const headingRef = useRef(null);
  const successRef = useRef(null);
  // The step focus was last moved for. Compared rather than a "has mounted"
  // flag, so React's development double-run of effects cannot steal focus
  // on first load.
  const focusedStep = useRef(step);

  const sending = submitStatus === "sending";
  const done = submitStatus === "success";

  // Bring a heading into focus (so screen readers announce the new step)
  // and make sure the top of the panel is on screen.
  const focusPanel = (ref) => {
    const el = ref.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    const top = panelRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 80 || top > window.innerHeight * 0.5) {
      panelRef.current?.scrollIntoView({ block: "start" });
    }
  };

  // Focus moves to the step heading whenever the step changes — but not on
  // first load, where focus belongs at the top of the page.
  useEffect(() => {
    if (focusedStep.current === step) return;
    focusedStep.current = step;
    if (!done) focusPanel(headingRef);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (done) focusPanel(successRef);
  }, [done]);

  const goTo = (index) => {
    if (sending) return;
    setAnnouncement("");
    setStep(index);
  };

  const chooseInterest = (id) => {
    setInterest(id);
    setFormData((prev) => ({ ...prev, service: INTERESTS[id].service }));
    setErrors((prev) => ({ ...prev, service: "" }));
  };

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

  // Put the cursor on a field (or, for step 1, on the chosen or first option).
  const focusField = (field) => {
    const form = formRef.current;
    if (!form) return;
    const el =
      field === "service"
        ? form.querySelector('input[name="interest"]:checked') ||
          form.querySelector('input[name="interest"]')
        : form.elements?.[field];
    if (el && typeof el.focus === "function") el.focus();
  };

  // Check only the current step's fields.
  const validateStep = (index) => {
    const found = {};
    STEPS[index].fields.forEach((field) => {
      found[field] =
        field === "service"
          ? interest
            ? FIELD_VALIDATOR.service(formData.service)
            : CHOOSE_ERROR
          : FIELD_VALIDATOR[field](formData[field], country);
    });
    setErrors((prev) => ({ ...prev, ...found }));
    setTouched((prev) => ({
      ...prev,
      ...Object.fromEntries(STEPS[index].fields.map((f) => [f, true])),
    }));
    return STEPS[index].fields.filter((f) => found[f]);
  };

  const announceErrors = (count) =>
    setAnnouncement(
      count === 1
        ? "One answer needs attention before you continue."
        : `${count} answers need attention before you continue.`
    );

  // Enter in any field submits the form, which moves to the next step (or
  // sends the request on the last one).
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;

    const invalid = validateStep(step);
    if (invalid.length) {
      announceErrors(invalid.length);
      focusField(invalid[0]);
      return;
    }

    if (step < STEPS.length - 1) {
      goTo(step + 1);
      return;
    }

    // Last step: recheck everything, in case an earlier answer changed.
    const { errors: found, isValid, firstInvalid } = validateForm(formData, country);
    if (!isValid) {
      setErrors(found);
      setTouched({ name: true, email: true, number: true, service: true, message: true });
      announceErrors(Object.values(found).filter(Boolean).length);
      goTo(STEP_OF[firstInvalid] ?? 0);
      return;
    }

    setAnnouncement("");
    setSubmitStatus("sending");
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          message: composeMessage(interest, formData.message),
          number: composePhone(country, formData.number),
          source: "contact-page",
        }),
      });

      if (response.ok) {
        setSentTo(formData.email.trim());
        setSubmitStatus("success");
        setFormData(EMPTY);
        setInterest("");
        setErrors({});
        setTouched({});
      } else {
        setSubmitStatus("error");
      }
    } catch {
      setSubmitStatus("error");
    }
  };

  // Ctrl/Cmd + Enter sends from inside the message box, where a plain Enter
  // starts a new line.
  const handleMessageKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      formRef.current?.requestSubmit?.();
    }
  };

  // Enter on an option continues to the next step. Not every browser treats
  // Enter on a radio button as a form submission, so do it explicitly.
  const handleOptionKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      formRef.current?.requestSubmit?.();
    }
  };

  const startOver = () => {
    setSubmitStatus(null);
    setSentTo("");
    setStep(0);
  };

  // Only render an error once the field has been touched.
  const errorFor = (field) => (touched[field] ? errors[field] : "");
  // `contact-field-invalid` is kept alongside the shared `field-invalid` so
  // the CountrySelect trigger can tint itself to match.
  const fieldClass = (field) =>
    `field flow-field${errorFor(field) ? " field-invalid contact-field-invalid" : ""}`;

  const phoneHref = telHref(COMPANY.phone);
  const current = STEPS[step];
  const headingId = `flow-step-${step + 1}-title`;
  const phonePreview = composePhone(country, formData.number);

  // ---- Step bodies --------------------------------------------------------

  // One card per option: a radio mark, the title and its level or a short
  // hint. The native radio stays in the card, visually hidden, so arrow keys
  // and screen readers work as usual.
  const renderOption = (id, title, meta, kind) => {
    const checked = interest === id;
    return (
      <label
        className={`flow-option flow-option-${kind}${checked ? " is-checked" : ""}`}
        key={id}
      >
        <input
          type="radio"
          name="interest"
          value={id}
          checked={checked}
          onChange={() => chooseInterest(id)}
          onKeyDown={handleOptionKeyDown}
          disabled={sending}
          className="flow-option-input"
        />
        <span className="flow-option-radio" aria-hidden="true" />
        <span className="flow-option-text">
          <span className="flow-option-title">{title}</span>
          {meta && <span className="flow-option-meta">{meta}</span>}
        </span>
      </label>
    );
  };

  const stepInterest = (
    <div
      role="radiogroup"
      aria-labelledby={headingId}
      aria-describedby={errorFor("service") ? "flow-interest-error" : undefined}
      aria-invalid={Boolean(errorFor("service"))}
      className="flow-options"
    >
      {TRACK_GROUPS.map((group) => (
        <div className="flow-group" key={group.value}>
          <p className="flow-group-label" aria-hidden="true">
            {group.label}
          </p>
          <div className="flow-group-options">
            {group.courses.map((course) =>
              renderOption(course.id, course.title, course.level, "course")
            )}
          </div>
        </div>
      ))}
      <div className="flow-group flow-group-extra">
        <p className="flow-group-label" aria-hidden="true">
          Other options
        </p>
        <div className="flow-group-options">
          {EXTRA_OPTIONS.map((o) => renderOption(o.id, o.title, o.hint, "extra"))}
        </div>
      </div>
      {errorFor("service") && (
        <p className="field-error flow-error" id="flow-interest-error">
          {errorFor("service")}
        </p>
      )}
    </div>
  );

  const stepAbout = (
    <div className="flow-fields">
      <div className={fieldClass("name")}>
        <label htmlFor="contact-name" className="field-label">
          Name <span className="field-required" aria-hidden="true">*</span>
        </label>
        <input
          id="contact-name"
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
          aria-describedby={errorFor("name") ? "contact-name-error" : undefined}
        />
        {errorFor("name") && (
          <span className="field-error" id="contact-name-error">
            {errorFor("name")}
          </span>
        )}
      </div>

      <div className={fieldClass("email")}>
        <label htmlFor="contact-email" className="field-label">
          Email <span className="field-required" aria-hidden="true">*</span>
        </label>
        <input
          id="contact-email"
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
          aria-describedby={errorFor("email") ? "contact-email-error" : "contact-email-hint"}
        />
        {errorFor("email") ? (
          <span className="field-error" id="contact-email-error">
            {errorFor("email")}
          </span>
        ) : (
          <span className="field-hint" id="contact-email-hint">
            We'll reply to this address.
          </span>
        )}
      </div>

      <div className={`${fieldClass("number")} flow-field-wide`}>
        <label htmlFor="contact-phone" className="field-label">
          Phone number <span className="flow-optional">(optional)</span>
        </label>
        <div className="contact-phone-group">
          <CountrySelect
            id="contact-country"
            value={country}
            onChange={handleCountryChange}
            disabled={sending}
          />
          <input
            id="contact-phone"
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
            aria-describedby={errorFor("number") ? "contact-phone-error" : "contact-phone-hint"}
          />
        </div>
        {errorFor("number") ? (
          <span className="field-error" id="contact-phone-error">
            {errorFor("number")}
          </span>
        ) : (
          <span className="field-hint" id="contact-phone-hint">
            Add it if you would rather we call you. Digits only.
          </span>
        )}
      </div>
    </div>
  );

  const reviewRows = [
    { label: "Interested in", value: INTERESTS[interest]?.title || "Not given", step: 0 },
    { label: "Name", value: formData.name.trim() || "Not given", step: 1 },
    { label: "Email", value: formData.email.trim() || "Not given", step: 1 },
    { label: "Phone", value: phonePreview || "Not given", step: 1 },
  ];

  const stepMessage = (
    <div className="flow-fields flow-fields-single">
      <div className={fieldClass("message")}>
        <label htmlFor="contact-message" className="field-label">
          Your message <span className="field-required" aria-hidden="true">*</span>
        </label>
        {interest && (
          <p className="flow-context" id="contact-message-context">
            We&rsquo;ll include your choice ({INTERESTS[interest].title}) at the top of
            your message.
          </p>
        )}
        <textarea
          id="contact-message"
          className="textarea"
          name="message"
          placeholder="e.g. I work in IT support and want to move into machine learning. Which course should I start with?"
          value={formData.message}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleMessageKeyDown}
          rows="5"
          disabled={sending}
          aria-required="true"
          aria-invalid={Boolean(errorFor("message"))}
          aria-describedby={[
            interest ? "contact-message-context" : "",
            errorFor("message") ? "contact-message-error" : "contact-message-hint",
          ]
            .filter(Boolean)
            .join(" ")}
        />
        {errorFor("message") ? (
          <span className="field-error" id="contact-message-error">
            {errorFor("message")}
          </span>
        ) : (
          <span className="field-hint flow-hint-row" id="contact-message-hint">
            <span>At least 10 characters.</span>
            <span aria-hidden="true">
              {formData.message.length}/{MAX.message}
            </span>
          </span>
        )}
      </div>

      <div className="flow-review" aria-labelledby="flow-review-title" role="group">
        <h3 className="flow-review-title" id="flow-review-title">
          Check your details
        </h3>
        <dl>
          {reviewRows.map((row) => (
            <div className="flow-review-row" key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
              <button
                type="button"
                className="btn btn-link flow-review-edit"
                onClick={() => goTo(row.step)}
                disabled={sending}
              >
                Edit<span className="visually-hidden"> {row.label.toLowerCase()}</span>
              </button>
            </div>
          ))}
        </dl>
      </div>

      {submitStatus === "error" && (
        <div className="notice notice-error flow-status" role="alert">
          <strong>We couldn&rsquo;t send your request.</strong>
          <span>
            Your answers are still here, so you can try again or email us at{" "}
            <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
          </span>
        </div>
      )}
    </div>
  );

  const stepBodies = [stepInterest, stepAbout, stepMessage];
  const isLast = step === STEPS.length - 1;

  // ---- Page -----------------------------------------------------------------

  const progress = `${((step + 1) / STEPS.length) * 100}%`;

  return (
    <>
      <Header />

      <section className="page-hero contact-hero" id="main" tabIndex={-1}>
        <div className="container">
          <div className="page-hero-inner">
            <h1>Book a free call with an advisor</h1>
            <p>
              Tell us a little about yourself and what you&rsquo;d like to learn. An
              advisor will reply within one business day.
            </p>
          </div>
        </div>
      </section>

      <section className="section contact-flow-section" aria-label="Book a free call">
        <div className="container flow-layout">
          <div className={`flow-panel${done ? " is-done" : ""}`} ref={panelRef}>
            {done ? (
              <div className="flow-success">
                <span className="flow-success-icon" aria-hidden="true">
                  <FontAwesomeIcon icon={faCheck} />
                </span>
                <h2 tabIndex={-1} ref={successRef} className="flow-success-title">
                  Thanks, your request has been sent
                </h2>
                <p className="flow-success-lead" role="status">
                  An advisor will email you within one business day to arrange a call.
                  {sentTo ? (
                    <>
                      {" "}We&rsquo;ve also sent a confirmation to <strong>{sentTo}</strong>.
                    </>
                  ) : null}
                </p>
                <div className="flow-success-actions">
                  <Link to={ROUTES.courses} className="btn btn-primary">
                    Browse courses
                  </Link>
                  <button type="button" className="btn btn-secondary" onClick={startOver}>
                    Send another request
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flow-form"
                ref={formRef}
                noValidate
                aria-labelledby={headingId}
              >
                <div className="flow-progress" aria-hidden="true">
                  <p className="flow-step-count">
                    Step {step + 1} of {STEPS.length}: {current.label}
                  </p>
                  <div className="flow-bar">
                    <span style={{ width: progress }} />
                  </div>
                </div>

                <div className="flow-step" key={step}>
                  <div className="flow-step-head">
                    <h2 id={headingId} tabIndex={-1} ref={headingRef}>
                      <span className="visually-hidden">
                        Step {step + 1} of {STEPS.length}:{" "}
                      </span>
                      {current.title}
                    </h2>
                    <p className="flow-step-intro">{current.intro}</p>
                  </div>

                  {stepBodies[step]}
                </div>

                <p className="visually-hidden" aria-live="polite">
                  {announcement}
                </p>

                <div className="flow-actions">
                  {step > 0 ? (
                    <button
                      type="button"
                      className="btn btn-secondary flow-back"
                      onClick={() => goTo(step - 1)}
                      disabled={sending}
                    >
                      <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
                      Back
                    </button>
                  ) : (
                    <span className="flow-actions-note">This takes about a minute.</span>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg flow-next-btn"
                    disabled={sending}
                  >
                    {isLast ? (sending ? "Sending…" : "Send request") : "Next"}
                    {!sending && (
                      <FontAwesomeIcon
                        icon={isLast ? faPaperPlane : faArrowRight}
                        className="btn-arrow"
                      />
                    )}
                  </button>
                </div>
                {isLast && (
                  <p className="flow-shortcut" aria-hidden="true">
                    You can also press Ctrl + Enter (or &#8984; + Enter on a Mac) to send.
                  </p>
                )}
              </form>
            )}
          </div>

          <aside className="flow-aside" aria-label="About your request">
            {/* Contact methods: one card per channel, the whole card is the link. */}
            <div className="contact-direct">
              <h2 className="flow-aside-title">Prefer email?</h2>
              <ul className="contact-direct-list">
                {COMPANY.email && (
                  <li className="contact-method is-link">
                    <span className="icon-tile contact-method-icon" aria-hidden="true">
                      <FontAwesomeIcon icon={faEnvelope} />
                    </span>
                    <span className="contact-method-text">
                      <span className="contact-method-label">Email</span>
                      <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
                    </span>
                  </li>
                )}
                {phoneHref && (
                  <li className="contact-method is-link">
                    <span className="icon-tile contact-method-icon" aria-hidden="true">
                      <FontAwesomeIcon icon={faPhone} />
                    </span>
                    <span className="contact-method-text">
                      <span className="contact-method-label">Phone</span>
                      <a href={phoneHref}>{COMPANY.phone}</a>
                    </span>
                  </li>
                )}
                {locations[0]?.address && (
                  <li className="contact-method">
                    <span className="icon-tile contact-method-icon" aria-hidden="true">
                      <FontAwesomeIcon icon={faLocationDot} />
                    </span>
                    <span className="contact-method-text">
                      <span className="contact-method-label">Address</span>
                      <span>{locations[0].address}</span>
                    </span>
                  </li>
                )}
                {COMPANY.hours && (
                  <li className="contact-method">
                    <span
                      className="icon-tile icon-tile-teal contact-method-icon"
                      aria-hidden="true"
                    >
                      <FontAwesomeIcon icon={faClock} />
                    </span>
                    <span className="contact-method-text">
                      <span className="contact-method-label">Hours</span>
                      <span>{COMPANY.hours}</span>
                    </span>
                  </li>
                )}
              </ul>
            </div>

            {/* Reassurance: what happens after the form is sent. */}
            <div className="flow-aside-card">
              <h2 className="flow-aside-title">What happens next</h2>
              <ol className="flow-aside-steps">
                {NEXT_STEPS.map((item, index) => (
                  <li key={item.title}>
                    <span className="step-num" aria-hidden="true">
                      {index + 1}
                    </span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>

        {/* Offices, only when configured in src/constants/company.js. */}
        {locations.length > 0 && (
          <div className="container">
            <section className="contact-offices" aria-labelledby="contact-offices-title">
              <h2 className="contact-offices-title" id="contact-offices-title">
                Our offices
              </h2>
              <ul className="contact-offices-list">
                {locations.map((office, index) => (
                  <li key={`${office.city}-${index}`}>
                    <strong>{office.city}</strong>
                    {office.company && <span>{office.company}</span>}
                    {office.address && <span>{office.address}</span>}
                    {office.phone && (
                      <a href={telHref(office.phone) || undefined}>{office.phone}</a>
                    )}
                    {office.email && <a href={`mailto:${office.email}`}>{office.email}</a>}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </section>

      <Footer />
    </>
  );
};

export default ContactUsPage;
