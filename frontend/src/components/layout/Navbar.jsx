import { useState, useRef, useEffect } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext.jsx";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [legalOpen, setLegalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

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
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setLegalOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="shell">
        <NavLink to="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="mark-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor"/>
            </svg>
          </div>
          <span>Onefeed</span>
          <span className="logo-tag">AI</span>
        </NavLink>

        <button
          type="button"
          className="nav-menu-toggle"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="8" x2="20" y2="8" />
              <line x1="4" y1="16" x2="20" y2="16" />
            </svg>
          )}
        </button>

        <ul className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <li>
            <NavLink to="/" end onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => (isActive ? "active" : "")}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => (isActive ? "active" : "")}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => (isActive ? "active" : "")}>
              About
            </NavLink>
          </li>
          <li>
            <NavLink to="/blog" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => (isActive ? "active" : "")}>
              Blog
            </NavLink>
          </li>
          <li className="nav-legal" ref={menuRef}>
            <button
              type="button"
              className="nav-legal-btn"
              onClick={() => setLegalOpen((open) => !open)}
            >
              <span>Legal</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: legalOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s ease" }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {legalOpen && (
              <div className="nav-legal-menu">
                <NavLink to="/privacy-policy" onClick={() => { setLegalOpen(false); setMobileMenuOpen(false); }}>
                  🔒 Privacy Policy
                </NavLink>
                <NavLink to="/terms-and-conditions" onClick={() => { setLegalOpen(false); setMobileMenuOpen(false); }}>
                  📄 Terms &amp; Conditions
                </NavLink>
              </div>
            )}
          </li>
          <li className="nav-actions">
            {user ? (
              <button type="button" className="nav-auth-btn" onClick={() => { signOut(); setMobileMenuOpen(false); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Sign out</span>
              </button>
            ) : (
              <NavLink to="/login" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `nav-auth-btn ${isActive ? "active" : ""}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                <span>Sign in</span>
              </NavLink>
            )}
          </li>
        </ul>
      </div>
    </header>
  );
}
