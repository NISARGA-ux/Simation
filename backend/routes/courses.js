// backend/routes/courses.js
// GET  /api/courses/recommend?skill=Kubernetes
// POST /api/courses/skill-gaps     — student assessment → gaps + courses + reasoning
// POST /api/courses/track-skills   — AI-generated skill list for a career track

const express = require("express");
const router = express.Router();
const axios = require("axios");
const db = require("../utils/db");
const { callLLMJSON } = require("../utils/ai");
require("dotenv").config();

// ══════════════════════════════════════════════
// TRACK SKILLS GENERATION (AI-powered, cached)
// ══════════════════════════════════════════════

const trackSkillsSchema = {
  type: "object",
  properties: {
    skills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          weight: { type: "string" },
          reason: { type: "string" },
        },
        required: ["name", "weight", "reason"],
        additionalProperties: false,
      },
    },
  },
  required: ["skills"],
  additionalProperties: false,
};

// In-memory cache for generated track skills
const trackSkillsCache = {};
const TRACK_CACHE_TTL = 60 * 60 * 1000; // 1 hour

async function handleTrackSkills(req, res, input) {
  try {
    const { track, description, roles } = input;
    if (!track) return res.status(400).json({ error: "track name required" });

    // Check cache
    const cacheKey = track.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const cached = trackSkillsCache[cacheKey];
    if (cached && Date.now() - cached.timestamp < TRACK_CACHE_TTL) {
      return res.json({ skills: cached.skills, source: "cache" });
    }

    // Gather context from skills market
    const marketCache = db.get("skillsMarketCache").value();
    const marketSkills = marketCache?.skills || [];
    const marketSummary = marketSkills
      .slice(0, 50)
      .map((s) => `${s.name} (demand: ${s.demandScore}, category: ${s.category}, trend: ${s.changePercent > 0 ? "+" + s.changePercent.toFixed(0) + "%" : "flat"})`)
      .join(", ");

    // Gather context from student achievements
    const achievements = db.get("achievements").value() || [];
    const achievementText = achievements
      .slice(0, 60)
      .map((a) => `${a.title || ""}: ${(a.skillTags || []).join(", ")}`)
      .join("; ");

    const prompt = `
You are generating a comprehensive skills assessment for a "${track}" career track.
${description ? `Track description: ${description}` : ""}
${roles && roles.length ? `Target roles: ${roles.join(", ")}` : ""}

Live skills market data from this college's ecosystem:
${marketSummary || "No market data available."}

Student portfolio signals:
${achievementText.slice(0, 3000) || "No portfolio data."}

Generate 16 to 22 specific, concrete technical skills that someone pursuing "${track}" should be assessed on.

Rules:
- Be SPECIFIC: "PyTorch" not "Deep Learning Framework", "PostgreSQL" not "Database", "FastAPI" not "Web Framework".
- Include a mix of: programming languages, frameworks/libraries, tools, platforms, and concepts.
- Include at least 2-3 emerging or trending skills for 2025-2026 (e.g., LangChain, Rust, Temporal, dbt).
- weight: "core" (can't get hired without it, 5-8 skills), "important" (strongly preferred, 5-7 skills), "useful" (differentiator, 4-6 skills).
- reason: one concrete sentence (e.g., "Required by 78% of ML engineer job postings" or "Industry standard for experiment tracking in production ML pipelines").
- Order: all core first, then all important, then all useful.
- DO NOT include soft skills, only technical skills.
- DO NOT repeat skills with different names (e.g., don't list both "Machine Learning" and "ML").
- Return ONLY valid JSON.
`;

    let result;
    try {
      result = await callLLMJSON({
        prompt,
        schema: trackSkillsSchema,
        temperature: 0.3,
        maxOutputTokens: 3000,
      });
    } catch (err) {
      console.error("Track skills LLM error:", err?.message || err);
      return res.status(502).json({ error: "AI skill generation failed. Try again." });
    }

    const skills = (result.skills || []).map((s) => ({
      name: (s.name || "").trim(),
      weight: ["core", "important", "useful"].includes(s.weight) ? s.weight : "important",
      reason: (s.reason || "").trim(),
    })).filter((s) => s.name.length > 0);

    if (skills.length < 8) {
      return res.status(502).json({ error: "AI returned too few skills. Try again." });
    }

    // Cache it
    trackSkillsCache[cacheKey] = { skills, timestamp: Date.now() };

    return res.json({ skills, source: "generated" });
  } catch (err) {
    console.error("Track skills error:", err);
    return res.status(500).json({ error: "Failed to generate track skills" });
  }
}

// POST /api/courses/track-skills
router.post("/track-skills", async (req, res) => {
  return handleTrackSkills(req, res, req.body || {});
});

// GET /api/courses/track-skills?track=... (fallback for clients using GET)
router.get("/track-skills", async (req, res) => {
  const roles = req.query.roles
    ? String(req.query.roles).split(",").map((r) => r.trim()).filter(Boolean)
    : undefined;
  return handleTrackSkills(req, res, {
    track: req.query.track,
    description: req.query.description,
    roles,
  });
});

// ══════════════════════════════════════════════
// COURSE FETCHING
// ══════════════════════════════════════════════

async function fetchCoursesForSkill(skill) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  try {
    const primaryQuery = [
      `${skill} professional certificate`,
      `${skill} specialization`,
      `${skill} course project-based`,
      `${skill} official documentation`,
      `${skill} best practices`,
    ].join(" OR ");

    const resp = await axios.post(
      "https://api.tavily.com/search",
      {
        api_key: apiKey,
        query: `(${primaryQuery}) 2025 2026`,
        search_depth: "basic",
        max_results: 8,
        include_answer: false,
        include_images: false,
      },
      { timeout: 15000 }
    );

    const results = (resp.data?.results || []).map((r) => ({
      title: r.title || "",
      url: r.url || "",
      snippet: (r.content || "").slice(0, 250),
      source: extractDomain(r.url),
    }));

    const preferredDomains = [
      "coursera.org",
      "edx.org",
      "udacity.com",
      "pluralsight.com",
      "freecodecamp.org",
      "deeplearning.ai",
      "fast.ai",
      "kaggle.com",
      "learn.microsoft.com",
      "aws.amazon.com",
      "cloud.google.com",
      "developer.apple.com",
      "kubernetes.io",
      "docker.com",
      "pytorch.org",
      "tensorflow.org",
      "react.dev",
      "nodejs.org",
    ];

    const keywordBoosts = [
      "professional certificate",
      "specialization",
      "nanodegree",
      "career track",
      "official",
      "documentation",
      "hands-on",
      "project",
      "capstone",
    ];

    const scored = results.map((r) => {
      const domain = (r.source || "").toLowerCase();
      const title = (r.title || "").toLowerCase();
      const snippet = (r.snippet || "").toLowerCase();

      let score = 0;
      if (preferredDomains.some((d) => domain.includes(d))) score += 3;
      if (domain.includes("docs") || domain.includes("developer")) score += 1;
      keywordBoosts.forEach((k) => {
        if (title.includes(k) || snippet.includes(k)) score += 1;
      });
      if (title.includes("course") || title.includes("certificate") || title.includes("specialization")) score += 1;
      return { ...r, score };
    });

    const seen = new Set();
    const deduped = scored.filter((r) => {
      const key = `${r.title}|${r.url}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    deduped.sort((a, b) => b.score - a.score);
    return deduped.slice(0, 6).map(({ score, ...rest }) => rest);
  } catch (err) {
    console.error(`[Courses] Tavily error for ${skill}:`, err.message);
    return [];
  }
}

function extractDomain(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}

// ══════════════════════════════════════════════
// COURSE REASONING
// ══════════════════════════════════════════════

function generateCourseReasoning(course, gap) {
  if (!course || !gap) return null;
  const reasons = [];
  const source = (course.source || "").toLowerCase();

  if (source.includes("coursera")) reasons.push("structured university-backed curriculum with employer-recognized certificates");
  else if (source.includes("udemy")) reasons.push("project-based with lifetime access — good for hands-on learners");
  else if (source.includes("youtube")) reasons.push("free visual format, learn at your own pace");
  else if (source.includes("freecodecamp")) reasons.push("completely free, learn-by-building approach");
  else if (source.includes("geeksforgeeks")) reasons.push("interview-focused with code examples");
  else if (source.includes("kaggle")) reasons.push("competitions + learning — builds public portfolio");
  else if (source.includes("github")) reasons.push("learn from real production codebases");
  else if (source.includes("medium") || source.includes("dev.to")) reasons.push("practitioner-written with real-world context");
  else if (source.includes("docs.") || source.includes("documentation")) reasons.push("official documentation — most accurate and up-to-date source");

  if (gap.demandScore >= 70) reasons.push(`high market demand (${gap.demandScore}/100) — directly improves employability`);
  else if (gap.demandScore >= 40) reasons.push(`solid market demand (${gap.demandScore}/100)`);

  if (gap.jobCount > 0) reasons.push(`${gap.jobCount} active job listings require this`);
  if (gap.changePercent > 10) reasons.push("trending upward — timely investment");

  if (gap.studentRating <= 1) reasons.push("start with fundamentals before building projects");
  else if (gap.studentRating === 2) reasons.push("you have basics — focus on building a real project");
  else if (gap.studentRating >= 3) reasons.push("target advanced topics and production patterns");

  return reasons.length > 0 ? reasons.slice(0, 3).join(". ") + "." : null;
}

// ══════════════════════════════════════════════
// AI-GENERATED TREND REASONS (per-skill)
// ══════════════════════════════════════════════

const trendReasonSchema = {
  type: "object",
  properties: {
    reasons: {
      type: "array",
      items: {
        type: "object",
        properties: {
          skill: { type: "string" },
          reason: { type: "string" },
        },
        required: ["skill", "reason"],
        additionalProperties: false,
      },
    },
  },
  required: ["reasons"],
  additionalProperties: false,
};

const roadmapSchema = {
  type: "object",
  properties: {
    phase1: { type: "array", items: { type: "string" } },
    phase2: { type: "array", items: { type: "string" } },
    phase3: { type: "array", items: { type: "string" } },
  },
  required: ["phase1", "phase2", "phase3"],
  additionalProperties: false,
};

async function generateTrendReasons(gaps, track) {
  const top = gaps.slice(0, 8);
  if (top.length === 0) return {};

  const prompt = `
You're explaining to a college student why specific skills matter right now in the job market.
Track they're pursuing: ${track || "General software engineering"}

For each skill below, write a sharp, honest, 2-3 sentence explanation of why it's in demand.
Be specific — reference the actual numbers I'm giving you. Don't be vague or corporate.
Talk like a senior engineer mentoring someone, not like a marketing brochure.

Examples of good tone:
- "Kubernetes isn't optional anymore — 42 live job postings mention it, and every cloud-native team expects you to at least deploy with it. The 12% demand spike tracks with companies moving off managed PaaS to self-hosted infra."
- "FastAPI blew up because Python shops needed something faster than Flask without switching languages. With demand at 65/100 and growing, it's the default for ML model serving APIs now."
- "Nobody's hiring junior devs who can't write SQL. It's boring but it's table stakes — 38 postings and a demand score of 71 tells you everything."

Bad tone (avoid this):
- "This skill is increasingly important in today's rapidly evolving technology landscape."
- "Recruiters are actively prioritizing this skill because it closes real delivery gaps."

Skills to explain (use the numbers in your reasoning):
${top.map((g) => `- ${g.skill} | demandScore=${g.demandScore}/100 | trend=${g.changePercent > 0 ? "+" + g.changePercent.toFixed(1) + "% growth" : g.changePercent < 0 ? g.changePercent.toFixed(1) + "% dip" : "flat"} | ${g.jobCount || 0} active job listings`).join("\n")}

Rules:
- Each reason MUST reference at least one specific number from the data above.
- Each reason MUST be unique — don't repeat the same framing across skills.
- If demand is low but growing fast, say that. If it's high but flat, say that. Be honest.
- Keep each reason between 35-70 words.
- Return ONLY valid JSON matching the schema.
`;

  try {
    const result = await callLLMJSON({
      prompt,
      schema: trendReasonSchema,
      temperature: 0.5,
      maxOutputTokens: 2000,
    });
    const map = {};
    (result.reasons || []).forEach((r) => {
      if (r.skill && r.reason) map[r.skill] = r.reason.trim();
    });
    return map;
  } catch (err) {
    console.error("Trend reason LLM error:", err?.message || err);
    return {};
  }
}

async function generateRoadmap(gaps, track) {
  const top = gaps.slice(0, 6);
  if (top.length === 0) return null;

  // Gather student's existing portfolio context
  const achievements = db.get("achievements").value() || [];
  const recentAchievements = achievements
    .slice(-20)
    .map((a) => `${a.title || ""} (${(a.skillTags || []).join(", ")})`)
    .filter(Boolean)
    .join("; ");

  const prompt = `
You're a senior engineer building a 90-day learning plan for a student in the "${track || "General"}" track.

They just completed a skills assessment. Here are their biggest gaps — the skills where market demand outpaces their current ability:

${top.map((g) => `- ${g.skill}: they rated ${g.studentRating}/5, market demand is ${g.demandScore}/100, ${g.jobCount || 0} job listings mention it${g.changePercent > 5 ? ", trending up " + g.changePercent.toFixed(0) + "%" : ""}`).join("\n")}

${recentAchievements ? `\nTheir existing portfolio includes: ${recentAchievements.slice(0, 1500)}` : ""}

Create a 3-phase plan. Each phase should have 2-3 action items.

Phase 1 (Days 1-30): Foundation — get functional in the highest-priority gaps. Focus on the skills with the worst rating-to-demand ratio.
Phase 2 (Days 31-60): Build — ship something real with these skills. Combine 2-3 gap skills into one project if possible.
Phase 3 (Days 61-90): Prove — make the work visible. Deploy, write about it, contribute to OSS, or present it.

Rules:
- Every item must name a SPECIFIC skill from the gap list. No generic "learn the basics" items.
- Each item should be a single actionable sentence with a concrete deliverable (a repo, a deployment, a PR, a blog post, etc).
- Reference the student's portfolio where relevant — build on what they already have.
- If a skill has very high demand (70+), prioritize it in Phase 1.
- If two skills pair well (e.g., Docker + Kubernetes, or FastAPI + PostgreSQL), combine them in one item.
- Write like you're talking to the student directly. "Set up X" not "The student should set up X".
- Each item: 20-40 words. Be specific, not fluffy.
- Return ONLY valid JSON with arrays: phase1, phase2, phase3.
`;

  try {
    const result = await callLLMJSON({
      prompt,
      schema: roadmapSchema,
      temperature: 0.55,
      maxOutputTokens: 1500,
    });
    return result;
  } catch (err) {
    console.error("Roadmap LLM error:", err?.message || err);
    return null;
  }
}

// ══════════════════════════════════════════════
// PORTFOLIO CROSS-REFERENCE
// ══════════════════════════════════════════════

function crossReferencePortfolio(userId, skills) {
  try {
    const achievements = db.get("achievements").value() || [];
    const studentAchievements = achievements.filter(
      (a) => a.userId === userId || a.studentId === userId
    );
    const portfolioEvidence = {};

    skills.forEach((skillName) => {
      const skillLower = skillName.toLowerCase();
      const matching = studentAchievements.filter((a) => {
        const text = `${a.title || ""} ${a.description || ""} ${(a.skillTags || []).join(" ")}`.toLowerCase();
        return text.includes(skillLower);
      });
      if (matching.length > 0) {
        portfolioEvidence[skillName] = {
          count: matching.length,
          examples: matching.slice(0, 2).map((a) => ({
            title: a.title,
            domain: a.domain,
            points: a.points,
          })),
        };
      }
    });
    return portfolioEvidence;
  } catch {
    return {};
  }
}

// ══════════════════════════════════════════════
// FIXED GAP CALCULATION
// ══════════════════════════════════════════════

function computeGapScore(studentRating, demandScore) {
  const studentScore = studentRating * 20;
  const proficiencyDeficit = Math.max(0, 60 - studentScore);
  const demandFactor = Math.max(demandScore, 20) / 100;
  const raw = proficiencyDeficit * demandFactor * 1.5 + (studentRating <= 1 ? 15 : 0);
  return Math.round(Math.min(raw, 100));
}

function classifySkill(studentRating, demandScore) {
  const gapScore = computeGapScore(studentRating, demandScore);
  if (studentRating <= 2 && demandScore >= 10) return { type: "gap", gapScore };
  if (studentRating >= 4) return { type: "strength", gapScore: 0 };
  if (gapScore >= 12) return { type: "gap", gapScore };
  return { type: "strength", gapScore: 0 };
}

// ══════════════════════════════════════════════
// GET /api/courses/recommend?skill=Docker
// ══════════════════════════════════════════════

router.get("/recommend", async (req, res) => {
  try {
    const { skill } = req.query;
    if (!skill) return res.status(400).json({ error: "skill parameter required" });

    const courses = await fetchCoursesForSkill(skill);
    const cached = db.get("skillsMarketCache").value();
    let marketData = null;
    if (cached?.skills) {
      marketData = cached.skills.find(
        (s) => s.name.toLowerCase() === skill.toLowerCase()
      );
    }

    return res.json({
      skill,
      courses,
      market: marketData
        ? {
            composite: marketData.composite,
            changePercent: marketData.changePercent,
            demandScore: marketData.demandScore,
            jobCount: marketData.demand?.jobCount || 0,
          }
        : null,
    });
  } catch (err) {
    console.error("Course recommend error:", err);
    return res.status(500).json({ error: "Failed to fetch course recommendations" });
  }
});

// ══════════════════════════════════════════════
// POST /api/courses/skill-gaps
// ══════════════════════════════════════════════

router.post("/skill-gaps", async (req, res) => {
  try {
    const { ratings, userId, track } = req.body;

    if (!ratings || !Array.isArray(ratings)) {
      return res.status(400).json({ error: "ratings array required" });
    }

    const cached = db.get("skillsMarketCache").value();
    const marketSkills = cached?.skills || [];

    const gaps = [];
    const strengths = [];

    for (const r of ratings) {
      const market = marketSkills.find(
        (ms) => ms.name.toLowerCase() === r.skill.toLowerCase()
      );

      const demandScore = market?.demandScore || 50;
      const composite = market?.composite || 50;
      const changePercent = market?.changePercent || 0;
      const studentRating = r.rating || 0;
      const studentScore = studentRating * 20;

      const { type, gapScore } = classifySkill(studentRating, demandScore);

      const entry = {
        skill: r.skill,
        studentRating,
        studentScore,
        demandScore,
        composite,
        changePercent,
        gapScore,
        jobCount: market?.demand?.jobCount || 0,
        topCompanies: market?.demand?.topCompanies || [],
      };

      if (type === "gap") {
        gaps.push(entry);
      } else {
        strengths.push(entry);
      }
    }

    gaps.sort((a, b) => b.gapScore - a.gapScore);
    strengths.sort((a, b) => b.studentScore - a.studentScore);

    // Marketability
    const marketability = Math.round(
      ratings.reduce((sum, r) => {
        const market = marketSkills.find(
          (ms) => ms.name.toLowerCase() === r.skill.toLowerCase()
        );
        const demand = Math.max(market?.demandScore || 50, 20);
        const coverage = Math.min(((r.rating || 0) * 20) / demand, 1.0);
        return sum + coverage;
      }, 0) / Math.max(ratings.length, 1) * 100
    );

    // Fetch courses for top 4 gaps
    const topGapCount = Math.min(gaps.length, 4);
    const coursesMap = {};

    for (let i = 0; i < topGapCount; i++) {
      const gap = gaps[i];
      const courses = await fetchCoursesForSkill(gap.skill);
      coursesMap[gap.skill] = courses.map((course) => ({
        ...course,
        reasoning: generateCourseReasoning(course, gap),
      }));
      await new Promise((r) => setTimeout(r, 300));
    }

    // AI trend reasons for ALL gaps (not just top 6)
    const trendReasons = await generateTrendReasons(gaps, track);

    gaps.forEach((g) => {
      if (trendReasons[g.skill]) g.trendReason = trendReasons[g.skill];
    });

    const roadmap = await generateRoadmap(gaps, track);

    // Portfolio cross-reference
    let portfolioEvidence = {};
    if (userId) {
      const uid = parseInt(userId, 10);
      portfolioEvidence = crossReferencePortfolio(uid, ratings.map((r) => r.skill));
    }

    // Save assessment
    if (userId) {
      const uid = parseInt(userId, 10);
      db.read();
      const user = db.get("users").find({ id: uid }).value();
      if (user) {
        db.get("users")
          .find({ id: uid })
          .assign({
            skillAssessment: {
              ratings,
              track: track || null,
              marketability: Math.min(marketability, 100),
              topGaps: gaps.slice(0, 5).map((g) => g.skill),
              assessedAt: new Date().toISOString(),
            },
          })
          .write();
      }
    }

    return res.json({
      marketability: Math.min(marketability, 100),
      gaps,
      strengths,
      courses: coursesMap,
      portfolioEvidence,
      roadmap,
      totalSkillsAssessed: ratings.length,
      track: track || null,
    });
  } catch (err) {
    console.error("Skill gaps error:", err);
    return res.status(500).json({ error: "Failed to compute skill gaps" });
  }
});

module.exports = router;