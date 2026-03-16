const axios = require("axios");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { extractJson } = require("./jsonHelper");

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

async function callLLMJSON({ prompt, schema, maxOutputTokens = 2048, temperature = 0 }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY");
  }

  const basePayload = {
    model: GROQ_MODEL,
    temperature,
    max_tokens: maxOutputTokens,
    messages: [
      {
        role: "system",
        content:
          "Return only valid JSON. Never use markdown fences or commentary outside the JSON response.",
      },
      { role: "user", content: prompt },
    ],
  };

  let data;

  try {
    const strictResp = await axios.post(
      GROQ_API_URL,
      {
        ...basePayload,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "response_schema",
            schema,
            strict: true,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 45000,
      }
    );
    data = strictResp.data;
  } catch (err) {
    const fallbackResp = await axios.post(GROQ_API_URL, basePayload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 45000,
    });
    data = fallbackResp.data;
  }

  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Empty response from Groq");

  if (typeof raw === "object") return raw;

  try {
    return JSON.parse(raw);
  } catch {
    const parsed = extractJson(raw);
    if (!parsed) throw new Error("Groq returned non-JSON content");
    return parsed;
  }
}

module.exports = { callLLMJSON };
