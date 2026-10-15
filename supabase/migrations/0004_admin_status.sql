-- Follow-up status for the /admin dashboard.
--
-- Every enquiry starts as 'new'. Admins move it along as the team works it:
-- new -> contacted -> enrolled / closed. Written only by api/admin/*, which
-- uses the service role key; Row Level Security from 0001 still denies the
-- anon and authenticated keys.

alter table public.contact_submissions
  add column if not exists status     text        not null default 'new',
  add column if not exists updated_at timestamptz;

alter table public.contact_submissions
  drop constraint if exists contact_submissions_status_check;
alter table public.contact_submissions
  add constraint contact_submissions_status_check
  check (status in ('new', 'contacted', 'enrolled', 'closed'));

comment on column public.contact_submissions.status is
  'Follow-up state set from the admin dashboard: new, contacted, enrolled or closed.';
comment on column public.contact_submissions.updated_at is
  'When an admin last changed status. Null if never changed.';

-- The dashboard's default view is "new enquiries, newest first".
create index if not exists contact_submissions_status_idx
  on public.contact_submissions (status, created_at desc);

