// /payment?course=<id>: the required second step of a course enrolment.
//
// The enrolment form saves the learner's details (src/utils/enrolmentSession)
// and redirects here. This page shows the order and the course fee for the
// learner's state, then hands over to Stripe Checkout through
// /api/checkout, which charges exactly that fee. The learner's email is
// prefilled and the enquiry id is sent as client_reference_id, so each
// Stripe payment is matched to its enrolment.
//
// /payment/success is the thank-you page; api/checkout.js sends Stripe's
// success redirect there.
import { useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLock,
  faShieldHalved,
  faCircleCheck,
  faClock,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import Header from "../Header/header";
import Footer from "../Footer/footer";
import { COURSES, TRACKS, labelOf } from "../../constants/courses";
import { loadEnrolment } from "../../utils/enrolmentSession";
import { useCourseFees, feeForState, formatFee } from "../../utils/courseFees";
import "./payment.css";
import { COMPANY } from "../../constants/company";
import { ROUTES } from "../../constants/routes";
import EnrollModal from "../Learnings/EnrollModal";
import { sentenceCase } from "../Learnings/courseUtils";
import { SuccessMark } from "../Modal/modal";

const CONTACT_EMAIL = COMPANY.email;

// The Stripe checkout for this enrolment: api/checkout.js looks up the
// enquiry, prices it from the learner's state and opens a Stripe Checkout
// for exactly that amount.
function checkoutPath(enrolment) {
  const id = enrolment?.submissionId;
  return id && /^[\w-]{1,200}$/.test(id) ? `/api/checkout?enquiry=${encodeURIComponent(id)}` : null;
}

function Steps({ current }) {
  const steps = ["Your details", "Payment", "Confirmed"];
  return (
    <ol className="pay-steps" aria-label="Enrolment steps">
      {steps.map((label, i) => {
        const done = i < current;
        const isCurrent = i === current;
        return (
          <li
            key={label}
            className={done ? "is-done" : isCurrent ? "is-current" : undefined}
            aria-current={isCurrent ? "step" : undefined}
          >
            <span className="pay-steps-num" aria-hidden="true">
              {done ? <FontAwesomeIcon icon={faCheck} /> : i + 1}
            </span>
            <span className="pay-steps-label">{label}</span>
            {done && <span className="visually-hidden"> (completed)</span>}
          </li>
        );
      })}
    </ol>
  );
}

function HelpLine() {
  return (
    <p className="pay-help">
      Need help with your enrolment? Email{" "}
      <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      {COMPANY.hours && <span className="pay-help-hours"> {COMPANY.hours}</span>}
    </p>
  );
}

export default function PaymentPage() {
  const [params] = useSearchParams();
  const course = COURSES.find((c) => c.id === params.get("course"));
  const enrolment = course ? loadEnrolment(course.id) : null;
  // The fee for the state given on the enrolment form. Payment is only
  // offered when there is one and Stripe can charge it (STRIPE_SECRET_KEY
  // set); otherwise the team follows up with the learner by email.
  const courseFees = useCourseFees();
  const stateFee = feeForState(courseFees, enrolment?.stateCode);
  const canPay = Boolean(courseFees?.checkout) && stateFee !== null && Boolean(checkoutPath(enrolment));
  const checkoutFailed = params.get("checkout") === "error";

  if (!course) return <Navigate to={ROUTES.courses} replace />;

  return (
    <>
      <Header />
      <main className="pay-page" id="main" tabIndex={-1}>
        <div className="container">
          <Steps current={enrolment ? 1 : 0} />

          <div className="pay-grid">
            <div className="pay-main">
              <h1 className="pay-title">Complete your enrolment</h1>
              <p className="pay-lead">
                Your place on <strong>{course.title}</strong> is confirmed as
                soon as your payment goes through.
              </p>

              <section className="pay-action" aria-labelledby="pay-heading">
                {!enrolment ? (
                  <NoEnrolment course={course} />
                ) : (
                  <>
                    <div className="pay-card">
                      <div className="pay-section-head">
                        <h2 id="pay-heading">Your details</h2>
                        <span className="pay-saved">
                          <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" /> Saved
                        </span>
                      </div>
                      <dl className="pay-details">
                        <div>
                          <dt>Name</dt>
                          <dd>{enrolment.name}</dd>
                        </div>
                        <div>
                          <dt>Email</dt>
                          <dd>{enrolment.email}</dd>
                        </div>
                        <div>
                          <dt>Phone</dt>
                          <dd>{enrolment.phone}</dd>
                        </div>
                      </dl>
                    </div>

                    {checkoutFailed && (
                      <div className="notice pay-pending" role="alert">
                        <strong>
                          <FontAwesomeIcon icon={faClock} aria-hidden="true" />{" "}
                          We couldn't open the secure checkout just now.
                        </strong>
                        <p>
                          You have not been charged. Please try again, or write to{" "}
                          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
                        </p>
                      </div>
                    )}
                    <PayButton
                      loading={!courseFees}
                      href={canPay ? checkoutPath(enrolment) : null}
                    />
                  </>
                )}
                <HelpLine />
              </section>
            </div>

            <OrderSummary
              course={course}
              enrolment={enrolment}
              fee={
                stateFee !== null
                  ? formatFee(stateFee)
                  : enrolment && !courseFees
                    ? "…"
                    : "Confirmed by our team"
              }
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// The order: course thumbnail, a few rows and the total.
function OrderSummary({ course, enrolment, fee }) {
  return (
    <aside className="pay-summary" aria-labelledby="pay-summary-title">
      <h2 id="pay-summary-title" className="pay-summary-title">
        Order summary
      </h2>

      <div className="pay-summary-course">
        <img src={course.image} alt="" width="640" height="360" decoding="async" />
        <div>
          <p className="pay-summary-name">{course.title}</p>
          <p className="pay-summary-track">
            {labelOf(TRACKS, course.track)} · {sentenceCase(course.level)}
          </p>
        </div>
      </div>

      <dl className="pay-rows">
        <div>
          <dt>Course</dt>
          <dd>{course.title}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{course.duration}</dd>
        </div>
        <div>
          <dt>Schedule</dt>
          <dd>
            {course.mode}, {enrolment?.batch || "Monday to Friday"}
          </dd>
        </div>
        {enrolment?.experience && (
          <div>
            <dt>Your level</dt>
            <dd>{enrolment.experience}</dd>
          </div>
        )}
        {enrolment?.state && (
          <div>
            <dt>State</dt>
            <dd>{enrolment.state}</dd>
          </div>
        )}
      </dl>

      <div className="pay-total">
        <span>Course fee</span>
        <strong>{fee}</strong>
      </div>
      <p className="pay-fee-note">
        The fee is set for your state. The exact amount is shown on the Stripe checkout page.
      </p>
    </aside>
  );
}

// `href` is the state-priced checkout, or null when online payment is not
// available for this enrolment (outside the US, no fee for the state yet,
// or Stripe not configured). The enquiry is already saved, so the team
// follows up by email.
function PayButton({ loading, href }) {
  if (loading) {
    return (
      <div className="pay-loading" aria-live="polite">
        <span className="pay-spinner" aria-hidden="true" /> Preparing secure checkout…
      </div>
    );
  }

  if (!href) {
    return (
      <div className="notice pay-pending" role="status">
        <strong>
          <FontAwesomeIcon icon={faClock} aria-hidden="true" /> Our team will confirm your fee and payment.
        </strong>
        <p>
          Your details are saved. An advisor will email you within one business
          day with your course fee and how to pay, or you can write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </div>
    );
  }

  return (
    <div className="pay-cta">
      <a className="btn btn-primary btn-lg btn-block pay-btn" href={href}>
        <FontAwesomeIcon icon={faLock} aria-hidden="true" /> Pay securely with Stripe
      </a>
      <ul className="pay-trust">
        <li>
          <FontAwesomeIcon icon={faShieldHalved} aria-hidden="true" />
          Payments are handled by Stripe. We never see or store your card details.
        </li>
        <li>
          <FontAwesomeIcon icon={faCircleCheck} aria-hidden="true" />
          After you pay, an advisor will confirm your batch and start date within one business day.
        </li>
      </ul>
    </div>
  );
}

// No saved details for this course yet (a new tab, or the link was shared):
// the application form opens right here, and saving it reloads this page
// with the details in place.
function NoEnrolment({ course }) {
  const [applying, setApplying] = useState(false);
  return (
    <div className="pay-card pay-empty">
      <h2 id="pay-heading">Start with your details</h2>
      <p>
        Before you pay for {course.title}, we need a few details about you.
        It takes about a minute and you'll stay on this page.
      </p>
      <div className="pay-empty-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setApplying(true)}
        >
          Apply now
        </button>
        <Link className="btn btn-secondary" to={ROUTES.course(course.id)}>
          Back to the course
        </Link>
      </div>
      {applying && (
        <EnrollModal course={course} isOpen={applying} onClose={() => setApplying(false)} />
      )}
    </div>
  );
}

const NEXT_STEPS = [
  {
    title: "Check your inbox",
    text: "Stripe has emailed you a receipt for your payment.",
  },
  {
    title: "Hear from your advisor",
    text: "We'll be in touch within one business day to confirm your batch, start date and mentor.",
  },
  {
    title: "Join your first class",
    text: "Classes are live online, Monday to Friday.",
  },
];

// /payment/success: where Stripe sends the learner after paying.
export function PaymentSuccess() {
  return (
    <>
      <Header />
      <main className="pay-page pay-page-success" id="main" tabIndex={-1}>
        <div className="container">
          <section className="pay-done" role="status">
            <SuccessMark />

            <h1>Payment received, you're enrolled</h1>
            <p className="pay-done-lead">
              Thank you for enrolling with {COMPANY.name}. Here's what happens
              next.
            </p>

            <ol className="pay-next">
              {NEXT_STEPS.map((step, i) => (
                <li key={step.title}>
                  <span className="step-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="pay-done-actions">
              <Link className="btn btn-primary" to={ROUTES.courses}>
                Browse other courses
              </Link>
              <Link className="btn btn-secondary" to={ROUTES.home}>
                Back to home
              </Link>
            </div>
            <p className="pay-done-foot">
              Questions? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
