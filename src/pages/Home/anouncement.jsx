import React, { useEffect, useState } from "react";

const AnnouncementBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem("announcementSeen");
    if (!seen) {
      setShow(true);
      sessionStorage.setItem("announcementSeen", "true");
    }
  }, []);

  if (!show) return null;

  return (
    <div style={styles.banner}>
      <div style={styles.text}>
        <strong>Corporate Announcement:</strong>&nbsp;
        <span>
          <strong>URL Point LLP</strong> has been officially formed through
          the merger of <strong>Geshur Infra Private Limited</strong> and{" "}
          <strong>Genesis 7 Solutions</strong>.
        </span>
      </div>

      <button
        style={styles.close}
        onClick={() => setShow(false)}
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
};

const styles = {
  banner: {
    width: "100%",
    background: "#0a2351",
    color: "#fff",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    fontSize: "15px",
  },
  text: {
    lineHeight: 1.5,
    paddingRight: "16px",
  },
  close: {
    background: "transparent",
    border: "none",
    color: "#fff",
    fontSize: "18px",
    cursor: "pointer",
    fontWeight: "600",
  },
};

export default AnnouncementBanner;
