// backend/scripts/seedDemo.js
// Run this ONCE before your demo:
//   node scripts/seedDemo.js
//
// What it does:
// 1. Enriches all achievements with AI-extracted skill tags (via Groq)
// 2. Triggers skills market data refresh (via SerpAPI/Tavily/GitHub/SO)
//
// This makes every feature work with real, structured data.

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const db = require("../utils/db");
const { callLLMJSON } = require("../utils/ai");
const { fetchAllSkillsData } = require("../utils/skillsFetcher");

const enrichSchema = {
  type: "object",
  properties: {
    skills: { type: "array", items: { type: "string" } },
    domain: { type: "string" },
    difficultyLevel: { type: "string" },
  },
  required: ["skills", "domain"],
  additionalProperties: false,
};

async function enrichAchievements() {
  db.read();
  const achievements = db.get("achievements").value() || [];
  const unenriched = achievements.filter((a) => !a.skillTags || a.skillTags.length === 0);

  console.log(`\n🧠 Enriching ${unenriched.length} achievements with AI skill tags...\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < unenriched.length; i++) {
    const a = unenriched[i];
    const label = `[${i + 1}/${unenriched.length}] "${(a.title || "").slice(0, 40)}"`;

    try {
      const prompt = `
Extract technical skills and domain from this student achievement.
Title: "${a.title || ""}"
Description: "${(a.description || "").slice(0, 800)}"
Rules:
- Extract specific technical skills mentioned or implied.
- Infer related skills logically.
- Domain: "Web Development", "AI/ML", "Data Science", "Cybersecurity", "Mobile Development", "Cloud/DevOps", "IoT/Hardware", "Design", "Research", "Other".
- Difficulty: "Beginner", "Intermediate", "Advanced".
- Return ONLY JSON.
`;
      const result = await callLLMJSON({
        prompt,
        schema: enrichSchema,
        temperature: 0,
        maxOutputTokens: 512,
      });

      db.get("achievements")
        .find((x) => x.id === a.id)
        .assign({
          skillTags: result.skills || [],
          domain: result.domain || a.domain || "Other",
          difficultyLevel: result.difficultyLevel || null,
          enrichedAt: new Date().toISOString(),
        })
        .write();

      console.log(`  ✅ ${label} → ${(result.skills || []).join(", ")}`);
      success++;
    } catch (err) {
      console.log(`  ❌ ${label} → ${err.message || "failed"}`);
      failed++;
    }

    // Rate limit: Groq free tier = ~30 req/min
    await new Promise((r) => setTimeout(r, 2200));
  }

  console.log(`\n📊 Enrichment complete: ${success} succeeded, ${failed} failed\n`);
}

async function refreshSkillsMarket() {
  console.log("📈 Refreshing skills market data from live APIs...\n");
  try {
    const data = await fetchAllSkillsData(db);
    db.set("skillsMarketCache", data).write();
    console.log(`\n✅ Skills market refreshed: ${data.skills.length} skills tracked`);
    console.log(`   Sources active: ${JSON.stringify(data.meta.sources)}`);
    console.log(`   Fetch took: ${data.meta.fetchDurationSeconds}s\n`);
  } catch (err) {
    console.error("❌ Skills market refresh failed:", err.message);
  }
}

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("  ZENITH CORTEX — PRE-DEMO DATA SEEDER");
  console.log("═══════════════════════════════════════════\n");

  const args = process.argv.slice(2);

  if (args.includes("--enrich-only")) {
    await enrichAchievements();
  } else if (args.includes("--market-only")) {
    await refreshSkillsMarket();
  } else {
    // Default: run both
    await enrichAchievements();
    await refreshSkillsMarket();
  }

  console.log("═══════════════════════════════════════════");
  console.log("  DONE — Your demo data is ready! 🚀");
  console.log("═══════════════════════════════════════════\n");
  process.exit(0);
}

main();