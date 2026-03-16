import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user, switchRole } = useAuth();
  const role = user?.role || null;

  return (
    <aside
      className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-6 transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out z-50`}
    >
      <button
        onClick={toggleSidebar}
        className="absolute top-4 right-4 text-white"
      >
        ✕
      </button>

      <div className="mt-10">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gray-400">
          Demo Mode
        </p>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => { switchRole("student"); toggleSidebar(); }}
            className={`rounded border px-3 py-2 text-left hover:bg-gray-700 ${
              role === "student" ? "border-violet-400 bg-gray-700" : "border-gray-700"
            }`}
          >
            Student View
          </button>
          <button
            type="button"
            onClick={() => { switchRole("recruiter"); toggleSidebar(); }}
            className={`rounded border px-3 py-2 text-left hover:bg-gray-700 ${
              role === "recruiter" ? "border-violet-400 bg-gray-700" : "border-gray-700"
            }`}
          >
            Recruiter View
          </button>
          <button
            type="button"
            onClick={() => { switchRole("faculty"); toggleSidebar(); }}
            className={`rounded border px-3 py-2 text-left hover:bg-gray-700 ${
              role === "faculty" || role === "mentor" ? "border-violet-400 bg-gray-700" : "border-gray-700"
            }`}
          >
            Faculty View
          </button>
        </div>
      </div>

      <ul className="mt-8 space-y-6">
        {/* STUDENT MENU */}
        {role === "student" && (
          <>
            <li><Link to="/home" onClick={toggleSidebar}>📈 Skills Market</Link></li>
            <li><Link to="/resume" onClick={toggleSidebar}>📄 Resume Analyzer</Link></li>
            <li><Link to="/profile" onClick={toggleSidebar}>👤 Profile</Link></li>
            <li><Link to="/mentorhub" onClick={toggleSidebar}>🎯 Opportunities</Link></li>
            <li><Link to="/quiz" onClick={toggleSidebar}>📝 Career Quiz</Link></li>
            <li><Link to="/leaderboard" onClick={toggleSidebar}>🏆 Leaderboard</Link></li>
          </>
        )}

        {/* RECRUITER MENU */}
        {role === "recruiter" && (
          <>
            <li><Link to="/rechome" onClick={toggleSidebar}>🏠 Dashboard</Link></li>
            <li><Link to="/recjd" onClick={toggleSidebar}>🔍 JD Intelligence</Link></li>
            <li><Link to="/recquiz" onClick={toggleSidebar}>📝 Filter Quiz</Link></li>
            <li><Link to="/leaderboard" onClick={toggleSidebar}>🏆 Leaderboard</Link></li>
            <li><Link to="/recprofile" onClick={toggleSidebar}>👤 Profile</Link></li>
          </>
        )}

        {/* MENTOR/FACULTY MENU */}
        {(role === "mentor" || role === "faculty") && (
          <>
            <li><Link to="/mentorhome" onClick={toggleSidebar}>🏠 Dashboard</Link></li>
            <li><Link to="/mentorprofile" onClick={toggleSidebar}>👤 Profile</Link></li>
            <li><Link to="/mentoropportunities" onClick={toggleSidebar}>🎯 Post Opportunities</Link></li>
            <li><Link to="/leaderboard" onClick={toggleSidebar}>🏆 Leaderboard</Link></li>
          </>
        )}
      </ul>
    </aside>
  );
}