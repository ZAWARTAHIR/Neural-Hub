import { useState } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  function handleSubscribe(e) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  }

  return (
    <footer className="footer-v2">
      <div className="shell">
        <div className="footer-v2-grid">
          {/* Col 1: Brand & Status */}
          <div className="footer-brand">
            <Link to="/" className="logo">
              <div className="mark-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor"/>
                </svg>
              </div>
              <span>Onefeed</span>
              <span className="logo-tag">AI</span>
            </Link>
            <p>
              The unified multi-channel AI marketing platform. Turn single prompts into blogs, visuals, videos, and broadcast messages.
            </p>
            <div className="footer-status-pill">
              <span className="pulse-dot green" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div className="footer-col">
            <h4>Platform</h4>
            <ul className="footer-nav">
              <li><Link to="/">Home Overview</Link></li>
              <li><Link to="/dashboard">AI Studio Dashboard</Link></li>
              <li><Link to="/blog">Engineering &amp; Insights</Link></li>
              <li><Link to="/about">About Onefeed</Link></li>
            </ul>
          </div>

          {/* Col 3: Compliance & Legal */}
          <div className="footer-col">
            <h4>Legal &amp; Trust</h4>
            <ul className="footer-nav">
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions">Terms of Service</Link></li>
              <li><Link to="/about#architecture">Security &amp; Architecture</Link></li>
              <li><Link to="/login">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="footer-col">
            <h4>Get Product Updates</h4>
            <div className="newsletter-box">
              <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "8px" }}>
                Receive our latest AI workflow playbooks and feature releases.
              </p>
              {subscribed ? (
                <div style={{ background: "var(--lime-light)", color: "var(--lime-hover)", padding: "10px 14px", borderRadius: "6px", fontWeight: "700", fontSize: "13.5px", border: "1px solid var(--lime)" }}>
                  ✓ You are subscribed to updates!
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="newsletter-form">
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="newsletter-input"
                  />
                  <button type="submit" className="btn btn-blue btn-sm">
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="footer-v2-bottom">
          <span>&copy; {year} Onefeed Technologies Inc. All rights reserved.</span>
          <div style={{ display: "flex", gap: "18px", alignItems: "center" }}>
            <span>Built for Modern Growth &amp; Content Teams</span>
            <span style={{ color: "var(--blue)", fontWeight: "700" }}>v2.4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
