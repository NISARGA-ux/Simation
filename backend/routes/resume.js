const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { callLLMJSON } = require("../utils/ai");

const upload = multer({ storage: multer.memoryStorage() });

const resumeSchema = {
  type: "object",
  properties: {
    atsScore: { type: "number", minimum: 0, maximum: 10 },
    pros: { type: "array", items: { type: "string" } },
    cons: { type: "array", items: { type: "string" } },
    improvements: { type: "array", items: { type: "string" } },
    keywordSuggestions: { type: "array", items: { type: "string" } },
  },
  required: ["atsScore", "pros", "cons", "improvements", "keywordSuggestions"],
  additionalProperties: false,
};

router.post("/analyse-file", upload.single("resume"), async (req, res) => {
  try {
    const file = req.file;
    const targetRole = (req.body.targetRole || "Not specified").slice(0, 200);

    if (!file) return res.status(400).json({ error: "File missing" });

    let text = "";
    if (file.mimetype === "application/pdf") {
      const data = await pdfParse(file.buffer);
      text = data.text || "";
    } else if (
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.mimetype === "application/msword"
    ) {
      const { value } = await mammoth.extractRawText({ buffer: file.buffer });
      text = value || "";
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    const MAX_CHARS = 20000;
    const clipped = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;

    const prompt = `
You are an ATS resume analyzer and career coach.
Analyze the resume text and return ONLY JSON that matches the provided schema.

Resume Content:
"""${clipped}"""

Target Job Role: "${targetRole}"

Rules:
- Use ONLY valid JSON. No markdown, no backticks, no extra text.
- "atsScore" must be a decimal number 0.0-10.0 (10 = excellent match).
- "pros"/"cons" concise but specific.
- "improvements" must be actionable.
- "keywordSuggestions" tailored to the target role.
`;

    let resultObj;
    try {
      resultObj = await callLLMJSON({
        prompt,
        schema: resumeSchema,
        temperature: 0,
        maxOutputTokens: 2048,
      });
    } catch (err) {
      console.error("LLM JSON error (resume):", err?.message || err);
      return res.status(502).json({ error: "AI returned non-JSON or invalid schema output" });
    }

    return res.json(resultObj);
  } catch (err) {
    console.error("Error analysing resume:", err);
    return res.status(500).json({ error: "Failed to analyse resume" });
  }
});

module.exports = router;
