import React, { useState, useEffect } from "react";

const StartupModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if modal was already shown in this session
    const hasSeenModal = sessionStorage.getItem("startupModalShown");

    if (!hasSeenModal) {
      setIsOpen(true);
      sessionStorage.setItem("startupModalShown", "true"); // Mark as shown
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Important Corporate Update</h2>
        <p style={styles.subtitle}>
          We are pleased to announce that <strong>URL Point LLP</strong> has
          been officially formed through the merger and acquisition of the
          following companies:
        </p>
        <ol style={styles.list}>
          <li>
            <strong>Geshur Infra Private Limited</strong>
          </li>
          <li>
            <strong>Genesis 7 Solutions</strong>
          </li>
        </ol>
        <button style={styles.button} onClick={handleClose}>
          Got it
        </button>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7))",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "30px 40px",
    maxWidth: "600px",
    width: "90%",
    textAlign: "center",
    boxShadow: "0px 6px 18px rgba(0,0,0,0.25)",
  },
  title: {
    marginBottom: "15px",
    fontSize: "22px",
    fontWeight: "700",
    color: "#2c3e50",
  },
  subtitle: {
    fontSize: "16px",
    marginBottom: "20px",
    color: "#555",
    lineHeight: 1.6,
  },
  list: {
    paddingLeft: "20px",
    margin: "0 0 25px 0",
    fontSize: "16px",
    color: "#333",
    lineHeight: 1.8,
    textAlign: "left",
  },
  button: {
    padding: "12px 28px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
    transition: "background-color 0.3s ease",
  },
};

export default StartupModal;
