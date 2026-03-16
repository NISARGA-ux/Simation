// backend/routes/resume.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const { callVertexJSON } = require("../utils/vertex");

const upload = multer({ storage: multer.memoryStorage() });

// Vertex-compatible JSON schema for decimal ATS score out of 10
const resumeSchema = {
  type: "object",
  properties: {
    atsScore: { type: "number", minimum: 0, maximum: 10 }, // decimal 0–10
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
- "atsScore" must be a decimal number 0.0–10.0 (10 = excellent match).
- "pros"/"cons" concise but specific.
- "improvements" must be actionable.
- "keywordSuggestions" tailored to the target role.
`;

    let resultObj;
    try {
      resultObj = await callVertexJSON({
        prompt,
        schema: resumeSchema,
        temperature: 0,
        maxOutputTokens: 2048,
      });
    } catch (err) {
      console.error("Vertex JSON error (resume):", err?.message || err);
      return res.status(502).json({ error: "AI returned non-JSON or invalid schema output" });
    }

    return res.json(resultObj);
  } catch (err) {
    console.error("Error analysing resume:", err);
    return res.status(500).json({ error: "Failed to analyse resume" });
  }
});

module.exports = router;



// // backend/routes/resume.js
// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const pdfParse = require("pdf-parse");
// const mammoth = require("mammoth");
// const { callVertexJSON } = require("../utils/vertex");

// const upload = multer({ storage: multer.memoryStorage() });

// // JSON schema that forces strictly valid output
// const resumeSchema = {
//   type: "object",
//   properties: {
//     atsScore: { type: "integer", minimum: 1, maximum: 5 },
//     pros: { type: "array", items: { type: "string" } },
//     cons: { type: "array", items: { type: "string" } },
//     improvements: { type: "array", items: { type: "string" } },
//     keywordSuggestions: { type: "array", items: { type: "string" } },
//   },
//   required: ["atsScore", "pros", "cons", "improvements", "keywordSuggestions"],
//   additionalProperties: false,
// };

// router.post("/analyse-file", upload.single("resume"), async (req, res) => {
//   try {
//     const file = req.file;
//     const targetRole = (req.body.targetRole || "Not specified").slice(0, 200);

//     if (!file) return res.status(400).json({ error: "File missing" });

//     let text = "";
//     if (file.mimetype === "application/pdf") {
//       const data = await pdfParse(file.buffer);
//       text = data.text || "";
//     } else if (
//       file.mimetype ===
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
//       file.mimetype === "application/msword"
//     ) {
//       const { value } = await mammoth.extractRawText({ buffer: file.buffer });
//       text = value || "";
//     } else {
//       return res.status(400).json({ error: "Unsupported file type" });
//     }

//     // Keep prompt size reasonable to avoid truncation/garbling
//     const MAX_CHARS = 20000;
//     const clipped = text.length > MAX_CHARS ? text.slice(0, MAX_CHARS) : text;

//     const prompt = `
// You are an ATS resume analyzer and career coach.
// Analyze the resume text and return ONLY JSON that matches the provided schema.

// Resume Content:
// """${clipped}"""

// Target Job Role: "${targetRole}"

// Rules:
// - Use ONLY valid JSON. No markdown, no backticks, no extra text.
// - "atsScore" must be a float 1–5 (5 = excellent match).
// - "pros"/"cons" concise but specific.
// - "improvements" must be actionable.
// - "keywordSuggestions" tailored to the target role.
// `;

//     // Force schema-valid JSON from the model
//     let resultObj;
//     try {
//       resultObj = await callVertexJSON({
//         prompt,
//         schema: resumeSchema,
//         temperature: 0,
//         maxOutputTokens: 2048,
//       });
//     } catch (err) {
//       console.error("Vertex JSON error (resume):", err?.message || err);
//       return res.status(502).json({ error: "AI returned non-JSON or invalid schema output" });
//     }

//     return res.json(resultObj);
//   } catch (err) {
//     console.error("Error analysing resume:", err);
//     return res.status(500).json({ error: "Failed to analyse resume" });
//   }
// });

// module.exports = router;











// const express = require("express");
// const router = express.Router();
// const multer = require("multer");
// const pdfParse = require("pdf-parse");
// const mammoth = require("mammoth");
// const { callVertex } = require("../utils/vertex");
// const { extractJson } = require("../utils/jsonHelper");

// const upload = multer({ storage: multer.memoryStorage() });

// router.post("/analyse-file", upload.single("resume"), async (req, res) => {
//   try {
//     const file = req.file;
//     const targetRole = req.body.targetRole || "Not specified";

//     if (!file) return res.status(400).json({ error: "File missing" });

//     let text = "";
//     if (file.mimetype === "application/pdf") {
//       const data = await pdfParse(file.buffer);
//       text = data.text;
//     } else if (
//       file.mimetype ===
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
//       file.mimetype === "application/msword"
//     ) {
//       const { value } = await mammoth.extractRawText({ buffer: file.buffer });
//       text = value;
//     } else {
//       return res.status(400).json({ error: "Unsupported file type" });
//     }

//     const prompt = `
// You are an ATS resume analyzer and career coach.
// Analyze the following resume and return the response in **strict JSON format only**.

// SCHEMA:
// {
//   "atsScore": "<integer 1–5>",
//   "pros": ["list of strong points"],
//   "cons": ["list of weaknesses"],
//   "improvements": ["list of specific recommendations to make resume stronger"],
//   "keywordSuggestions": ["list of missing but important keywords for the target role"]
// }

// Resume Content:
// ${text}

// Target Job Role: ${targetRole}

// IMPORTANT:
// - atsScore must be 1–5 only (5 = excellent match, 1 = poor match).
// - pros/cons should be detailed but concise.
// - improvements must be actionable.
// - keywordSuggestions should be tailored to the job role.
// - Output ONLY valid JSON, no explanations.
//     `;

//     const raw = await callVertex(prompt);

//     let parsed = extractJson(raw);

//     if (!parsed) {
//       console.error("Failed to parse Vertex response:", raw);
//       return res.status(502).json({ error: "AI returned non-JSON or unparsable output", raw });
//     }

//     res.json(parsed);
//   } catch (err) {
//     console.error("Error analysing resume:", err);
//     res.status(500).json({ error: "Failed to analyse resume" });
//   }
// });

// module.exports = router;
