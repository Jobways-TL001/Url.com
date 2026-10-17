import React, { useId } from "react";

// The URL brand mark: a white "U" on a blue → violet gradient tile with a
// soft full stop, followed by the wordmark "URL." Inline SVG, so it is crisp
// at every size; the wordmark colour follows the theme (`variant="light"` on
// dark backgrounds).
//
// Decorative to assistive technology: wrap it in a link or heading that
// carries an aria-label with the brand name.
//
// Static copies for places React does not reach (favicon, app icons,
// emails) live in public/brand/.
const Logo = ({ variant = "dark", showWord = true, className = "" }) => {
  const gradientId = `brand-grad-${useId().replace(/:/g, "")}`;
  return (
    <span
      className={`brand-logo brand-logo-${variant} ${className}`.trim()}
      aria-hidden="true"
    >
      <svg className="brand-logo-mark" viewBox="0 0 40 40" focusable="false">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2e5bff" />
            <stop offset="1" stopColor="#6d4cff" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill={`url(#${gradientId})`} />
        <path
          d="M12 9.5v11.5a8 8 0 0 0 16 0V9.5"
          fill="none"
          stroke="#ffffff"
          strokeWidth="4.2"
          strokeLinecap="round"
        />
        <circle cx="32.2" cy="31.6" r="3" fill="#c7d4ff" />
      </svg>
      {showWord && (
        <span className="brand-logo-word">
          URL<span className="brand-logo-dot">.</span>
        </span>
      )}
    </span>
  );
};

export default Logo;
