import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";

// Student Pages
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import MentorHub from "./pages/MentorHub";
import Profile from "./pages/Profile";
import Quiz from "./pages/Quiz";
import Resume from "./pages/Resume";

// Recruiter Pages
import RecHome from "./pages/RecHome";
import RecQuiz from "./pages/RecQuiz";
import RecProfile from "./pages/RecProfile";

//Mentor Pages
import MentorHome from "./pages/Mentorhome";
import MentorOpportunities from "./pages/MentorOpportunities";
import MentorProfile from "./pages/MentorProfile";


// Shared
import Login from "./pages/Login";

// Role-protected wrappers (use inside AuthProvider)
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RoleRoute({ allowedRoles = [], children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  // accept synonyms for mentor role: "mentor" or "faculty"
  const role = user.role;
  if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return children;
}

// helper to redirect to role-appropriate default
function DashboardRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  const role = user.role;
  if (role === "recruiter") return <Navigate to="/rechome" replace />;
  if (role === "student") return <Navigate to="/home" replace />;
  if (role === "mentor" || role === "faculty") return <Navigate to="/mentorhub" replace />;
  return <Navigate to="/home" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Protected Layout */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            {/* index: redirect to role dashboard */}
            <Route index element={<DashboardRedirect />} />

            {/* Student routes */}
            <Route path="/home" element={<RoleRoute allowedRoles={["student"]}><Home /></RoleRoute>} />
            <Route path="/resume" element={<RoleRoute allowedRoles={["student"]}><Resume /></RoleRoute>} />
            <Route path="/profile" element={<RoleRoute allowedRoles={["student"]}><Profile /></RoleRoute>} />
            <Route path="/mentorhub" element={<RoleRoute allowedRoles={["student","mentor","faculty"]}><MentorHub /></RoleRoute>} />
            <Route path="/quiz" element={<RoleRoute allowedRoles={["student"]}><Quiz /></RoleRoute>} />

            {/* Recruiter routes */}
            <Route path="/rechome" element={<RoleRoute allowedRoles={["recruiter"]}><RecHome /></RoleRoute>} />
            <Route path="/recquiz" element={<RoleRoute allowedRoles={["recruiter"]}><RecQuiz /></RoleRoute>} />
            <Route path="/recprofile" element={<RoleRoute allowedRoles={["recruiter"]}><RecProfile /></RoleRoute>} />
            
            {/* Mentor routes */}
            <Route path="/mentorhome" element={<RoleRoute allowedRoles={["mentor","faculty"]}><MentorHome /></RoleRoute>} />
            <Route path="/mentorprofile" element={<RoleRoute allowedRoles={["mentor","faculty"]}><MentorProfile /></RoleRoute>} />
            <Route path="/mentoropportunities" element={<RoleRoute allowedRoles={["mentor","faculty"]}><MentorOpportunities /></RoleRoute>} />
            <Route path="/mentorhub" element={<RoleRoute allowedRoles={["student","mentor","faculty"]}><MentorHub /></RoleRoute>} />

            {/* Shared */}
            <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}




// // src/App.jsx
// import React, { useContext } from "react";
// import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// import { AuthProvider} from "./context/AuthContext";
// import { useAuth } from "./context/AuthContext";
// import MainLayout from "./layouts/MainLayout";

// // Pages
// import Home from "./pages/Home";
// import Leaderboard from "./pages/Leaderboard";
// import MentorHub from "./pages/MentorHub";
// import Profile from "./pages/Profile";
// import Quiz from "./pages/Quiz";
// import Resume from "./pages/Resume";
// import Login from "./pages/Login";

// // ProtectedRoute component
// function ProtectedRoute({ children }) {
//   const { user } = useAuth();
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }
//   return children;
// }

// export default function App() {
//   return (
//     <AuthProvider>
//       <Router>
//         <Routes>
//           {/* Public */}
//           <Route path="/login" element={<Login />} />

//           {/* Protected Layout */}
//           <Route
//             element={
//               <ProtectedRoute>
//                 <MainLayout />
//               </ProtectedRoute>
//             }
//           >
//             <Route index element={<Home />} />
//             <Route path="/leaderboard" element={<Leaderboard />} />
//             <Route path="/mentorhub" element={<MentorHub />} />
//             <Route path="/profile" element={<Profile />} />
//             <Route path="/quiz" element={<Quiz />} />
//             <Route path="/resume" element={<Resume />} />
//           </Route>

//           {/* Catch-all */}
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </Router>
//     </AuthProvider>
//   );
// }




