import { Routes, Route } from "react-router-dom";

import MarketingLayout from "./components/layout/MarketingLayout.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Blog from "./pages/Blog.jsx";
import BlogPost from "./pages/BlogPost.jsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx";
import TermsAndConditions from "./pages/TermsAndConditions.jsx";
import Login from "./pages/Login.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import DashboardHome from "./pages/dashboard/DashboardHome.jsx";
import BlogPage from "./pages/dashboard/BlogPage.jsx";
import ImagePage from "./pages/dashboard/ImagePage.jsx";
import VideoPage from "./pages/dashboard/VideoPage.jsx";
import GifPage from "./pages/dashboard/GifPage.jsx";
import WhatsappPage from "./pages/dashboard/WhatsappPage.jsx";
import ProfilePage from "./pages/dashboard/ProfilePage.jsx";
import CampaignPage from "./pages/dashboard/CampaignPage.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public marketing pages */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
      </Route>

      {/* Dashboard app */}
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />}>
        <Route element={<ProtectedRoute />}>
          <Route index element={<DashboardHome />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="image" element={<ImagePage />} />
          <Route path="gif" element={<GifPage />} />
          <Route path="video" element={<VideoPage />} />
          <Route path="whatsapp" element={<WhatsappPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="campaign" element={<CampaignPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
