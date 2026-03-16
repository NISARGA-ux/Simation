import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Quiz from "./pages/Quiz";
import RecHome from "./pages/RecHome";
import RecJD from "./pages/RecJD";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function RoleRoute({ allowedRoles = [], children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (user.role === "recruiter") return <Navigate to="/rechome" replace />;
  return <Navigate to="/home" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />

          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Student */}
            <Route path="/home" element={<RoleRoute allowedRoles={["student"]}><Home /></RoleRoute>} />
            <Route path="/profile" element={<RoleRoute allowedRoles={["student"]}><Profile /></RoleRoute>} />
            <Route path="/quiz" element={<RoleRoute allowedRoles={["student"]}><Quiz /></RoleRoute>} />
            

            {/* Recruiter */}
            <Route path="/rechome" element={<RoleRoute allowedRoles={["recruiter"]}><RecHome /></RoleRoute>} />
            <Route path="/recjd" element={<RoleRoute allowedRoles={["recruiter"]}><RecJD /></RoleRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}