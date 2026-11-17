import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import ChatPanel from "../components/dashboard/ChatPanel.jsx";
import { channelForPath } from "../components/dashboard/channels.js";
import { Icon } from "../components/icons/Icons.jsx";
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import { useAuth } from "../lib/AuthContext.jsx";

// Breakpoints must match styles/dashboard.css.
const SIDEBAR_INLINE = "(min-width: 861px)"; // below this the sidebar is a drawer
const matches = (query) => window.matchMedia(query).matches;

export default function Dashboard() {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="app-loading">Loading your workspace...</div>;
  }

  return isAdmin ? <AppShell /> : <PublicDashboard />;
}

function AppShell() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => matches(SIDEBAR_INLINE));
  // The AI Helper starts minimized as a round launcher, unless the visitor
  // arrived with a prefilled prompt from the marketing site.
  const [chatOpen, setChatOpen] = useState(() => Boolean(location.state?.prompt));
  const chatInputRef = useRef(null);
  const current = channelForPath(location.pathname);

  const openChat = useCallback(({ focus = true } = {}) => {
    setChatOpen(true);
    if (focus) requestAnimationFrame(() => chatInputRef.current?.focus());
  }, []);

  // Escape minimizes the AI Helper.
  useEffect(() => {
    if (!chatOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setChatOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chatOpen]);

  // Close the sidebar when it is drawn as an overlay.
  function closeOverlays() {
    if (!matches(SIDEBAR_INLINE)) setSidebarOpen(false);
  }

  function handleNavigate() {
    if (!matches(SIDEBAR_INLINE)) setSidebarOpen(false);
  }

  return (
    <div className={`app-shell ${sidebarOpen ? "sidebar-open" : "sidebar-closed"} ${chatOpen ? "chat-open" : "chat-closed"}`}>
      <Sidebar
        onCollapse={() => setSidebarOpen(false)}
        onNavigate={handleNavigate}
        onOpenChat={openChat}
      />

      <div className="app-center">
        <div className="app-topbar">
          {!sidebarOpen && (
            <button type="button" className="app-icon-btn" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar" title="Open sidebar">
              <Icon name="menu" size={20} />
            </button>
          )}

          <div className="app-crumbs">
            <Link to="/dashboard" className="app-crumb">
              <Icon name="grid" size={16} />
              Workspace
            </Link>
            {current.key !== "chat" && (
              <span className="app-crumb active">
                <Icon name={current.icon} size={16} />
                {current.label}
              </span>
            )}
          </div>
        </div>

        <main className="app-content">
          <Outlet context={{ openChat }} />
        </main>
      </div>

      {/* AI Helper: stays mounted while minimized so the conversation is kept. */}
      <aside className="app-chat-wrap" aria-hidden={!chatOpen}>
        <ChatPanel inputRef={chatInputRef} onClose={() => setChatOpen(false)} />
      </aside>

      <button
        type="button"
        className="ai-helper-launcher"
        onClick={() => (chatOpen ? setChatOpen(false) : openChat())}
        aria-label={chatOpen ? "Minimize AI Helper" : "Open AI Helper"}
        aria-expanded={chatOpen}
        title="AI Helper"
      >
        <span className="ai-helper-launcher-label" aria-hidden="true">
          <strong>AI Helper</strong>
          <small>Ask me anything</small>
        </span>
        <span className="ai-helper-launcher-orb">
          <span className="ai-helper-launcher-icon ai-helper-icon-bot"><Icon name="bot" size={28} strokeWidth={1.8} /></span>
          <span className="ai-helper-launcher-icon ai-helper-icon-close"><Icon name="close" size={24} strokeWidth={2.2} /></span>
          <span className="ai-helper-launcher-status" aria-hidden="true" />
        </span>
      </button>

      <div className="app-backdrop" onClick={closeOverlays} aria-hidden="true" />
    </div>
  );
}

// Shown to visitors who are not signed in as the admin.
function PublicDashboard() {
  const location = useLocation();

  return (
    <>
      <Navbar />
      <main>
        <div className="dashboard-shell">
          <main className="dash-main">
            <div className="dashboard-welcome">
              <div className="dashboard-welcome-head">
                <span className="badge badge-blog">Onefeed dashboard</span>
                <h1>One prompt. Every channel, handled.</h1>
                <p>
                  Onefeed helps your team turn one campaign idea into
                  ready-to-review content for every important channel.
                </p>
              </div>

              <div className="dashboard-service-grid">
                <article className="card card-blue">
                  <div className="cap">Chat</div>
                  <div className="body">
                    Describe your campaign in a prompt. Chat turns your
                    brief into clear content requests and next steps.
                  </div>
                </article>
                <article className="card card-red">
                  <div className="cap">Images</div>
                  <div className="body">
                    Create campaign visuals from the same brief, then
                    review and manage the generated image content.
                  </div>
                </article>
                <article className="card card-blue">
                  <div className="cap">Video</div>
                  <div className="body">
                    Turn your campaign idea into video-ready content for
                    short-form channels and social publishing.
                  </div>
                </article>
                <article className="card card-yellow">
                  <div className="cap">Blog</div>
                  <div className="body">
                    Expand a short prompt into structured blog content
                    that is ready for review and publishing.
                  </div>
                </article>
              </div>

              <div className="dashboard-welcome-cta">
                <h2>Ready to use the services?</h2>
                <p>Sign in first to create, manage, and save your content.</p>
                <Link className="btn btn-blue" to="/login" state={{ from: location }}>
                  Sign in to access services
                </Link>
              </div>
            </div>
          </main>
        </div>
      </main>
      <Footer showCta={false} />
    </>
  );
}
