-- Stripe payment link per course, managed from /admin -> Payment links.
--
-- The /payment page looks the link up by course id (the `id` values in
-- src/constants/courses.js) through api/payment-link.js. Both that endpoint
-- and api/admin/payment-links.js use the service role key; Row Level
-- Security below denies the anon and authenticated keys.

create table if not exists public.course_payment_links (
  course_id  text        primary key check (course_id ~ '^[a-z0-9-]{1,60}$'),
  url        text        not null check (url ~ '^https://'),
  updated_at timestamptz not null default now()
);

comment on table public.course_payment_links is
  'Stripe payment link for each course, edited in the admin dashboard.';

alter table public.course_payment_links enable row level security;
revoke all on public.course_payment_links from anon, authenticated;

-- The AI & Machine Learning link that was previously hard-coded in
-- src/constants/courses.js. Left alone if it has already been changed.
insert into public.course_payment_links (course_id, url)
values ('ai-ml', 'https://buy.stripe.com/aEU7vD5Kf5Fi8KsdXo')
on conflict (course_id) do nothing;
