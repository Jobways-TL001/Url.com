-- Contact-form enquiries from /contact-us and the homepage modal.
-- Rows are written by api/send-email.js before the notification email is
-- attempted, so an SMTP outage can never lose a lead.

create extension if not exists "pgcrypto";

create table if not exists public.contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  email       text        not null,
  number      text,
  message     text        not null,
  source      text        not null default 'contact-page',
  email_sent  boolean     not null default false,
  email_error text,
  ip          inet,
  user_agent  text,
  created_at  timestamptz not null default now()
);

comment on table public.contact_submissions is
  'Contact-form enquiries. Written server-side only; see api/send-email.js.';
comment on column public.contact_submissions.source is
  'Which form produced the row: contact-page or home-modal.';
comment on column public.contact_submissions.email_sent is
  'False means the row was captured but the notification email failed; see email_error.';

-- Newest-first listing is the common read pattern.
create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);

-- Finding every enquiry from one person.
create index if not exists contact_submissions_email_idx
  on public.contact_submissions (email);

-- Locating leads that were captured but never emailed, for recovery.
create index if not exists contact_submissions_unsent_idx
  on public.contact_submissions (created_at desc)
  where email_sent = false;

-- Row Level Security: enabled with NO policies, which denies every request
-- made with the anon or authenticated keys. The serverless function uses the
-- service_role key, which bypasses RLS. Do not add a policy here unless you
-- genuinely intend to expose enquiries to browser clients.
alter table public.contact_submissions enable row level security;

revoke all on public.contact_submissions from anon, authenticated;
