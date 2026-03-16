// backend/routes/github.js
// POST /api/github/import  — import SELECTED repos as achievements
// GET  /api/github/preview/:username — preview repos for selection

const express = require("express");
const router = express.Router();
const axios = require("axios");
const db = require("../utils/db");
const { callLLMJSON } = require("../utils/ai");

const importSchema = {
  type: "object",
  properties: {
    achievements: {
      type: "array",
      items: {
        type: "object",
        properties: {
          repoName: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          domain: { type: "string" },
          skillTags: { type: "array", items: { type: "string" } },
          difficultyLevel: { type: "string" },
          points: { type: "integer", minimum: 5, maximum: 50 },
        },
        required: ["repoName", "title", "description", "domain", "skillTags", "points"],
        additionalProperties: false,
      },
    },
    overallSkills: {
      type: "array",
      items: { type: "string" },
    },
    profileSummary: { type: "string" },
  },
  required: ["achievements", "overallSkills", "profileSummary"],
  additionalProperties: false,
};

async function fetchGitHubProfile(username) {
  const userResp = await axios.get(
    `https://api.github.com/users/${encodeURIComponent(username)}`,
    { headers: { Accept: "application/vnd.github.v3+json" }, timeout: 10000 }
  );
  const user = userResp.data;

  const reposResp = await axios.get(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos`,
    {
      params: { sort: "updated", per_page: 100, type: "owner" },
      headers: { Accept: "application/vnd.github.v3+json" },
      timeout: 10000,
    }
  );

  const repos = (reposResp.data || []).filter(
    (r) => !r.fork && (r.description || r.stargazers_count > 0 || r.language)
  );

  return {
    profile: {
      login: user.login,
      name: user.name || user.login,
      bio: user.bio || "",
      publicRepos: user.public_repos,
      followers: user.followers,
      avatarUrl: user.avatar_url,
      profileUrl: user.html_url,
      createdAt: user.created_at,
    },
    repos: repos.map((r) => ({
      name: r.name,
      description: r.description || "",
      language: r.language || "Unknown",
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      topics: r.topics || [],
      url: r.html_url,
      updatedAt: r.updated_at,
      homepage: r.homepage || null,
    })),
  };
}

// ── GET /api/github/preview/:username ──
router.get("/preview/:username", async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: "GitHub username required" });

    const githubData = await fetchGitHubProfile(username);

    return res.json({
      profile: githubData.profile,
      repoCount: githubData.repos.length,
      repos: githubData.repos,
      languages: [...new Set(githubData.repos.map((r) => r.language).filter(Boolean))],
      totalStars: githubData.repos.reduce((sum, r) => sum + r.stars, 0),
    });
  } catch (err) {
    if (err.response?.status === 404) return res.status(404).json({ error: "GitHub user not found" });
    if (err.response?.status === 403) return res.status(429).json({ error: "GitHub API rate limit. Try again in a few minutes." });
    console.error("GitHub preview error:", err.message);
    return res.status(500).json({ error: "Failed to fetch GitHub profile" });
  }
});

// ── POST /api/github/import ──
// Only analyzes and imports the repos the student selected
router.post("/import", async (req, res) => {
  try {
    const { username, userId, selectedRepos } = req.body;

    if (!username) return res.status(400).json({ error: "GitHub username required" });
    if (!userId) return res.status(400).json({ error: "userId required" });
    if (!selectedRepos || !Array.isArray(selectedRepos) || selectedRepos.length === 0) {
      return res.status(400).json({ error: "Select at least one repository to import" });
    }

    const uid = parseInt(userId, 10);
    db.read();
    const user = db.get("users").find({ id: uid }).value();
    if (!user) return res.status(404).json({ error: "User not found" });

    const repoSummary = selectedRepos
      .map(
        (r, i) =>
          `${i + 1}. "${r.name}" - ${r.description || "No description"} | Language: ${r.language || "Unknown"} | Stars: ${r.stars || 0} | Topics: ${(r.topics || []).join(", ") || "none"} | URL: ${r.url || ""}`
      )
      .join("\n");

    const prompt = `
You are an expert technical portfolio analyzer.
Analyze ONLY these specific GitHub repositories selected by the student and create one achievement per repository.

GitHub Username: ${username}
Selected Repositories (${selectedRepos.length}):
${repoSummary}

Rules:
- Create EXACTLY one achievement per repository listed above. Do not skip any.
- Include "repoName" matching the exact repository name from the list.
- Title: descriptive (e.g. "Built a real-time chat app with React & Socket.io").
- Description: 1-2 sentences about what the project does and its tech stack.
- Domain: "Web Development", "AI/ML", "Data Science", "Mobile Development", "DevOps", "Cybersecurity", "IoT/Hardware", "Design", "Research", "Open Source Contribution", "Other".
- skillTags: specific technologies (e.g., ["React", "Node.js", "MongoDB"]).
- difficultyLevel: "Beginner", "Intermediate", "Advanced".
- points: 5-50 based on quality. Basic app = 10, deployed full-stack = 35, popular OSS = 50.
- overallSkills: ALL unique technologies across selected repos.
- profileSummary: one paragraph summarizing strengths from these repos.
- Return ONLY valid JSON.
`;

    let analysis;
    try {
      analysis = await callLLMJSON({
        prompt,
        schema: importSchema,
        temperature: 0,
        maxOutputTokens: 4096,
      });
    } catch (err) {
      console.error("GitHub import LLM error:", err?.message || err);
      return res.status(502).json({ error: "AI analysis failed. Try again." });
    }

    const createdAchievements = [];
    let totalNewPoints = 0;

    for (const ach of analysis.achievements || []) {
      const matchedRepo = selectedRepos.find(
        (r) => r.name.toLowerCase() === (ach.repoName || "").toLowerCase()
      );

      const achievement = {
        id: Date.now() + Math.floor(Math.random() * 10000),
        userId: uid,
        studentId: uid,
        title: ach.title,
        description: ach.description,
        domain: ach.domain || "Other",
        skillTags: ach.skillTags || [],
        difficultyLevel: ach.difficultyLevel || "Intermediate",
        points: ach.points || 10,
        proof: matchedRepo?.url || `https://github.com/${username}`,
        source: "github-import",
        repoName: ach.repoName || "",
        createdAt: new Date().toISOString(),
        enrichedAt: new Date().toISOString(),
      };

      db.get("achievements").push(achievement).write();
      createdAchievements.push(achievement);
      totalNewPoints += achievement.points;
      await new Promise((r) => setTimeout(r, 5));
    }

    if (typeof user.totalPoints === "number") {
      db.get("users")
        .find({ id: uid })
        .assign({
          totalPoints: user.totalPoints + totalNewPoints,
          githubUsername: username,
          githubImportedAt: new Date().toISOString(),
        })
        .write();
    }

    return res.json({
      message: `Imported ${createdAchievements.length} selected repositories as achievements`,
      imported: createdAchievements.length,
      totalNewPoints,
      achievements: createdAchievements,
      overallSkills: analysis.overallSkills || [],
      profileSummary: analysis.profileSummary || "",
    });
  } catch (err) {
    console.error("GitHub import error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;