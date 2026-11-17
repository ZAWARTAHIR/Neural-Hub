import { useNavigate } from "react-router-dom";
import CampaignStudio from "../../components/dashboard/CampaignStudio.jsx";

// Full-page campaign chat, opened from "Start chat" on the overview.
export default function CampaignPage() {
  const navigate = useNavigate();
  return (
    <div className="cs-page">
      <CampaignStudio className="cs-full" onClose={() => navigate("/dashboard")} />
    </div>
  );
}
