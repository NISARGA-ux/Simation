const express = require("express");
const router = express.Router();
const db = require("../utils/db");
const { fetchAllSkillsData } = require("../utils/skillFetcher");

db.defaults({ skillsMarketCache: null }).write();

let isRefreshing = false;
const REQUIRED_CACHE_VERSION = 2;

function isCacheStale(cached) {
  if (!cached) {
    return true;
  }

  if (cached?.meta?.cacheVersion !== REQUIRED_CACHE_VERSION) {
    return true;
  }

  if (!cached?.meta?.discoverySummary) {
    return true;
  }

  return false;
}

function startRefresh(reason = "manual") {
  if (isRefreshing) {
    return false;
  }

  isRefreshing = true;
  fetchAllSkillsData(db)
    .then((data) => {
      db.set("skillsMarketCache", data).write();
      console.log(`Skills market refresh complete (${reason})`);
    })
    .catch((err) => {
      console.error(`Skills market refresh failed (${reason}):`, err);
    })
    .finally(() => {
      isRefreshing = false;
    });

  return true;
}

router.get("/", async (req, res) => {
  try {
    let cached = db.get("skillsMarketCache").value();

    if (isCacheStale(cached)) {
      startRefresh(cached ? "stale-cache" : "initial-cache");

      return res.status(202).json({
        status: "refreshing",
        message: cached
          ? "Skills market cache is being rebuilt with the latest discovery engine. Try again in 60 seconds."
          : "Skills market data is being fetched for the first time. Try again in 60 seconds.",
      });
    }

    const { category, sort, order } = req.query;
    let skills = cached.skills || [];

    if (category && category !== "All") {
      skills = skills.filter((skill) => skill.category === category);
    }

    if (sort) {
      const direction = order === "asc" ? 1 : -1;
      skills = [...skills].sort((a, b) => {
        const aValue = a[sort] ?? 0;
        const bValue = b[sort] ?? 0;
        if (typeof aValue === "string") {
          return direction * aValue.localeCompare(String(bValue));
        }
        return direction * (aValue - bValue);
      });
    }

    return res.json({
      skills,
      meta: cached.meta,
    });
  } catch (err) {
    console.error("Error serving skills market:", err);
    return res.status(500).json({ error: "Failed to load skills market data" });
  }
});

router.post("/refresh", async (req, res) => {
  if (isRefreshing) {
    return res.status(429).json({
      status: "already_refreshing",
      message: "A refresh is already in progress. Please wait.",
    });
  }

  res.json({
    status: "started",
    message: "Refresh started. This takes 30-90 seconds depending on API response times.",
  });

  startRefresh("manual");
});

router.get("/status", (req, res) => {
  const cached = db.get("skillsMarketCache").value();
  res.json({
    hasData: !!cached && !isCacheStale(cached),
    isRefreshing,
    lastUpdated: cached?.meta?.lastUpdated || null,
    skillCount: cached?.skills?.length || 0,
  });
});

router.get("/meta/categories", (req, res) => {
  const cached = db.get("skillsMarketCache").value();
  if (isCacheStale(cached)) {
    return res.json({ categories: [] });
  }

  const categories = [...new Set((cached.skills || []).map((skill) => skill.category))];
  return res.json({ categories });
});

router.get("/:name", (req, res) => {
  try {
    const cached = db.get("skillsMarketCache").value();
    if (isCacheStale(cached)) {
      return res.status(404).json({ error: "No data available. Trigger a refresh first." });
    }

    const skill = (cached.skills || []).find(
      (item) => item.name.toLowerCase() === req.params.name.toLowerCase()
    );

    if (!skill) {
      return res.status(404).json({ error: `Skill "${req.params.name}" not found` });
    }

    const studentIds = skill.supply?.studentIds || [];
    const users = db.get("users").value() || [];
    const matchedStudents = users
      .filter((user) => user.role === "student" && studentIds.includes(user.id))
      .map((user) => ({
        id: user.id,
        name: user.name,
        department: user.department,
        branch: user.branch,
        year: user.year,
        totalPoints: user.totalPoints || 0,
      }));

    return res.json({
      ...skill,
      supply: {
        ...skill.supply,
        students: matchedStudents,
      },
    });
  } catch (err) {
    console.error("Error fetching skill detail:", err);
    return res.status(500).json({ error: "Failed to fetch skill detail" });
  }
});

module.exports = router;
