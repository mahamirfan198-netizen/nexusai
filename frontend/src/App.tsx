import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CustomCursor } from "./components/CustomCursor";
import { RocketIntro } from "./components/RocketIntro";
import { SupportWidget } from "./components/SupportWidget";
import { Toaster } from "react-hot-toast";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EducationDashboard from "./pages/EducationDashboard";
import BusinessDashboard from "./pages/BusinessDashboard";
import Analytics from "./pages/Analytics";
import TeacherDashboard from "./pages/TeacherDashboard";
import Directory from "./pages/Directory";

const qc = new QueryClient();

function PortalRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8 text-white bg-[#03060a] min-h-screen">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.active_portal === "business") return <Navigate to="/business/dashboard" replace />;
  if (user.roles.includes("teacher")) return <Navigate to="/teacher/dashboard" replace />;
  return <Navigate to="/education/dashboard" replace />;
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  useEffect(() => {
    if (showIntro) { document.body.style.overflow = "hidden"; } else { document.body.style.overflow = "auto"; }
  }, [showIntro]);

  return (
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <div className="cursor-none min-h-screen">
          <CustomCursor />
          {showIntro ? (
            <RocketIntro onComplete={() => setShowIntro(false)} />
          ) : (
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/portal" element={<PortalRedirect />} />
                <Route path="/directory" element={<Directory />} />
                <Route path="/education/dashboard" element={<ProtectedRoute portal="education"><EducationDashboard /></ProtectedRoute>} />
                <Route path="/education/analytics" element={<ProtectedRoute portal="education"><Analytics /></ProtectedRoute>} />
                <Route path="/teacher/dashboard" element={<ProtectedRoute portal="education" roles={["teacher", "education_admin"]}><TeacherDashboard /></ProtectedRoute>} />
                <Route path="/business/dashboard" element={<ProtectedRoute portal="business"><BusinessDashboard /></ProtectedRoute>} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <SupportWidget />
              <Toaster position="bottom-right" toastOptions={{ style: { background: "#0B1724", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" } }} />
            </BrowserRouter>
          )}
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}