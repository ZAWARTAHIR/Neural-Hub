import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { BoltIcon, Icon } from "../icons/Icons.jsx";
import { useAuth } from "../../lib/AuthContext.jsx";
import { getTheme, setTheme } from "../../lib/theme.js";
import { CHANNELS, displayName } from "./channels.js";

export default function Sidebar({ onCollapse, onNavigate, onOpenChat }) {
  const { user, signOut } = useAuth();
  const [theme, setThemeState] = useState(getTheme);
  const name = displayName(user);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  }

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-top">
        <div className="app-ws">
          <Link to="/" className="app-ws-mark" title="Back to site">
            <BoltIcon size={18} />
          </Link>
          <span className="app-ws-name">Onefeed</span>
          <div className="app-ws-actions">
            <button
              type="button"
              className="app-icon-btn"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
              title={theme === "dark" ? "Light theme" : "Dark theme"}
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} size={18} />
            </button>
            <button
              type="button"
              className="app-icon-btn"
              onClick={onCollapse}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <Icon name="chevronLeft" size={18} />
            </button>
          </div>
        </div>

        <div className="app-ws-meta">
          <span><Icon name="user" size={15} /> Admin workspace</span>
          <span><Icon name="grid" size={15} /> {CHANNELS.length} channels</span>
        </div>

        <p className="app-ws-desc">
          Onefeed is a multi-channel AI content platform: type one prompt and get
          ready-to-review content for every channel. <Link to="/">View site</Link>
        </p>
      </div>

      <nav className="app-sidebar-nav" aria-label="Channels">
        <div className="app-section-head">
          <span>Channels</span>
          <span className="app-count-pill">{CHANNELS.length}</span>
        </div>

        {CHANNELS.map((channel) => (
          <NavLink
            key={channel.key}
            to={channel.to}
            end={channel.end}
            className={({ isActive }) => `app-nav-item${isActive ? " active" : ""}`}
            onClick={() => {
              if (channel.key === "chat") onOpenChat({ focus: false });
              onNavigate();
            }}
          >
            <Icon name={channel.icon} size={18} className="app-nav-icon" />
            <span className="app-nav-label">{channel.label}</span>
            {channel.key === "chat" ? (
              <span className="app-live-dot" aria-label="Live" />
            ) : (
              <Icon name="chevronRight" size={16} className="app-nav-chevron" />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="app-profile">
        <span className="app-avatar" aria-hidden="true">{name.charAt(0)}</span>
        <div className="app-profile-text">
          <strong>{name}</strong>
          <span title={user?.email}>{user?.email}</span>
        </div>
        <button type="button" className="app-icon-btn" onClick={signOut} aria-label="Sign out" title="Sign out">
          <Icon name="signOut" size={18} />
        </button>
      </div>
    </aside>
  );
}
