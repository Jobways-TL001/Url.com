-- Remove the Stripe payment link that 0005 used to seed for the AI & Machine
-- Learning course. It was inherited from the site this project was cloned
-- from and does not belong to URL. Only that exact link is deleted; a link
-- already replaced from /admin -> Payment links is left alone.

delete from public.course_payment_links
where course_id = 'ai-ml'
  and url = 'https://buy.stripe.com/aEU7vD5Kf5Fi8KsdXo';
