

// backend/routes/quiz.js
const express = require("express");
const router = express.Router();
const { callVertexJSON } = require("../utils/vertex");

// Schema to enforce a stable shape
const quizSchema = {
  type: "object",
  properties: {
    topProfessions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          profession: { type: "string" },
          matchPercentage: { type: "integer", minimum: 0, maximum: 100 },
          reasons: { type: "array", items: { type: "string" } },
        },
        required: ["profession", "matchPercentage"],
        additionalProperties: false,
      },
    },
    roadmaps: {
      type: "object",
      additionalProperties: {
        type: "object",
        properties: {
          beginner: { type: "array", items: { type: "object", properties: {
            title: { type: "string" }, why: { type: "string" }
          }, required: ["title"], additionalProperties: false } },
          intermediate: { type: "array", items: { type: "object", properties: {
            title: { type: "string" }, why: { type: "string" }
          }, required: ["title"], additionalProperties: false } },
          advanced: { type: "array", items: { type: "object", properties: {
            title: { type: "string" }, why: { type: "string" }
          }, required: ["title"], additionalProperties: false } },
        },
        required: ["beginner", "intermediate", "advanced"],
        additionalProperties: false,
      },
    },
  },
  required: ["topProfessions", "roadmaps"],
  additionalProperties: false,
};

router.post("/analyze", async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: "No answers provided (expected array)" });
    }

    const prompt = `
You are an expert career advisor.
Given this JSON array of quiz answers, return ONLY JSON that matches the provided schema.

User answers:
${JSON.stringify(answers).slice(0, 15000)}

Rules:
- Provide up to 5 top professions.
- Each profession must include an independent integer matchPercentage (0–100).
- For every profession, include a roadmap with beginner/intermediate/advanced steps.
- Output must be ONLY strict JSON. No markdown, no commentary.
`;

    let obj;
    try {
      obj = await callVertexJSON({
        prompt,
        schema: quizSchema,
        temperature: 0,
        maxOutputTokens: 4096,
      });
    } catch (err) {
      console.error("Vertex JSON error (quiz):", err?.message || err);
      return res.status(502).json({ error: "AI returned non-JSON or invalid schema output" });
    }

    return res.json(obj);
  } catch (err) {
    console.error("Error analyzing quiz:", err);
    return res.status(500).json({ error: "Failed to analyze quiz results", details: String(err) });
  }
});

module.exports = router;
