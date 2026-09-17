import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar.jsx";
import Navbar from "../components/layout/Navbar.jsx";
import Footer from "../components/layout/Footer.jsx";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 700);

  return (
    <>
      <Navbar />
      <main>
        <div className="dashboard-shell" style={{ flexDirection: "column" }}>
          <div className="dash-body">
            <Sidebar
              open={sidebarOpen}
              onToggle={() => setSidebarOpen((v) => !v)}
            />
            <main className="dash-main">
              <Outlet />
            </main>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
