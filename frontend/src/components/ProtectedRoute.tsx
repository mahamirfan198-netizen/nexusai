import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({
  children,
  portal,
  roles,
}: {
  children: JSX.Element;
  portal?: "education" | "business";
  roles?: string[];
}) {
  const { user, loading } = useAuth();

  // 1. Wait for the token check to finish. Show a beautiful loader.
  if (loading) return (
    <div className="min-h-screen bg-[#03060a] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#00D68F] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  // 2. If no user, go to login
  if (!user) return <Navigate to="/login" replace />;

  // 3. Portal access check
  if (portal && user.active_portal !== portal && !user.roles.includes("platform_admin")) {
    return <Navigate to={`/${user.active_portal}/dashboard`} replace />;
  }

  // 4. Role access check
  if (roles && !roles.some(r => user.roles.includes(r)) && !user.roles.includes("platform_admin")) {
    return <div className="p-8 text-center text-red-500 min-h-screen bg-[#03060a]">Access denied. You do not have the required role.</div>;
  }

  return children;
}