const express = require("express");
const db = require("../utils/db");
const router = express.Router();

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  // check in students (users)
  let user = db.get("users").find({ username, password }).value();

  // if not found, check in recruiters
  if (!user) {
    user = db.get("recruiters").find({ username, password }).value();
  }

  // if not found, check in mentors
  if (!user) {
    user = db.get("mentors").find({ username, password }).value();
  }

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // Return the full user object
  res.json({
    id: user.id,
    username: user.username,
    role: user.role,  // "student", "recruiter", "faculty"
    name: user.name,
    srn: user.srn || null,
    class: user.class || null,
    year: user.year || null,
    branch: user.branch || null,
    department: user.department || null,
    company: user.company || null
  });
});

module.exports = router;


// // backend/routes/auth.js only student login
// const express = require("express");
// const db = require("../utils/db");
// const router = express.Router();

// // POST /api/auth/login
// router.post("/login", (req, res) => {
//   const { username, password } = req.body;

//   const user = db.get("users").find({ username, password }).value();

//   if (!user) {
//     return res.status(401).json({ message: "Invalid credentials" });
//   }

//   // Return full user object including role
//   res.json({
//     id: user.id,
//     username: user.username,
//     role: user.role,       // student / faculty / recruiter
//     name: user.name,
//     srn: user.srn,
//     class: user.class,
//     year: user.year,
//     branch: user.branch,
//     department: user.department,
//   });
// });

// module.exports = router;
