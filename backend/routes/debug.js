// Add this TEMPORARILY to server.js after all the app.use() lines:
// app.use("/api/debug", require("./routes/debug"));
// DELETE THIS FILE after confirming env vars work

const express = require("express");
const router = express.Router();

router.get("/env-check", (req, res) => {
  res.json({
    hasGroqKey: !!process.env.GROQ_API_KEY,
    groqKeyPrefix: process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.slice(0, 8) + "..." : "MISSING",
    hasTavilyKey: !!process.env.TAVILY_API_KEY,
    tavilyKeyPrefix: process.env.TAVILY_API_KEY ? process.env.TAVILY_API_KEY.slice(0, 8) + "..." : "MISSING",
    hasSerpApiKey: !!process.env.SERPAPI_API_KEY,
    serpKeyPrefix: process.env.SERPAPI_API_KEY ? process.env.SERPAPI_API_KEY.slice(0, 8) + "..." : "MISSING",
    groqModel: process.env.GROQ_MODEL || "NOT SET",
    port: process.env.PORT || "NOT SET",
    nodeEnv: process.env.NODE_ENV || "NOT SET",
  });
});

module.exports = router;