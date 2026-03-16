// backend/routes/courses.js
// GET /api/courses/recommend?skill=Kubernetes
// POST /api/courses/skill-gaps  — takes student profile, returns gaps + courses

const express = require("express");
const router = express.Router();
const axios = require("axios");
const db = require("../utils/db");
require("dotenv").config();

// ── Fetch real courses from Tavily ──
async function fetchCoursesForSkill(skill) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  try {
    const resp = await axios.post(
      "https://api.tavily.com/search",
      {
        api_key: apiKey,
        query: `best free ${skill} course tutorial 2025 2026 beginner`,
        search_depth: "basic",
        max_results: 5,
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

    return results;
  } catch (err) {
    console.error(`[Courses] Tavily error for ${skill}:`, err.message);
    return [];
  }
}

function extractDomain(url) {
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    return domain;
  } catch {
    return "";
  }
}

// ── GET /api/courses/recommend?skill=Docker ──
router.get("/recommend", async (req, res) => {
  try {
    const { skill } = req.query;
    if (!skill) return res.status(400).json({ error: "skill parameter required" });

    const courses = await fetchCoursesForSkill(skill);

    // Also check skills market for context
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

// ── POST /api/courses/skill-gaps ──
// Takes a student's self-rated skills, compares to market demand, returns gaps + courses
router.post("/skill-gaps", async (req, res) => {
  try {
    const { ratings, userId } = req.body;
    // ratings: [{ skill: "Python", rating: 4 }, { skill: "Docker", rating: 1 }, ...]

    if (!ratings || !Array.isArray(ratings)) {
      return res.status(400).json({ error: "ratings array required" });
    }

    const cached = db.get("skillsMarketCache").value();
    const marketSkills = cached?.skills || [];

    // Compute gaps: skills where (market demand is high) AND (student rating is low)
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

      // Normalize student rating to 0-100 scale (from 0-5)
      const studentScore = studentRating * 20;

      // Gap = demand is high but student is low
      const gapScore = Math.max(0, demandScore - studentScore);

      const entry = {
        skill: r.skill,
        studentRating,
        studentScore,
        demandScore,
        composite,
        changePercent,
        gapScore,
        jobCount: market?.demand?.jobCount || 0,
      };

      if (gapScore > 30) {
        gaps.push(entry);
      } else {
        strengths.push(entry);
      }
    }

    // Sort gaps by severity
    gaps.sort((a, b) => b.gapScore - a.gapScore);
    strengths.sort((a, b) => b.studentScore - a.studentScore);

    // Compute marketability score
    const totalDemand = ratings.reduce((sum, r) => {
      const m = marketSkills.find((ms) => ms.name.toLowerCase() === r.skill.toLowerCase());
      return sum + (m?.demandScore || 50);
    }, 0);
    const totalStudentScore = ratings.reduce((sum, r) => sum + (r.rating || 0) * 20, 0);
    const marketability = Math.round(
      (totalStudentScore / Math.max(totalDemand, 1)) * 100
    );

    // Fetch courses for top 3 gaps
    const topGaps = gaps.slice(0, 3);
    const coursesMap = {};

    for (const gap of topGaps) {
      coursesMap[gap.skill] = await fetchCoursesForSkill(gap.skill);
      await new Promise((r) => setTimeout(r, 300)); // rate limit
    }

    // Optional: save assessment to user profile
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
              marketability,
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
      totalSkillsAssessed: ratings.length,
    });
  } catch (err) {
    console.error("Skill gaps error:", err);
    return res.status(500).json({ error: "Failed to compute skill gaps" });
  }
});

module.exports = router;