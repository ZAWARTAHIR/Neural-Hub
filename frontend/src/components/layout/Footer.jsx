import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo.jsx";
import { Icon } from "../icons/Icons.jsx";
import { getTheme, setTheme } from "../../lib/theme.js";

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
  const [theme, setThemeState] = useState(getTheme);

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
          <section className="footer-cta" aria-labelledby="footer-cta-title" data-scroll="enter" data-scroll-end="0.55">
            <div className="footer-cta-copy">
              <h2 id="footer-cta-title">Turn your next brief into four channels.</h2>
              <p>
                Write one prompt in the studio and review a blog post, visuals, a video script and a WhatsApp message.
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
            </div>
          </section>
        )}

        <div className="footer-v2-grid">
          <div className="footer-brand">
            <Logo />
            <p className="footer-tagline">The unified multi-channel AI marketing platform.</p>
            <p>Turn single prompts into blogs, visuals, videos, and broadcast messages.</p>
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
        </div>

        <div className="footer-wordmark" aria-hidden="true">Onefeed</div>

        <div className="footer-v2-bottom">
          <span>&copy; {year} Onefeed Technologies Inc. All rights reserved.</span>
          <div className="footer-bottom-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-and-conditions">Terms of Service</Link>
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
