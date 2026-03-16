// A small utility for safe JSON extraction

function extractJson(text) {
  if (!text || typeof text !== "string") return null;

  // Strip code fences (```json ... ```)
  let cleaned = text.replace(/```(?:json|javascript|js|txt)?/gi, "```");
  if (cleaned.includes("```")) {
    const parts = cleaned.split("```").filter(Boolean);
    for (const p of parts) {
      const m = p.match(/({[\s\S]*}|\[[\s\S]*\])/);
      if (m) {
        try {
          return JSON.parse(m[0]);
        } catch {}
      }
    }
  }

  // Try first JSON object
  const objMatch = text.match(/{[\s\S]*}/);
  if (objMatch) {
    try { return JSON.parse(objMatch[0]); } catch {}
  }

  // Try first JSON array
  const arrMatch = text.match(/\[[\s\S]*\]/);
  if (arrMatch) {
    try { return JSON.parse(arrMatch[0]); } catch {}
  }

  return null;
}

module.exports = { extractJson };
