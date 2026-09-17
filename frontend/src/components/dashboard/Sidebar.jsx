import { NavLink } from "react-router-dom";

const items = [
  { to: "/dashboard/blog", label: "Blog", dot: "dot-blog" },
  { to: "/dashboard/image", label: "Image", dot: "dot-image" },
  { to: "/dashboard/video", label: "Video", dot: "dot-video" },
  { to: "/dashboard/whatsapp", label: "WhatsApp", dot: "dot-whatsapp" }
];

export default function Sidebar({ open, onToggle }) {
  return (
    <aside className={`sidebar ${open ? "" : "closed"}`}>
      <div className="sidebar-header">
        <p className="sidebar-label">Channels</p>
        <button
          type="button"
          className="sidebar-toggle"
          aria-label={open ? "Close sidebar" : "Open sidebar"}
          title={open ? "Close sidebar" : "Open sidebar"}
          onClick={onToggle}
        >
          <span />
        </button>
      </div>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
        >
          <span className={`dot ${item.dot}`} />
          <span className="sidebar-item-label">{item.label}</span>
        </NavLink>
      ))}
    </aside>
  );
}
