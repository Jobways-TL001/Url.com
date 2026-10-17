// /admin — enquiry dashboard for the URL team.
//
// Sign-in, data and status changes all go through /api/admin/*, which keeps
// the session in HttpOnly cookies. This page never sees a token or a
// Supabase key; it only knows whether the API says it is signed in.
import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, Navigate, useParams } from "react-router-dom";
import { SERVICES } from "../../constants/services";
import { US_STATES } from "../../constants/usStates";
import { courseFeeFrom } from "../../utils/courseFees";
import Logo from "../../components/ui/Logo";
import "./admin.css";

// Whole dollars without cents ($1,658), otherwise two decimals ($652.50).
const usdTotal = (n) =>
  `$${n.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

const STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  // Set automatically when Stripe confirms payment (api/stripe-webhook.js).
  { value: "paid", label: "Paid" },
  { value: "enrolled", label: "Enrolled" },
  { value: "closed", label: "Closed" },
];

const SOURCES = [
  { value: "contact-page", label: "Contact page" },
  { value: "home-modal", label: "Home pop-up" },
  { value: "course-enrollment", label: "Course enrolment" },
];

const PERIODS = [
  { value: "", label: "All time" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
];

const SERVICE_LABELS = Object.fromEntries(SERVICES.map((s) => [s.value, s.label]));
const SOURCE_LABELS = Object.fromEntries(SOURCES.map((s) => [s.value, s.label]));

const dateFormat = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function formatDate(iso) {
  return iso ? dateFormat.format(new Date(iso)) : "—";
}

const ZERO_DECIMAL = new Set(["bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga", "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf"]);

function formatMoney(amount, currency) {
  if (amount === null || amount === undefined || !currency) return "";
  const value = ZERO_DECIMAL.has(currency.toLowerCase()) ? amount : amount / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: currency.toUpperCase() }).format(value);
  } catch {
    return `${value} ${currency.toUpperCase()}`;
  }
}

const PAYMENT_FILTERS = [
  { value: "", label: "Any payment" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Enrolled, not paid yet" },
  { value: "expired", label: "Checkout not completed" },
  { value: "failed", label: "Payment failed" },
];

function serviceLabel(row) {
  if (row.source === "course-enrollment" && row.enrolment?.course) return row.enrolment.course;
  if (!row.service) return "Not specified";
  return SERVICE_LABELS[row.service] || row.service;
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function api(path, { method = "GET", body, signal } = {}) {
  const res = await fetch(path, {
    method,
    credentials: "same-origin",
    signal,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON (e.g. a gateway error page); fall through to the status.
  }
  if (!res.ok) {
    throw new ApiError(data?.message || `Request failed (${res.status})`, res.status);
  }
  return data;
}

// Keep the dashboard out of search engines. The API sends X-Robots-Tag too,
// but this page itself is the SPA's index.html.
function useNoIndex() {
  useEffect(() => {
    const tag = document.createElement("meta");
    tag.name = "robots";
    tag.content = "noindex, nofollow";
    document.head.appendChild(tag);
    return () => tag.remove();
  }, []);
}

export default function Admin() {
  useNoIndex();
  // undefined = checking, null = signed out, { email } = signed in
  const [session, setSession] = useState(undefined);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    api("/api/admin/session", { signal: controller.signal })
      .then((data) => setSession(data))
      .catch((error) => {
        if (error.name === "AbortError") return;
        if (error.status && error.status !== 401) setNotice(error.message);
        setSession(null);
      });
    return () => controller.abort();
  }, []);

  const expire = useCallback(() => {
    setNotice("Your session has ended. Please sign in again.");
    setSession(null);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await api("/api/admin/logout", { method: "POST", body: {} });
    } catch {
      // Cookies are cleared server-side either way; show the login regardless.
    }
    setNotice("");
    setSession(null);
  }, []);

  if (session === undefined) {
    return (
      <div className="adm-center">
        <div className="adm-spinner" aria-label="Loading" />
      </div>
    );
  }

  if (!session) {
    return (
      <Login
        notice={notice}
        onSignedIn={(data) => {
          setNotice("");
          setSession(data);
        }}
      />
    );
  }

  return <Dashboard email={session.email} onExpired={expire} onSignOut={signOut} />;
}

function Login({ notice, onSignedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      onSignedIn(await api("/api/admin/login", { method: "POST", body: { email, password } }));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="adm-login">
      <form className="adm-login-card" onSubmit={submit} noValidate>
        <Logo className="adm-login-logo" />
        <h1>URL Admin</h1>
        <p className="adm-muted">Sign in to view and manage enquiries.</p>

        {(error || notice) && (
          <div className="adm-alert" role="alert">
            {error || notice}
          </div>
        )}

        <label className="adm-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
        </label>
        <label className="adm-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" className="btn btn-primary btn-block" disabled={busy || !email || !password}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

const EMPTY_FILTERS = { status: "", source: "", delivery: "", period: "", payment: "" };

// Admin sections, each at its own URL: /admin/<path>.
const SECTIONS = [
  { path: "enquiries", label: "Enquiries" },
  { path: "payments", label: "Payments" },
  { path: "state-tax", label: "State tax" },
  { path: "emails", label: "Email templates" },
];

function Dashboard({ email, onExpired, onSignOut }) {
  const [stats, setStats] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ rows: [], total: 0, pageSize: 25 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  // True while a reload was triggered by the background poll, so it updates
  // the rows quietly instead of dimming the table.
  const silentReload = useRef(false);
  const [selectedId, setSelectedId] = useState(null);
  // The section comes from the URL (/admin/<section>), so a refresh, the
  // browser's Back/Forward and bookmarks all land on the right page.
  const { section } = useParams();
  const view = SECTIONS.some((s) => s.path === section) ? section : null;

  const handleError = useCallback(
    (err) => {
      if (err.name === "AbortError") return;
      if (err.status === 401 || err.status === 403) onExpired();
      else setError(err.message);
    },
    [onExpired]
  );

  // Debounce typing so each keystroke does not hit the database.
  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const queryString = new URLSearchParams(
    Object.entries({ q, ...filters }).filter(([, v]) => v)
  ).toString();

  useEffect(() => {
    const controller = new AbortController();
    const silent = silentReload.current;
    silentReload.current = false;
    if (!silent) {
      setLoading(true);
      setError("");
    }
    const params = new URLSearchParams(queryString);
    params.set("page", String(page));
    api(`/api/admin/submissions?${params}`, { signal: controller.signal })
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        handleError(err);
        setLoading(false);
      });
    return () => controller.abort();
  }, [queryString, page, reloadKey, handleError]);

  useEffect(() => {
    const controller = new AbortController();
    api("/api/admin/stats", { signal: controller.signal })
      .then(setStats)
      .catch(handleError);
    return () => controller.abort();
  }, [reloadKey, handleError]);

  // Keep the dashboard current without clicking Refresh: a payment confirmed
  // by Stripe shows up as Paid within half a minute. Paused while the tab is
  // hidden, and caught up as soon as it is shown again.
  useEffect(() => {
    const poll = () => {
      if (document.visibilityState !== "visible") return;
      silentReload.current = true;
      setReloadKey((k) => k + 1);
    };
    const timer = setInterval(poll, 30000);
    document.addEventListener("visibilitychange", poll);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", poll);
    };
  }, []);

  function setFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }

  function showCard(patch) {
    setSearchInput("");
    setQ("");
    setFilters({ ...EMPTY_FILTERS, ...patch });
    setPage(1);
  }

  async function changeStatus(id, status) {
    const before = result.rows;
    // Optimistic: update the row now, put it back if the save fails.
    setResult((r) => ({ ...r, rows: r.rows.map((row) => (row.id === id ? { ...row, status } : row)) }));
    try {
      const saved = await api("/api/admin/submissions", { method: "PATCH", body: { id, status } });
      setResult((r) => ({ ...r, rows: r.rows.map((row) => (row.id === id ? { ...row, ...saved } : row)) }));
      api("/api/admin/stats").then(setStats).catch(handleError);
    } catch (err) {
      setResult((r) => ({ ...r, rows: before }));
      handleError(err);
    }
  }

  const hasFilters = Boolean(q || Object.values(filters).some(Boolean));
  const pages = Math.max(1, Math.ceil(result.total / result.pageSize));
  const firstShown = result.total ? (page - 1) * result.pageSize + 1 : 0;
  const lastShown = Math.min(page * result.pageSize, result.total);
  const selected = result.rows.find((row) => row.id === selectedId) || null;

  return (
    <div className="adm">
      <header className="adm-topbar">
        <div className="adm-brand">
          <Logo className="adm-brand-logo" />
          <span className="visually-hidden">URL</span>
          <span className="adm-brand-tag">Admin</span>
        </div>
        <nav className="adm-tabs" aria-label="Admin sections">
          {SECTIONS.map((s) => (
            <NavLink
              key={s.path}
              to={`/admin/${s.path}`}
              className={({ isActive }) => (isActive ? "is-active" : undefined)}
            >
              {s.label}
            </NavLink>
          ))}
        </nav>
        <div className="adm-user">
          <span className="adm-user-email" title={email}>
            {email}
          </span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </header>

      {!view ? (
        // /admin, or a section that does not exist.
        <Navigate to="/admin/enquiries" replace />
      ) : view === "state-tax" ? (
        <StateTaxes onError={handleError} />
      ) : view === "payments" ? (
        <Payments onError={handleError} />
      ) : view === "emails" ? (
        <EmailTemplates onError={handleError} />
      ) : (
      <main className="adm-main">
        <div className="adm-heading">
          <div>
            <h1>Enquiries</h1>
            <p className="adm-muted">Contact forms and course enrolments from url.com.</p>
          </div>
          <div className="adm-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setReloadKey((k) => k + 1)}>
              Refresh
            </button>
            <a
              className="btn btn-primary btn-sm"
              href={`/api/admin/submissions?${queryString ? `${queryString}&` : ""}format=csv`}
              download
            >
              Export CSV
            </a>
          </div>
        </div>

        <section className="adm-stats" aria-label="Summary">
          <StatCard label="Total enquiries" value={stats?.total} onClick={() => showCard({})} />
          <StatCard label="New (to follow up)" value={stats?.new} tone="blue" onClick={() => showCard({ status: "new" })} />
          <StatCard label="Last 7 days" value={stats?.lastWeek} onClick={() => showCard({ period: "7d" })} />
          <StatCard
            label="Course enrolments"
            value={stats?.enrolments}
            tone="teal"
            onClick={() => showCard({ source: "course-enrollment" })}
          />
          <StatCard
            label="Paid enrolments"
            value={stats?.paid}
            tone="teal"
            onClick={() => showCard({ payment: "paid" })}
          />
          <StatCard
            label="Email not delivered"
            value={stats?.failed}
            tone={stats?.failed ? "red" : undefined}
            onClick={() => showCard({ delivery: "failed" })}
          />
        </section>

        <section className="adm-panel">
          <div className="adm-filters">
            <input
              type="search"
              className="adm-search"
              placeholder="Search name, email, phone or message"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search enquiries"
            />
            <Select label="Status" value={filters.status} onChange={(v) => setFilter("status", v)}
              options={[{ value: "", label: "All statuses" }, ...STATUSES]} />
            <Select label="Source" value={filters.source} onChange={(v) => setFilter("source", v)}
              options={[{ value: "", label: "All sources" }, ...SOURCES]} />
            <Select label="Period" value={filters.period} onChange={(v) => setFilter("period", v)} options={PERIODS} />
            <Select label="Email delivery" value={filters.delivery} onChange={(v) => setFilter("delivery", v)}
              options={[{ value: "", label: "Any delivery" }, { value: "failed", label: "Email not delivered" }]} />
            <Select label="Payment" value={filters.payment} onChange={(v) => setFilter("payment", v)} options={PAYMENT_FILTERS} />
            {hasFilters && (
              <button type="button" className="btn-link adm-clear" onClick={() => showCard({})}>
                Clear filters
              </button>
            )}
          </div>

          {error && (
            <div className="adm-alert" role="alert">
              {error}
            </div>
          )}

          <div className={`adm-table-wrap${loading ? " is-loading" : ""}`}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Received</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Service / course</th>
                  <th>Source</th>
                  <th>Email</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr key={row.id} onClick={() => setSelectedId(row.id)} className="adm-row">
                    <td data-label="Received" className="adm-nowrap">{formatDate(row.created_at)}</td>
                    <td data-label="Name">
                      <button type="button" className="adm-name" onClick={() => setSelectedId(row.id)}>
                        {row.name}
                      </button>
                    </td>
                    <td data-label="Contact">
                      <div className="adm-ellipsis">{row.email}</div>
                      {row.number && <div className="adm-muted adm-small">{row.number}</div>}
                    </td>
                    <td data-label="Service">{serviceLabel(row)}</td>
                    <td data-label="Source">{SOURCE_LABELS[row.source] || row.source}</td>
                    <td data-label="Email">
                      <DeliveryBadge row={row} />
                    </td>
                    <td data-label="Payment">
                      <PaymentBadge row={row} />
                    </td>
                    <td data-label="Status" onClick={(e) => e.stopPropagation()}>
                      <StatusSelect value={row.status} onChange={(v) => changeStatus(row.id, v)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && !result.rows.length && !error && (
              <div className="adm-empty">{hasFilters ? "No enquiries match these filters." : "No enquiries yet."}</div>
            )}
          </div>

          <div className="adm-pager">
            <span className="adm-muted">
              {result.total ? `${firstShown}–${lastShown} of ${result.total}` : loading ? "Loading…" : "0 results"}
            </span>
            <div className="adm-pager-buttons">
              <button type="button" className="btn btn-secondary btn-sm" disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}>
                ← Previous
              </button>
              <button type="button" className="btn btn-secondary btn-sm" disabled={page >= pages || loading}
                onClick={() => setPage((p) => p + 1)}>
                Next →
              </button>
            </div>
          </div>
        </section>
      </main>
      )}

      {selected && (
        <Detail
          row={selected}
          onClose={() => setSelectedId(null)}
          onStatus={(v) => changeStatus(selected.id, v)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, tone, onClick }) {
  return (
    <button type="button" className={`adm-stat${tone ? ` adm-stat-${tone}` : ""}`} onClick={onClick}>
      <span className="adm-stat-value">{value === undefined ? "—" : value.toLocaleString()}</span>
      <span className="adm-stat-label">{label}</span>
    </button>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <select className="adm-select" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function StatusSelect({ value, onChange }) {
  return (
    <select
      className={`adm-status adm-status-${value || "new"}`}
      aria-label="Status"
      value={value || "new"}
      onChange={(e) => onChange(e.target.value)}
    >
      {STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

function PaymentBadge({ row }) {
  switch (row.payment_status) {
    case "paid":
      return (
        <span className="adm-badge adm-badge-ok">
          Paid{row.amount_paid !== null && row.amount_paid !== undefined ? ` ${formatMoney(row.amount_paid, row.payment_currency)}` : ""}
        </span>
      );
    case "failed":
      return <span className="adm-badge adm-badge-bad">Failed</span>;
    case "expired":
      return <span className="adm-badge adm-badge-warn">Not completed</span>;
    default:
      return row.source === "course-enrollment" ? (
        <span className="adm-badge adm-badge-muted">Awaiting payment</span>
      ) : (
        <span className="adm-muted">—</span>
      );
  }
}

function DeliveryBadge({ row }) {
  if (row.email_sent) {
    return <span className="adm-badge adm-badge-ok">Delivered</span>;
  }
  return (
    <span className="adm-badge adm-badge-bad" title={row.email_error || ""}>
      Not delivered
    </span>
  );
}

function Detail({ row, onClose, onStatus }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const enrolment = row.enrolment || null;
  const phoneHref = row.number ? `tel:${row.number.replace(/[^\d+]/g, "")}` : null;
  const replySubject = encodeURIComponent("Re: your enquiry — URL");

  return (
    <div className="adm-overlay" onClick={onClose}>
      <aside
        className="adm-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="adm-detail-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="adm-drawer-head">
          <div>
            <div className="adm-muted adm-small">{formatDate(row.created_at)}</div>
            <h2 id="adm-detail-title">{row.name}</h2>
          </div>
          <button type="button" ref={closeRef} className="adm-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="adm-drawer-actions">
          <a className="btn btn-primary btn-sm" href={`mailto:${row.email}?subject=${replySubject}`}>
            Reply by email
          </a>
          {phoneHref && (
            <a className="btn btn-secondary btn-sm" href={phoneHref}>
              Call
            </a>
          )}
          <StatusSelect value={row.status} onChange={onStatus} />
        </div>

        <dl className="adm-dl">
          <Field label="Email" value={row.email} />
          <Field label="Phone" value={row.number || "Not provided"} />
          <Field label="Service" value={serviceLabel(row)} />
          <Field label="Source" value={SOURCE_LABELS[row.source] || row.source} />
          {enrolment && (
            <>
              <Field label="Course" value={enrolment.course} />
              {enrolment.state && <Field label="State" value={enrolment.state} />}
              <Field label="Experience" value={enrolment.experience || "Not provided"} />
              <Field label="Preferred batch" value={enrolment.batch || "Not provided"} />
              {enrolment.notes && <Field label="Notes" value={enrolment.notes} />}
            </>
          )}
        </dl>

        <h3 className="adm-section-title">Message</h3>
        <p className="adm-message">{row.message}</p>

        {(row.payment_status || row.source === "course-enrollment") && (
          <>
            <h3 className="adm-section-title">Payment</h3>
            <dl className="adm-dl">
              <Field label="Status" value={<PaymentBadge row={row} />} />
              {row.amount_paid !== null && row.amount_paid !== undefined && (
                <Field label="Amount paid" value={formatMoney(row.amount_paid, row.payment_currency)} />
              )}
              {row.paid_at && <Field label="Paid at" value={formatDate(row.paid_at)} />}
              {row.stripe_session_id && <Field label="Stripe session" value={row.stripe_session_id} small />}
            </dl>
          </>
        )}

        <h3 className="adm-section-title">Delivery</h3>
        <dl className="adm-dl">
          <Field label="Team notified" value={row.email_sent ? "Yes" : "No"} />
          <Field
            label="Confirmation to visitor"
            value={row.acknowledged === true ? "Sent" : row.acknowledged === false ? "Failed" : "Not attempted"}
          />
          {row.email_error && <Field label="Email error" value={row.email_error} />}
          {row.updated_at && <Field label="Status changed" value={formatDate(row.updated_at)} />}
          {row.ip && <Field label="IP address" value={row.ip} />}
          {row.user_agent && <Field label="Browser" value={row.user_agent} small />}
        </dl>
      </aside>
    </div>
  );
}

function Field({ label, value, small }) {
  return (
    <div className="adm-dl-row">
      <dt>{label}</dt>
      <dd className={small ? "adm-small" : undefined}>{value}</dd>
    </div>
  );
}

// Per-state W2 cost inputs: hours per month, hourly pay rate, employee and
// employer tax and the amount payable to the vendor (dollars, stored as
// company_margin). Every state is listed; each
// row is edited in place and saved on its own.
const TAX_FIELDS = [
  { key: "hoursPerMonth", label: "Hours per month", unit: "hrs", step: "0.5", max: 744 },
  { key: "payRate", label: "Pay rate per hour", unit: "$", step: "0.01", max: 100000 },
  { key: "employeeTax", label: "Employee tax", unit: "%", step: "0.001", max: 100 },
  { key: "employerTax", label: "Employer tax", unit: "%", step: "0.001", max: 100 },
  { key: "companyMargin", label: "Payable to Vendor", unit: "$", step: "0.01", max: 1000000 },
];

// Saved value -> input text. Blank when not filled in.
function taxDraftOf(rate) {
  return Object.fromEntries(
    TAX_FIELDS.map(({ key }) => [key, rate?.[key] === null || rate?.[key] === undefined ? "" : String(rate[key])])
  );
}

function taxDirty(draft, rate) {
  const saved = taxDraftOf(rate);
  return TAX_FIELDS.some(({ key }) => {
    const a = (draft?.[key] ?? "").trim();
    const b = saved[key];
    if (a === "" || b === "") return a !== b;
    return Number(a) !== Number(b);
  });
}

function StateTaxes({ onError }) {
  const [rates, setRates] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState({}); // { [stateCode]: true } while saving
  const [messages, setMessages] = useState({});
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    api("/api/admin/state-taxes", { signal: controller.signal })
      .then((data) => {
        setRates(data.rates);
        setDrafts(Object.fromEntries(US_STATES.map((s) => [s.value, taxDraftOf(data.rates[s.value])])));
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        if (err.status === 401 || err.status === 403) onError(err);
        else setLoadError(err.message);
      });
    return () => controller.abort();
  }, [onError]);

  function edit(state, key, value) {
    setDrafts((d) => ({ ...d, [state]: { ...d[state], [key]: value } }));
    setMessages((m) => ({ ...m, [state]: null }));
  }

  // Rows save themselves when a box is left (blur, Tab or Enter), so a
  // change reaches the website's course fee without a Save click. Saving on
  // leaving the box rather than on every keystroke means a half-typed value
  // ("2" on the way to "200") never goes live.
  //
  // Several saves for one row can overlap (tabbing across its boxes); each
  // gets a number, and only the newest one's reply is applied, so an older
  // reply arriving late cannot undo a newer value.
  const saveSeq = useRef({});

  async function save(state) {
    const draft = drafts[state] || {};
    if (!taxDirty(draft, rates?.[state])) return;
    const seq = (saveSeq.current[state] || 0) + 1;
    saveSeq.current[state] = seq;
    const isLatest = () => saveSeq.current[state] === seq;

    setSaving((s) => ({ ...s, [state]: true }));
    setMessages((m) => ({ ...m, [state]: null }));
    try {
      const body = { state };
      for (const { key } of TAX_FIELDS) body[key] = (draft[key] ?? "").trim();
      const saved = await api("/api/admin/state-taxes", { method: "PUT", body });
      if (!isLatest()) return;
      setRates((r) => {
        const next = { ...r };
        if (saved.rate) next[state] = saved.rate;
        else delete next[state];
        return next;
      });
      // The boxes are left as typed: replacing them with the saved values
      // could wipe out something typed while this save was in flight.
      setMessages((m) => ({
        ...m,
        [state]: { ok: true, text: saved.rate ? "Saved · website updated" : "Cleared" },
      }));
    } catch (err) {
      if (err.status === 401 || err.status === 403) return onError(err);
      if (isLatest()) setMessages((m) => ({ ...m, [state]: { ok: false, text: err.message } }));
    } finally {
      if (isLatest()) setSaving((s) => ({ ...s, [state]: false }));
    }
  }

  const needle = filter.trim().toLowerCase();
  const shown = needle
    ? US_STATES.filter(
        (s) => s.label.toLowerCase().includes(needle) || s.value.toLowerCase() === needle
      )
    : US_STATES;
  const filled = rates ? Object.keys(rates).length : 0;

  return (
    <main className="adm-main">
      <div className="adm-heading">
        <div>
          <h1>State tax</h1>
          <p className="adm-muted">
            Hours, pay rate, taxes and the amount payable to the vendor for each
            state. Taxes are percentages; pay rate (per hour) and payable to
            vendor are US dollars. Leave a value blank if it is not known yet.
            Total is what the customer pays: pay rate &times; hours + employer
            tax + payable to vendor. Employee tax is withheld from the employee&rsquo;s pay, so it
            does not change it. Changes save automatically when you leave a box,
            and the website&rsquo;s course fee updates within seconds.
          </p>
        </div>
      </div>

      {loadError && (
        <div className="adm-alert" role="alert">
          {loadError}
        </div>
      )}

      {!rates && !loadError && (
        <div className="adm-center adm-inline-center">
          <div className="adm-spinner" aria-label="Loading" />
        </div>
      )}

      {rates && (
        <section className="adm-panel">
          <div className="adm-filters">
            <input
              type="search"
              className="adm-search"
              placeholder="Find a state…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Find a state"
            />
            <span className="adm-muted adm-small">
              {filled} of {US_STATES.length} states filled in
            </span>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table adm-tax-table">
              <thead>
                <tr>
                  <th scope="col">State</th>
                  {TAX_FIELDS.map((f) => (
                    <th scope="col" key={f.key}>
                      {f.label} <span className="adm-tax-unit">({f.unit})</span>
                    </th>
                  ))}
                  <th
                    scope="col"
                    className="adm-tax-total"
                    title="What the customer pays: pay rate × hours + employer tax + payable to vendor"
                  >
                    Total <span className="adm-tax-unit">($)</span>
                  </th>
                  <th scope="col">
                    <span className="visually-hidden">Save status</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.map((s) => {
                  const draft = drafts[s.value] || {};
                  const dirty = taxDirty(draft, rates[s.value]);
                  const message = messages[s.value];
                  // From the values on screen, so it updates as you type.
                  const total = courseFeeFrom(draft);
                  // The website and checkout use the saved figures, so say
                  // when the Total on screen has not been saved yet.
                  const savedTotal = rates[s.value] ? courseFeeFrom(rates[s.value]) : null;
                  return (
                    <tr key={s.value}>
                      <th scope="row" className="adm-tax-state">
                        <strong>{s.label}</strong>
                        <span className="adm-muted adm-small">{s.value}</span>
                      </th>
                      {TAX_FIELDS.map((f) => (
                        <td key={f.key}>
                          <input
                            type="number"
                            inputMode="decimal"
                            min="0"
                            max={f.max}
                            step={f.step}
                            className="adm-search adm-tax-input"
                            value={draft[f.key] ?? ""}
                            onChange={(e) => edit(s.value, f.key, e.target.value)}
                            onBlur={() => save(s.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") save(s.value);
                            }}
                            aria-label={`${f.label} for ${s.label}`}
                          />
                        </td>
                      ))}
                      <td className="adm-tax-total">
                        {total !== null ? (
                          <strong>{usdTotal(total)}</strong>
                        ) : (
                          <span className="adm-muted" title="Needs hours per month and a pay rate">
                            —
                          </span>
                        )}
                        {dirty && !saving[s.value] && total !== savedTotal && (
                          <span className="adm-tax-unsaved">
                            Saves when you leave the box · website shows{" "}
                            {savedTotal !== null ? usdTotal(savedTotal) : "no fee"}
                          </span>
                        )}
                      </td>
                      <td className="adm-tax-actions">
                        {saving[s.value] ? (
                          <span className="adm-small adm-muted" role="status">
                            Saving…
                          </span>
                        ) : message && (
                          <span
                            className={`adm-small ${message.ok ? "adm-ok-text" : "adm-error-text"}`}
                            role="status"
                          >
                            {message.text}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {!shown.length && (
                  <tr>
                    <td colSpan={TAX_FIELDS.length + 3} className="adm-empty">
                      No state matches &ldquo;{filter}&rdquo;.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  );
}

// Every enrolment payment Stripe has reported (paid, failed, not completed),
// newest first, with totals. Rows come from the same enquiries API, filtered
// to ones with a payment outcome; amounts are what Stripe actually charged.
const PAYMENT_TABS = [
  { value: "any", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "expired", label: "Not completed" },
  { value: "pending", label: "Awaiting payment" },
];

function stripeLink(sessionId) {
  return `https://dashboard.stripe.com/search?query=${encodeURIComponent(sessionId)}`;
}

function Payments({ onError }) {
  const [tab, setTab] = useState("any");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    api("/api/admin/stats", { signal: controller.signal })
      .then(setStats)
      .catch((err) => {
        if (err.name === "AbortError") return;
        if (err.status === 401 || err.status === 403) onError(err);
      });
    return () => controller.abort();
  }, [onError]);

  useEffect(() => {
    const controller = new AbortController();
    setError("");
    api(`/api/admin/submissions?payment=${tab}&page=${page}`, { signal: controller.signal })
      .then(setResult)
      .catch((err) => {
        if (err.name === "AbortError") return;
        if (err.status === 401 || err.status === 403) onError(err);
        else setError(err.message);
      });
    return () => controller.abort();
  }, [tab, page, onError]);

  const pages = result ? Math.max(1, Math.ceil(result.total / result.pageSize)) : 1;
  const revenue = stats?.revenue && Object.keys(stats.revenue).length
    ? Object.entries(stats.revenue).map(([cur, cents]) => formatMoney(cents, cur)).join(" + ")
    : formatMoney(0, "usd");

  return (
    <main className="adm-main">
      <div className="adm-heading">
        <div>
          <h1>Payments</h1>
          <p className="adm-muted">
            Course payments made through Stripe Checkout. A payment shows here as
            soon as Stripe confirms it; refunds and payouts are in Stripe.
          </p>
        </div>
      </div>

      <section className="adm-stats" aria-label="Payment totals">
        <StatCard label="Revenue" value={stats ? revenue : undefined} tone="teal" />
        <StatCard label="Paid" value={stats?.paid} onClick={() => { setTab("paid"); setPage(1); }} />
        <StatCard label="Failed" value={stats?.paymentsFailed} onClick={() => { setTab("failed"); setPage(1); }} />
        <StatCard label="Not completed" value={stats?.paymentsExpired} onClick={() => { setTab("expired"); setPage(1); }} />
      </section>

      <section className="adm-panel">
        <div className="adm-filters" role="tablist" aria-label="Payment status">
          {PAYMENT_TABS.map((t) => (
            <button
              key={t.value}
              type="button"
              role="tab"
              aria-selected={tab === t.value}
              className={`adm-chip${tab === t.value ? " is-active" : ""}`}
              onClick={() => {
                setTab(t.value);
                setPage(1);
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="adm-alert" role="alert">
            {error}
          </div>
        )}

        <div className={`adm-table-wrap${result ? "" : " is-loading"}`}>
          <table className="adm-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Learner</th>
                <th scope="col">Course</th>
                <th scope="col">State</th>
                <th scope="col">Status</th>
                <th scope="col" className="adm-num">Amount</th>
                <th scope="col">Stripe</th>
              </tr>
            </thead>
            <tbody>
              {result?.rows.map((row) => (
                <tr key={row.id}>
                  <td className="adm-small">{formatDate(row.paid_at || row.created_at)}</td>
                  <td>
                    <strong>{row.name}</strong>
                    <div className="adm-muted adm-small">{row.email}</div>
                  </td>
                  <td>{row.enrolment?.course || "—"}</td>
                  <td>{row.enrolment?.state || "—"}</td>
                  <td>
                    <PaymentBadge row={{ ...row, amount_paid: null }} />
                  </td>
                  <td className="adm-num">
                    {row.amount_paid !== null && row.amount_paid !== undefined
                      ? formatMoney(row.amount_paid, row.payment_currency)
                      : "—"}
                  </td>
                  <td>
                    {row.stripe_session_id ? (
                      <a href={stripeLink(row.stripe_session_id)} target="_blank" rel="noopener noreferrer">
                        Open
                      </a>
                    ) : (
                      <span className="adm-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {result && !result.rows.length && (
                <tr>
                  <td colSpan={7} className="adm-empty">
                    No payments here yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {result && result.total > result.pageSize && (
          <div className="adm-pager">
            <span className="adm-muted adm-small">
              Page {page} of {pages} · {result.total} payments
            </span>
            <div className="adm-pager-buttons">
              <button type="button" className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <button type="button" className="btn btn-secondary btn-sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

// Every email the site sends, rendered with sample data exactly as it is
// built for real (api/admin/email-previews.js). Nothing is sent.
function EmailTemplates({ onError }) {
  const [templates, setTemplates] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    api("/api/admin/email-previews", { signal: controller.signal })
      .then((data) => {
        const emails = Array.isArray(data?.emails) ? data.emails : [];
        setTemplates(emails);
        setSelected(emails[0]?.key || null);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        if (err.status === 401 || err.status === 403) onError(err);
        else setError(err.message);
      });
    return () => controller.abort();
  }, [onError]);

  const current = templates?.find((t) => t.key === selected) || null;

  return (
    <main className="adm-main">
      <div className="adm-heading">
        <div>
          <h1>Email templates</h1>
          <p className="adm-muted">
            Every email the site sends, shown with sample details. Learner emails
            are branded; team notifications are plain text. Previews only —
            nothing is sent.
          </p>
        </div>
      </div>

      {error && (
        <div className="adm-alert" role="alert">
          {error}
        </div>
      )}

      {!templates && !error && (
        <div className="adm-center adm-inline-center">
          <div className="adm-spinner" aria-label="Loading" />
        </div>
      )}

      {templates && (
        <div className="adm-mail">
          <nav className="adm-panel adm-mail-list" aria-label="Email templates">
            {templates.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`adm-mail-item${t.key === selected ? " is-active" : ""}`}
                aria-current={t.key === selected ? "true" : undefined}
                onClick={() => setSelected(t.key)}
              >
                <span className={`adm-badge ${t.audience === "Learner" ? "adm-badge-ok" : "adm-badge-muted"}`}>
                  {t.audience}
                </span>
                <strong>{t.label}</strong>
                <span className="adm-muted adm-small">{t.when}</span>
              </button>
            ))}
          </nav>

          {current && (
            <section className="adm-panel adm-mail-preview" aria-label={`${current.label} preview`}>
              <dl className="adm-mail-meta">
                <div>
                  <dt>Subject</dt>
                  <dd>{current.subject}</dd>
                </div>
                <div>
                  <dt>From</dt>
                  <dd>{current.from}</dd>
                </div>
                <div>
                  <dt>To</dt>
                  <dd>{current.to}</dd>
                </div>
                <div>
                  <dt>Sent when</dt>
                  <dd>{current.when}</dd>
                </div>
              </dl>
              {current.html ? (
                // sandbox="" blocks scripts, forms and navigation in the preview.
                <iframe className="adm-mail-frame" title={current.label} sandbox="" srcDoc={current.html} />
              ) : (
                <pre className="adm-mail-text">{current.text}</pre>
              )}
            </section>
          )}
        </div>
      )}
    </main>
  );
}
