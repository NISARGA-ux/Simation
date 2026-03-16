import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";

// Student Pages
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Quiz from "./pages/Quiz";
import Resume from "./pages/Resume";

// Recruiter Pages
import RecHome from "./pages/RecHome";
import RecQuiz from "./pages/RecQuiz";
import RecProfile from "./pages/RecProfile";
import RecJD from "./pages/RecJD";

// Mentor Pages
import MentorProfile from "./pages/MentorProfile";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  return children;
}

function RoleRoute({ allowedRoles = [], children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  const role = user.role;
  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  const role = user.role;
  if (role === "recruiter") return <Navigate to="/rechome" replace />;
  if (role === "student") return <Navigate to="/home" replace />;
  if (role === "mentor" || role === "faculty") return <Navigate to="/mentorprofile" replace />;
  return <Navigate to="/home" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardRedirect />} />

            {/* Student routes */}
            <Route path="/home" element={<RoleRoute allowedRoles={["student"]}><Home /></RoleRoute>} />
            <Route path="/resume" element={<RoleRoute allowedRoles={["student"]}><Resume /></RoleRoute>} />
            <Route path="/profile" element={<RoleRoute allowedRoles={["student"]}><Profile /></RoleRoute>} />
            <Route path="/quiz" element={<RoleRoute allowedRoles={["student"]}><Quiz /></RoleRoute>} />

            {/* Recruiter routes */}
            <Route path="/rechome" element={<RoleRoute allowedRoles={["recruiter"]}><RecHome /></RoleRoute>} />
            <Route path="/recjd" element={<RoleRoute allowedRoles={["recruiter"]}><RecJD /></RoleRoute>} />
            <Route path="/recquiz" element={<RoleRoute allowedRoles={["recruiter"]}><RecQuiz /></RoleRoute>} />
            <Route path="/recprofile" element={<RoleRoute allowedRoles={["recruiter"]}><RecProfile /></RoleRoute>} />

            {/* Mentor routes */}
            <Route path="/mentorprofile" element={<RoleRoute allowedRoles={["mentor","faculty"]}><MentorProfile /></RoleRoute>} />

            {/* Shared */}
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
