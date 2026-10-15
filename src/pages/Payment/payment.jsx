// /payment?course=<id> — the required second step of a course enrolment.
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
  faCheck,
  faShieldHalved,
  faCircleCheck,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import Header from "../Header/header";
import Footer from "../Footer/footer";
import { COURSES, COURSE_FEE } from "../../constants/courses";
import { loadEnrolment } from "../../utils/enrolmentSession";
import "./payment.css";

const CONTACT_EMAIL = "contactus@url.com";

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

export default function PaymentPage() {
  const [params] = useSearchParams();
  const course = COURSES.find((c) => c.id === params.get("course"));
  const enrolment = course ? loadEnrolment(course.id) : null;
  const link = usePaymentLink(enrolment ? course.id : null);

  if (!course) return <Navigate to="/ai-courses" replace />;

  return (
    <>
      <Header />
      <main className="pay-page" id="main" tabIndex={-1}>
        <div className="container pay-container">
          <ol className="pay-steps" aria-label="Enrolment steps">
            <li className="is-done">
              <span>
                <FontAwesomeIcon icon={faCheck} />
              </span>
              Your details
            </li>
            <li className="is-current" aria-current="step">
              <span>2</span> Payment
            </li>
          </ol>

          <h1 className="pay-title">Complete your enrolment</h1>
          <p className="pay-lead">
            Your seat in <strong>{course.title}</strong> is confirmed once
            payment is complete.
          </p>

          <div className="pay-grid">
            <OrderSummary course={course} enrolment={enrolment} />

            <section className="pay-card pay-action" aria-labelledby="pay-heading">
              {!enrolment ? (
                <NoEnrolment course={course} />
              ) : (
                <>
                  <h2 id="pay-heading">Your details</h2>
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

                  <PayButton link={link} enrolment={enrolment} />
                </>
              )}
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function OrderSummary({ course, enrolment }) {
  return (
    <aside className="pay-card pay-summary" aria-label="Order summary">
      <div className="pay-summary-media">
        <img src={course.image} alt="" />
      </div>
      <div className="pay-summary-body">
        <span className="pay-summary-level">{course.level}</span>
        <h2>{course.title}</h2>
        <dl className="pay-facts">
          <div>
            <dt>Duration</dt>
            <dd>{course.duration}</dd>
          </div>
          <div>
            <dt>Format</dt>
            <dd>{course.mode}</dd>
          </div>
          <div>
            <dt>Batch</dt>
            <dd>{enrolment?.batch || "Monday – Friday"}</dd>
          </div>
          {enrolment?.experience && (
            <div>
              <dt>Your level</dt>
              <dd>{enrolment.experience}</dd>
            </div>
          )}
          <div className="pay-facts-total">
            <dt>Course fee</dt>
            <dd>{COURSE_FEE}</dd>
          </div>
        </dl>
        <p className="pay-fee-note">The exact amount is shown on the secure Stripe checkout.</p>
      </div>
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
      <div className="pay-pending" role="status">
        <FontAwesomeIcon icon={faClock} />
        <div>
          <strong>
            {link.status === "missing"
              ? "Online payment for this course is being set up."
              : "We couldn't load the checkout just now."}
          </strong>
          <p>
            Your details are saved. A URL counsellor will email you a
            secure payment link within one business day, or write to{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
          {link.status === "error" && (
            <button type="button" className="btn-link" onClick={() => window.location.reload()}>
              Try again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <a className="btn btn-primary btn-lg btn-block pay-btn" href={checkoutUrl(link.url, enrolment)}>
        <FontAwesomeIcon icon={faLock} /> Pay Securely with Stripe
      </a>
      <ul className="pay-trust">
        <li>
          <FontAwesomeIcon icon={faShieldHalved} />
          Payment is processed by Stripe. URL never sees or stores your card details.
        </li>
        <li>
          <FontAwesomeIcon icon={faCircleCheck} />
          After payment, a counsellor confirms your batch and start date within one business day.
        </li>
      </ul>
    </>
  );
}

function NoEnrolment({ course }) {
  return (
    <div className="pay-empty">
      <h2 id="pay-heading">Start with your details</h2>
      <p>
        To pay for {course.title}, first tell us a little about yourself. It
        takes under a minute, and you will come straight back here.
      </p>
      <Link className="btn btn-primary btn-block" to={`/ai-courses#course-${course.id}`}>
        Enrol in {course.title}
      </Link>
    </div>
  );
}

// /payment/success — where Stripe sends the learner after paying.
export function PaymentSuccess() {
  return (
    <>
      <Header />
      <main className="pay-page" id="main" tabIndex={-1}>
        <div className="container pay-container">
          <section className="pay-card pay-thanks" role="status">
            <div className="pay-thanks-icon" aria-hidden="true">
              <FontAwesomeIcon icon={faCheck} />
            </div>
            <h1>Payment received — you're enrolled!</h1>
            <p>
              Thank you. Stripe has emailed your receipt. A URL counsellor
              will contact you within one business day to confirm your batch,
              start date and mentor.
            </p>
            <div className="pay-thanks-actions">
              <Link className="btn btn-primary" to="/ai-courses">
                Explore other courses
              </Link>
              <Link className="btn btn-secondary" to="/">
                Back to home
              </Link>
            </div>
            <p className="pay-fee-note">
              Questions? Email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
