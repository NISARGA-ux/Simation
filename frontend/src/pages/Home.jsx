import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// ── Ticker tape component (horizontal scroll of top movers) ──
function TickerTape({ skills }) {
  if (!skills || skills.length === 0) return null;
  const movers = [...skills]
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 12);

  return (
    <div className="overflow-hidden bg-gray-900 text-sm">
      <div className="flex animate-marquee whitespace-nowrap py-2">
        {[...movers, ...movers].map((s, i) => (
          <span key={i} className="mx-6 inline-flex items-center gap-2">
            <span className="font-semibold text-white">{s.name}</span>
            <span className="font-mono text-white/70">{s.composite.toFixed(1)}</span>
            <span
              className={`font-mono font-semibold ${
                s.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {s.changePercent >= 0 ? "▲" : "▼"}{" "}
              {Math.abs(s.changePercent).toFixed(1)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Mini sparkline component ──
function Sparkline({ data, positive }) {
  if (!data || data.length < 2) {
    return <div className="w-24 h-8 bg-gray-100 rounded animate-pulse" />;
  }
  const color = positive ? "#10b981" : "#f43f5e";
  const fillColor = positive ? "#10b98120" : "#f43f5e20";

  return (
    <div className="w-28 h-9">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`grad-${positive}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={`url(#grad-${positive})`}
            strokeWidth={1.5}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Score bar component ──
function ScoreBar({ value, max = 100, color = "bg-violet-500" }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono text-gray-600 w-7 text-right">{value}</span>
    </div>
  );
}

// ── Expanded detail panel ──
function SkillDetail({ skill, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/skills-market/${encodeURIComponent(skill.name)}`)
      .then((r) => r.json())
      .then((d) => {
        setDetail(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [skill.name]);

  const d = detail || skill;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-start rounded-t-2xl">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900">{d.name}</h2>
              <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {d.category}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-3xl font-mono font-bold text-gray-900">
                {d.composite?.toFixed(1)}
              </span>
              <span
                className={`text-lg font-mono font-semibold ${
                  d.changePercent >= 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {d.changePercent >= 0 ? "+" : ""}
                {d.changePercent?.toFixed(1)}%
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-xl p-1"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Trend chart — larger */}
          {d.trend?.sparkline?.length > 1 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Search Interest (Last 3 Months)
              </h3>
              <div className="h-48 bg-gray-50 rounded-xl p-3">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={d.trend.sparkline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ fontWeight: 600 }}
                    />
                    <defs>
                      <linearGradient id="detailGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#8b5cf6"
                      fill="url(#detailGrad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Scores grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-xs text-blue-600 font-medium uppercase">Demand</p>
              <p className="text-2xl font-bold text-blue-800 font-mono">{d.demandScore}</p>
              <p className="text-xs text-blue-500 mt-1">{d.demand?.jobCount || 0} jobs found</p>
            </div>
            <div className="bg-violet-50 rounded-xl p-4 text-center">
              <p className="text-xs text-violet-600 font-medium uppercase">Trend</p>
              <p className="text-2xl font-bold text-violet-800 font-mono">{d.trendScore}</p>
              <p className="text-xs text-violet-500 mt-1">Google Trends score</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 text-center">
              <p className="text-xs text-emerald-600 font-medium uppercase">Dev Activity</p>
              <p className="text-2xl font-bold text-emerald-800 font-mono">{d.devActivity}</p>
              <p className="text-xs text-emerald-500 mt-1">
                {d.github?.recentRepos || 0} new repos
              </p>
            </div>
          </div>

          {/* Companies hiring */}
          {d.demand?.topCompanies?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Companies Hiring
              </h3>
              <div className="flex flex-wrap gap-2">
                {d.demand.topCompanies.map((c, i) => (
                  <span
                    key={i}
                    className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sample job titles */}
          {d.demand?.sampleTitles?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Sample Job Titles
              </h3>
              <ul className="space-y-1">
                {d.demand.sampleTitles.map((t, i) => (
                  <li key={i} className="text-sm text-gray-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Stack Overflow */}
          {d.stackoverflow?.totalQuestions > 0 && (
            <div className="bg-orange-50 rounded-xl p-4">
              <p className="text-xs text-orange-600 font-medium uppercase">Stack Overflow</p>
              <p className="text-lg font-bold text-orange-800 font-mono">
                {(d.stackoverflow.totalQuestions || 0).toLocaleString()} total questions
              </p>
            </div>
          )}

          {/* News from Tavily */}
          {d.news?.articles?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Recent News & Articles
              </h3>
              <div className="space-y-3">
                {d.news.articles.map((a, i) => (
                  <a
                    key={i}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <p className="text-sm font-semibold text-gray-800">{a.title}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{a.snippet}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Students with this skill */}
          {loading ? (
            <p className="text-sm text-gray-400">Loading student data...</p>
          ) : d.supply?.students?.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Students With This Skill ({d.supply.studentCount})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {d.supply.students.slice(0, 8).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center text-sm font-bold text-violet-600">
                      {s.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{s.name}</p>
                      <p className="text-xs text-gray-500">
                        {s.department} · Year {s.year} · {s.totalPoints} pts
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 rounded-xl p-4">
              <p className="text-sm text-amber-700">
                <span className="font-semibold">Talent gap:</span> No students in your
                college currently have this skill in their portfolio. This is a skill gap worth exploring.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sort arrow indicator ──
function SortArrow({ active, dir }) {
  if (!active) return <span className="text-gray-300 ml-1">↕</span>;
  return (
    <span className="text-violet-600 ml-1">{dir === "asc" ? "↑" : "↓"}</span>
  );
}

// ═══════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ═══════════════════════════════════════════
export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: "composite", dir: "desc" });
  const [expandedSkill, setExpandedSkill] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/skills-market");
      const json = await res.json();

      if (res.status === 202) {
        // First-time refresh in progress
        setError("Skills data is being fetched for the first time. This takes about 60 seconds...");
        setLoading(true);
        // Poll every 10 seconds
        setTimeout(fetchData, 10000);
        return;
      }

      if (json.skills) {
        setData(json);
        setError(null);
      }
    } catch (err) {
      setError("Failed to load skills market data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Trigger refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch("/api/skills-market/refresh", { method: "POST" });
      // Poll until complete
      const poll = setInterval(async () => {
        const res = await fetch("/api/skills-market/status");
        const status = await res.json();
        if (!status.isRefreshing && status.hasData) {
          clearInterval(poll);
          await fetchData();
          setRefreshing(false);
        }
      }, 5000);
    } catch {
      setRefreshing(false);
    }
  };

  // Categories
  const categories = useMemo(() => {
    if (!data?.skills) return ["All"];
    const cats = [...new Set(data.skills.map((s) => s.category))];
    return ["All", ...cats];
  }, [data]);

  // Filtered + sorted skills
  const displaySkills = useMemo(() => {
    if (!data?.skills) return [];
    let skills = [...data.skills];

    // Category filter
    if (activeCategory !== "All") {
      skills = skills.filter((s) => s.category === activeCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      skills = skills.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
      );
    }

    // Sort
    skills.sort((a, b) => {
      const aVal = a[sortConfig.key] ?? 0;
      const bVal = b[sortConfig.key] ?? 0;
      const dir = sortConfig.dir === "asc" ? 1 : -1;
      if (typeof aVal === "string") return dir * aVal.localeCompare(bVal);
      return dir * (aVal - bVal);
    });

    return skills;
  }, [data, activeCategory, searchQuery, sortConfig]);

  // Sort handler
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      dir: prev.key === key && prev.dir === "desc" ? "asc" : "desc",
    }));
  };

  // Summary stats
  const stats = useMemo(() => {
    if (!data?.skills) return {};
    const skills = data.skills;
    const rising = skills.filter((s) => s.changePercent > 0).length;
    const falling = skills.filter((s) => s.changePercent < 0).length;
    const topMover = [...skills].sort(
      (a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)
    )[0];
    const avgComposite = (
      skills.reduce((sum, s) => sum + s.composite, 0) / skills.length
    ).toFixed(1);
    return { rising, falling, topMover, avgComposite, total: skills.length };
  }, [data]);

  // Time since last update
  const timeSinceUpdate = useMemo(() => {
    if (!data?.meta?.lastUpdated) return "";
    const diff = Date.now() - new Date(data.meta.lastUpdated).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m ago`;
  }, [data]);

  // ── Loading state ──
  if (loading && !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-violet-200 rounded-full animate-spin border-t-violet-600" />
        </div>
        <p className="mt-6 text-gray-600 font-medium">
          {error || "Loading Skills Market Intelligence..."}
        </p>
        <p className="mt-2 text-sm text-gray-400">
          Fetching real-time data from Google Jobs, Trends, GitHub, Stack Overflow
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 -m-6">
      {/* Ticker tape */}
      <TickerTape skills={data?.skills} />

      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Skills Market Intelligence
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Live data from Google Jobs, Google Trends, GitHub &amp; Stack Overflow
                {timeSinceUpdate && (
                  <span className="ml-2 text-gray-400">· Updated {timeSinceUpdate}</span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <input
                type="text"
                placeholder="Filter skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-40 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent"
              />

              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition ${
                  refreshing
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <span className={refreshing ? "animate-spin" : ""}>⟳</span>
                {refreshing ? "Refreshing..." : "Refresh Data"}
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 font-medium">Tracked Skills</p>
              <p className="text-xl font-bold text-gray-900 font-mono">{stats.total}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl px-4 py-3">
              <p className="text-xs text-emerald-600 font-medium">Rising</p>
              <p className="text-xl font-bold text-emerald-700 font-mono">
                {stats.rising} <span className="text-sm">▲</span>
              </p>
            </div>
            <div className="bg-rose-50 rounded-xl px-4 py-3">
              <p className="text-xs text-rose-600 font-medium">Falling</p>
              <p className="text-xl font-bold text-rose-700 font-mono">
                {stats.falling} <span className="text-sm">▼</span>
              </p>
            </div>
            <div className="bg-violet-50 rounded-xl px-4 py-3">
              <p className="text-xs text-violet-600 font-medium">Market Average</p>
              <p className="text-xl font-bold text-violet-700 font-mono">{stats.avgComposite}</p>
            </div>
            <div className="bg-amber-50 rounded-xl px-4 py-3">
              <p className="text-xs text-amber-600 font-medium">Top Mover</p>
              <p className="text-lg font-bold text-amber-700">
                {stats.topMover?.name}{" "}
                <span className="text-sm font-mono">
                  {stats.topMover?.changePercent >= 0 ? "+" : ""}
                  {stats.topMover?.changePercent?.toFixed(1)}%
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className="max-w-7xl mx-auto px-6 pt-5">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-sm font-medium px-4 py-1.5 rounded-full border transition ${
                activeCategory === cat
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Data source indicators */}
      {data?.meta?.sources && (
        <div className="max-w-7xl mx-auto px-6 pt-3">
          <div className="flex flex-wrap gap-3 text-xs text-gray-400">
            {Object.entries(data.meta.sources).map(([src, active]) => (
              <span key={src} className="flex items-center gap-1">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    active ? "bg-emerald-400" : "bg-gray-300"
                  }`}
                />
                {src}
              </span>
            ))}
          </div>
        </div>
      )}

      {data?.meta?.discoverySummary && (
        <div className="max-w-7xl mx-auto px-6 pt-3">
          <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
            {data.meta.discoverySummary}
          </div>
        </div>
      )}

      {/* Main table */}
      <div className="max-w-7xl mx-auto px-6 py-5">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  {[
                    { key: "name", label: "Skill" },
                    { key: "composite", label: "Score" },
                    { key: "changePercent", label: "Change" },
                    { key: null, label: "Trend" },
                    { key: "demandScore", label: "Demand" },
                    { key: "devActivity", label: "Dev Activity" },
                    { key: "supply.studentCount", label: "Students" },
                  ].map((col) => (
                    <th
                      key={col.label}
                      onClick={col.key ? () => handleSort(col.key) : undefined}
                      className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${
                        col.key ? "cursor-pointer hover:text-gray-700 select-none" : ""
                      }`}
                    >
                      {col.label}
                      {col.key && (
                        <SortArrow
                          active={sortConfig.key === col.key}
                          dir={sortConfig.dir}
                        />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displaySkills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      No skills match your filter
                    </td>
                  </tr>
                ) : (
                  displaySkills.map((skill, idx) => (
                    <tr
                      key={skill.name}
                      onClick={() => setExpandedSkill(skill)}
                      className={`border-b border-gray-50 cursor-pointer transition hover:bg-violet-50/50 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                    >
                      {/* Skill name + category */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                              skill.changePercent >= 0
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                          >
                            {skill.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {skill.name}
                            </p>
                            <p className="text-xs text-gray-400">{skill.category}</p>
                          </div>
                        </div>
                      </td>

                      {/* Composite score */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-gray-900 text-lg">
                          {skill.composite.toFixed(1)}
                        </span>
                      </td>

                      {/* Change % */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-mono font-semibold text-sm px-2 py-0.5 rounded-md ${
                            skill.changePercent > 0
                              ? "text-emerald-700 bg-emerald-50"
                              : skill.changePercent < 0
                              ? "text-rose-700 bg-rose-50"
                              : "text-gray-500 bg-gray-50"
                          }`}
                        >
                          {skill.changePercent > 0
                            ? "▲"
                            : skill.changePercent < 0
                            ? "▼"
                            : "—"}
                          {Math.abs(skill.changePercent).toFixed(1)}%
                        </span>
                      </td>

                      {/* Sparkline */}
                      <td className="px-4 py-3.5">
                        <Sparkline
                          data={skill.trend?.sparkline}
                          positive={skill.changePercent >= 0}
                        />
                      </td>

                      {/* Demand */}
                      <td className="px-4 py-3.5">
                        <ScoreBar
                          value={skill.demandScore}
                          color={
                            skill.demandScore >= 70
                              ? "bg-emerald-500"
                              : skill.demandScore >= 40
                              ? "bg-amber-500"
                              : "bg-gray-400"
                          }
                        />
                      </td>

                      {/* Dev Activity */}
                      <td className="px-4 py-3.5">
                        <ScoreBar value={skill.devActivity} color="bg-violet-500" />
                      </td>

                      {/* Student supply */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-gray-700">
                            {skill.supply?.studentCount || 0}
                          </span>
                          {skill.supply?.studentCount === 0 && (
                            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                              GAP
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
          <span>
            Showing {displaySkills.length} of {data?.skills?.length || 0} skills
          </span>
          <span>
            Data from Google Jobs, Google Trends, GitHub, Stack Overflow &amp; Tavily
            {data?.meta?.fetchDurationSeconds && (
              <span> · Fetched in {data.meta.fetchDurationSeconds}s</span>
            )}
          </span>
        </div>
      </div>

      {/* Detail modal */}
      {expandedSkill && (
        <SkillDetail
          skill={expandedSkill}
          onClose={() => setExpandedSkill(null)}
        />
      )}

      {/* Marquee CSS — injected via style tag */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
