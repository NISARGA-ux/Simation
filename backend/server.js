require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");

const resumeRoutes = require("./routes/resume");
const quizRoutes = require("./routes/quiz");
const homeRoutes = require("./routes/home");
const authRoutes = require("./routes/auth");
const achievementsRoutes = require("./routes/achievements");
const leaderboardRoutes = require("./routes/leaderboard");
const searchRoutes = require("./routes/search");
const opportunitiesRoutes = require("./routes/opportunities");
const recQuizRoutes = require("./routes/recquiz");
const studentRoutes = require("./routes/students");

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); 

app.use("/api/resume", resumeRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/home", homeRoutes);
app.use("/api", searchRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/achievements", achievementsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/opportunities", opportunitiesRoutes);
app.use("/api", recQuizRoutes);
app.use("/api/students", studentRoutes);

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
