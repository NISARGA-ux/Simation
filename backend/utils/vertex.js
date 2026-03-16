// backend/utils/vertex.js
const { VertexAI } = require("@google-cloud/vertexai");
require("dotenv").config();

const project = process.env.GOOGLE_PROJECT;
const location = process.env.GOOGLE_LOCATION;

// Use the model you confirmed works in your project/region.
const model = "gemini-2.0-flash-001";

const vertexAI = new VertexAI({ project, location });
const generativeModel = vertexAI.getGenerativeModel({ model });

/**
 * Call Vertex and FORCE strict JSON using responseSchema + responseMimeType.
 * Returns a JS object (already parsed).
 */
async function callVertexJSON({ prompt, schema, maxOutputTokens = 2048, temperature = 0 }) {
  const resp = await generativeModel.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature,
      maxOutputTokens,
      responseMimeType: "application/json",
      responseSchema: schema, // <-- the magic that enforces JSON shape
    },
  });

  const response = await resp.response;
  // Join all text parts (some SDK versions can split output)
  const text =
    (response.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || "")
      .join("")
      .trim();

  if (!text) {
    throw new Error("Empty response from Vertex");
  }

  // Strict parse. No regex. If this throws, send 502 up the chain.
  return JSON.parse(text);
}

module.exports = { callVertexJSON };
