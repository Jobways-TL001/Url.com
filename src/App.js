import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home/home";
import Learning from "./pages/Learnings/learning";
import TermsAndConditions from "./pages/Agreements/Terms";
import Privacypolicy from "./pages/Agreements/privacy";
import Disclaimer from "./pages/Agreements/Disclaimer";
import { useLocation } from "react-router-dom";
import { lazy, Suspense, useLayoutEffect } from "react";
import ContactUsPage from "./pages/Contact/contact";
import AboutUsPage from "./pages/About/about";
import PageMeta from "./utils/PageMeta";
import useScrollReveal from "./utils/useScrollReveal";
import BackToTop from "./components/ui/BackToTop";

// Loaded only when someone opens /admin, so the dashboard adds nothing to
// the bundle public visitors download.
const Admin = lazy(() => import("./pages/Admin/Admin"));
const PaymentPage = lazy(() => import("./pages/Payment/payment"));
const PaymentSuccess = lazy(() =>
  import("./pages/Payment/payment").then((m) => ({ default: m.PaymentSuccess }))
);

function App() {
  return (
    <>
      {/* <StartupModal /> */}

      <BrowserRouter>
        <ScrollToTop />
        <PageMeta />
        <ScrollReveal />
        <BackToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/ai-courses" element={<Learning />} />
          <Route path="/e-learning" element={<Navigate to="/ai-courses" replace />} />
          <Route path="/contact-us" element={<ContactUsPage />} />
          <Route path="/TermsAndConditions" element={<TermsAndConditions />} />
          <Route path="/Privacypolicy" element={<Privacypolicy />} />
          <Route path="/Disclaimer" element={<Disclaimer />} />
          <Route
            path="/payment"
            element={
              <Suspense fallback={null}>
                <PaymentPage />
              </Suspense>
            }
          />
          <Route
            path="/payment/success"
            element={
              <Suspense fallback={null}>
                <PaymentSuccess />
              </Suspense>
            }
          />
          <Route
            path="/admin"
            element={
              <Suspense fallback={null}>
                <Admin />
              </Suspense>
            }
          />
          {/* The staffing, teach and resume-marketing pages were removed.
              Without this, their old URLs — and any typo — render a blank
              page, since every path is rewritten to index.html. */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}


export default App;

// Runs inside the router so it can re-scan after each route change.
const ScrollReveal = () => {
  useScrollReveal();
  return null;
};

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  // A layout effect, so the page is already at the top before it paints and
  // before useScrollReveal measures what is on screen. "instant" overrides
  // the smooth scrolling set on <html>, which made every page switch
  // visibly scroll up from wherever the last page was left.
  useLayoutEffect(() => {
    // A link to a section (/ai-courses#courses) is scrolled by that page.
    if (!hash) window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
};
