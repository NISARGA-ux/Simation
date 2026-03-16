import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ isOpen, toggleSidebar }) {
  const { user } = useAuth();
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
        ❌
      </button>

      <ul className="mt-10 space-y-6">
        {/* STUDENT MENU */}
        {role === "student" && (
          <>
            <li><Link to="/home" onClick={toggleSidebar}>🏠 Home</Link></li>
            <li><Link to="/resume" onClick={toggleSidebar}>📄 Resume</Link></li>
            <li><Link to="/profile" onClick={toggleSidebar}>👤 Profile</Link></li>
            <li><Link to="/mentorhub" onClick={toggleSidebar}>🤝 Mentor Hub</Link></li>
            <li><Link to="/quiz" onClick={toggleSidebar}>📝 Student Quiz</Link></li>
            <li><Link to="/leaderboard" onClick={toggleSidebar}>🏆 Leaderboard</Link></li>
          </>
        )}

        {/* RECRUITER MENU */}
        {role === "recruiter" && (
          <>
            <li><Link to="/rechome" onClick={toggleSidebar}>🏠 Recruiter Home</Link></li>
            <li><Link to="/recquiz" onClick={toggleSidebar}>📝 Recruiter Quiz</Link></li>
            <li><Link to="/leaderboard" onClick={toggleSidebar}>🏆 Leaderboard</Link></li>
            <li><Link to="/recprofile" onClick={toggleSidebar}>👤 Recruiter Profile</Link></li>
          </>
        )}

        {/* MENTOR/FACULTY MENU */}
{(role === "mentor" || role === "faculty") && (
  <>
    <li><Link to="/mentorhome" onClick={toggleSidebar}>🏠 Mentor Dashboard</Link></li>
    <li><Link to="/mentorprofile" onClick={toggleSidebar}>👤 Mentor Profile</Link></li>
    {/*<li><Link to="/mentorhub" onClick={toggleSidebar}>🤝 Mentor Hub</Link></li>*/}
    <li><Link to="/mentoropportunities" onClick={toggleSidebar}>🎯 Opportunities</Link></li>
    <li><Link to="/leaderboard" onClick={toggleSidebar}>🏆 Leaderboard</Link></li>
  </>
)}

      </ul>
    </aside>
  );
}




// import { Link } from "react-router-dom";

// export default function Sidebar({ isOpen, toggleSidebar }) {
//   return (
//     <aside
//       className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white p-6 transform ${
//         isOpen ? "translate-x-0" : "-translate-x-full"
//       } transition-transform duration-300 ease-in-out z-50`}
//     >
//       <button
//         onClick={toggleSidebar}
//         className="absolute top-4 right-4 text-white"
//       >
//         ❌
//       </button>
//       <ul className="mt-10 space-y-6">
//         <li><Link to="/home" onClick={toggleSidebar}>🏠 Home</Link></li>
//         <li><Link to="/resume" onClick={toggleSidebar}>📄 Resume</Link></li>
//         <li><Link to="/profile" onClick={toggleSidebar}>👤 Profile</Link></li>
//         <li><Link to="/quiz" onClick={toggleSidebar}>📝 Quiz</Link></li>
//         <li><Link to="/leaderboard" onClick={toggleSidebar}>🏆 Leaderboard</Link></li>
//         <li><Link to="/mentorhub" onClick={toggleSidebar}>🤝 Mentor Hub</Link></li>
//       </ul>
//     </aside>
//   );
// }


