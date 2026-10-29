import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo.jsx";
import { Icon } from "../icons/Icons.jsx";
import { getTheme, setTheme } from "../../lib/theme.js";

const CTA_CHANNELS = [
  { icon: "blog", tone: "amber" },
  { icon: "image", tone: "coral" },
  { icon: "video", tone: "ink" },
  { icon: "whatsapp", tone: "teal" },
];

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { to: "/", label: "Home Overview" },
      { to: "/dashboard", label: "AI Studio Dashboard" },
      { to: "/blog", label: "Engineering & Insights" },
      { to: "/about", label: "About Onefeed" },
    ],
  },
  {
    title: "Channels",
    links: [
      { to: "/dashboard/blog", label: "Blog" },
      { to: "/dashboard/image", label: "Image" },
      { to: "/dashboard/video", label: "Video" },
      { to: "/dashboard/whatsapp", label: "WhatsApp" },
    ],
  },
  {
    title: "Legal & Trust",
    links: [
      { to: "/privacy-policy", label: "Privacy Policy" },
      { to: "/terms-and-conditions", label: "Terms of Service" },
      { to: "/about#architecture", label: "Security & Architecture" },
      { to: "/login", label: "Admin Portal" },
    ],
  },
];

export default function Footer({ showCta = true }) {
  const year = new Date().getFullYear();
  const navigate = useNavigate();
  const [brief, setBrief] = useState("");
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [theme, setThemeState] = useState(getTheme);

  function handleSubscribe(e) {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  }

  function handleBrief(e) {
    e.preventDefault();
    navigate("/dashboard", { state: { prompt: brief.trim() } });
  }

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  }

  return (
    <footer className="footer-v2">
      <div className="shell">
        {showCta && (
          <section className="footer-cta" aria-labelledby="footer-cta-title">
            <span className="tile-accents" aria-hidden="true" />
            <div className="footer-cta-copy">
              <div className="footer-cta-agents">
                <span className="agent-stack">
                  {CTA_CHANNELS.map((c) => (
                    <span key={c.icon} className={`icon-tile tone-${c.tone}`}>
                      <Icon name={c.icon} size={12} />
                    </span>
                  ))}
                </span>
                <span>4 channel agents, one brief</span>
              </div>
              <h2 id="footer-cta-title">Ready to revolutionize your marketing engine?</h2>
              <p>
                Open the studio dashboard, write a single prompt, and watch four high-impact channel assets generate in real-time.
              </p>
            </div>
            <div className="footer-cta-action">
              <form className="pill-form" onSubmit={handleBrief}>
                <input
                  type="text"
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="Describe your campaign…"
                  aria-label="Describe your campaign"
                />
                <button type="submit" className="btn btn-blue">
                  Open Studio
                  <Icon name="arrowRight" size={16} strokeWidth={2} />
                </button>
              </form>
              <p className="footer-cta-note">
                <strong>50,000+</strong> marketing assets generated · 99.9% workflow uptime
              </p>
            </div>
          </section>
        )}

        <div className="footer-v2-grid">
          <div className="footer-brand">
            <Logo />
            <p className="footer-tagline">The unified multi-channel AI marketing platform.</p>
            <p>Turn single prompts into blogs, visuals, videos, and broadcast messages.</p>
            <div className="footer-status-pill">
              <span className="pulse-dot green" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title} className="footer-col">
              <h4>{col.title}</h4>
              <ul className="footer-nav">
                {col.links.map((link) => (
                  <li key={link.to}>
                    <Link to={link.to}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="footer-col">
            <h4>Get Product Updates</h4>
            <div className="newsletter-box">
              <p>Receive our latest AI workflow playbooks and feature releases.</p>
              {subscribed ? (
                <div className="newsletter-success">✓ You are subscribed to updates!</div>
              ) : (
                <form onSubmit={handleSubscribe} className="newsletter-form">
                  <input
                    type="email"
                    required
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="newsletter-input"
                    aria-label="Email address"
                  />
                  <button type="submit" className="btn btn-blue btn-sm">
                    Join
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        <div className="footer-wordmark" aria-hidden="true">Onefeed</div>

        <div className="footer-v2-bottom">
          <span>&copy; {year} Onefeed Technologies Inc. All rights reserved.</span>
          <div className="footer-bottom-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">Terms of Service</Link>
            <span className="footer-version">v2.4.0</span>
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} size={16} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
