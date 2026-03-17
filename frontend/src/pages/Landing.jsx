import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Landing() {
  const { switchRole } = useAuth();
  const navigate = useNavigate();

  const enterAs = (role) => {
    switchRole(role);
    if (role === "recruiter") navigate("/rechome");
    else navigate("/home");
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#f5f3ff] text-[#1c1c1e] flex items-center justify-center relative">
      {/* Base */}
      <div className="absolute inset-0 bg-[#f5f3ff]" />

      {/* Edge grid lines (faded toward center) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.12) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          WebkitMaskImage:
            "radial-gradient(circle at center, transparent 30%, black 75%)",
          maskImage:
            "radial-gradient(circle at center, transparent 30%, black 75%)",
          opacity: 0.6,
        }}
      />

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Noise texture */}
      <div className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none">
        <svg width="100%" height="100%">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      {/* Soft glow */}
      <div className="absolute w-[500px] h-[500px] bg-purple-300/20 blur-[140px] rounded-full top-[-20%] left-[10%]" />
      <div className="absolute w-[400px] h-[400px] bg-pink-200/20 blur-[120px] rounded-full bottom-[-20%] right-[10%]" />

      <div className="relative z-10 w-full max-w-5xl px-6">

        {/* TOP BADGE */}
        <div className="flex justify-center mb-6">
          <div className="text-xs tracking-wide text-gray-500 border border-gray-200 px-4 py-1 rounded-full bg-white/60 backdrop-blur">
            AI Skills Intelligence Platform
          </div>
        </div>

        {/* BRAND */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-6xl md:text-7xl font-semibold tracking-tight">
            Simation
          </h1>
          <p className="text-gray-500 text-lg mt-3">
            Where skills meet real market demand
          </p>
        </motion.div>

        {/* FEATURE STRIP */}
        <div className="flex justify-center gap-6 text-xs text-gray-500 mb-10 flex-wrap">
          <span>Live Market Data</span>
          <span>•</span>
          <span>AI Skill Matching</span>
          <span>•</span>
          <span>GitHub Portfolios</span>
          <span>•</span>
          <span>Real Recruiters</span>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Student */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-7 shadow-sm"
          >
            <p className="text-xs text-gray-400 mb-1">Students</p>
            <h2 className="text-2xl font-medium mb-2">Build. Track. Get discovered.</h2>
            <p className="text-sm text-gray-500 mb-6">
              Your 4-year journey becomes your strongest proof of skill.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => enterAs("student")}
                className="flex-1 py-2.5 rounded-full bg-[#1c1c1e] text-white text-sm font-medium hover:opacity-90 transition"
              >
                Year 2
              </button>
              <button
                onClick={() => enterAs("student-y4")}
                className="flex-1 py-2.5 rounded-full bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300 transition"
              >
                Year 4
              </button>
            </div>
          </motion.div>

          {/* Recruiter */}
          <motion.div
            whileHover={{ y: -6 }}
            className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-3xl p-7 shadow-sm"
          >
            <p className="text-xs text-gray-400 mb-1">Recruiters</p>
            <h2 className="text-2xl font-medium mb-2">Hire with precision</h2>
            <p className="text-sm text-gray-500 mb-6">
              AI-ranked candidates based on real skill data.
            </p>

            <button
              onClick={() => enterAs("recruiter")}
              className="w-full py-2.5 rounded-full bg-[#1c1c1e] text-white text-sm font-medium hover:opacity-90 transition"
            >
              Continue
            </button>
          </motion.div>
        </div>

        {/* FOOTER */}
        <div className="mt-10 text-center text-xs text-gray-400">
          Powered by real-time signals · No fake data · No static profiles
        </div>
      </div>
    </div>
  );
}
