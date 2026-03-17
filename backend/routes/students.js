// backend/routes/students.js
const express = require("express");
const router = express.Router();
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");

const adapter = new FileSync(path.join(__dirname, "../db.json"));
const db = low(adapter);
db.defaults({ users: [], achievements: [] }).write();

/**
 * Compute total points per student from the achievements collection.
 *
 * Handles multiple data shapes:
 *  - achievements with userId field
 *  - achievements with studentId field
 *  - achievements nested inside user objects (user.achievements array)
 *
 * Deduplicates by achievement ID so nothing gets double-counted.
 */
function computeStudentPoints(users, achievements) {
  const pointsByUser = {};
  const seenAchievementIds = new Set();

  // 1) Top-level achievements collection (the normal path)
  for (const a of achievements) {
    const uid = a.userId ?? a.studentId;
    if (uid == null) continue;
    const aid = a.id;
    if (aid != null && seenAchievementIds.has(aid)) continue;
    if (aid != null) seenAchievementIds.add(aid);
    pointsByUser[uid] = (pointsByUser[uid] || 0) + (a.points || 0);
  }

  // 2) Achievements nested inside user objects (from seed data / JSON import)
  //    Some DB shapes store achievements as user.achievements = [...]
  for (const user of users) {
    if (!Array.isArray(user.achievements)) continue;
    for (const a of user.achievements) {
      const aid = a.id;
      if (aid != null && seenAchievementIds.has(aid)) continue;
      if (aid != null) seenAchievementIds.add(aid);
      pointsByUser[user.id] = (pointsByUser[user.id] || 0) + (a.points || 0);
    }
  }

  return pointsByUser;
}

// GET /api/students  -> return only users with role "student"
router.get("/", (req, res) => {
  try {
    db.read();
    const users = db.get("users").value() || [];
    const achievements = db.get("achievements").value() || [];
    const pointsByUser = computeStudentPoints(users, achievements);
    const students = users.filter((u) => u.role === "student");
    const enriched = students.map((s) => ({
      ...s,
      // Use computed points; fall back to stored totalPoints if no achievements found
      totalPoints: pointsByUser[s.id] || s.totalPoints || 0,
      // Strip nested achievements from the response to keep payloads small
      achievements: undefined,
    }));
    // Sort by points descending so the leaderboard is pre-ranked
    enriched.sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
    res.json(enriched);
  } catch (err) {
    console.error("Error in GET /api/students:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/students/:id
router.get("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    db.read();
    const users = db.get("users").value() || [];
    const achievements = db.get("achievements").value() || [];
    const pointsByUser = computeStudentPoints(users, achievements);
    const student = users.find((u) => u.role === "student" && u.id === id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json({
      ...student,
      totalPoints: pointsByUser[student.id] || student.totalPoints || 0,
      achievements: undefined,
    });
  } catch (err) {
    console.error("Error in GET /api/students/:id:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;