import { useNavigate, useOutletContext } from "react-router-dom";
import CampaignStudio from "../../components/dashboard/CampaignStudio.jsx";

// Full-page campaign chat, opened from "Start chat" on the overview.
// The dashboard greeting bar is hidden here, so the chat header carries the
// "open sidebar" button when the sidebar is collapsed.
export default function CampaignPage() {
  const navigate = useNavigate();
  const { sidebarOpen, openSidebar } = useOutletContext() ?? {};
  return (
    <div className="cs-page">
      <CampaignStudio
        className="cs-full"
        onClose={() => navigate("/dashboard")}
        onOpenSidebar={sidebarOpen === false ? openSidebar : undefined}
      />
    </div>
  );
}
