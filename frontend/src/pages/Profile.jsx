import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import GitHubImport from "../components/GitHubImport";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// ── Skills extraction from achievements ──
function extractSkillProfile(achievements) {
  const domainCounts = {};
  const skillCounts = {};
  const domainPoints = {};

  achievements.forEach((a) => {
    const domain = a.domain || "Other";
    domainCounts[domain] = (domainCounts[domain] || 0) + 1;
    domainPoints[domain] = (domainPoints[domain] || 0) + (a.points || 0);

    if (Array.isArray(a.skillTags)) {
      a.skillTags.forEach((tag) => {
        skillCounts[tag] = (skillCounts[tag] || 0) + 1;
      });
    }
  });

  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);

  const domains = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count, points: domainPoints[name] || 0 }));

  return { topSkills, domains, skillCounts };
}

// ── Domain color mapping ──
function getDomainColor(domain) {
  const map = {
    Project: "bg-violet-100 text-violet-700",
    Hackathon: "bg-rose-100 text-rose-700",
    Internship: "bg-blue-100 text-blue-700",
    Certification: "bg-emerald-100 text-emerald-700",
    Course: "bg-amber-100 text-amber-700",
    Competition: "bg-cyan-100 text-cyan-700",
    "Research Paper": "bg-indigo-100 text-indigo-700",
    Research: "bg-indigo-100 text-indigo-700",
    Workshop: "bg-orange-100 text-orange-700",
    "Open Source": "bg-gray-100 text-gray-700",
    "Extra-Curricular": "bg-pink-100 text-pink-700",
    Other: "bg-gray-100 text-gray-600",
  };
  return map[domain] || map.Other;
}

// ── Notification card ──
function NotificationCard({ n }) {
  return (
    <div className={`p-4 rounded-xl border transition ${
      n.read ? "bg-white border-gray-200" : "bg-white border-emerald-300 shadow-sm"
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">
            {!n.read && <span className="text-emerald-500 mr-1.5 text-xs">●</span>}
            <span className="font-bold">{n.company}</span> shortlisted you for{" "}
            <span className="font-bold">{n.jobTitle}</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            by {n.recruiterName} ·{" "}
            {new Date(n.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
        </div>
        <div className="text-right shrink-0 ml-4">
          <span className={`text-xl font-bold font-mono ${
            n.matchPercent >= 70 ? "text-emerald-600" : n.matchPercent >= 40 ? "text-amber-600" : "text-gray-500"
          }`}>
            {n.matchPercent}%
          </span>
          <p className="text-[10px] text-gray-400">match</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {(n.skillsMatched || []).map((s, i) => (
          <span key={`m-${i}`} className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
            ✓ {s}
          </span>
        ))}
        {(n.skillsMissing || []).map((s, i) => (
          <span key={`x-${i}`} className="text-[10px] bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full">
            Gap: {s}
          </span>
        ))}
      </div>

      {(n.skillsMissing || []).length > 0 && (
        <p className="text-xs text-gray-400 mt-2 italic">
          Closing these gaps would improve your match for similar roles.
        </p>
      )}
    </div>
  );
}

// ── Achievement card ──
function AchievementCard({ a }) {
  const domainColor = getDomainColor(a.domain);
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 text-sm flex-1 line-clamp-1">
          {a.title || "Untitled"}
        </h3>
        <span className="text-xs font-bold bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full shrink-0">
          {a.points || 0} pts
        </span>
      </div>

      <p className="text-sm text-gray-500 mt-1.5 line-clamp-2">{a.description}</p>

      <div className="flex items-center gap-2 mt-3">
        {a.domain && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${domainColor}`}>
            {a.domain}
          </span>
        )}
        {a.difficultyLevel && (
          <span className="text-[10px] text-gray-400 font-medium">
            {a.difficultyLevel}
          </span>
        )}
      </div>

      {a.skillTags && a.skillTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {a.skillTags.slice(0, 5).map((t, i) => (
            <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
              {t}
            </span>
          ))}
          {a.skillTags.length > 5 && (
            <span className="text-[10px] text-gray-400">+{a.skillTags.length - 5}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        {a.source === "github-import" && (
          <span className="inline-flex items-center gap-1 text-[10px] text-gray-400">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            GitHub Import
          </span>
        )}
        {a.proof && (a.proof.startsWith("http") || a.proof.startsWith("/uploads")) && (
          <a href={a.proof} target="_blank" rel="noreferrer" className="text-xs text-violet-600 hover:underline ml-auto">
            View proof ↗
          </a>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
export default function Profile() {
  const { user, logout } = useAuth();
  const [achievements, setAchievements] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [allStudents, setAllStudents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState("All");

  const isPlacementYear = (user?.year || 1) >= 4;

  // Fetch achievements
  useEffect(() => {
    if (!user?.id) return;
    axios.get(`/api/achievements/${user.id}`)
      .then((res) => {
        setAchievements(res.data);
        setTotalPoints(res.data.reduce((sum, a) => sum + (a.points || 0), 0));
      })
      .catch(() => {});
  }, [user]);

  // Fetch notifications
  useEffect(() => {
    if (!user?.id || !isPlacementYear) return;
    fetch(`/api/notifications/${user.id}`)
      .then((r) => r.json())
      .then((data) => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      })
      .catch(() => {});
  }, [user, isPlacementYear]);

  // Fetch all students for ranking
  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.json())
      .then((data) => setAllStudents(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Skills profile from achievements
  const skillProfile = useMemo(() => extractSkillProfile(achievements), [achievements]);

  // Department ranking
  const deptRanking = useMemo(() => {
    if (!user?.department) return null;
    const deptStudents = allStudents
      .filter((s) => s.department === user.department)
      .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

    const myIndex = deptStudents.findIndex((s) => s.id === user.id);
    return {
      rank: myIndex >= 0 ? myIndex + 1 : null,
      total: deptStudents.length,
      topStudents: deptStudents.slice(0, 5),
    };
  }, [allStudents, user]);

  // Radar data from domains
  const radarData = useMemo(() => {
    return skillProfile.domains.slice(0, 6).map((d) => ({
      domain: d.name.length > 12 ? d.name.slice(0, 12) + "…" : d.name,
      count: d.count,
      points: d.points,
    }));
  }, [skillProfile]);

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    if (filter === "All") return achievements;
    return achievements.filter((a) => a.domain === filter);
  }, [achievements, filter]);

  const domains = useMemo(() => {
    const set = new Set(achievements.map((a) => a.domain).filter(Boolean));
    return ["All", ...set];
  }, [achievements]);

  const markAllRead = async () => {
    try {
      await fetch(`/api/notifications/${user.id}/read-all`, { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {}
  };

  const handleAddAchievement = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("link", link);
    formData.append("userId", user.id);
    if (file) formData.append("proofFile", file);

    try {
      const res = await axios.post("/api/achievements/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAchievements((prev) => [...prev, res.data.achievement]);
      setTotalPoints((prev) => prev + (res.data.achievement.points || 0));
      setTitle(""); setDescription(""); setLink(""); setFile(null); setCategory("");
      setShowAddForm(false);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add achievement");
    }
  };

  const handleGitHubImport = (importResult) => {
    if (importResult?.achievements) {
      setAchievements((prev) => [...prev, ...importResult.achievements]);
      setTotalPoints((prev) => prev + (importResult.totalNewPoints || 0));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 -m-6">
      {/* ── Header ── */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-violet-500/20">
                {user.name?.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isPlacementYear ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-blue-50 text-blue-700 border border-blue-200"
                  }`}>
                    {isPlacementYear ? "Placement Ready" : "Growth Mode"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {user.srn} · {user.department} / {user.branch} · Year {user.year}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-3xl font-bold text-violet-600 font-mono">{totalPoints}</p>
                <p className="text-xs text-gray-400">total points</p>
              </div>
              <button onClick={logout} className="text-sm px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500">
                Logout
              </button>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
            <div className="bg-violet-50 rounded-xl px-4 py-3">
              <p className="text-xs text-violet-500 font-medium">Achievements</p>
              <p className="text-xl font-bold text-violet-700 font-mono">{achievements.length}</p>
            </div>
            <div className="bg-blue-50 rounded-xl px-4 py-3">
              <p className="text-xs text-blue-500 font-medium">Skills Tracked</p>
              <p className="text-xl font-bold text-blue-700 font-mono">{Object.keys(skillProfile.skillCounts).length}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl px-4 py-3">
              <p className="text-xs text-emerald-500 font-medium">Domains</p>
              <p className="text-xl font-bold text-emerald-700 font-mono">{skillProfile.domains.length}</p>
            </div>
            {deptRanking?.rank && (
              <div className="bg-amber-50 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-500 font-medium">{user.department} Rank</p>
                <p className="text-xl font-bold text-amber-700 font-mono">
                  #{deptRanking.rank} <span className="text-sm font-normal text-amber-500">/ {deptRanking.total}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

        {/* ── Placement Notifications ── */}
        {isPlacementYear && notifications.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-emerald-800">Recruiter Activity</h2>
                {unreadCount > 0 && (
                  <span className="text-xs font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full animate-pulse">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-emerald-600 hover:underline font-medium">
                  Mark all read
                </button>
              )}
            </div>
            <div className="space-y-3">
              {notifications.slice(0, 5).map((n) => (
                <NotificationCard key={n.id} n={n} />
              ))}
            </div>
          </div>
        )}

        {/* ── Status Badge ── */}
        {isPlacementYear && notifications.length === 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-lg">✓</div>
            <div>
              <p className="text-sm font-semibold text-emerald-800">Your profile is visible to recruiters</p>
              <p className="text-xs text-emerald-600">When companies analyze JDs, your skills are matched automatically. You'll be notified when shortlisted.</p>
            </div>
          </div>
        )}

        {!isPlacementYear && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">📈</div>
            <div>
              <p className="text-sm font-semibold text-blue-800">Growth Mode — every achievement counts</p>
              <p className="text-xs text-blue-600">
                Projects and skills you add now make you discoverable when placement season starts in Year 4.
                {deptRanking?.rank && ` You're currently #${deptRanking.rank} in ${user.department}.`}
              </p>
            </div>
          </div>
        )}

        {/* ── Skills Intelligence Panel ── */}
        {skillProfile.topSkills.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top skills heatmap */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
                Your Skill Footprint
              </h2>
              <div className="flex flex-wrap gap-2">
                {skillProfile.topSkills.map(([skill, count]) => {
                  const intensity = Math.min(count, 5);
                  const opacityClass = intensity >= 4 ? "bg-violet-600 text-white" : intensity >= 3 ? "bg-violet-500 text-white" : intensity >= 2 ? "bg-violet-200 text-violet-800" : "bg-violet-100 text-violet-600";
                  return (
                    <span key={skill} className={`text-xs font-medium px-3 py-1.5 rounded-lg ${opacityClass}`}>
                      {skill}
                      <span className="ml-1 opacity-70">×{count}</span>
                    </span>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                Extracted from {achievements.length} achievements. Darker = more evidence.
              </p>
            </div>

            {/* Domain radar */}
            {radarData.length > 2 && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
                  Achievement Distribution
                </h2>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="domain" tick={{ fontSize: 10, fill: "#6b7280" }} />
                      <PolarRadiusAxis tick={false} axisLine={false} />
                      <Radar name="Count" dataKey="count" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Department Leaderboard Preview ── */}
        {deptRanking && deptRanking.topStudents.length > 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
              {user.department} Leaderboard
            </h2>
            <div className="space-y-2">
              {deptRanking.topStudents.map((s, i) => {
                const isMe = s.id === user.id;
                return (
                  <div key={s.id} className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition ${
                    isMe ? "bg-violet-50 border border-violet-200" : "bg-gray-50"
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        i === 0 ? "bg-amber-100 text-amber-700" : i === 1 ? "bg-gray-200 text-gray-600" : i === 2 ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {i + 1}
                      </span>
                      <p className={`text-sm font-medium ${isMe ? "text-violet-700 font-semibold" : "text-gray-700"}`}>
                        {s.name} {isMe && "(you)"}
                      </p>
                    </div>
                    <span className={`text-sm font-bold font-mono ${isMe ? "text-violet-600" : "text-gray-500"}`}>
                      {s.totalPoints || 0} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── GitHub Import ── */}
        <GitHubImport userId={user.id} onImportComplete={handleGitHubImport} />

        {/* ── Add Achievement ── */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-lg">+</div>
              <div className="text-left">
                <h2 className="font-bold text-gray-900 text-sm">Add Achievement Manually</h2>
                <p className="text-xs text-gray-500">Projects, certifications, hackathons, internships</p>
              </div>
            </div>
            <span className="text-gray-400 text-sm">{showAddForm ? "▲" : "▼"}</span>
          </button>

          {showAddForm && (
            <form onSubmit={handleAddAchievement} className="px-5 pb-5 space-y-3 border-t border-gray-100 pt-4">
              <input
                type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="Achievement title" required
                className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
              <textarea
                value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (max 1000 chars)" maxLength={1000} rows={3} required
                className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={category} onChange={(e) => setCategory(e.target.value)}
                  className="border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                >
                  <option value="">Category (optional)</option>
                  <option>Project</option><option>Hackathon</option><option>Course</option>
                  <option>Certification</option><option>Internship</option><option>Workshop</option>
                  <option>Competition</option><option>Research</option>
                </select>
                <input
                  type="text" value={link} onChange={(e) => setLink(e.target.value)}
                  placeholder="Proof link (optional)"
                  className="border border-gray-200 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
                />
              </div>
              <div className="flex items-center justify-between">
                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="text-sm text-gray-500" />
                <button type="submit" className="bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-gray-800 transition">
                  Add Achievement
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ── Achievements List ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Achievements ({achievements.length})</h2>
            {domains.length > 2 && (
              <div className="flex flex-wrap gap-1.5">
                {domains.map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilter(d)}
                    className={`text-xs px-3 py-1 rounded-full border transition ${
                      filter === d
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filteredAchievements.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
              <p className="text-gray-400 text-lg mb-1">No achievements yet</p>
              <p className="text-sm text-gray-400">Import from GitHub or add manually above to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAchievements.map((a) => (
                <AchievementCard key={a.id} a={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}