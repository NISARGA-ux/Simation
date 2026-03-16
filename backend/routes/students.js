// backend/routes/students.js
const express = require("express");
const router = express.Router();
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const path = require("path");

const adapter = new FileSync(path.join(__dirname, "../db.json"));
const db = low(adapter);
db.defaults({ users: [] }).write();

// GET /api/students  -> return only users with role "student"
router.get("/", (req, res) => {
  try {
    db.read();
    const users = db.get("users").value() || [];
    const students = users.filter(u => u.role === "student");
    res.json(students);
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
    const student = users.find(u => u.role === "student" && u.id === id);
    if (!student) return res.status(404).json({ error: "Student not found" });
    res.json(student);
  } catch (err) {
    console.error("Error in GET /api/students/:id:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
