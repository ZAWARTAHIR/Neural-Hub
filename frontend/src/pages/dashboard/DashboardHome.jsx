import { Link } from "react-router-dom";
import { Icon } from "../../components/icons/Icons.jsx";
import { CHANNELS } from "../../components/dashboard/channels.js";

export default function DashboardHome() {

  return (
    <div className="app-home">
      <section className="app-block">
        <div className="app-block-head">
          <h2>Get started</h2>
        </div>

        <div className="app-task">
          <span className="app-task-icon">
            <Icon name="chat" size={20} />
          </span>
          <p>Describe your next campaign in the chat</p>
          <Link className="app-btn app-btn-dark" to="/dashboard/campaign">
            Start chat
          </Link>
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
                <span className="app-folder" aria-hidden="true" />
                <strong>{channel.label}</strong>
                <small>{channel.desc}</small>
              </>
            );

            // The Chat tile opens the campaign studio page.
            const to = channel.key === "chat" ? "/dashboard/campaign" : channel.to;
            return (
              <Link key={channel.key} to={to} className="app-folder-tile">
                {content}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
