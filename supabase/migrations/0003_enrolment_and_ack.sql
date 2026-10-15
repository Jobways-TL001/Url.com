-- Course enrolments and acknowledgement tracking.
--
-- Course enrolments (source = 'course-enrollment') carry structured answers
-- (course, experience, batch, notes) alongside the free-text message. They
-- are kept as jsonb so the shape can grow without another migration.
--
-- acknowledged records whether the confirmation email reached the visitor.
-- Nullable: null means "not attempted" (ACK_DISABLED, or the notification
-- failed first) and is distinct from a failed attempt (false).

alter table public.contact_submissions
  add column if not exists enrolment    jsonb,
  add column if not exists acknowledged boolean;

comment on column public.contact_submissions.source is
  'Which form produced the row: contact-page, home-modal or course-enrollment.';
comment on column public.contact_submissions.enrolment is
  'Course enrolment answers {course, experience, batch, notes}. Null for ordinary enquiries.';
comment on column public.contact_submissions.acknowledged is
  'True if the confirmation email to the visitor was sent, false if it failed, null if not attempted.';

-- Listing enrolments per course.
create index if not exists contact_submissions_enrolment_course_idx
  on public.contact_submissions ((enrolment ->> 'course'), created_at desc)
  where enrolment is not null;
