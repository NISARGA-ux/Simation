import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const { switchRole } = useAuth();
  const navigate = useNavigate();

  const enterAs = (role) => {
    switchRole(role);
    if (role === "recruiter") navigate("/rechome");
    else navigate("/home");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden relative">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Nav */}
        <nav className="flex items-center justify-between py-6">
          <h1 className="text-xl font-bold tracking-tight">
            Simation<span className="text-violet-400">.</span>
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            Live market data
          </div>
        </nav>

        {/* Hero section */}
        <div className="text-center pt-16 pb-12">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-sm text-gray-300 px-4 py-1.5 rounded-full mb-6">
            AI-Powered Skills Intelligence Platform
          </div>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
            Bridge the gap between<br />
            <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
              campus and career
            </span>
          </h2>
          <p className="text-gray-400 text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
            Real-time job market intelligence meets student skill tracking.
            Students build portfolios over 4 years. Recruiters find exactly who they need.
            Every data point is live — nothing hardcoded, nothing fake.
          </p>
        </div>

        {/* Two paths */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-16">
          {/* Student card */}
          <div className="bg-white/[0.03] backdrop-blur border border-white/10 rounded-2xl p-8 hover:border-violet-500/30 transition group">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-2xl">
                🎓
              </div>
              <div>
                <h3 className="text-xl font-bold">I'm a Student</h3>
                <p className="text-sm text-gray-500">Build skills, track progress, get discovered</p>
              </div>
            </div>

            {/* Two student journey previews */}
            <div className="space-y-4 mb-6">
              {/* Year 1-3 preview */}
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full">
                      Year 1–3
                    </span>
                    <span className="text-sm font-medium text-gray-300">Growth Mode</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Import your GitHub repos to auto-build your portfolio. See which skills are trending in the job market
                  right now. Take skill assessments benchmarked against real demand. Climb the department leaderboard.
                  Every project you add makes you more discoverable when placement season hits.
                </p>
                <div className="flex gap-2 mt-3">
                  <span className="text-[10px] bg-violet-500/10 text-violet-300 px-2 py-0.5 rounded">Skills Market</span>
                  <span className="text-[10px] bg-violet-500/10 text-violet-300 px-2 py-0.5 rounded">GitHub Import</span>
                  <span className="text-[10px] bg-violet-500/10 text-violet-300 px-2 py-0.5 rounded">Leaderboard</span>
                  <span className="text-[10px] bg-violet-500/10 text-violet-300 px-2 py-0.5 rounded">Assessment</span>
                </div>
              </div>

              {/* Year 4 preview */}
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full">
                      Year 4
                    </span>
                    <span className="text-sm font-medium text-gray-300">Placement Mode</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Everything from Growth Mode plus: your profile enters the recruiter matching pool.
                  When companies visit campus and post JDs, you see which ones match your skills.
                  Get notified when a recruiter shortlists you. Your 3 years of tracked portfolio IS your application.
                </p>
                <div className="flex gap-2 mt-3">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded">Everything above</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded">JD Matching</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded">Shortlist Alerts</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => enterAs("student")}
                className="py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition shadow-lg shadow-violet-600/20 text-sm"
              >
                Year 2 Student →
                <span className="block text-[10px] font-normal text-violet-200 mt-0.5">Preeti · Growth Mode</span>
              </button>
              <button
                onClick={() => enterAs("student-y4")}
                className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition shadow-lg shadow-emerald-600/20 text-sm"
              >
                Year 4 Student →
                <span className="block text-[10px] font-normal text-emerald-200 mt-0.5">Karan · Placement Mode</span>
              </button>
            </div>
          </div>

          {/* Recruiter card */}
          <div className="bg-white/[0.03] backdrop-blur border border-white/10 rounded-2xl p-8 hover:border-blue-500/30 transition group">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl">
                🏢
              </div>
              <div>
                <h3 className="text-xl font-bold">I'm a Recruiter</h3>
                <p className="text-sm text-gray-500">Find verified talent for your open roles</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">JD Intelligence Engine</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Paste any job description. AI extracts required skills, categorizes them as must-have vs nice-to-have,
                  then scans every Year 3-4 student profile to find ranked matches. Each candidate shows a skill
                  match percentage, radar chart comparison, and relevant projects from their actual GitHub portfolio.
                </p>
                <div className="flex gap-2 mt-3">
                  <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded">AI Skill Extraction</span>
                  <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded">Ranked Matching</span>
                  <span className="text-[10px] bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded">Radar Charts</span>
                </div>
              </div>

              <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Shortlist → Student Gets Notified</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  When you shortlist a candidate, they see it on their dashboard. They know which skills matched
                  and which gaps remain. The feedback loop motivates students to keep building — and gives you
                  a stronger talent pipeline next cycle.
                </p>
              </div>
            </div>

            <button
              onClick={() => enterAs("recruiter")}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition shadow-lg shadow-blue-600/20"
            >
              Enter as Recruiter →
            </button>
          </div>
        </div>

        {/* Data sources bar */}
        <div className="border-t border-white/5 py-8 text-center">
          <p className="text-xs text-gray-600 uppercase tracking-wider mb-4">
            Powered by real-time data from
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span>Google Jobs API</span>
            <span className="text-gray-700">·</span>
            <span>Google Trends</span>
            <span className="text-gray-700">·</span>
            <span>GitHub API</span>
            <span className="text-gray-700">·</span>
            <span>Stack Overflow</span>
            <span className="text-gray-700">·</span>
            <span>Tavily Search</span>
            <span className="text-gray-700">·</span>
            <span>Groq LLM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
