import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center cs-dot-bg">
        <div className="flex flex-col items-center">

          {/* Spinner */}
          <div
            className="w-12 h-12 rounded-full animate-spin mb-4"
            style={{
              border: "4px solid rgba(245,158,11,0.2)", // amber soft ring
              borderTopColor: "#F59E0B", // main brand color
            }}
          />

          {/* Text */}
          <p
            className="font-semibold text-sm tracking-wide"
            style={{ color: "#F59E0B" }}
          >
            Loading...
          </p>

          {/* Optional subtle hint */}
          <p className="text-xs text-gray-400 mt-1">
            Preparing your session
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}