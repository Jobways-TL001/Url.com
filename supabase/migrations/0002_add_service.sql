-- Which service the visitor selected on the enquiry form.
--
-- Nullable because rows captured before this column existed have no value,
-- and backfilling them would invent data that was never collected.

alter table public.contact_submissions
  add column if not exists service text;

comment on column public.contact_submissions.service is
  'Service the visitor selected: url-teach, e-learning, staffing-recruitment, resume-marketing or general. Null for enquiries captured before the field existed.';

-- Reporting on demand per service is the reason this column exists.
create index if not exists contact_submissions_service_idx
  on public.contact_submissions (service, created_at desc);
