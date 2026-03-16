// backend/routes/jd.js
// POST /api/jd/analyze   — paste a JD, get skill extraction + ranked student matches
// POST /api/jd/enrich    — enrich an achievement with auto-extracted skill tags

const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const { callLLMJSON } = require("../utils/ai");

// ── Schema for JD skill extraction ──
const jdExtractionSchema = {
  type: "object",
  properties: {
    jobTitle: { type: "string" },
    company: { type: "string" },
    mustHaveSkills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          skill: { type: "string" },
          category: { type: "string" },
        },
        required: ["skill", "category"],
        additionalProperties: false,
      },
    },
    niceToHaveSkills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          skill: { type: "string" },
          category: { type: "string" },
        },
        required: ["skill", "category"],
        additionalProperties: false,
      },
    },
    experienceLevel: { type: "string" },
    roleSummary: { type: "string" },
  },
  required: ["jobTitle", "mustHaveSkills", "niceToHaveSkills", "roleSummary"],
  additionalProperties: false,
};

// ── Schema for achievement enrichment ──
const enrichSchema = {
  type: "object",
  properties: {
    skills: {
      type: "array",
      items: { type: "string" },
    },
    domain: { type: "string" },
    difficultyLevel: { type: "string" },
  },
  required: ["skills", "domain"],
  additionalProperties: false,
};

// ── Helper: compute match score between a student and extracted JD skills ──
function computeStudentMatch(student, achievements, mustHaveSkills, niceToHaveSkills) {
  // Build student's skill profile from achievements
  const studentSkillsSet = new Set();
  const studentSkillsText = [];

  achievements.forEach((a) => {
    // If enriched skill tags exist
    if (Array.isArray(a.skillTags)) {
      a.skillTags.forEach((t) => studentSkillsSet.add(t.toLowerCase()));
    }
    // Also scan raw text
    const text = `${a.title || ""} ${a.description || ""} ${a.domain || ""}`.toLowerCase();
    studentSkillsText.push(text);
  });

  // Also add branch/department context
  const profileText = `${student.branch || ""} ${student.department || ""}`.toLowerCase();

  // Score must-haves (weighted 2x)
  let mustHaveMatched = [];
  let mustHaveMissed = [];
  mustHaveSkills.forEach((s) => {
    const skillLower = s.skill.toLowerCase();
    const words = skillLower.split(/\s+/);

    const inTags = studentSkillsSet.has(skillLower) ||
      words.some((w) => w.length > 2 && [...studentSkillsSet].some((t) => t.includes(w)));
    const inText = studentSkillsText.some((t) =>
      words.some((w) => w.length > 2 && t.includes(w))
    );
    const inProfile = words.some((w) => w.length > 2 && profileText.includes(w));

    if (inTags || inText || inProfile) {
      mustHaveMatched.push(s);
    } else {
      mustHaveMissed.push(s);
    }
  });

  // Score nice-to-haves (weighted 1x)
  let niceToHaveMatched = [];
  niceToHaveSkills.forEach((s) => {
    const skillLower = s.skill.toLowerCase();
    const words = skillLower.split(/\s+/);

    const inTags = studentSkillsSet.has(skillLower) ||
      words.some((w) => w.length > 2 && [...studentSkillsSet].some((t) => t.includes(w)));
    const inText = studentSkillsText.some((t) =>
      words.some((w) => w.length > 2 && t.includes(w))
    );
    const inProfile = words.some((w) => w.length > 2 && profileText.includes(w));

    if (inTags || inText || inProfile) {
      niceToHaveMatched.push(s);
    }
  });

  // Compute match percentage
  const totalMust = mustHaveSkills.length || 1;
  const totalNice = niceToHaveSkills.length || 1;
  const mustScore = (mustHaveMatched.length / totalMust) * 70; // 70% weight
  const niceScore = (niceToHaveMatched.length / totalNice) * 30; // 30% weight
  const matchPercent = Math.round(mustScore + niceScore);

  // Find relevant achievements (ones that match any JD skill)
  const allJdSkills = [...mustHaveSkills, ...niceToHaveSkills].map((s) =>
    s.skill.toLowerCase()
  );
  const relevantAchievements = achievements.filter((a) => {
    const text = `${a.title || ""} ${a.description || ""} ${
      (a.skillTags || []).join(" ")
    }`.toLowerCase();
    return allJdSkills.some((skill) => {
      const words = skill.split(/\s+/);
      return words.some((w) => w.length > 2 && text.includes(w));
    });
  });

  return {
    matchPercent,
    mustHaveMatched,
    mustHaveMissed,
    niceToHaveMatched,
    relevantAchievements: relevantAchievements.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      domain: a.domain,
      points: a.points,
      skillTags: a.skillTags || [],
    })),
    // For radar chart: skill coverage per category
    skillProfile: buildSkillProfile(
      mustHaveSkills,
      niceToHaveSkills,
      mustHaveMatched,
      niceToHaveMatched
    ),
  };
}

// ── Build radar chart data ──
function buildSkillProfile(mustHave, niceToHave, mustMatched, niceMatched) {
  const categories = {};

  // Collect all categories from JD
  [...mustHave, ...niceToHave].forEach((s) => {
    const cat = s.category || "Other";
    if (!categories[cat]) {
      categories[cat] = { required: 0, matched: 0 };
    }
    categories[cat].required++;
  });

  // Mark matched
  [...mustMatched, ...niceMatched].forEach((s) => {
    const cat = s.category || "Other";
    if (categories[cat]) {
      categories[cat].matched++;
    }
  });

  return Object.entries(categories).map(([category, data]) => ({
    category,
    required: data.required,
    matched: data.matched,
    score: Math.round((data.matched / Math.max(data.required, 1)) * 100),
  }));
}

// ═══════════════════════════════════════════
// POST /api/jd/analyze
// ═══════════════════════════════════════════
router.post("/analyze", async (req, res) => {
  try {
    const { jdText } = req.body;

    if (!jdText || typeof jdText !== "string" || jdText.trim().length < 20) {
      return res
        .status(400)
        .json({ error: "Please provide a job description (minimum 20 characters)" });
    }

    const clipped = jdText.slice(0, 8000); // limit input size

    // Step 1: Extract skills from JD via Groq
    const extractionPrompt = `
You are an expert technical recruiter AI.
Analyze this job description and extract structured skill requirements.

Job Description:
"""
${clipped}
"""

Rules:
- Extract the job title and company name if mentioned.
- Separate skills into "mustHaveSkills" (explicitly required) and "niceToHaveSkills" (preferred/bonus).
- Categorize each skill into one of: "Programming Language", "Framework", "Database", "Cloud/DevOps", "AI/ML", "Data", "Security", "Design", "Soft Skill", "Domain Knowledge", "Tools", "Other".
- Identify experience level: "Entry Level", "Mid Level", "Senior", "Lead", or "Not Specified".
- Write a one-sentence role summary.
- Return ONLY valid JSON matching the schema.
`;

    let extraction;
    try {
      extraction = await callLLMJSON({
        prompt: extractionPrompt,
        schema: jdExtractionSchema,
        temperature: 0,
        maxOutputTokens: 2048,
      });
    } catch (err) {
      console.error("JD extraction LLM error:", err?.message || err);
      return res.status(502).json({ error: "Failed to analyze job description" });
    }

    const mustHaveSkills = extraction.mustHaveSkills || [];
    const niceToHaveSkills = extraction.niceToHaveSkills || [];

    if (mustHaveSkills.length === 0 && niceToHaveSkills.length === 0) {
      return res.json({
        extraction,
        matches: [],
        talentGaps: [],
        message: "No technical skills could be extracted from this JD.",
      });
    }

    // Step 2: Match against all students
    db.read();
    const users = db.get("users").value() || [];
    const achievements = db.get("achievements").value() || [];
    const students = users.filter((u) => u.role === "student");

    const matches = [];

    students.forEach((student) => {
      const studentAchievements = achievements.filter(
        (a) => a.studentId === student.id || a.userId === student.id
      );

      const matchResult = computeStudentMatch(
        student,
        studentAchievements,
        mustHaveSkills,
        niceToHaveSkills
      );

      // Only include students with > 0% match
      if (matchResult.matchPercent > 0) {
        matches.push({
          id: student.id,
          name: student.name,
          department: student.department,
          branch: student.branch,
          year: student.year,
          totalPoints: student.totalPoints || 0,
          avatar: student.avatar || null,
          srn: student.srn,
          ...matchResult,
        });
      }
    });

    // Sort by match percentage descending
    matches.sort((a, b) => b.matchPercent - a.matchPercent);

    // Step 3: Compute talent gaps — skills no student has
    const allJdSkills = [...mustHaveSkills, ...niceToHaveSkills];
    const talentGaps = allJdSkills.filter((jdSkill) => {
      const skillLower = jdSkill.skill.toLowerCase();
      const words = skillLower.split(/\s+/);

      // Check if ANY student has this skill
      return !matches.some((m) =>
        m.mustHaveMatched.some((s) => s.skill === jdSkill.skill) ||
        m.niceToHaveMatched.some((s) => s.skill === jdSkill.skill)
      );
    });

    // Step 4: Check skills market for demand context
    const skillsCache = db.get("skillsMarketCache").value();
    let marketContext = [];
    if (skillsCache?.skills) {
      allJdSkills.forEach((jdSkill) => {
        const marketMatch = skillsCache.skills.find(
          (ms) => ms.name.toLowerCase() === jdSkill.skill.toLowerCase()
        );
        if (marketMatch) {
          marketContext.push({
            skill: jdSkill.skill,
            composite: marketMatch.composite,
            changePercent: marketMatch.changePercent,
            demandScore: marketMatch.demandScore,
            studentCount: marketMatch.supply?.studentCount || 0,
          });
        }
      });
    }

    return res.json({
      extraction,
      matches: matches.slice(0, 25), // top 25
      totalMatches: matches.length,
      totalStudentsScanned: students.length,
      talentGaps,
      marketContext,
    });
  } catch (err) {
    console.error("JD analyze error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ═══════════════════════════════════════════
// POST /api/jd/enrich
// Enriches a single achievement with AI-extracted skill tags
// ═══════════════════════════════════════════
router.post("/enrich", async (req, res) => {
  try {
    const { achievementId } = req.body;
    if (!achievementId)
      return res.status(400).json({ error: "achievementId required" });

    db.read();
    const achievement = db
      .get("achievements")
      .find((a) => a.id === achievementId)
      .value();

    if (!achievement)
      return res.status(404).json({ error: "Achievement not found" });

    const prompt = `
Extract technical skills and domain from this student achievement.

Title: "${achievement.title || ""}"
Description: "${(achievement.description || "").slice(0, 1000)}"

Rules:
- Extract specific technical skills mentioned or implied (e.g., "Python", "React", "Machine Learning").
- Also infer reasonable related skills (if they built a web app, they likely know HTML/CSS/JS).
- Assign a domain: "Web Development", "AI/ML", "Data Science", "Cybersecurity", "Mobile Development", "Cloud/DevOps", "IoT/Hardware", "Design", "Research", "Other".
- Assign a difficulty level: "Beginner", "Intermediate", "Advanced".
- Return ONLY valid JSON.
`;

    let enrichment;
    try {
      enrichment = await callLLMJSON({
        prompt,
        schema: enrichSchema,
        temperature: 0,
        maxOutputTokens: 512,
      });
    } catch (err) {
      console.error("Enrich LLM error:", err?.message || err);
      return res.status(502).json({ error: "Failed to enrich achievement" });
    }

    // Update achievement in DB
    db.get("achievements")
      .find((a) => a.id === achievementId)
      .assign({
        skillTags: enrichment.skills || [],
        domain: enrichment.domain || achievement.domain,
        difficultyLevel: enrichment.difficultyLevel || null,
        enrichedAt: new Date().toISOString(),
      })
      .write();

    return res.json({
      message: "Achievement enriched",
      achievementId,
      skills: enrichment.skills,
      domain: enrichment.domain,
      difficultyLevel: enrichment.difficultyLevel,
    });
  } catch (err) {
    console.error("Enrich error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ═══════════════════════════════════════════
// POST /api/jd/enrich-all
// Bulk-enriches all achievements that haven't been enriched yet
// ═══════════════════════════════════════════
router.post("/enrich-all", async (req, res) => {
  try {
    db.read();
    const achievements = db.get("achievements").value() || [];
    const unenriched = achievements.filter((a) => !a.skillTags || a.skillTags.length === 0);

    res.json({
      status: "started",
      message: `Enriching ${unenriched.length} achievements. This runs in the background.`,
      total: unenriched.length,
    });

    // Run enrichment in background
    let enriched = 0;
    for (const achievement of unenriched) {
      try {
        const prompt = `
Extract technical skills and domain from this student achievement.
Title: "${achievement.title || ""}"
Description: "${(achievement.description || "").slice(0, 1000)}"
Rules:
- Extract specific technical skills (e.g., "Python", "React", "Machine Learning").
- Infer reasonable related skills.
- Assign domain: "Web Development", "AI/ML", "Data Science", "Cybersecurity", "Mobile Development", "Cloud/DevOps", "IoT/Hardware", "Design", "Research", "Other".
- Assign difficulty: "Beginner", "Intermediate", "Advanced".
- Return ONLY valid JSON.
`;
        const enrichment = await callLLMJSON({
          prompt,
          schema: enrichSchema,
          temperature: 0,
          maxOutputTokens: 512,
        });

        db.get("achievements")
          .find((a) => a.id === achievement.id)
          .assign({
            skillTags: enrichment.skills || [],
            domain: enrichment.domain || achievement.domain,
            difficultyLevel: enrichment.difficultyLevel || null,
            enrichedAt: new Date().toISOString(),
          })
          .write();

        enriched++;
        // Rate limit for Groq
        await new Promise((r) => setTimeout(r, 800));
      } catch (err) {
        console.error(`Failed to enrich achievement ${achievement.id}:`, err?.message);
      }
    }

    console.log(`✅ Bulk enrichment complete: ${enriched}/${unenriched.length}`);
  } catch (err) {
    console.error("Enrich-all error:", err);
  }
});

module.exports = router;