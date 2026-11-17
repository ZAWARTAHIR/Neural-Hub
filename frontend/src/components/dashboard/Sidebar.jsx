import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { BoltIcon, Icon } from "../icons/Icons.jsx";
import { useAuth } from "../../lib/AuthContext.jsx";
import { getTheme, setTheme } from "../../lib/theme.js";
import { CHANNELS, displayName } from "./channels.js";
import Avatar from "./Avatar.jsx";

// The "chat" channel lives on the overview route; the rest are content studios.
const STUDIOS = CHANNELS.filter((c) => c.key !== "chat");

export default function Sidebar({ onCollapse, onNavigate, onOpenChat }) {
  const { user, signOut } = useAuth();
  const [theme, setThemeState] = useState(getTheme);
  const name = displayName(user);
  const dark = theme === "dark";

  function toggleTheme() {
    const next = dark ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  }

  const navClass = ({ isActive }) => `sb-item${isActive ? " active" : ""}`;

  return (
    <aside className="app-sidebar">
      <div className="sb-brand">
        <Link to="/" className="sb-logo" title="Back to site">
          <BoltIcon size={15} />
        </Link>
        <div className="sb-brand-text">
          <strong>Onefeed</strong>
          <span>Admin workspace</span>
        </div>
        <button type="button" className="sb-icon-btn" onClick={onCollapse} aria-label="Collapse sidebar" title="Collapse sidebar">
          <Icon name="chevronLeft" size={16} />
        </button>
      </div>

      <div className="sb-cta-wrap">
        <button
          type="button"
          className="sb-cta"
          onClick={() => {
            onOpenChat({ focus: true });
            onNavigate();
          }}
        >
          <span className="sb-cta-icon"><Icon name="bot" size={15} strokeWidth={1.9} /></span>
          Ask AI Helper
        </button>
      </div>

      <nav className="sb-nav" aria-label="Workspace">
        <div className="sb-label">Workspace</div>
        <NavLink to="/dashboard" end className={navClass} onClick={onNavigate}>
          <span className="sb-item-icon"><Icon name="grid" size={16} /></span>
          <span className="sb-item-label">Overview</span>
        </NavLink>
        <NavLink to="/dashboard/campaign" className={navClass} onClick={onNavigate}>
          <span className="sb-item-icon"><Icon name="chat" size={16} /></span>
          <span className="sb-item-label">New campaign</span>
        </NavLink>

        <div className="sb-label">
          Create
          <span className="sb-label-count">{STUDIOS.length}</span>
        </div>
        {STUDIOS.map((channel) => (
          <NavLink key={channel.key} to={channel.to} className={navClass} onClick={onNavigate}>
            <span className="sb-item-icon"><Icon name={channel.icon} size={16} /></span>
            <span className="sb-item-label">{channel.label}</span>
            <span className="sb-item-meta">{channel.desc}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sb-foot">
        <button type="button" className="sb-item sb-theme" onClick={toggleTheme} role="switch" aria-checked={dark}>
          <span className="sb-item-icon"><Icon name={dark ? "moon" : "sun"} size={16} /></span>
          <span className="sb-item-label">Dark mode</span>
          <span className="sb-switch" aria-hidden="true" />
        </button>

        <div className="sb-profile">
          <NavLink
            to="/dashboard/profile"
            className={({ isActive }) => `sb-profile-link${isActive ? " active" : ""}`}
            onClick={onNavigate}
            title="View profile"
          >
            <Avatar user={user} size={32} className="sb-avatar" />
            <div className="sb-profile-text">
              <strong>{name}</strong>
              <span title={user?.email}>{user?.email}</span>
            </div>
          </NavLink>
          <button type="button" className="sb-icon-btn" onClick={signOut} aria-label="Sign out" title="Sign out">
            <Icon name="signOut" size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
