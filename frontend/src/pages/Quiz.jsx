import React, { useState, useMemo } from "react";
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

// ── Skills to assess, grouped by track ──
const SKILL_TRACKS = {
  "Web Development": [
    "React", "Node.js", "TypeScript", "SQL", "MongoDB", "Docker", "AWS", "Next.js",
  ],
  "AI / Machine Learning": [
    "Python", "TensorFlow", "PyTorch", "NLP", "Computer Vision", "SQL", "Docker", "Generative AI",
  ],
  "Data Engineering": [
    "Python", "SQL", "Apache Spark", "AWS", "Docker", "Kubernetes", "MongoDB", "Power BI",
  ],
  "Cybersecurity": [
    "Cybersecurity", "Python", "Docker", "AWS", "Kubernetes", "SQL", "IoT", "Blockchain",
  ],
  "Mobile Development": [
    "Flutter", "React Native", "TypeScript", "Node.js", "MongoDB", "AWS", "Docker", "Python",
  ],
};

const LEVELS = [
  { value: 0, label: "No experience", emoji: "🔴", color: "#ef4444" },
  { value: 1, label: "Aware of it", emoji: "🟠", color: "#f97316" },
  { value: 2, label: "Basic knowledge", emoji: "🟡", color: "#eab308" },
  { value: 3, label: "Can build with it", emoji: "🟢", color: "#22c55e" },
  { value: 4, label: "Proficient", emoji: "🔵", color: "#3b82f6" },
  { value: 5, label: "Expert", emoji: "🟣", color: "#8b5cf6" },
];

// ── Slider component ──
function SkillSlider({ skill, value, onChange }) {
  const level = LEVELS[value];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-violet-300 transition">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">{skill}</h3>
        <span className="text-sm font-medium px-2 py-0.5 rounded-full" style={{ 
          backgroundColor: level.color + "15", 
          color: level.color 
        }}>
          {level.emoji} {level.label}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={5}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-violet-600"
        style={{
          background: `linear-gradient(to right, ${level.color} 0%, ${level.color} ${value * 20}%, #e5e7eb ${value * 20}%, #e5e7eb 100%)`,
        }}
      />
      <div className="flex justify-between mt-1">
        {LEVELS.map((l) => (
          <span key={l.value} className="text-[10px] text-gray-400 w-8 text-center">
            {l.value}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Marketability ring ──
function MarketabilityRing({ score }) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg width={144} height={144} className="-rotate-90">
        <circle cx={72} cy={72} r={radius} stroke="#f3f4f6" strokeWidth={8} fill="none" />
        <circle
          cx={72} cy={72} r={radius}
          stroke={color} strokeWidth={8} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color }}>{score}</span>
        <span className="text-xs text-gray-500">/ 100</span>
      </div>
    </div>
  );
}

// ── Course card ──
function CourseCard({ course }) {
  const sourceColors = {
    "coursera.org": "bg-blue-50 text-blue-700",
    "udemy.com": "bg-purple-50 text-purple-700",
    "youtube.com": "bg-red-50 text-red-700",
    "freecodecamp.org": "bg-green-50 text-green-700",
    "geeksforgeeks.org": "bg-emerald-50 text-emerald-700",
  };
  const colorClass = sourceColors[course.source] || "bg-gray-50 text-gray-700";

  return (
    <a
      href={course.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 bg-gray-50 rounded-lg hover:bg-violet-50 transition border border-transparent hover:border-violet-200"
    >
      <p className="text-sm font-semibold text-gray-800 line-clamp-2">{course.title}</p>
      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{course.snippet}</p>
      <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-2 ${colorClass}`}>
        {course.source}
      </span>
    </a>
  );
}

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
export default function Quiz() {
  const { user } = useAuth();
  const [phase, setPhase] = useState("track"); // track | assess | loading | results
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [ratings, setRatings] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const trackSkills = selectedTrack ? SKILL_TRACKS[selectedTrack] : [];

  const handleRating = (skill, value) => {
    setRatings((prev) => ({ ...prev, [skill]: value }));
  };

  const allRated = trackSkills.every((s) => ratings[s] !== undefined);

  const handleSubmit = async () => {
    setPhase("loading");
    setError(null);

    const ratingsArray = trackSkills.map((skill) => ({
      skill,
      rating: ratings[skill] || 0,
    }));

    try {
      const res = await fetch("/api/courses/skill-gaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ratings: ratingsArray,
          userId: user?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setResult({ ...data, track: selectedTrack, ratingsArray });
      setPhase("results");
    } catch (err) {
      setError(err.message);
      setPhase("assess");
    }
  };

  // ── Track selection ──
  if (phase === "track") {
    return (
      <div className="min-h-screen bg-gray-50 -m-6">
        <div className="bg-white border-b">
          <div className="max-w-3xl mx-auto px-6 py-10 text-center">
            <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
              <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
              Market-Aware Assessment
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Skills Assessment</h1>
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">
              Rate your skills, see how they match against live job market demand,
              and get real course recommendations for your gaps.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-6 py-8">
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Choose your track
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(SKILL_TRACKS).map(([track, skills]) => (
              <button
                key={track}
                onClick={() => {
                  setSelectedTrack(track);
                  setRatings({});
                  setPhase("assess");
                }}
                className="text-left bg-white border border-gray-200 rounded-xl p-5 hover:border-violet-400 hover:shadow-md transition group"
              >
                <h3 className="font-bold text-gray-900 text-lg group-hover:text-violet-700 transition">
                  {track}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {skills.length} skills: {skills.slice(0, 4).join(", ")}
                  {skills.length > 4 ? ` +${skills.length - 4} more` : ""}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (phase === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="w-16 h-16 border-4 border-violet-200 rounded-full animate-spin border-t-violet-600" />
        <p className="mt-6 text-gray-600 font-medium">Analyzing your skills against live market data...</p>
        <p className="mt-2 text-sm text-gray-400">Searching for courses on Coursera, YouTube, freeCodeCamp...</p>
      </div>
    );
  }

  // ── Results ──
  if (phase === "results" && result) {
    const radarData = result.ratingsArray.map((r) => {
      const market = [...(result.gaps || []), ...(result.strengths || [])].find(
        (g) => g.skill === r.skill
      );
      return {
        skill: r.skill,
        "Your Level": r.rating * 20,
        "Market Demand": market?.demandScore || 50,
      };
    });

    const gapChartData = (result.gaps || []).slice(0, 6).map((g) => ({
      skill: g.skill,
      gap: g.gapScore,
      demand: g.demandScore,
      yours: g.studentScore,
    }));

    return (
      <div className="min-h-screen bg-gray-50 -m-6">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-5xl mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-violet-600 font-medium">{result.track}</p>
                <h1 className="text-2xl font-bold text-gray-900">Your Skills Report</h1>
              </div>
              <button
                onClick={() => { setPhase("track"); setResult(null); }}
                className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
              >
                ← Retake Assessment
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
          {/* Top row: Marketability + Radar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Marketability score */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Marketability Score
              </h2>
              <MarketabilityRing score={result.marketability || 0} />
              <p className="text-sm text-gray-500 mt-4">
                Based on your skills vs. current job market demand
              </p>
              <div className="flex justify-center gap-6 mt-4 text-sm">
                <div>
                  <span className="font-bold text-emerald-600">{result.strengths?.length || 0}</span>
                  <span className="text-gray-500 ml-1">strengths</span>
                </div>
                <div>
                  <span className="font-bold text-rose-600">{result.gaps?.length || 0}</span>
                  <span className="text-gray-500 ml-1">gaps</span>
                </div>
              </div>
            </div>

            {/* Radar chart */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                You vs. Market Demand
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "#6b7280" }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Your Level" dataKey="Your Level" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} strokeWidth={2} />
                    <Radar name="Market Demand" dataKey="Market Demand" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.1} strokeWidth={2} strokeDasharray="4 4" />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Gap analysis bar chart */}
          {gapChartData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Skill Gap Breakdown
              </h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gapChartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="skill" width={100} tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="yours" name="Your Level" radius={[0, 4, 4, 0]}>
                      {gapChartData.map((_, i) => (
                        <Cell key={i} fill="#8b5cf6" />
                      ))}
                    </Bar>
                    <Bar dataKey="demand" name="Market Demand" radius={[0, 4, 4, 0]}>
                      {gapChartData.map((_, i) => (
                        <Cell key={i} fill="#f43f5e" fillOpacity={0.4} />
                      ))}
                    </Bar>
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Gap details + courses */}
          {result.gaps && result.gaps.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Your Skill Gaps + Recommended Courses
              </h2>
              <div className="space-y-4">
                {result.gaps.slice(0, 5).map((gap) => {
                  const courses = result.courses?.[gap.skill] || [];
                  return (
                    <div key={gap.skill} className="bg-white rounded-xl border border-gray-200 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-gray-900">{gap.skill}</h3>
                          <span className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-medium">
                            Gap: {gap.gapScore}
                          </span>
                        </div>
                        <div className="text-right text-xs text-gray-500">
                          <p>Your level: <span className="font-semibold text-violet-600">{gap.studentRating}/5</span></p>
                          <p>Market demand: <span className="font-semibold text-rose-600">{gap.demandScore}/100</span></p>
                          {gap.jobCount > 0 && <p>{gap.jobCount} open jobs</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-violet-500 rounded-full"
                            style={{ width: `${gap.studentScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-16 text-right">You: {gap.studentScore}%</span>
                      </div>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-400 rounded-full"
                            style={{ width: `${gap.demandScore}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-16 text-right">Market: {gap.demandScore}%</span>
                      </div>

                      {courses.length > 0 ? (
                        <div>
                          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2">
                            📚 Real courses to close this gap
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {courses.slice(0, 4).map((c, i) => (
                              <CourseCard key={i} course={c} />
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">No courses found — try searching "{gap.skill} tutorial" online.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Strengths */}
          {result.strengths && result.strengths.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider mb-3">
                ✓ Your Strengths
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.strengths.map((s) => (
                  <span
                    key={s.skill}
                    className="bg-emerald-100 text-emerald-800 text-sm px-3 py-1 rounded-full font-medium"
                  >
                    {s.skill} — {s.studentRating}/5
                    {s.changePercent > 0 && (
                      <span className="text-emerald-600 ml-1">↑ trending</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Assessment phase ──
  return (
    <div className="min-h-screen bg-gray-50 -m-6">
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-violet-600 font-medium">{selectedTrack}</p>
              <h1 className="text-2xl font-bold text-gray-900">Rate Your Skills</h1>
              <p className="text-sm text-gray-500 mt-1">
                Be honest — the value is in the gap analysis, not a high score.
              </p>
            </div>
            <button
              onClick={() => setPhase("track")}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Change track
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {trackSkills.map((skill) => (
            <SkillSlider
              key={skill}
              skill={skill}
              value={ratings[skill] || 0}
              onChange={(val) => handleRating(skill, val)}
            />
          ))}
        </div>

        {error && (
          <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!allRated}
          className={`mt-6 w-full py-3 rounded-xl font-semibold text-sm transition ${
            allRated
              ? "bg-gray-900 text-white hover:bg-gray-800 shadow-sm"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {allRated
            ? "Analyze Against Live Market Data →"
            : `Rate all ${trackSkills.length} skills to continue (${Object.keys(ratings).length}/${trackSkills.length})`}
        </button>
      </div>
    </div>
  );
}