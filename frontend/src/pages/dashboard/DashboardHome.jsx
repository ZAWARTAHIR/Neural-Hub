import { Link, useOutletContext } from "react-router-dom";
import { Icon } from "../../components/icons/Icons.jsx";
import { useAuth } from "../../lib/AuthContext.jsx";
import { CHANNELS, displayName } from "../../components/dashboard/channels.js";

export default function DashboardHome() {
  const { user } = useAuth();
  const { openChat } = useOutletContext();
  const name = displayName(user);

  return (
    <div className="app-home">
      <header className="app-home-head">
        <h1>
          <Icon name="sparkle" size={22} className="app-home-head-icon" />
          Welcome, {name}.
          <span className="app-live-dot" aria-hidden="true" />
        </h1>
        <p>Pick a channel, or describe a campaign in the chat to get started.</p>
      </header>

      <section className="app-block">
        <div className="app-block-head">
          <h2>Get started</h2>
        </div>

        <div className="app-task">
          <span className="app-task-icon" style={{ color: "var(--teal)" }}>
            <Icon name="chat" size={20} />
          </span>
          <p>Describe your next campaign in the chat</p>
          <button type="button" className="app-btn app-btn-dark" onClick={() => openChat({ focus: true })}>
            Start chat
          </button>
        </div>

        <div className="app-task app-task-plain">
          <span className="app-task-icon" style={{ color: "var(--amber)" }}>
            <Icon name="blog" size={20} />
          </span>
          <p>
            <span className="app-task-muted">Ready to explore · </span>
            Your blog workspace
          </p>
          <Link className="app-btn app-btn-light" to="/dashboard/blog">Open</Link>
        </div>
      </section>

      <section className="app-block">
        <div className="app-block-head">
          <h2>Channels</h2>
          <span className="app-block-meta">{CHANNELS.length} channels</span>
        </div>

        <div className="app-folder-grid">
          {CHANNELS.map((channel) => {
            const content = (
              <>
                <span className="app-folder" aria-hidden="true">
                  <span className="app-folder-chip" style={{ color: channel.accent }}>
                    <Icon name={channel.icon} size={16} strokeWidth={2} />
                  </span>
                </span>
                <strong>{channel.label}</strong>
                <small>{channel.desc}</small>
              </>
            );

            return channel.key === "chat" ? (
              <button key={channel.key} type="button" className="app-folder-tile" onClick={() => openChat({ focus: true })}>
                {content}
              </button>
            ) : (
              <Link key={channel.key} to={channel.to} className="app-folder-tile">
                {content}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
