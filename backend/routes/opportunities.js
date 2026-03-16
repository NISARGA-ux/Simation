// backend/routes/opportunities.js
const express = require("express");
const router = express.Router();
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

// Ensure defaults
db.defaults({ opportunities: [], students: [] }).write();

/**
 * Helper to normalize date + time into ISO string
 */
function normalizeDate(date, time) {
  if (!date) return null;

  // If already ISO
  const tryDate = new Date(date);
  if (!isNaN(tryDate.getTime())) return tryDate.toISOString();

  // If given as "2025-12-20" and time separate
  if (time) {
    const combined = new Date(`${date} ${time}`);
    if (!isNaN(combined.getTime())) return combined.toISOString();
  }

  return null;
}

/**
 * GET all opportunities
 * Sorted by event date (latest first)
 */
router.get("/", (req, res) => {
  const opportunities = db.get("opportunities").value();

  const normalized = opportunities.map((opp) => {
    return {
      ...opp,
      _sortDate: normalizeDate(opp.date, opp.time), // temp field
    };
  });

  const sorted = normalized
    .sort((a, b) => {
      const dA = a._sortDate ? new Date(a._sortDate) : 0;
      const dB = b._sortDate ? new Date(b._sortDate) : 0;
      return dB - dA; // latest first
    })
    .map(({ _sortDate, ...rest }) => rest); // drop temp

  res.json(sorted);
});

/**
 * POST new opportunity
 */
router.post("/", (req, res) => {
  const {
    title,
    description,
    type,
    venue,
    date,
    time,
    registrationLink,
    postedBy,
    mentorId,
  } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }

  // Normalize to ISO
  const isoDate = normalizeDate(date, time);

  // Auto fetch mentor name if mentorId is given
  let mentorName = postedBy || "Unknown Mentor";
  if (mentorId) {
    const mentor = db.get("students").find({ id: mentorId }).value();
    if (mentor && mentor.name) {
      mentorName = mentor.name;
    }
  }

  const newOpportunity = {
    id: Date.now(),
    title,
    description,
    type: type || "General",
    venue: venue || "TBA",
    date: isoDate || date || "", // always something valid
    time: time || "",
    registrationLink: registrationLink || "",
    postedBy: mentorName,
    mentorId: mentorId || null,
  };

  db.get("opportunities").push(newOpportunity).write();

  res.status(201).json(newOpportunity);
});

module.exports = router;
