// backend/routes/achievements.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const db = require("../utils/db");

const router = express.Router();

// ensure uploads folder exists (server start should create it, but double-check)
const fs = require("fs");
const UPLOAD_DIR = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

// multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// POST /api/achievements/add
router.post("/add", upload.single("proofFile"), (req, res) => {
  try {
    // NOTE: db is lowdb v1 (FileSync). Use db.get(...).push(...).write()
    const { title, description, link, userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId required" });

    // Make sure db has structure
    db.defaults({ users: [], achievements: [], notifications: [] }).write();

    // find user (user ids in db.json are integers)
    const uid = parseInt(userId, 10);
    const user = db.get("users").find({ id: uid }).value();
    if (!user) return res.status(404).json({ message: "User not found" });

    // build proof URL
    let proofUrl = null;
    if (req.file) {
      // store path that frontend can fetch: /uploads/<filename>
      proofUrl = `/uploads/${req.file.filename}`;
    } else if (link) {
      proofUrl = link;
    }

    const achievement = {
      id: Date.now(),
      userId: uid,
      title: title || "",
      description: description || "",
      proof: proofUrl,
      points: 10, // placeholder; you'll integrate Vertex later
      createdAt: new Date().toISOString(),
    };

    // push into top-level achievements list (easier) — keeps all achievements together
    db.get("achievements").push(achievement).write();

    // optional: update user's totalPoints field if you maintain it
    if (typeof user.totalPoints === "number") {
      db.get("users")
        .find({ id: uid })
        .assign({ totalPoints: user.totalPoints + achievement.points })
        .write();
    }

    return res.json({ message: "Achievement added", achievement });
  } catch (err) {
    console.error("achievements.add error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// GET /api/achievements/:userId  -> returns achievements for that user
router.get("/:userId", (req, res) => {
  try {
    db.defaults({ users: [], achievements: [], notifications: [] }).write();
    const uid = parseInt(req.params.userId, 10);
    if (isNaN(uid)) return res.status(400).json({ message: "Invalid userId" });

    const user = db.get("users").find({ id: uid }).value();
    if (!user) return res.status(404).json({ message: "User not found" });

    const userAchievements = db.get("achievements").filter({ userId: uid }).value();
    return res.json(userAchievements);
  } catch (err) {
    console.error("achievements.get error:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;