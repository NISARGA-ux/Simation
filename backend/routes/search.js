// routes/search.js
const express = require("express");
const router = express.Router();
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

// GET /api/search?q=...
router.get("/search", (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);

  const query = q.toLowerCase();

  const results = db
    .get("achievements")
    .filter(a =>
      (a.title && a.title.toLowerCase().includes(query)) ||
      (a.description && a.description.toLowerCase().includes(query))
    )
    .map(a => {
      const userId = a.studentId || a.userId;
      const user = db.get("users").find({ id: userId }).value();

      return {
        ...a,
        userName: user?.name || "Unknown",  // <-- mapped to `name`
        year: user?.year || "",
        avatar: user?.avatar || null,
        userId: user?.id || null,
      };
    })
    .value();

  res.json(results);
});

module.exports = router;


// const express = require("express");
// const router = express.Router();
// const low = require("lowdb");
// const FileSync = require("lowdb/adapters/FileSync");
// const adapter = new FileSync("db.json");
// const db = low(adapter);

// router.get("/search", (req, res) => {
//   const { q } = req.query;
//   if (!q) return res.json([]);

//   const achievements = db.get("achievements")
//     .filter(a => a.title.toLowerCase().includes(q.toLowerCase()))
//     .map(a => {
//       const user = db.get("users").find({ id: a.studentId || a.userId }).value();
//       return {
//         ...a,
//         userName: user?.name || "Unknown",
//         year: user?.year || "",
//         userId: user?.id
//       };
//     })
//     .value();

//   res.json(achievements);
// });


// module.exports = router;


// const express = require("express");
// const router = express.Router();
// const low = require("lowdb");
// const FileSync = require("lowdb/adapters/FileSync");

// // Load db.json with FileSync adapter (lowdb v1)
// const adapter = new FileSync("db.json");
// const db = low(adapter);

// // Make sure defaults exist
// db.defaults({ achievements: [] }).write();

// // GET /api/search?q=term
// router.get("/", (req, res) => {
//   try {
//     const query = req.query.q ? req.query.q.toLowerCase() : "";

//     if (!query) {
//       return res.json([]); // empty search returns []
//     }

//     // Search in title, description, and domain
//     const results = db
//       .get("achievements")
//       .filter((item) =>
//         (item.title && item.title.toLowerCase().includes(query)) ||
//         (item.description && item.description.toLowerCase().includes(query)) ||
//         (item.domain && item.domain.toLowerCase().includes(query))
//       )
//       .value();

//     res.json(results);
//   } catch (err) {
//     console.error("Search route error:", err);
//     res.status(500).json({ error: "Search failed", details: String(err) });
//   }
// });

// module.exports = router;

