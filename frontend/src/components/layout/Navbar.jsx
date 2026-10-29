import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext.jsx";
import Logo from "./Logo.jsx";
import { Icon } from "../icons/Icons.jsx";

const CHANNEL_LINKS = [
  { to: "/dashboard/blog", icon: "blog", tone: "amber", name: "Blog Agent", desc: "Long-form SEO articles" },
  { to: "/dashboard/image", icon: "image", tone: "coral", name: "Visual Agent", desc: "On-brand campaign visuals" },
  { to: "/dashboard/video", icon: "video", tone: "ink", name: "Video Agent", desc: "Short-form video scripts" },
  { to: "/dashboard/whatsapp", icon: "whatsapp", tone: "teal", name: "WhatsApp Agent", desc: "Formatted broadcasts" },
];

const LEGAL_LINKS = [
  { to: "/privacy-policy", name: "Privacy Policy" },
  { to: "/terms-and-conditions", name: "Terms & Conditions" },
];

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 15);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setOpenMenu(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  function toggleMenu(name) {
    setOpenMenu((current) => (current === name ? null : name));
  }

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`} ref={navRef}>
      <div className="shell">
        <Logo />

        <nav className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`} aria-label="Main">
          <div className="nav-dropdown">
            <button
              type="button"
              className="nav-link"
              aria-expanded={openMenu === "channels"}
              onClick={() => toggleMenu("channels")}
            >
              <span>Channels</span>
              <Icon name="chevronDown" size={14} strokeWidth={2.2} className="nav-chevron" />
            </button>
            {openMenu === "channels" && (
              <div className="nav-panel nav-panel-wide">
                <p className="nav-panel-label">Channel agents</p>
                <div className="nav-panel-grid">
                  {CHANNEL_LINKS.map((item) => (
                    <Link key={item.to} to={item.to} className="nav-panel-item">
                      <span className={`icon-tile tone-${item.tone}`}>
                        <Icon name={item.icon} size={18} />
                      </span>
                      <span>
                        <strong>{item.name}</strong>
                        <small>{item.desc}</small>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <NavLink to="/dashboard" end className="nav-link">
            Dashboard
          </NavLink>
          <NavLink to="/blog" className="nav-link">
            Blog
          </NavLink>
          <NavLink to="/about" className="nav-link">
            About
          </NavLink>

          <div className="nav-dropdown">
            <button
              type="button"
              className="nav-link"
              aria-expanded={openMenu === "legal"}
              onClick={() => toggleMenu("legal")}
            >
              <span>Legal</span>
              <Icon name="chevronDown" size={14} strokeWidth={2.2} className="nav-chevron" />
            </button>
            {openMenu === "legal" && (
              <div className="nav-panel">
                {LEGAL_LINKS.map((item) => (
                  <Link key={item.to} to={item.to} className="nav-panel-link">
                    {item.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="nav-mobile-actions">
            {user ? (
              <button type="button" className="btn btn-outline" onClick={signOut}>
                Sign out
              </button>
            ) : (
              <Link to="/login" className="btn btn-outline">
                Sign in
              </Link>
            )}
            <Link to="/dashboard" className="btn btn-blue">
              {user ? "Open Studio" : "Start Free"}
              <Icon name="arrowRight" size={16} strokeWidth={2} />
            </Link>
          </div>
        </nav>

        <div className="nav-actions">
          {user ? (
            <button type="button" className="nav-text-btn" onClick={signOut}>
              Sign out
            </button>
          ) : (
            <NavLink to="/login" className="nav-text-btn">
              Sign in
            </NavLink>
          )}
          <Link to="/dashboard" className="nav-auth-btn">
            <span>{user ? "Open Studio" : "Start Free"}</span>
            <Icon name="arrowRight" size={16} strokeWidth={2} />
          </Link>
          <button
            type="button"
            className="nav-menu-toggle"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <Icon name={mobileMenuOpen ? "close" : "menu"} size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    </header>
  );
}
