import React, { useState, useMemo, useEffect } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { useAuth } from "../context/AuthContext";

// ── Track definitions (metadata only — skills come from AI) ──
const TRACKS = {
  "Web Development": {
    icon: "🌐",
    color: "violet",
    description: "Full-stack web apps, modern frameworks, APIs, and deployment",
    roles: ["Full Stack Developer", "Frontend Engineer", "Backend Developer"],
  },
  "AI / Machine Learning": {
    icon: "🧠",
    color: "rose",
    description: "Deep learning, NLP, computer vision, and generative AI",
    roles: ["ML Engineer", "Data Scientist", "AI Researcher"],
  },
  "Data Engineering": {
    icon: "📊",
    color: "blue",
    description: "ETL pipelines, data warehousing, streaming, and analytics",
    roles: ["Data Engineer", "Analytics Engineer", "Platform Engineer"],
  },
  "Cybersecurity": {
    icon: "🔒",
    color: "emerald",
    description: "Penetration testing, SOC operations, and cloud security",
    roles: ["Security Analyst", "Penetration Tester", "Cloud Security Engineer"],
  },
  "Mobile Development": {
    icon: "📱",
    color: "amber",
    description: "Cross-platform apps, native development, and mobile backends",
    roles: ["Mobile Developer", "React Native Engineer", "Flutter Developer"],
  },
  "DevOps / Cloud": {
    icon: "☁️",
    color: "sky",
    description: "CI/CD, infrastructure as code, containers, and cloud platforms",
    roles: ["DevOps Engineer", "SRE", "Cloud Architect"],
  },
};

const LEVELS = [
  { value: 0, label: "Never used", color: "#d1d5db" },
  { value: 1, label: "Heard of it", color: "#f97316" },
  { value: 2, label: "Tutorial level", color: "#eab308" },
  { value: 3, label: "Built with it", color: "#22c55e" },
  { value: 4, label: "Proficient", color: "#3b82f6" },
  { value: 5, label: "Production expert", color: "#8b5cf6" },
];

const COLOR_MAP = {
  violet: { bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", light: "bg-violet-100", gradFrom: "from-violet-50", gradTo: "to-violet-100" },
  rose: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", light: "bg-rose-100", gradFrom: "from-rose-50", gradTo: "to-rose-100" },
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", light: "bg-blue-100", gradFrom: "from-blue-50", gradTo: "to-blue-100" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", light: "bg-emerald-100", gradFrom: "from-emerald-50", gradTo: "to-emerald-100" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", light: "bg-amber-100", gradFrom: "from-amber-50", gradTo: "to-amber-100" },
  sky: { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700", light: "bg-sky-100", gradFrom: "from-sky-50", gradTo: "to-sky-100" },
};

// ── Step indicator ──
function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            i === current ? "bg-gray-900 text-white" : i < current ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"
          }`}>
            {i < current ? "✓" : i + 1}
            <span className="hidden sm:inline">{step}</span>
          </div>
          {i < steps.length - 1 && <div className={`w-8 h-px ${i < current ? "bg-emerald-300" : "bg-gray-200"}`} />}
        </div>
      ))}
    </div>
  );
}

// ── Skill slider with AI-generated reason ──
function SkillSlider({ skill, value, onChange }) {
  const level = LEVELS[value];
  const weightLabel = skill.weight === "core" ? "Core" : skill.weight === "important" ? "Important" : "Useful";
  const weightColor = skill.weight === "core" ? "text-rose-500 bg-rose-50" : skill.weight === "important" ? "text-amber-600 bg-amber-50" : "text-gray-400 bg-gray-50";

  return (
    <div className={`bg-white rounded-xl border p-4 transition-all ${
      value > 0 ? "border-gray-300 shadow-sm" : "border-gray-200 hover:border-gray-300"
    }`}>
      <div className="flex items-center justify-between mb-0.5">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 text-sm">{skill.name}</h3>
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${weightColor}`}>
            {weightLabel}
          </span>
        </div>
        <span className="text-xs font-medium" style={{ color: level.color }}>
          {level.label}
        </span>
      </div>

      {skill.reason && (
        <p className="text-[11px] text-gray-400 mb-2.5 leading-relaxed">{skill.reason}</p>
      )}

      <input
        type="range" min={0} max={5} value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, ${level.color} 0%, ${level.color} ${value * 20}%, #e5e7eb ${value * 20}%, #e5e7eb 100%)`,
          accentColor: level.color,
        }}
      />
      <div className="flex justify-between mt-1 px-0.5">
        {LEVELS.map((l) => (
          <button key={l.value} onClick={() => onChange(l.value)}
            className={`text-[10px] w-6 h-4 rounded transition ${value === l.value ? "font-bold text-gray-900" : "text-gray-300 hover:text-gray-500"}`}>
            {l.value}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Marketability ring ──
function MarketabilityRing({ score }) {
  const radius = 62;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";
  const label = score >= 70 ? "Strong" : score >= 40 ? "Developing" : "Needs Focus";

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg width={160} height={160} className="-rotate-90">
        <circle cx={80} cy={80} r={radius} stroke="#f3f4f6" strokeWidth={8} fill="none" />
        <circle cx={80} cy={80} r={radius} stroke={color} strokeWidth={8} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold font-mono" style={{ color }}>{score}</span>
        <span className="text-xs font-medium text-gray-500 mt-0.5">{label}</span>
      </div>
    </div>
  );
}

// ── Course card with reasoning ──
function CourseCard({ course }) {
  const platformColors = {
    "coursera.org": { bg: "bg-blue-50", text: "text-blue-700", label: "Coursera" },
    "udemy.com": { bg: "bg-purple-50", text: "text-purple-700", label: "Udemy" },
    "youtube.com": { bg: "bg-red-50", text: "text-red-700", label: "YouTube" },
    "freecodecamp.org": { bg: "bg-green-50", text: "text-green-700", label: "freeCodeCamp" },
    "geeksforgeeks.org": { bg: "bg-emerald-50", text: "text-emerald-700", label: "GeeksForGeeks" },
  };
  const platform = platformColors[course.source] || { bg: "bg-gray-50", text: "text-gray-700", label: course.source };

  return (
    <a href={course.url} target="_blank" rel="noopener noreferrer"
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-violet-300 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 group-hover:text-violet-700 transition line-clamp-2">{course.title}</p>
          <p className="text-xs text-gray-500 mt-1.5 line-clamp-2">{course.snippet}</p>
        </div>
        <span className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded-lg ${platform.bg} ${platform.text}`}>{platform.label}</span>
      </div>
      {course.reasoning && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-600 leading-relaxed">
            <span className="font-semibold text-violet-600">Why this →</span> {course.reasoning}
          </p>
        </div>
      )}
    </a>
  );
}

// ── Gap severity ──
function GapSeverity({ score }) {
  const severity = score >= 50 ? "Critical" : score >= 25 ? "Significant" : "Moderate";
  const color = score >= 50 ? "text-rose-600 bg-rose-50" : score >= 25 ? "text-amber-600 bg-amber-50" : "text-gray-600 bg-gray-100";
  return <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${color}`}>{severity}</span>;
}

// ── Roadmap item ──
function RoadmapItem({ phase, weeks, items, color }) {
  const dotColor = color === "emerald" ? "bg-emerald-500" : color === "amber" ? "bg-amber-500" : "bg-violet-500";
  const lineColor = color === "emerald" ? "bg-emerald-200" : color === "amber" ? "bg-amber-200" : "bg-violet-200";
  return (
    <div className="relative pl-8">
      <div className={`absolute left-3 top-0 bottom-0 w-px ${lineColor}`} />
      <div className={`absolute left-1 top-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${dotColor}`}>{phase}</div>
      <div className="pb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{weeks}</p>
        <div className="space-y-1.5">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-gray-300 mt-0.5 text-xs">→</span>
              <p className="text-sm text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
export default function Quiz() {
  const { user } = useAuth();
  const [phase, setPhase] = useState("track");
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [trackSkills, setTrackSkills] = useState([]); // AI-generated
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [ratings, setRatings] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [portfolio, setPortfolio] = useState([]);

  // Fetch student's existing achievements
  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/achievements/${user.id}`)
      .then((r) => r.json())
      .then((data) => setPortfolio(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [user]);

  const trackData = selectedTrack ? TRACKS[selectedTrack] : null;
  const trackColor = trackData?.color || "violet";
  const colors = COLOR_MAP[trackColor] || COLOR_MAP.violet;

  // Fetch AI-generated skills when track is selected
  const selectTrack = async (track) => {
    setSelectedTrack(track);
    setRatings({});
    setError(null);
    setLoadingSkills(true);
    setPhase("assess");

    try {
      const trackInfo = TRACKS[track];
      const res = await fetch("/api/courses/track-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          description: trackInfo.description,
          roles: trackInfo.roles,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate skills");
      setTrackSkills(data.skills || []);
    } catch (err) {
      setError(err.message);
      setPhase("track");
    } finally {
      setLoadingSkills(false);
    }
  };

  const handleRating = (skill, value) => {
    setRatings((prev) => ({ ...prev, [skill]: value }));
  };

  const ratedCount = trackSkills.filter((s) => ratings[s.name] !== undefined && ratings[s.name] > 0).length;
  const allRated = trackSkills.length > 0 && trackSkills.every((s) => ratings[s.name] !== undefined);

  // Portfolio cross-reference
  const portfolioSkills = useMemo(() => {
    const found = new Set();
    portfolio.forEach((a) => {
      const text = `${a.title || ""} ${a.description || ""} ${(a.skillTags || []).join(" ")}`.toLowerCase();
      trackSkills.forEach((skill) => {
        if (text.includes(skill.name.toLowerCase())) found.add(skill.name);
      });
    });
    return found;
  }, [portfolio, trackSkills]);

  const handleSubmit = async () => {
    setPhase("loading");
    setError(null);

    const ratingsArray = trackSkills.map((skill) => ({
      skill: skill.name,
      rating: ratings[skill.name] || 0,
    }));

    try {
      const res = await fetch("/api/courses/skill-gaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ratings: ratingsArray, userId: user?.id, track: selectedTrack }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult({ ...data, track: selectedTrack, ratingsArray, trackData: TRACKS[selectedTrack] });
      setPhase("results");
    } catch (err) {
      setError(err.message);
      setPhase("assess");
    }
  };

  // ════════════════════════════
  // TRACK SELECTION
  // ════════════════════════════
  if (phase === "track") {
    return (
      <div className="min-h-screen bg-gray-50 -m-6">
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="mb-6"><StepIndicator steps={["Choose Track", "Rate Skills", "Your Report"]} current={0} /></div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Skills Assessment</h1>
              <p className="text-gray-500 mt-2 max-w-xl mx-auto">
                Choose a career track. AI generates a comprehensive skill list based on live market data,
                then benchmarks your self-rating against real job demand.
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-5">Select your career track</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(TRACKS).map(([track, data]) => {
              const c = COLOR_MAP[data.color] || COLOR_MAP.violet;
              return (
                <button key={track} onClick={() => selectTrack(track)}
                  className={`text-left bg-gradient-to-br ${c.gradFrom} ${c.gradTo} border ${c.border} rounded-2xl p-6 hover:shadow-lg transition-all group`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${c.light} flex items-center justify-center text-2xl shrink-0`}>{data.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-lg">{track}</h3>
                      <p className="text-sm text-gray-500 mt-1">{data.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {data.roles.map((role) => (
                          <span key={role} className={`text-[10px] font-medium ${c.bg} ${c.text} px-2 py-0.5 rounded-full`}>{role}</span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 mt-3">Skills generated by AI from live market data</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-2">How this works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
              <div className="flex gap-3"><span className="text-lg">①</span><p>AI generates 15-20 relevant skills for your track using live job market and student portfolio data.</p></div>
              <div className="flex gap-3"><span className="text-lg">②</span><p>Rate each from 0 (never touched) to 5 (shipped production code). Be honest.</p></div>
              <div className="flex gap-3"><span className="text-lg">③</span><p>Get gap analysis, course recommendations with reasoning, and a 90-day learning roadmap.</p></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════
  // LOADING (ANALYSIS)
  // ════════════════════════════
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 -m-6 flex flex-col items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="relative mx-auto w-20 h-20 mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-violet-200 animate-ping opacity-20" />
            <div className="absolute inset-2 rounded-full bg-violet-100 flex items-center justify-center text-2xl">📊</div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Analyzing {trackSkills.length} skills against live market data</h2>
          <div className="space-y-2 text-sm text-gray-500">
            <p className="flex items-center justify-center gap-2"><span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />Computing gap scores...</p>
            <p className="flex items-center justify-center gap-2"><span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />Searching for targeted courses...</p>
            <p className="flex items-center justify-center gap-2"><span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.6s" }} />Building your learning roadmap...</p>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════
  // RESULTS
  // ════════════════════════════
  if (phase === "results" && result) {
    const radarData = result.ratingsArray.map((r) => {
      const entry = [...(result.gaps || []), ...(result.strengths || [])].find((g) => g.skill === r.skill);
      return { skill: r.skill.length > 14 ? r.skill.slice(0, 14) + "…" : r.skill, "You": r.rating * 20, "Market": entry?.demandScore || 50 };
    });

    const gapChartData = (result.gaps || []).slice(0, 8).map((g) => ({
      skill: g.skill.length > 12 ? g.skill.slice(0, 12) + "…" : g.skill,
      gap: g.gapScore,
      demand: g.demandScore,
      yours: g.studentScore,
    }));

    const topGaps = (result.gaps || []).slice(0, 6);
    const roadmap = result.roadmap || {
      phase1: [],
      phase2: [],
      phase3: [],
    };
    const roadmapHasItems = (roadmap.phase1.length + roadmap.phase2.length + roadmap.phase3.length) > 0;

    const portfolioMatches = trackSkills.filter((s) => portfolioSkills.has(s.name)).map((s) => s.name);

    return (
      <div className="min-h-screen bg-gray-50 -m-6">
        <div className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-6 py-5">
            <div className="mb-4"><StepIndicator steps={["Choose Track", "Rate Skills", "Your Report"]} current={2} /></div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{result.trackData?.icon}</span>
                  <p className="text-sm font-medium text-gray-500">{result.track}</p>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">Your Skills Report</h1>
                <p className="text-xs text-gray-400 mt-0.5">{result.totalSkillsAssessed} skills assessed against live market data</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPhase("assess")} className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">← Adjust Ratings</button>
                <button onClick={() => { setPhase("track"); setResult(null); setRatings({}); setTrackSkills([]); }} className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Try Another Track</button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Marketability</p>
              <MarketabilityRing score={result.marketability || 0} />
            </div>
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5 flex flex-col items-center justify-center">
              <p className="text-4xl font-bold text-emerald-700 font-mono">{result.strengths?.length || 0}</p>
              <p className="text-sm font-medium text-emerald-600 mt-1">Strengths</p>
              <p className="text-xs text-emerald-500 mt-1">At or above market demand</p>
            </div>
            <div className="bg-rose-50 rounded-xl border border-rose-200 p-5 flex flex-col items-center justify-center">
              <p className="text-4xl font-bold text-rose-700 font-mono">{result.gaps?.length || 0}</p>
              <p className="text-sm font-medium text-rose-600 mt-1">Gaps</p>
              <p className="text-xs text-rose-500 mt-1">Below market demand</p>
            </div>
            <div className="bg-violet-50 rounded-xl border border-violet-200 p-5 flex flex-col items-center justify-center">
              <p className="text-4xl font-bold text-violet-700 font-mono">{result.totalSkillsAssessed}</p>
              <p className="text-sm font-medium text-violet-600 mt-1">Assessed</p>
              <p className="text-xs text-violet-500 mt-1">AI-generated skills</p>
            </div>
          </div>

          {/* Portfolio cross-reference */}
          {portfolioMatches.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Already in Your Portfolio</h2>
              <div className="flex flex-wrap gap-2">
                {portfolioMatches.map((skill) => (
                  <span key={skill} className="text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-medium">✓ {skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">You vs. Market Demand</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 9, fill: "#6b7280" }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="You" dataKey="You" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Market" dataKey="Market" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.08} strokeWidth={2} strokeDasharray="5 5" />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {gapChartData.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">Gap Severity</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gapChartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="skill" width={100} tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="yours" name="You" radius={[0, 4, 4, 0]}><Cell fill="#8b5cf6" />{gapChartData.map((_, i) => <Cell key={i} fill="#8b5cf6" />)}</Bar>
                      <Bar dataKey="demand" name="Market" radius={[0, 4, 4, 0]}>{gapChartData.map((_, i) => <Cell key={i} fill="#f43f5e" fillOpacity={0.35} />)}</Bar>
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Gap details + courses */}
          {result.gaps && result.gaps.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400">Skill Gaps & Recommended Resources</h2>
                <p className="text-xs text-gray-400">Sorted by severity · courses from live search</p>
              </div>
              <div className="space-y-5">
                {result.gaps.slice(0, 6).map((gap, gapIdx) => {
                  const courses = result.courses?.[gap.skill] || [];
                  return (
                    <div key={gap.skill} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-bold text-gray-300 font-mono w-6">{String(gapIdx + 1).padStart(2, "0")}</span>
                            <h3 className="text-lg font-bold text-gray-900">{gap.skill}</h3>
                            <GapSeverity score={gap.gapScore} />
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-4 text-sm">
                              <div><span className="text-gray-400">You: </span><span className="font-bold text-violet-600 font-mono">{gap.studentRating}/5</span></div>
                              <div><span className="text-gray-400">Market: </span><span className="font-bold text-rose-600 font-mono">{gap.demandScore}/100</span></div>
                              {gap.jobCount > 0 && <div><span className="font-bold text-gray-700 font-mono">{gap.jobCount}</span><span className="text-gray-400"> jobs</span></div>}
                            </div>
                          </div>
                        </div>
                      <div className="mt-3 grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-[10px] text-gray-400 mb-1"><span>Your proficiency</span><span>{gap.studentScore}%</span></div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-violet-500 rounded-full transition-all duration-700" style={{ width: `${gap.studentScore}%` }} /></div>
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-gray-400 mb-1"><span>Market demand</span><span>{gap.demandScore}%</span></div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-rose-400 rounded-full transition-all duration-700" style={{ width: `${gap.demandScore}%` }} /></div>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="mb-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Why This Skill Is Trending</p>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                          {gap.trendReason || (
                            <>
                              Recruiters are actively prioritizing {gap.skill} because it closes real delivery gaps: higher market demand
                              and visible hiring signals indicate teams need engineers who can ship with it today, not later.
                              {gap.jobCount > 0 ? ` With ${gap.jobCount} active listings mentioning it, this is a direct employability lever.` : " It's consistently mentioned across role requirements."}
                            </>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                            Market demand: {gap.demandScore}/100
                          </span>
                          {gap.changePercent > 5 && (
                            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                              Demand up {gap.changePercent}% recently
                            </span>
                          )}
                          {gap.changePercent < -5 && (
                            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                              Demand dipped {Math.abs(gap.changePercent)}% recently
                            </span>
                          )}
                          {gap.changePercent >= -5 && gap.changePercent <= 5 && (
                            <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                              Demand steady, consistently required
                            </span>
                          )}
                          {gap.jobCount > 0 && (
                            <span className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full">
                              {gap.jobCount} active job listings mention it
                            </span>
                          )}
                        </div>
                      </div>
                      {courses.length > 0 ? (
                        <>
                          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3">Recommended Resources</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {courses.slice(0, 4).map((c, i) => <CourseCard key={i} course={c} />)}
                          </div>
                        </>
                      ) : (
                          <p className="text-sm text-gray-400">No courses found. Search for "{gap.skill} beginner tutorial 2026" to get started.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 30/60/90 Roadmap */}
          {topGaps.length > 0 && roadmapHasItems && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-1">90-Day Learning Roadmap</h2>
              <p className="text-xs text-gray-400 mb-6">Close your top gaps with this structured plan</p>
              <div className="ml-2">
                <RoadmapItem phase={1} weeks="Days 1–30 · Foundation" items={roadmap.phase1} color="emerald" />
                <RoadmapItem phase={2} weeks="Days 31–60 · Build" items={roadmap.phase2} color="amber" />
                <RoadmapItem phase={3} weeks="Days 61–90 · Prove" items={roadmap.phase3} color="violet" />
              </div>
            </div>
          )}

          {/* Strengths */}
          {result.strengths && result.strengths.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700 mb-3">Your Strengths</h2>
              <div className="flex flex-wrap gap-2">
                {result.strengths.map((s) => (
                  <div key={s.skill} className="bg-white border border-emerald-200 rounded-xl px-4 py-2.5">
                    <p className="text-sm font-semibold text-emerald-800">{s.skill}</p>
                    <p className="text-xs text-emerald-500 mt-0.5">
                      Rated {s.studentRating}/5 · Demand {s.demandScore}/100
                      {s.changePercent > 5 && " · ↑ trending"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Career impact */}
          <div className="bg-gray-900 rounded-xl p-6 text-white">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">What This Means for Your Career</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-gray-400 mb-1">Current standing</p>
                <p>{result.marketability >= 70 ? `You're well-positioned for ${result.track} roles. Deepen your expertise in your strongest areas.`
                  : result.marketability >= 40 ? `Solid foundation, but ${result.gaps?.length || 0} gaps are holding you back from competitive ${result.track} roles.`
                  : `You're early in your ${result.track} journey. The roadmap above will get you interview-ready in 90 days.`}</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Impact of closing gaps</p>
                <p>Closing your top {Math.min(topGaps.length, 3)} gaps could raise your marketability to ~{Math.min(100, (result.marketability || 0) + topGaps.slice(0, 3).reduce((s, g) => s + Math.round(g.gapScore / 4), 0))}/100.</p>
              </div>
              <div>
                <p className="text-gray-400 mb-1">Target roles</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {(result.trackData?.roles || []).map((role) => (
                    <span key={role} className="text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded-full">{role}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════
  // ASSESSMENT PHASE
  // ════════════════════════════
  const coreSkills = trackSkills.filter((s) => s.weight === "core");
  const importantSkills = trackSkills.filter((s) => s.weight === "important");
  const usefulSkills = trackSkills.filter((s) => s.weight === "useful");

  return (
    <div className="min-h-screen bg-gray-50 -m-6">
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-5">
          <div className="mb-4"><StepIndicator steps={["Choose Track", "Rate Skills", "Your Report"]} current={1} /></div>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{trackData?.icon}</span>
                <p className="text-sm font-medium text-gray-500">{selectedTrack}</p>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Rate Your Skills</h1>
              <p className="text-sm text-gray-500 mt-1">
                {loadingSkills ? "AI is generating your skill list from live market data..." : `${trackSkills.length} skills · 0 = never used · 5 = production expert`}
              </p>
            </div>
            <button onClick={() => { setPhase("track"); setTrackSkills([]); }} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100">← Change track</button>
          </div>

          {!loadingSkills && trackSkills.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>{ratedCount}/{trackSkills.length} skills rated</span>
                <span>{Math.round((ratedCount / trackSkills.length) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all duration-300" style={{ width: `${(ratedCount / trackSkills.length) * 100}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Loading skills */}
        {loadingSkills && (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-violet-200 rounded-full animate-spin border-t-violet-600 mx-auto" />
            <p className="mt-4 text-gray-600 font-medium">AI is generating skills for {selectedTrack}...</p>
            <p className="mt-1 text-sm text-gray-400">Analyzing job market data and student portfolios</p>
          </div>
        )}

        {/* Portfolio hint */}
        {!loadingSkills && portfolioSkills.size > 0 && (
          <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-lg mt-0.5">💡</span>
            <div>
              <p className="text-sm font-medium text-emerald-800">Found {portfolioSkills.size} of these skills in your portfolio</p>
              <p className="text-xs text-emerald-600 mt-0.5">{[...portfolioSkills].join(", ")}</p>
            </div>
          </div>
        )}

        {/* Core skills */}
        {coreSkills.length > 0 && (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
              Core Skills <span className="text-rose-400">({coreSkills.length})</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {coreSkills.map((skill) => (
                <SkillSlider key={skill.name} skill={skill} value={ratings[skill.name] || 0}
                  onChange={(val) => handleRating(skill.name, val)} />
              ))}
            </div>
          </>
        )}

        {/* Important skills */}
        {importantSkills.length > 0 && (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
              Important Skills <span className="text-amber-500">({importantSkills.length})</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {importantSkills.map((skill) => (
                <SkillSlider key={skill.name} skill={skill} value={ratings[skill.name] || 0}
                  onChange={(val) => handleRating(skill.name, val)} />
              ))}
            </div>
          </>
        )}

        {/* Useful skills */}
        {usefulSkills.length > 0 && (
          <>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
              Useful / Differentiator <span className="text-gray-400">({usefulSkills.length})</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {usefulSkills.map((skill) => (
                <SkillSlider key={skill.name} skill={skill} value={ratings[skill.name] || 0}
                  onChange={(val) => handleRating(skill.name, val)} />
              ))}
            </div>
          </>
        )}

        {error && (
          <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm">{error}</div>
        )}

        {!loadingSkills && trackSkills.length > 0 && (
          <button onClick={handleSubmit} disabled={!allRated}
            className={`mt-2 w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
              allRated ? "bg-gray-900 text-white hover:bg-gray-800 shadow-lg shadow-gray-900/10" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}>
            {allRated ? "Generate My Skills Report →" : `Rate all ${trackSkills.length} skills to continue (${Object.keys(ratings).length}/${trackSkills.length})`}
          </button>
        )}
      </div>
    </div>
  );
}
