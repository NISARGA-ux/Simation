import React, { useState, useRef, useEffect } from "react";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// ── Typing animation for the extraction phase ──
function TypewriterText({ text, speed = 20, onComplete }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    setDisplayed("");
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed((prev) => prev + text[i]);
        i++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text]);
  return <span>{displayed}</span>;
}

// ── Skill chip ──
function SkillChip({ skill, type }) {
  const colors =
    type === "must"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${colors}`}>
      <span className="text-[10px] uppercase tracking-wider opacity-60">
        {skill.category}
      </span>
      <span className="w-px h-3 bg-current opacity-20" />
      {skill.skill}
    </span>
  );
}

// ── Match percentage ring ──
function MatchRing({ percent, size = 64 }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const color =
    percent >= 70
      ? "#10b981"
      : percent >= 40
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#f3f4f6"
          strokeWidth={4}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={4}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold" style={{ color }}>
          {percent}%
        </span>
      </div>
    </div>
  );
}

// ── Candidate card ──
function CandidateCard({ student, rank, onShortlist }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 ${
        rank <= 3
          ? "border-violet-200 shadow-md"
          : "border-gray-200 shadow-sm"
      } hover:shadow-lg`}
    >
      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <MatchRing percent={student.matchPercent} />
            <div>
              <div className="flex items-center gap-2">
                {rank <= 3 && (
                  <span className="text-xs font-bold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                    #{rank}
                  </span>
                )}
                <h3 className="font-bold text-gray-900 text-lg">{student.name}</h3>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {student.department} · {student.branch} · Year {student.year}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                SRN: {student.srn} · {student.totalPoints} pts
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onShortlist(student);
            }}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition shadow-sm"
          >
            ✓ Shortlist
          </button>
        </div>

        {/* Skill match summary */}
        <div className="mt-4 flex flex-wrap gap-2">
          {student.mustHaveMatched.map((s, i) => (
            <span
              key={`m-${i}`}
              className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200"
            >
              ✓ {s.skill}
            </span>
          ))}
          {student.mustHaveMissed.map((s, i) => (
            <span
              key={`x-${i}`}
              className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-200 line-through opacity-60"
            >
              {s.skill}
            </span>
          ))}
          {student.niceToHaveMatched.map((s, i) => (
            <span
              key={`n-${i}`}
              className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-200"
            >
              + {s.skill}
            </span>
          ))}
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs text-violet-600 font-medium hover:underline"
        >
          {expanded ? "Hide details ▲" : "View radar & projects ▼"}
        </button>

        {/* Expanded details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Radar chart */}
              {student.skillProfile && student.skillProfile.length > 1 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Skill Coverage by Category
                  </h4>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={student.skillProfile}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis
                          dataKey="category"
                          tick={{ fontSize: 11, fill: "#6b7280" }}
                        />
                        <PolarRadiusAxis
                          angle={90}
                          domain={[0, 100]}
                          tick={false}
                          axisLine={false}
                        />
                        <Radar
                          name="Coverage"
                          dataKey="score"
                          stroke="#8b5cf6"
                          fill="#8b5cf6"
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                        <Tooltip
                          formatter={(val) => `${val}%`}
                          contentStyle={{ borderRadius: 8, fontSize: 12 }}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Relevant projects */}
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Relevant Achievements ({student.relevantAchievements.length})
                </h4>
                {student.relevantAchievements.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No directly matching projects found.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {student.relevantAchievements.slice(0, 5).map((a) => (
                      <div
                        key={a.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <p className="text-sm font-semibold text-gray-800">
                          {a.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {a.description}
                        </p>
                        {a.skillTags && a.skillTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {a.skillTags.slice(0, 5).map((t, i) => (
                              <span
                                key={i}
                                className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════
export default function RecJD() {
  const [jdText, setJdText] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("input"); // input | extracting | results
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [shortlisted, setShortlisted] = useState([]);
  const textareaRef = useRef(null);

  const handleAnalyze = async () => {
    if (!jdText.trim() || jdText.trim().length < 20) {
      setError("Please paste a job description (at least a few sentences).");
      return;
    }

    setError(null);
    setLoading(true);
    setPhase("extracting");
    setResult(null);

    try {
      const res = await fetch("/api/jd/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jdText }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Analysis failed");

      setResult(data);
      setPhase("results");
    } catch (err) {
      setError(err.message);
      setPhase("input");
    } finally {
      setLoading(false);
    }
  };

  const handleShortlist = (student) => {
    if (!shortlisted.find((s) => s.id === student.id)) {
      setShortlisted((prev) => [...prev, student]);
    }
  };

  const handleReset = () => {
    setJdText("");
    setResult(null);
    setPhase("input");
    setError(null);
    setShortlisted([]);
  };

  // ── Extracting phase ──
  if (phase === "extracting") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <div className="max-w-lg text-center">
          <div className="relative mx-auto w-20 h-20 mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-violet-200 animate-ping opacity-30" />
            <div className="absolute inset-0 rounded-full border-4 border-violet-300 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-violet-100 flex items-center justify-center">
              <span className="text-2xl">🔍</span>
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Analyzing Job Description
          </h2>

          <div className="space-y-2 text-sm text-gray-500">
            <p className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Extracting required skills via AI...
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" style={{animationDelay: '0.3s'}} />
              Scanning student profiles...
            </p>
            <p className="flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.6s'}} />
              Computing skill match scores...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Results phase ──
  if (phase === "results" && result) {
    const { extraction, matches, totalMatches, totalStudentsScanned, talentGaps, marketContext } =
      result;

    return (
      <div className="min-h-screen bg-gray-50 -m-6">
        {/* Header bar */}
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {extraction.jobTitle || "Job Analysis"}
                  </h1>
                  {extraction.company && (
                    <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                      {extraction.company}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {extraction.roleSummary}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {shortlisted.length > 0 && (
                  <span className="text-sm font-medium text-violet-600 bg-violet-50 px-3 py-1.5 rounded-lg">
                    {shortlisted.length} shortlisted
                  </span>
                )}
                <button
                  onClick={handleReset}
                  className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                >
                  ← New Analysis
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
              <div className="bg-violet-50 rounded-xl px-4 py-3">
                <p className="text-xs text-violet-600 font-medium">Students Scanned</p>
                <p className="text-xl font-bold text-violet-800 font-mono">{totalStudentsScanned}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl px-4 py-3">
                <p className="text-xs text-emerald-600 font-medium">Matches Found</p>
                <p className="text-xl font-bold text-emerald-800 font-mono">{totalMatches}</p>
              </div>
              <div className="bg-rose-50 rounded-xl px-4 py-3">
                <p className="text-xs text-rose-600 font-medium">Must-Have Skills</p>
                <p className="text-xl font-bold text-rose-800 font-mono">
                  {extraction.mustHaveSkills?.length || 0}
                </p>
              </div>
              <div className="bg-amber-50 rounded-xl px-4 py-3">
                <p className="text-xs text-amber-600 font-medium">Talent Gaps</p>
                <p className="text-xl font-bold text-amber-800 font-mono">{talentGaps?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* Extracted skills */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Extracted Skills
            </h2>
            <div className="space-y-3">
              {extraction.mustHaveSkills?.length > 0 && (
                <div>
                  <p className="text-xs text-rose-500 font-medium mb-2">MUST HAVE</p>
                  <div className="flex flex-wrap gap-2">
                    {extraction.mustHaveSkills.map((s, i) => (
                      <SkillChip key={i} skill={s} type="must" />
                    ))}
                  </div>
                </div>
              )}
              {extraction.niceToHaveSkills?.length > 0 && (
                <div>
                  <p className="text-xs text-blue-500 font-medium mb-2">NICE TO HAVE</p>
                  <div className="flex flex-wrap gap-2">
                    {extraction.niceToHaveSkills.map((s, i) => (
                      <SkillChip key={i} skill={s} type="nice" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Market context — if skills market data exists */}
          {marketContext && marketContext.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Market Intelligence for JD Skills
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {marketContext.slice(0, 8).map((mc, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-semibold text-gray-800">{mc.skill}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-mono font-bold text-gray-900">
                        {mc.composite?.toFixed(1)}
                      </span>
                      <span
                        className={`text-xs font-mono ${
                          mc.changePercent >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {mc.changePercent >= 0 ? "▲" : "▼"}
                        {Math.abs(mc.changePercent || 0).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {mc.studentCount} students in college
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Talent gaps */}
          {talentGaps && talentGaps.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
              <h2 className="text-sm font-semibold text-amber-700 uppercase tracking-wider mb-2">
                ⚠ Talent Gaps — No Students Found With These Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {talentGaps.map((g, i) => (
                  <span
                    key={i}
                    className="bg-amber-100 text-amber-800 text-sm px-3 py-1 rounded-full font-medium border border-amber-300"
                  >
                    {g.skill}
                  </span>
                ))}
              </div>
              <p className="text-xs text-amber-600 mt-3">
                Consider posting a workshop or hackathon for these skills via the Mentor Hub.
              </p>
            </div>
          )}

          {/* Candidate cards */}
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Ranked Candidates ({matches.length})
          </h2>

          {matches.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border">
              <p className="text-gray-400 text-lg">
                No matching students found. Try a broader job description.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((student, idx) => (
                <CandidateCard
                  key={student.id}
                  student={student}
                  rank={idx + 1}
                  onShortlist={handleShortlist}
                />
              ))}
            </div>
          )}

          {/* Shortlisted panel */}
          {shortlisted.length > 0 && (
            <div className="mt-8 bg-violet-50 border border-violet-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-violet-700 uppercase tracking-wider mb-3">
                Shortlisted Candidates ({shortlisted.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {shortlisted.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between bg-white rounded-lg p-3 border border-violet-100"
                  >
                    <div className="flex items-center gap-3">
                      <MatchRing percent={s.matchPercent} size={40} />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                        <p className="text-xs text-gray-500">
                          {s.department} · Year {s.year}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setShortlisted((prev) => prev.filter((x) => x.id !== s.id))
                      }
                      className="text-xs text-rose-500 hover:text-rose-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Input phase (default) ──
  return (
    <div className="min-h-screen bg-gray-50 -m-6 flex flex-col">
      {/* Hero */}
      <div className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
            AI-Powered Talent Matching
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            JD Intelligence Engine
          </h1>
          <p className="text-gray-500 mt-3 text-lg max-w-xl mx-auto">
            Paste any job description. Our AI extracts skills, scans every
            student profile, and ranks candidates by match percentage in seconds.
          </p>
        </div>
      </div>

      {/* Input area */}
      <div className="max-w-3xl mx-auto w-full px-6 py-8 flex-1">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <textarea
            ref={textareaRef}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder={`Paste a job description here...\n\nExample:\n"We are looking for a Full Stack Developer with 2+ years of experience in React, Node.js, and PostgreSQL. Experience with AWS, Docker, and CI/CD pipelines is a plus. Strong problem-solving skills required..."`}
            className="w-full h-64 p-5 text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none"
          />
          <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50">
            <span className="text-xs text-gray-400">
              {jdText.length > 0 ? `${jdText.length} characters` : "Supports any format — just paste the raw text"}
            </span>
            <button
              onClick={handleAnalyze}
              disabled={loading || jdText.trim().length < 20}
              className={`flex items-center gap-2 font-semibold text-sm px-6 py-2.5 rounded-lg transition shadow-sm ${
                loading || jdText.trim().length < 20
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-gray-800"
              }`}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⟳</span> Analyzing...
                </>
              ) : (
                <>Analyze JD →</>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Sample JDs */}
        <div className="mt-8">
          <p className="text-sm font-medium text-gray-500 mb-3">Quick test — paste a sample JD:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                title: "Full Stack Developer",
                text: "We are hiring a Full Stack Developer. Requirements: React, Node.js, TypeScript, PostgreSQL, REST APIs, Git. Nice to have: Docker, AWS, CI/CD, GraphQL. Experience building scalable web applications. 2+ years experience preferred.",
              },
              {
                title: "ML Engineer",
                text: "Looking for a Machine Learning Engineer. Must have: Python, TensorFlow or PyTorch, NLP, Computer Vision, SQL. Nice to have: MLOps, Docker, Kubernetes, Spark. Research paper publications preferred. Experience with large language models and transformers.",
              },
              {
                title: "Cybersecurity Analyst",
                text: "Hiring Cybersecurity Analyst. Required: Penetration testing, network security, SIEM tools, incident response, vulnerability assessment. Nice to have: AWS security, Python scripting, OSCP certification, threat intelligence. Must understand OWASP Top 10.",
              },
              {
                title: "IoT Engineer",
                text: "IoT Engineer needed. Skills required: Arduino, Raspberry Pi, MQTT protocol, embedded C/C++, sensor integration, PCB design. Nice to have: Python, cloud platforms (AWS IoT/Azure IoT), machine learning at edge, Flutter for companion apps.",
              },
            ].map((sample, i) => (
              <button
                key={i}
                onClick={() => setJdText(sample.text)}
                className="text-left p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-violet-300 hover:bg-violet-50 transition"
              >
                <p className="font-semibold text-gray-800 text-sm">{sample.title}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{sample.text}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
