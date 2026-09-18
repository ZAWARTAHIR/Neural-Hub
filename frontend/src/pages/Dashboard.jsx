import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";
import { useAuth } from "../lib/AuthContext.jsx";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 700);

  return (
    <>
      <Navbar />
      <main>
        <div className="dashboard-shell" style={{ flexDirection: "column" }}>
          <div className="dash-body">
            {user && (
              <Sidebar
                open={sidebarOpen}
                onToggle={() => setSidebarOpen((v) => !v)}
              />
            )}
            <main className="dash-main">
              {loading ? (
                <div className="auth-state">Loading your workspace...</div>
              ) : user ? (
                <Outlet />
              ) : (
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
              )}
            </main>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
