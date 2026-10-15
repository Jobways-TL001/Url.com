// Services a visitor can pick on an enquiry form.
//
// The `value` is what the form posts to /api/send-email, which maps it to the
// label shown in the enquiry subject line. The matching list in
// api/send-email.js ignores anything not defined here, so the two must be
// kept in step.
export const SERVICES = [
  { value: "e-learning", label: "AI Courses" },
  { value: "general", label: "General enquiry" },
];
