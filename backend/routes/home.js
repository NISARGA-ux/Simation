const express = require("express");
const router = express.Router();
const { callVertexJSON } = require("../utils/vertex");

const suggestionSchema = {
  type: "object",
  properties: {
    suggestions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          category: { type: "string" },
          shortDescription: { type: "string" },
          keywords: { type: "array", items: { type: "string" } },
          details: { type: "string" },
          link: { type: "string" },
        },
        required: ["title", "category", "shortDescription", "details"],
        additionalProperties: false,
      },
    },
  },
  required: ["suggestions"],
  additionalProperties: false,
};

router.get("/", async (req, res) => {
  try {
    const prompt = `
You are Zenith Cortex, a daily AI tech guide.
Generate EXACTLY 15 suggestions for a CS/IT student. 
Topics should include GSoC, ICPC, NLP, AI/ML, Cybersecurity, Hackathons, Open Source, and career tips.

Rules:
- Each suggestion must match the schema strictly.
- Output must be ONLY JSON, no markdown, no commentary.
- Do NOT include explanations outside JSON.
- Each suggestion must have title, category, shortDescription, keywords, details, and link.
`;


    let obj;
    try {
      obj = await callVertexJSON({
        prompt,
        schema: suggestionSchema,
        temperature: 0.5,
        maxOutputTokens: 2048, // keep smaller to avoid cut-off
      });
    } catch (err) {
      console.error("Vertex JSON error (home):", err?.message || err);
      return res.status(502).json({ error: "AI returned non-JSON or invalid schema output" });
    }

    return res.json(obj);
  } catch (err) {
    console.error("Error fetching home suggestions:", err);
    return res.status(500).json({ error: "Failed to fetch suggestions", details: String(err) });
  }
});

module.exports = router;

