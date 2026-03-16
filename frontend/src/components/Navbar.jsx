import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 md:pl-72">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="text-gray-700 hover:text-gray-900 md:hidden"
            aria-label="Open navigation"
          >
            Menu
          </button>

          <div
            className="cursor-pointer"
            onClick={() => navigate("/")}
          >
            <p className="text-xs uppercase tracking-[0.35em] text-gray-500">Simation</p>
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">Simation</h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <span className="text-xs uppercase tracking-[0.2em] text-gray-400">Role</span>
          <span className="text-sm font-semibold text-gray-800">
            {user?.role === "recruiter" ? "Recruiter" : "Student"}
          </span>
        </div>
      </div>
    </nav>
  );
}
