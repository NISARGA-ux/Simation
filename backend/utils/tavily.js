const axios = require("axios");
require("dotenv").config();

async function searchTavily(query, maxResults = Number(process.env.TAVILY_MAX_RESULTS || 5)) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  try {
    const resp = await axios.post(
      "https://api.tavily.com/search",
      {
        api_key: apiKey,
        query,
        search_depth: "basic",
        max_results: maxResults,
        include_answer: false,
        include_images: false,
      },
      { timeout: 20000 }
    );

    const results = Array.isArray(resp.data?.results) ? resp.data.results : [];
    return results.map((r) => ({
      title: r.title || "",
      url: r.url || "",
      snippet: r.content || "",
      score: typeof r.score === "number" ? r.score : undefined,
    }));
  } catch (err) {
    console.error("Tavily search failed:", err?.message || err);
    return [];
  }
}

module.exports = { searchTavily };
