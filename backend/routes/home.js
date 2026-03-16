const express = require("express");
const router = express.Router();
const { callLLMJSON } = require("../utils/ai");
const { searchTavily } = require("../utils/tavily");
const { searchSerpApi } = require("../utils/serpapi");

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
        required: ["title", "category", "shortDescription", "details", "link"],
        additionalProperties: false,
      },
    },
  },
  required: ["suggestions"],
  additionalProperties: false,
};

router.get("/", async (req, res) => {
  try {
    const query =
      "latest student tech skills AI ML cybersecurity open source learning resources GSoC ICPC career tips";

    const [tavilyResults, serpResults] = await Promise.all([
      searchTavily(query, Number(process.env.TAVILY_MAX_RESULTS || 5)),
      searchSerpApi(query, Number(process.env.TAVILY_MAX_RESULTS || 5)),
    ]);

    const references = [...tavilyResults, ...serpResults]
      .slice(0, 10)
      .map((r, i) => `${i + 1}. ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}`)
      .join("\n\n");

    const prompt = `
You are Simation, a daily AI tech guide.
Generate EXACTLY 15 suggestions for a CS/IT student. 
Topics should include GSoC, ICPC, NLP, AI/ML, Cybersecurity, Hackathons, Open Source, and career tips.
Ground your suggestions in the references if available.

References:
${references || "No live references available."}

Rules:
- Each suggestion must match the schema strictly.
- Output must be ONLY JSON, no markdown, no commentary.
- Do NOT include explanations outside JSON.
- Each suggestion must have title, category, shortDescription, keywords, details, and link.
`;


    let obj;
    try {
      obj = await callLLMJSON({
        prompt,
        schema: suggestionSchema,
        temperature: 0.5,
        maxOutputTokens: 2048, // keep smaller to avoid cut-off
      });
    } catch (err) {
      console.error("LLM JSON error (home):", err?.message || err);
      return res.status(502).json({ error: "AI returned non-JSON or invalid schema output" });
    }

    return res.json(obj);
  } catch (err) {
    console.error("Error fetching home suggestions:", err);
    return res.status(500).json({ error: "Failed to fetch suggestions", details: String(err) });
  }
});

module.exports = router;

