import { Routes, Route } from "react-router-dom";

import MarketingLayout from "./components/layout/MarketingLayout.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsAndConditions from "./pages/TermsAndConditions.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import ChatPanel from "./components/dashboard/ChatPanel.jsx";
import BlogPage from "./pages/dashboard/BlogPage.jsx";
import ImagePage from "./pages/dashboard/ImagePage.jsx";
import VideoPage from "./pages/dashboard/VideoPage.jsx";
import WhatsappPage from "./pages/dashboard/WhatsappPage.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public marketing pages */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      </Route>

      {/* Dashboard app */}
      <Route path="/dashboard" element={<Dashboard />}>
        <Route index element={<ChatPanel />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="image" element={<ImagePage />} />
        <Route path="video" element={<VideoPage />} />
        <Route path="whatsapp" element={<WhatsappPage />} />
      </Route>
    </Routes>
  );
}
