import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext.jsx";

export default function ProtectedRoute() {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="auth-state">Loading your workspace...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!isAdmin) return <Navigate to="/login" replace state={{ accessDenied: true }} />;

  return <Outlet />;
}
