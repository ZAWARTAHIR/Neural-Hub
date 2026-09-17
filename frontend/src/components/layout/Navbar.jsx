import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const [legalOpen, setLegalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

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
    <header className="navbar">
      <div className="shell">
        <NavLink to="/" className="logo">
          <span className="mark" />
          Onefeed
        </NavLink>

        <button
          type="button"
          className="nav-menu-toggle"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <span />
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
          <li className="nav-legal" ref={menuRef}>
            <button
              type="button"
              className="nav-legal-btn"
              onClick={() => setLegalOpen((open) => !open)}
            >
              Legal
            </button>
            {legalOpen && (
              <div className="nav-legal-menu">
                <NavLink to="/privacy-policy" onClick={() => setLegalOpen(false)}>
                  Privacy Policy
                </NavLink>
                <NavLink to="/terms-and-conditions" onClick={() => setLegalOpen(false)}>
                  Terms &amp; Conditions
                </NavLink>
              </div>
            )}
          </li>
        </ul>
      </div>
    </header>
  );
}
