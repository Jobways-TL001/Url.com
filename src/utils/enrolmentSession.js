// Hands the just-submitted enrolment from the enrolment form to the /payment
// page. Kept in sessionStorage (this tab only, cleared when it closes) rather
// than the URL, so the learner's name, email and phone never end up in
// browser history, server logs or a shared link.

const KEY = "url:enrolment";
// After this long the payment page asks the learner to enrol again, rather
// than charging against details from a stale session.
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function saveEnrolment(enrolment) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ ...enrolment, savedAt: Date.now() }));
  } catch {
    // Private mode or storage full: the payment page falls back to asking
    // the learner to enrol again.
  }
}

export function loadEnrolment(courseId) {
  try {
    const data = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (!data || data.courseId !== courseId) return null;
    if (!data.savedAt || Date.now() - data.savedAt > MAX_AGE_MS) return null;
    return data;
  } catch {
    return null;
  }
}
