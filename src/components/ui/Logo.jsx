import React from "react";

// The URL brand mark: a white "U" on an ink tile with a burnt-orange full
// stop, followed by the serif wordmark "URL." Inline SVG, so it is crisp at
// every size; the wordmark colour follows the theme (`variant="light"` on
// dark backgrounds).
//
// Decorative to assistive technology: wrap it in a link or heading that
// carries an aria-label with the brand name.
//
// Static copies for places React does not reach (favicon, app icons,
// emails) live in public/brand/.
const Logo = ({ variant = "dark", showWord = true, className = "" }) => (
  <span
    className={`brand-logo brand-logo-${variant} ${className}`.trim()}
    aria-hidden="true"
  >
    <svg className="brand-logo-mark" viewBox="0 0 40 40" focusable="false">
      <rect
        width="40"
        height="40"
        rx="8"
        fill={variant === "light" ? "#f6f3ec" : "#15120f"}
      />
      <path
        d="M12 9.5v11.5a8 8 0 0 0 16 0V9.5"
        fill="none"
        stroke={variant === "light" ? "#15120f" : "#f6f3ec"}
        strokeWidth="4.2"
        strokeLinecap="round"
      />
      <circle cx="32.2" cy="31.6" r="3" fill="#d9480f" />
    </svg>
    {showWord && (
      <span className="brand-logo-word">
        URL<span className="brand-logo-dot">.</span>
      </span>
    )}
  </span>
);

export default Logo;
