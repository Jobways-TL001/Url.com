// /payment?course=<id>: the required second step of a course enrolment.
//
// The enrolment form saves the learner's details (src/utils/enrolmentSession)
// and redirects here. This page shows the order, then hands over to the
// course's Stripe payment link, which the team manages in /admin -> Payment
// links. The learner's email is prefilled at checkout and the enquiry id is
// sent as client_reference_id, so each Stripe payment can be matched to its
// enrolment.
//
// /payment/success is the thank-you page. Set it as the payment link's
// "after payment" redirect in Stripe.
import { useEffect, useState } from "react";
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
import { COURSES, COURSE_FEE, TRACKS, labelOf } from "../../constants/courses";
import { loadEnrolment } from "../../utils/enrolmentSession";
import "./payment.css";
import { COMPANY } from "../../constants/company";
import { ROUTES } from "../../constants/routes";
import EnrollModal from "../Learnings/EnrollModal";
import { sentenceCase } from "../Learnings/courseUtils";
import { SuccessMark } from "../Modal/modal";

const CONTACT_EMAIL = COMPANY.email;

// Stripe payment links accept these query parameters: the email is filled
// in for the learner, and client_reference_id travels with the payment.
function checkoutUrl(base, enrolment) {
  try {
    const url = new URL(base);
    if (enrolment?.email) url.searchParams.set("prefilled_email", enrolment.email);
    if (enrolment?.submissionId && /^[\w-]{1,200}$/.test(enrolment.submissionId)) {
      url.searchParams.set("client_reference_id", enrolment.submissionId);
    }
    return url.toString();
  } catch {
    return base;
  }
}

function usePaymentLink(courseId) {
  const [state, setState] = useState({ status: "loading", url: null });

  useEffect(() => {
    if (!courseId) return undefined;
    const controller = new AbortController();
    setState({ status: "loading", url: null });
    fetch(`/api/payment-link?course=${encodeURIComponent(courseId)}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        if (res.status === 404) return setState({ status: "missing", url: null });
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        setState({ status: "ready", url: data.url });
      })
      .catch((error) => {
        if (error.name !== "AbortError") setState({ status: "error", url: null });
      });
    return () => controller.abort();
  }, [courseId]);

  return state;
}

// Details, then payment, then confirmed. `current` is the 0-based active step.
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
  const link = usePaymentLink(enrolment ? course.id : null);

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

                    <PayButton link={link} enrolment={enrolment} />
                  </>
                )}
                <HelpLine />
              </section>
            </div>

            <OrderSummary course={course} enrolment={enrolment} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// The order: course thumbnail, a few rows and the total.
function OrderSummary({ course, enrolment }) {
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
        <div>
          <dt>Fee</dt>
          <dd>{COURSE_FEE}</dd>
        </div>
      </dl>

      <div className="pay-total">
        <span>Total</span>
        <strong>{COURSE_FEE}</strong>
      </div>
      <p className="pay-fee-note">Your exact amount is shown on the Stripe checkout page.</p>
    </aside>
  );
}

function PayButton({ link, enrolment }) {
  if (link.status === "loading") {
    return (
      <div className="pay-loading" aria-live="polite">
        <span className="pay-spinner" aria-hidden="true" /> Preparing secure checkout…
      </div>
    );
  }

  if (link.status !== "ready") {
    // No link set for this course yet (or it could not be loaded). The
    // enrolment is already with the team, so they can send one.
    return (
      <div className="notice pay-pending" role="status">
        <strong>
          <FontAwesomeIcon icon={faClock} aria-hidden="true" />{" "}
          {link.status === "missing"
            ? "Online payment for this course is being set up."
            : "We couldn't load the checkout just now."}
        </strong>
        <p>
          Your details are saved. An advisor will email you a secure payment
          link within one business day, or you can write to{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
        {link.status === "error" && (
          <button type="button" className="btn btn-link pay-retry" onClick={() => window.location.reload()}>
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="pay-cta">
      <a className="btn btn-primary btn-lg btn-block pay-btn" href={checkoutUrl(link.url, enrolment)}>
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
