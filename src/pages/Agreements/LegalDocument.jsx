import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

// Shared layout for the legal pages (Terms, Privacy Policy, Disclaimer):
// a warm-grey header with the title and tabs between the three documents,
// then the text in a readable column with an "On this page" list beside it
// (sticky on wide screens, a collapsible panel on small ones).
//
// The documents themselves are left exactly as written. The contents list
// is built from their <h2> headings after mount, and each heading is given
// an anchor id so sections can be linked to directly.

const DOCUMENTS = [
  { to: ROUTES.terms, label: "Terms" },
  { to: ROUTES.privacy, label: "Privacy" },
  { to: ROUTES.disclaimer, label: "Disclaimer" },
];

// Words kept lower case when an ALL-CAPS heading is title-cased for the
// contents list (the heading in the document is not changed).
const SMALL_WORDS = new Set(["a", "an", "and", "as", "at", "by", "for", "in", "of", "on", "or", "the", "to", "with"]);

const clean = (text) => text.replace(/\s+/g, " ").trim();

const slugify = (text) =>
  clean(text)
    .replace(/^[\d.]+\s*/, "") // drop the clause number
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const isShouting = (text) => {
  const letters = text.replace(/[^A-Za-z]/g, "");
  if (letters.length < 24) return false;
  const upper = letters.replace(/[^A-Z]/g, "").length;
  return upper / letters.length > 0.8;
};

// "4. COPYRIGHT AND SECURITY" -> "4. Copyright and Security". Headings that
// are already mixed case are left alone; the brand name stays upper case.
const tocLabel = (text) => {
  const label = clean(text);
  if (!isShouting(label) && label !== label.toUpperCase()) return label;
  return label
    .toLowerCase()
    .split(" ")
    .map((word, i) => {
      if (/^url\b/.test(word)) return word.toUpperCase();
      if (i > 0 && SMALL_WORDS.has(word)) return word;
      return word.replace(/[a-z]/, (ch) => ch.toUpperCase());
    })
    .join(" ");
};

// Long all-caps headings are set a little smaller so they do not shout.
const markCapsHeading = (heading) => {
  const letters = heading.textContent.replace(/[^A-Za-z]/g, "");
  if (letters.length > 3 && letters === letters.toUpperCase()) {
    heading.classList.add("legal-h2-caps");
  }
};

const TocList = ({ items, activeId, onNavigate }) => (
  <ol className="legal-toc-list">
    {items.map((item) => (
      <li key={item.id}>
        <a
          href={`#${item.id}`}
          className={item.id === activeId ? "is-active" : undefined}
          aria-current={item.id === activeId ? "location" : undefined}
          onClick={onNavigate}
        >
          {item.label}
        </a>
      </li>
    ))}
  </ol>
);

const LegalDocument = ({ title, updated, children }) => {
  const contentRef = useRef(null);
  const tocRef = useRef(null);
  const mobileTocRef = useRef(null);
  const [toc, setToc] = useState([]);
  const [activeId, setActiveId] = useState("");

  // Build the contents list and anchor ids from the rendered document.
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return undefined;

    const used = new Set();
    const items = [];

    // Text before the first heading (the Disclaimer opens this way) gets an
    // "Overview" entry so the list covers the whole document.
    const first = root.firstElementChild;
    if (first && first.tagName !== "H2") {
      first.id = first.id || "overview";
      used.add(first.id);
      items.push({ id: first.id, label: "Overview", el: first });
    }

    root.querySelectorAll("h2").forEach((heading, index) => {
      markCapsHeading(heading);
      let id = heading.id || slugify(heading.textContent) || `section-${index + 1}`;
      let n = 2;
      const base = id;
      while (used.has(id)) id = `${base}-${n++}`;
      used.add(id);
      heading.id = id;
      items.push({ id, label: tocLabel(heading.textContent), el: heading });
    });

    // Long ALL-CAPS clauses are set a little smaller, which reads more
    // easily without changing a word of them.
    root.querySelectorAll("p, li").forEach((el) => {
      if (isShouting(el.textContent)) el.classList.add("legal-caps");
    });

    setToc(items.map(({ id, label }) => ({ id, label })));

    // Ids exist only now, so honour a #section in the address here. The
    // frame delay lets the router's scroll reset run first.
    const hash = decodeURIComponent(window.location.hash.slice(1));
    let frame;
    if (hash) {
      frame = requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ block: "start", behavior: "instant" });
      });
    }

    // Highlight the section currently being read.
    let ticking = false;
    const update = () => {
      ticking = false;
      const offset = window.innerHeight * 0.3;
      let current = items[0]?.id || "";
      for (const item of items) {
        if (item.el.getBoundingClientRect().top - offset <= 0) current = item.id;
        else break;
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Keep the highlighted entry in view inside the (scrollable) sidebar,
  // without moving the page itself.
  useEffect(() => {
    const list = tocRef.current;
    if (!list || !activeId) return;
    const link = list.querySelector(`a[href="#${CSS.escape(activeId)}"]`);
    if (!link) return;
    const top = link.offsetTop - list.clientHeight / 2 + link.clientHeight / 2;
    list.scrollTo({ top: Math.max(top, 0), behavior: "auto" });
  }, [activeId]);

  // Close the mobile contents panel once a section is chosen.
  const closeMobileToc = () => {
    if (mobileTocRef.current) mobileTocRef.current.open = false;
  };

  return (
    <>
      <section className="legal-hero" id="main" tabIndex={-1}>
        <div className="container">
          <div className="legal-hero-inner">
            <h1>{title}</h1>
            {updated && <p className="legal-updated">Last updated {updated}</p>}
            <nav className="legal-switch" aria-label="Legal documents">
              {DOCUMENTS.map((doc) => (
                <NavLink key={doc.to} to={doc.to} className="legal-switch-link">
                  {doc.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </section>

      <div className="legal-body">
        <div className="container legal-layout">
          {toc.length > 1 && (
            <aside className="legal-toc">
              <nav aria-labelledby="legal-toc-title">
                <p className="legal-toc-title" id="legal-toc-title">
                  On this page
                </p>
                <div className="legal-toc-scroll" ref={tocRef}>
                  <TocList items={toc} activeId={activeId} />
                </div>
              </nav>
            </aside>
          )}

          <div className="legal-main">
            {toc.length > 1 && (
              <details className="legal-toc-mobile" ref={mobileTocRef}>
                <summary>
                  <span>On this page</span>
                  <span className="legal-toc-count">{toc.length} sections</span>
                </summary>
                <TocList items={toc} activeId={activeId} onNavigate={closeMobileToc} />
              </details>
            )}

            <article className="legal-prose" ref={contentRef} aria-label={title}>
              {children}
            </article>
          </div>
        </div>
      </div>
    </>
  );
};

export default LegalDocument;
