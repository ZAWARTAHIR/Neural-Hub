import { Navigate, Outlet, useLocation, useOutletContext } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext.jsx";

export default function ProtectedRoute() {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();
  // Pass the dashboard shell's context (e.g. openChat) through to the protected pages.
  const outletContext = useOutletContext();

  if (loading) return <div className="auth-state">Loading your workspace...</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!isAdmin) return <Navigate to="/login" replace state={{ accessDenied: true }} />;

  return <Outlet context={outletContext} />;
}
