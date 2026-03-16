const axios = require("axios");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

async function searchSerpApi(query, num = Number(process.env.TAVILY_MAX_RESULTS || 5)) {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) return [];

  try {
    const resp = await axios.get("https://serpapi.com/search.json", {
      params: {
        q: query,
        api_key: apiKey,
        engine: process.env.SERPAPI_ENGINE || "google",
        num,
      },
      timeout: 20000,
    });

    const results = Array.isArray(resp.data?.organic_results) ? resp.data.organic_results : [];
    return results.map((r) => ({
      title: r.title || "",
      url: r.link || "",
      snippet: r.snippet || "",
      position: r.position,
    }));
  } catch (err) {
    console.error("SerpApi search failed:", err?.message || err);
    return [];
  }
}

module.exports = { searchSerpApi };
