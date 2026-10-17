import "./App.css";
import { lazy, Suspense, useLayoutEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./pages/Home/home";
import Learning from "./pages/Learnings/learning";
import CourseDetail from "./pages/Learnings/CourseDetail";
import TermsAndConditions from "./pages/Agreements/Terms";
import Privacypolicy from "./pages/Agreements/privacy";
import Disclaimer from "./pages/Agreements/Disclaimer";
import ContactUsPage from "./pages/Contact/contact";
import AboutUsPage from "./pages/About/about";
import PageMeta from "./utils/PageMeta";
import useScrollReveal from "./utils/useScrollReveal";
import BackToTop from "./components/ui/BackToTop";
import { ROUTES, LEGACY_REDIRECTS } from "./constants/routes";

// Loaded only when someone opens /admin, so the dashboard adds nothing to
// the bundle public visitors download.
const Admin = lazy(() => import("./pages/Admin/Admin"));
const PaymentPage = lazy(() => import("./pages/Payment/payment"));
const PaymentSuccess = lazy(() =>
  import("./pages/Payment/payment").then((m) => ({ default: m.PaymentSuccess }))
);

const withSuspense = (element) => <Suspense fallback={null}>{element}</Suspense>;

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <PageMeta />
      <ScrollReveal />
      <BackToTop />
      <Routes>
        <Route path={ROUTES.home} element={<Home />} />
        <Route path={ROUTES.courses} element={<Learning />} />
        <Route path={`${ROUTES.courses}/:courseId`} element={<CourseDetail />} />
        <Route path={ROUTES.about} element={<AboutUsPage />} />
        <Route path={ROUTES.contact} element={<ContactUsPage />} />
        <Route path={ROUTES.terms} element={<TermsAndConditions />} />
        <Route path={ROUTES.privacy} element={<Privacypolicy />} />
        <Route path={ROUTES.disclaimer} element={<Disclaimer />} />
        <Route path={ROUTES.payment} element={withSuspense(<PaymentPage />)} />
        <Route path={ROUTES.paymentSuccess} element={withSuspense(<PaymentSuccess />)} />
        <Route path="/admin/:section?" element={withSuspense(<Admin />)} />

        {/* Old URLs (bookmarks, links in emails already sent) keep working. */}
        {Object.entries(LEGACY_REDIRECTS).map(([from, to]) => (
          <Route key={from} path={from} element={<LegacyRedirect to={to} />} />
        ))}

        {/* Unknown paths — and any typo — would otherwise render a blank
            page, since every path is rewritten to index.html. */}
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

// Replaces an old URL with its new one, keeping the query string and hash
// (/ai-courses#courses -> /courses#courses). The old per-course anchors
// (/ai-courses#course-<id>) now have a page of their own.
const COURSE_ANCHOR = /^#course-(.+)$/;

const LegacyRedirect = ({ to }) => {
  const { search, hash } = useLocation();
  const match = hash.match(COURSE_ANCHOR);
  if (match) {
    return <Navigate to={ROUTES.course(decodeURIComponent(match[1]))} replace />;
  }
  return <Navigate to={{ pathname: to, search, hash }} replace />;
};

const ScrollReveal = () => {
  useScrollReveal();
  return null;
};

const prefersReducedMotion = () =>
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ScrollToTop = () => {
  const { pathname, search, hash, key } = useLocation();
  const lastPath = useRef(null);
  const lastSearch = useRef(null);

  // A layout effect, so the page is already at the top before it paints and
  // before useScrollReveal measures what is on screen. "instant" overrides
  // the smooth scrolling set on <html>, which made every page switch
  // visibly scroll up from wherever the last page was left.
  //
  // Keyed on location.key, not pathname: clicking the menu link for the page
  // you are already on (Home while on Home) keeps the same pathname, so a
  // pathname-only effect never ran and the click appeared to do nothing.
  // That case scrolls smoothly, so it reads as "back to the top".
  useLayoutEffect(() => {
    const pageChanged = lastPath.current !== pathname;
    const searchChanged = lastSearch.current !== search;
    lastPath.current = pathname;
    lastSearch.current = search;

    if (!hash) {
      // Only a new page starts at the top: a filter that changes the query
      // string must not throw the reader back up.
      if (pageChanged) {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      } else if (!searchChanged) {
        // The same URL again: the menu link for the page you are already on
        // (Home while on Home). Effects keyed on pathname never saw that
        // click, so it appeared to do nothing; scroll smoothly back to the
        // top so it reads as "back to the top".
        window.scrollTo({ top: 0, left: 0, behavior: prefersReducedMotion() ? "instant" : "smooth" });
      }
      return undefined;
    }

    // Other pages scroll their own sections (/courses#…). The home page's
    // sections (/#finder) are scrolled here, including when the link is
    // followed from the home page itself.
    if (pathname !== ROUTES.home) return undefined;

    let id;
    try {
      id = decodeURIComponent(hash.slice(1));
    } catch {
      return undefined;
    }

    let frame = 0;
    let tries = 0;
    const go = () => {
      const target = document.getElementById(id);
      if (!target) {
        // The section may not be rendered yet; give it a few frames.
        if (tries++ < 40) frame = requestAnimationFrame(go);
        return;
      }
      target.scrollIntoView({
        behavior: pageChanged || prefersReducedMotion() ? "instant" : "smooth",
        block: "start",
      });
      // Move keyboard and screen-reader focus with the view.
      if (target.tabIndex < 0 && !target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
      }
      target.focus({ preventScroll: true });
    };
    go();
    return () => cancelAnimationFrame(frame);
  }, [pathname, search, hash, key]);

  return null;
};
