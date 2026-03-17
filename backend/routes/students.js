// backend/routes/students.js
const express = require("express");
const router = express.Router();
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");

const adapter = new FileSync(path.join(__dirname, "../db.json"));
const db = low(adapter);
db.defaults({ users: [] }).write();

function computeStudentPoints(achievements) {
  const pointsByUser = {};
  for (const a of achievements) {
    const uid = a.userId ?? a.studentId;
    if (uid == null) continue;
    pointsByUser[uid] = (pointsByUser[uid] || 0) + (a.points || 0);
  }
  return pointsByUser;
}

// GET /api/students  -> return only users with role "student"
router.get("/", (req, res) => {
  try {
    db.read();
    const users = db.get("users").value() || [];
    const achievements = db.get("achievements").value() || [];
    const pointsByUser = computeStudentPoints(achievements);
    const students = users.filter(u => u.role === "student");
    const enriched = students.map((s) => ({
      ...s,
      totalPoints: pointsByUser[s.id] || 0,
    }));
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
    const pointsByUser = computeStudentPoints(achievements);
    const student = users.find(u => u.role === "student" && u.id === id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json({
      ...student,
      totalPoints: pointsByUser[student.id] || 0,
    });
  } catch (err) {
    console.error("Error in GET /api/students/:id:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
