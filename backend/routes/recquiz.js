// backend/routes/rec.quiz.js
const express = require("express");
const path = require("path");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const router = express.Router();

// Load the same db.json as other routes
const adapter = new FileSync(path.join(__dirname, "../db.json"));
const db = low(adapter);
db.read();

// Quick test route
router.get("/recquiz/test", (req, res) => {
  console.log("📌 rec.quiz.js GET /recquiz/test hit");
  res.json({ message: "RecQuiz route working ✅" });
});

/**
 * POST /api/recquiz/analyse
 * Body: { answers: ["aws", "Computer Science (CSE)", "3rd Year", ...] }
 *
 * Returns debug info + matches
 */
router.post("/recquiz/analyse", (req, res) => {
  try {
    const body = req.body || {};
    const answersRaw = Array.isArray(body.answers) ? body.answers : [];

    console.log("🔎 /recquiz/analyse called with answersRaw:", answersRaw);

    const answers = answersRaw
      .filter(a => typeof a === "string" && a.trim().length > 0)
      .map(a => a.trim().toLowerCase());

    db.read();
    const users = db.get("users").value() || [];
    const achievements = db.get("achievements").value() || [];

    console.log(`🗂️ DB counts: users=${users.length}, achievements=${achievements.length}`);

    if (!answers.length) {
      return res.json({
        debug: { answers, usersCount: users.length, achievementsCount: achievements.length },
        matches: []
      });
    }

    const students = users.filter(u => u.role === "student");
    const matches = [];

    // In your router.post("/recquiz/analyse", ...)
students.forEach(student => {
  const sid = student.id;
  const dept = (student.department || "").toLowerCase();
  const yearStr = student.year ? String(student.year).toLowerCase() : "";

  // profile match
  const profileMatched = answers.some(ans => {
    if (dept.includes(ans)) return true;
    if (yearStr && (ans.includes(yearStr) || `${yearStr}th`.includes(ans) || `${yearStr}rd`.includes(ans))) return true;
    if (ans.includes("year") && ans.includes(String(student.year))) return true;
    return false;
  });

  // **Always fetch all achievements for the student**
  const studentAchievements = achievements.filter(a => a.studentId === sid || a.userId === sid);

  // mark only the achievements that match answers
  const matchedAchievements = studentAchievements.filter(a => {
    const title = (a.title || "").toLowerCase();
    const desc = (a.description || "").toLowerCase();
    return answers.some(ans => title.includes(ans) || desc.includes(ans));
  });

  // **Also include achievements even if no direct answer match**, like search bar
  const achievementsToSend = profileMatched ? studentAchievements : matchedAchievements;

  if (profileMatched || achievementsToSend.length > 0) {
    matches.push({
      id: student.id,
      name: student.name,
      department: student.department,
      year: student.year,
      avatar: student.avatar || null,
      totalPoints: student.totalPoints || 0,
      matchedAchievements: achievementsToSend.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        domain: a.domain,
        proof: a.proof,
        points: a.points
      })),
      reason: {
        profileMatched,
        achievementCount: achievementsToSend.length
      }
    });
  }
});

    console.log("✅ total matched students:", matches.length);

    res.json({
      debug: {
        answers,
        usersCount: users.length,
        achievementsCount: achievements.length
      },
      matches
    });

  } catch (err) {
    console.error("Error in rec.quiz analyse:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;


// // backend/routes/rec.quiz.js
// const express = require("express");
// const path = require("path");
// const low = require("lowdb");
// const FileSync = require("lowdb/adapters/FileSync");

// const router = express.Router();

// // load the same db.json as other routes
// const adapter = new FileSync(path.join(__dirname, "../db.json"));
// const db = low(adapter);
// db.read();

// // quick test route
// router.get("/recquiz/test", (req, res) => {
//   console.log("📌 rec.quiz.js GET /recquiz/test hit");
//   res.json({ message: "RecQuiz route working ✅" });
// });

// /**
//  * POST /api/recquiz/analyse
//  * Body: { answers: ["aws", "Computer Science (CSE)", "3rd Year", ...] }
//  *
//  * Returns debug info + matches
//  */
// router.post("/recquiz/analyse", (req, res) => {
//   try {
//     // safe read of request
//     const body = req.body || {};
//     const answersRaw = Array.isArray(body.answers) ? body.answers : [];

//     console.log("🔎 /recquiz/analyse called with answersRaw:", answersRaw);

//     // normalize keywords to lowercase trimmed
//     const answers = answersRaw
//       .filter(a => typeof a === "string" && a.trim().length > 0)
//       .map(a => a.trim().toLowerCase());

//     // Read fresh DB
//     db.read();
//     const users = db.get("users").value() || [];
//     const achievements = db.get("achievements").value() || [];

//     console.log(`🗂️ DB counts: users=${users.length}, achievements=${achievements.length}`);

//     // If no filters, return nothing
//     if (!answers.length) {
//       return res.json({ debug: { answers, usersCount: users.length, achievementsCount: achievements.length }, matches: [] });
//     }

//     // Helpful debug: show achievements that match ANY keyword directly (title or desc)
//     const directAchievementMatches = achievements.filter(a => {
//       const title = (a.title || "").toLowerCase();
//       const desc = (a.description || "").toLowerCase();
//       return answers.some(ans => title.includes(ans) || desc.includes(ans));
//     });

//     console.log("🧾 directAchievementMatches (count):", directAchievementMatches.length);
//     // Also show matching studentIds from those achievements
//     const studentIdsFromAchievements = Array.from(new Set(directAchievementMatches.map(a => a.studentId || a.userId).filter(Boolean)));
//     console.log("🆔 studentIdsFromAchievements:", studentIdsFromAchievements);

//     // Now build matched students:
//     const students = users.filter(u => u.role === "student");
//     const matches = [];

//     students.forEach(student => {
//       const sid = student.id;
//       // profile match: department or year string contains any answer
//       const dept = (student.department || "").toLowerCase();
//       const yearStr = student.year ? String(student.year).toLowerCase() : "";

//       const profileMatched = answers.some(ans => {
//         if (dept && dept.includes(ans)) return true;
//         if (yearStr && (ans.includes(yearStr) || `${yearStr}th`.includes(ans) || `${yearStr}rd`.includes(ans))) return true;
//         // allow "3rd year" or "3" matching
//         if (ans.includes("year") && ans.includes(String(student.year))) return true;
//         return false;
//       });

//       // achievement matches for that student
//       const matchedAchievements = achievements.filter(a => {
//         const aStudentId = a.studentId || a.userId || null;
//         if (aStudentId !== sid) return false;
//         const title = (a.title || "").toLowerCase();
//         const desc = (a.description || "").toLowerCase();
//         return answers.some(ans => title.includes(ans) || desc.includes(ans));
//       });

//       if (profileMatched || matchedAchievements.length > 0) {
//         matches.push({
//           id: student.id,
//           name: student.name,
//           department: student.department,
//           year: student.year,
//           avatar: student.avatar || null,
//           totalPoints: student.totalPoints || 0,
//           matchedAchievements: matchedAchievements.map(a => ({
//             id: a.id,
//             title: a.title,
//             description: a.description,
//             domain: a.domain,
//             proof: a.proof,
//             points: a.points
//           })),
//           reason: {
//             profileMatched,
//             achievementCount: matchedAchievements.length
//           }
//         });
//       }
//     });

//     console.log("✅ total matched students:", matches.length);

//     // Return debug info + matches so we can inspect
//     res.json({
//       debug: {
//         answers,
//         directAchievementMatchesCount: directAchievementMatches.length,
//         studentIdsFromAchievements,
//         usersCount: users.length,
//         achievementsCount: achievements.length
//       },
//       matches
//     });

//   } catch (err) {
//     console.error("Error in rec.quiz analyse:", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// module.exports = router;
