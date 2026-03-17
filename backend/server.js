require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");

const quizRoutes = require("./routes/quiz");
const homeRoutes = require("./routes/home");
const achievementsRoutes = require("./routes/achievements");
const studentRoutes = require("./routes/students");
const skillsMarketRoutes = require("./routes/skillsMarket");
const authRoutes = require("./routes/auth");
const jdRoutes = require("./routes/jd");
const githubRoutes = require("./routes/github");
const coursesRoutes = require("./routes/courses");
const notificationsRoutes = require("./routes/notifications");

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/quiz", quizRoutes);
app.use("/api/home", homeRoutes);
app.use("/api/achievements", achievementsRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/skills-market", skillsMarketRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/jd", jdRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/debug", require("./routes/debug"));

// Serve frontend build from /dist
const frontendPath = path.join(__dirname, "dist");
app.use(express.static(frontendPath));

// Serve index.html for all unmatched routes EXCEPT API routes
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Use Cloud Run PORT
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
