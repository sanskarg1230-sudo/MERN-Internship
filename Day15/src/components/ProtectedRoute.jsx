import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ adminOnly = false, customerOnly = false }) {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <div className="loading-spinner">Loading authentication...</div>;
  }

  // Redirect to login if not logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role?.toLowerCase();

  // Redirect to login if role is unrecognized to prevent ping-pong redirect loops
  if (role !== "admin" && role !== "customer") {
    console.error("Invalid user role:", user.role);
    return <Navigate to="/login" replace />;
  }

  // Redirect to store if customer tries to access admin-only page
  if (adminOnly && role !== "admin") {
    return <Navigate to="/store" replace />;
  }

  // Redirect to admin dashboard if admin tries to access customer-only page
  if (customerOnly && role !== "customer") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
