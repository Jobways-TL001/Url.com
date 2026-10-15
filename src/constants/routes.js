// Every public URL on the site, in one place. Link with these instead of
// typing paths, so a route can be renamed without hunting for strings.
//
// The old paths (/ai-courses, /about-us, /contact-us, /TermsAndConditions,
// /Privacypolicy, /Disclaimer, /e-learning) redirect to these in App.js, so
// bookmarks and links in emails already sent keep working.
//
// /payment and /payment/success must not change: the success URL is set on
// each Stripe payment link.
export const ROUTES = {
  home: "/",
  courses: "/courses",
  course: (id) => `/courses/${encodeURIComponent(id)}`,
  about: "/about",
  contact: "/contact",
  // The course finder quiz on the home page.
  finder: "/#finder",
  terms: "/legal/terms",
  privacy: "/legal/privacy",
  disclaimer: "/legal/disclaimer",
  payment: "/payment",
  paymentSuccess: "/payment/success",
};

// Old path -> new path, used by the redirects in App.js.
export const LEGACY_REDIRECTS = {
  "/ai-courses": ROUTES.courses,
  "/e-learning": ROUTES.courses,
  "/about-us": ROUTES.about,
  "/contact-us": ROUTES.contact,
  "/TermsAndConditions": ROUTES.terms,
  "/Privacypolicy": ROUTES.privacy,
  "/Disclaimer": ROUTES.disclaimer,
};
