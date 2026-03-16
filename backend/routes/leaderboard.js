// backend/routes/leaderboard.js
const express = require("express");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const router = express.Router();
const adapter = new FileSync("db.json");
const db = low(adapter);

// Ensure defaults exist
db.defaults({ users: [] }).write();

// GET /api/leaderboard?department=CSE&branch=AI%20ML&year=2
router.get("/", (req, res) => {
  try {
    const { department, branch, year } = req.query;
    let users = db.get("users").value();

    // Apply filters
    if (department) users = users.filter((u) => u.department === department);
    if (branch) users = users.filter((u) => u.branch === branch);
    if (year) users = users.filter((u) => String(u.year) === String(year));

    if (users.length === 0) {
      return res.status(404).json({ error: "No students found for these filters." });
    }

    // Sort by totalPoints (descending)
    users.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));

    // Dense ranking
    let rank = 0;
    let lastScore = null;
    users.forEach((u) => {
      if (u.totalPoints !== lastScore) {
        rank++;
        lastScore = u.totalPoints;
      }
      u.rank = rank;
    });

    res.json(users);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

module.exports = router;
