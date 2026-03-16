// backend/routes/notifications.js
// POST /api/notifications/shortlist — recruiter shortlists a student
// GET  /api/notifications/:userId    — student reads their notifications

const express = require("express");
const router = express.Router();
const db = require("../utils/db");

db.defaults({ notifications: [] }).write();

// ── POST /api/notifications/shortlist ──
// Called when recruiter clicks "Shortlist" on a candidate
router.post("/shortlist", (req, res) => {
  try {
    const { studentId, recruiterId, recruiterName, company, jobTitle, matchPercent, mustHaveMatched, mustHaveMissed } = req.body;

    if (!studentId) return res.status(400).json({ error: "studentId required" });

    db.read();
    const student = db.get("users").find({ id: parseInt(studentId, 10) }).value();
    if (!student) return res.status(404).json({ error: "Student not found" });

    const notification = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      type: "shortlisted",
      studentId: parseInt(studentId, 10),
      recruiterId: recruiterId || null,
      recruiterName: recruiterName || "A recruiter",
      company: company || "A company",
      jobTitle: jobTitle || "Open Role",
      matchPercent: matchPercent || 0,
      skillsMatched: (mustHaveMatched || []).map(s => s.skill || s),
      skillsMissing: (mustHaveMissed || []).map(s => s.skill || s),
      read: false,
      createdAt: new Date().toISOString(),
    };

    db.get("notifications").push(notification).write();

    return res.json({ message: "Student notified", notification });
  } catch (err) {
    console.error("Shortlist notification error:", err);
    return res.status(500).json({ error: "Failed to create notification" });
  }
});

// ── GET /api/notifications/:userId ──
// Returns all notifications for a student, newest first
router.get("/:userId", (req, res) => {
  try {
    const uid = parseInt(req.params.userId, 10);
    if (isNaN(uid)) return res.status(400).json({ error: "Invalid userId" });

    db.read();
    const notifications = db.get("notifications")
      .filter({ studentId: uid })
      .value()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
    });
  } catch (err) {
    console.error("Get notifications error:", err);
    return res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// ── POST /api/notifications/:userId/read-all ──
// Mark all as read
router.post("/:userId/read-all", (req, res) => {
  try {
    const uid = parseInt(req.params.userId, 10);
    db.read();
    const notifications = db.get("notifications").value() || [];
    notifications.forEach(n => {
      if (n.studentId === uid && !n.read) {
        db.get("notifications").find({ id: n.id }).assign({ read: true }).write();
      }
    });
    return res.json({ message: "All notifications marked as read" });
  } catch (err) {
    return res.status(500).json({ error: "Failed to mark notifications" });
  }
});

module.exports = router;