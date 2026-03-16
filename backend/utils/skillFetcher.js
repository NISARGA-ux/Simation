const axios = require("axios");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { callLLMJSON } = require("./ai");
const { searchTavily } = require("./tavily");
const { searchSerpApi } = require("./serpapi");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const DISCOVERY_QUERY =
  "latest software engineering skills hiring trends developer tools AI cloud data security mobile jobs";

const discoverySchema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    skills: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          category: { type: "string" },
          keywords: { type: "array", items: { type: "string" } },
        },
        required: ["name", "category", "keywords"],
        additionalProperties: false,
      },
    },
  },
  required: ["summary", "skills"],
  additionalProperties: false,
};

function createSourceState(name) {
  return {
    name,
    enabled: true,
    available: false,
    warning: null,
  };
}

function createSourceStates() {
  return {
    discovery: createSourceState("discovery"),
    googleJobs: createSourceState("googleJobs"),
    googleTrends: createSourceState("googleTrends"),
    github: createSourceState("github"),
    stackoverflow: createSourceState("stackoverflow"),
    tavily: createSourceState("tavily"),
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateSourceAvailability(state, mapOrValue) {
  state.available = mapOrValue instanceof Map ? [...mapOrValue.values()].some(Boolean) : Boolean(mapOrValue);
}

function recordSourceWarning(state, warning) {
  if (!state.warning) {
    state.warning = warning;
  }
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inferCategory(name, categoryHint = "", keywords = []) {
  const text = `${name} ${categoryHint} ${(keywords || []).join(" ")}`.toLowerCase();

  if (/(\bai\b|\bml\b|machine learning|deep learning|\bllm\b|\bnlp\b|computer vision|pytorch|tensorflow|hugging face|genai)/.test(text)) {
    return "AI";
  }
  if (/(react native|flutter|android|ios|swift|kotlin|mobile)/.test(text)) {
    return "Mobile";
  }
  if (/(react|next|vue|angular|frontend|tailwind|html|css|javascript|typescript|web)/.test(text)) {
    return "Web";
  }
  if (/(node|express|django|flask|fastapi|spring|laravel|backend|api|server)/.test(text)) {
    return "Backend";
  }
  if (/(sql|mongodb|postgres|mysql|database|power bi|tableau|spark|pyspark|data)/.test(text)) {
    return "Data";
  }
  if (/(aws|azure|gcp|docker|kubernetes|devops|cloud|terraform|ci\/cd)/.test(text)) {
    return "Cloud";
  }
  if (/(cyber|security|pentest|ethical hacking|soc|forensics)/.test(text)) {
    return "Security";
  }
  if (/(iot|arduino|raspberry pi|embedded|robotics|hardware)/.test(text)) {
    return "Hardware";
  }

  return categoryHint || "General";
}

function normalizeSkill(skill) {
  const name = String(skill?.name || "").trim();
  if (!name) {
    return null;
  }

  const keywords = Array.isArray(skill?.keywords)
    ? skill.keywords
        .map((keyword) => String(keyword || "").trim().toLowerCase())
        .filter(Boolean)
    : [];

  const fallbackSlug = slugify(name);
  const category = inferCategory(name, String(skill?.category || "").trim(), keywords);

  return {
    name,
    category,
    keywords: [...new Set([name.toLowerCase(), ...keywords])].slice(0, 8),
    jobQuery: `${name} developer`,
    trendQuery: name,
    githubTopic: fallbackSlug,
    soTag: fallbackSlug,
  };
}

function dedupeSkills(skills) {
  const seen = new Set();
  const normalized = [];

  for (const skill of skills) {
    const item = normalizeSkill(skill);
    if (!item) {
      continue;
    }

    const key = item.name.toLowerCase();
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    normalized.push(item);
  }

  return normalized;
}

function collectInternalEvidence(db) {
  const users = db.get("users").value() || [];
  const achievements = db.get("achievements").value() || [];
  const opportunities = db.get("opportunities").value() || [];

  const studentProfiles = users
    .filter((user) => user.role === "student")
    .map((user) => ({
      branch: user.branch || "",
      department: user.department || "",
      year: user.year || "",
    }));

  const achievementSignals = achievements.map((achievement) => ({
    title: achievement.title || "",
    description: achievement.description || "",
    domain: achievement.domain || "",
  }));

  const opportunitySignals = opportunities.map((opportunity) => ({
    title: opportunity.title || "",
    description: opportunity.description || "",
    company: opportunity.company || "",
  }));

  return {
    studentProfiles,
    achievementSignals,
    opportunitySignals,
  };
}

function summarizeEvidence(evidence) {
  const topAchievementTerms = new Map();
  for (const achievement of evidence.achievementSignals) {
    const text = `${achievement.title} ${achievement.description} ${achievement.domain}`;
    const tokens = text.match(/[A-Za-z][A-Za-z0-9.+#-]{2,}/g) || [];
    for (const token of tokens) {
      const normalized = token.toLowerCase();
      if (["built", "using", "completed", "during", "project", "course", "winner", "research"].includes(normalized)) {
        continue;
      }
      topAchievementTerms.set(token, (topAchievementTerms.get(token) || 0) + 1);
    }
  }

  return {
    studentCount: evidence.studentProfiles.length,
    branches: [...new Set(evidence.studentProfiles.map((profile) => profile.branch).filter(Boolean))],
    departments: [...new Set(evidence.studentProfiles.map((profile) => profile.department).filter(Boolean))],
    opportunityCount: evidence.opportunitySignals.length,
    achievementCount: evidence.achievementSignals.length,
    topAchievementTerms: [...topAchievementTerms.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40)
      .map(([term, count]) => ({ term, count })),
    recentAchievements: evidence.achievementSignals.slice(-20),
    recentOpportunities: evidence.opportunitySignals.slice(-15),
  };
}

function deriveDiscoveryTargets(evidence, referenceCount) {
  const evidenceVolume =
    evidence.studentProfiles.length +
    evidence.achievementSignals.length * 2 +
    evidence.opportunitySignals.length * 2 +
    referenceCount * 3;

  return {
    perSourceResults: clamp(Math.ceil(evidenceVolume / 12), 12, 30),
    desiredSkillCount: clamp(Math.ceil(evidenceVolume / 2.5), 36, 140),
  };
}

function buildFallbackSkillsFromEvidence(evidence, limit) {
  const text = JSON.stringify(evidence);
  const matches =
    text.match(
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?|[A-Z]{2,}(?:\.[A-Z]{1,3})?|[A-Z][a-z]+\.[a-z]+)\b/g
    ) || [];

  const counts = new Map();
  for (const match of matches) {
    const cleaned = match.trim();
    if (cleaned.length < 2) {
      continue;
    }
    counts.set(cleaned, (counts.get(cleaned) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name]) => ({
      name,
      category: inferCategory(name),
      keywords: [name.toLowerCase()],
    }));
}

async function discoverSkills(db, sourceState) {
  const evidence = collectInternalEvidence(db);
  const evidenceSummary = summarizeEvidence(evidence);
  const initialTargets = deriveDiscoveryTargets(evidence, 0);
  const [tavilyResults, serpResults] = await Promise.all([
    searchTavily(DISCOVERY_QUERY, initialTargets.perSourceResults),
    searchSerpApi(DISCOVERY_QUERY, initialTargets.perSourceResults),
  ]);

  const references = [...tavilyResults, ...serpResults];
  const targets = deriveDiscoveryTargets(evidence, references.length);
  const referenceBlock = references
    .map(
      (result, index) =>
        `${index + 1}. ${result.title}\nSnippet: ${(result.snippet || "").slice(0, 240)}`
    )
    .join("\n\n");

  if (!process.env.GROQ_API_KEY) {
    sourceState.enabled = false;
    recordSourceWarning(
      sourceState,
      "GROQ_API_KEY is missing, so skill discovery is using a lightweight local fallback."
    );
    const fallbackSkills = dedupeSkills(buildFallbackSkillsFromEvidence(evidenceSummary, targets.desiredSkillCount));
    updateSourceAvailability(sourceState, fallbackSkills.length > 0);
    return {
      summary: "Skills discovered from current student portfolio evidence without an LLM.",
      skills: fallbackSkills,
    };
  }

  try {
    const prompt = `
You are discovering a live skills market board for students.

Use the internal campus evidence and live web references below to identify the most relevant concrete skills and technologies right now.
Do not fall back to a preset watchlist.
Do not invent skills that are not supported by the evidence.
Return 35 to 70 distinct skills, with meaningful category spread across AI, Web, Mobile, Backend, Data, Cloud, Security, and Hardware whenever supported by the evidence.
Prioritize clean JSON over exhaustive prose.

Internal campus evidence:
${JSON.stringify(evidenceSummary, null, 2)}

Live web references:
${referenceBlock || "No live references available."}

Rules:
- Each skill must be an actual skill, framework, platform, or technology.
- Keep names concise, like "React", "Docker", "TensorFlow", "Power BI".
- Infer a sensible category from the evidence.
- keywords should help match student achievements and profiles.
- jobQuery should be something you would use for jobs search.
- trendQuery should be a human search phrase for trend data.
- githubTopic should be a realistic GitHub topic slug.
- soTag should be a realistic Stack Overflow tag.
- Output only JSON matching the schema.
`;

    const response = await callLLMJSON({
      prompt,
      schema: discoverySchema,
      maxOutputTokens: 3000,
      temperature: 0.2,
    });

    const skills = dedupeSkills(response.skills || []);
    updateSourceAvailability(sourceState, skills.length > 0);

    if (skills.length === 0) {
      recordSourceWarning(
        sourceState,
        "AI skill discovery returned no skills, so local discovery fallback was used."
      );
      const fallbackSkills = dedupeSkills(buildFallbackSkillsFromEvidence(evidenceSummary, targets.desiredSkillCount));
      updateSourceAvailability(sourceState, fallbackSkills.length > 0);
      return {
        summary: "Skills discovered from current student portfolio evidence using fallback extraction.",
        skills: fallbackSkills,
      };
    }

    const fallbackSkills = dedupeSkills(buildFallbackSkillsFromEvidence(evidenceSummary, targets.desiredSkillCount));
    const combinedSkills = dedupeSkills([...(response.skills || []), ...fallbackSkills]);

    return {
      summary: response.summary || "Skills discovered from current student data and live market references.",
      skills: combinedSkills,
    };
  } catch (error) {
    console.error("Skill discovery failed:", error.message);
    recordSourceWarning(
      sourceState,
      "AI skill discovery failed, so local discovery fallback was used."
    );
    const fallbackSkills = dedupeSkills(buildFallbackSkillsFromEvidence(evidenceSummary, targets.desiredSkillCount));
    updateSourceAvailability(sourceState, fallbackSkills.length > 0);
    return {
      summary: "Skills discovered from current student portfolio evidence using fallback extraction.",
      skills: fallbackSkills,
    };
  }
}

async function fetchGoogleJobs(skill, sourceState) {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    sourceState.enabled = false;
    recordSourceWarning(sourceState, "SERPAPI_API_KEY is missing, so Google Jobs data is unavailable.");
    return null;
  }

  try {
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_jobs",
        q: skill.jobQuery,
        api_key: apiKey,
        hl: "en",
      },
      timeout: 15000,
    });

    const jobs = response.data?.jobs_results || [];
    return {
      count: jobs.length,
      topCompanies: [...new Set(jobs.map((job) => job.company_name).filter(Boolean))].slice(0, 6),
      sampleTitles: jobs.map((job) => job.title).filter(Boolean).slice(0, 4),
      locations: [...new Set(jobs.map((job) => job.location).filter(Boolean))].slice(0, 5),
    };
  } catch (error) {
    console.error(`[GoogleJobs] ${skill.name}: ${error.message}`);
    recordSourceWarning(sourceState, "Google Jobs could not be fetched from SerpAPI.");
    return null;
  }
}

async function fetchAllGoogleJobs(skills, sourceState) {
  const results = new Map();
  for (const skill of skills) {
    results.set(skill.name, await fetchGoogleJobs(skill, sourceState));
    await sleep(350);
  }
  updateSourceAvailability(sourceState, results);
  return results;
}

async function fetchGoogleTrendsBatch(skillBatch, sourceState) {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    sourceState.enabled = false;
    recordSourceWarning(sourceState, "SERPAPI_API_KEY is missing, so Google Trends data is unavailable.");
    return new Map();
  }

  const queries = skillBatch.map((skill) => skill.trendQuery).join(",");

  try {
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        engine: "google_trends",
        q: queries,
        api_key: apiKey,
        data_type: "TIMESERIES",
        date: "today 3-m",
      },
      timeout: 20000,
    });

    const timeline = response.data?.interest_over_time?.timeline_data || [];
    const results = new Map();

    skillBatch.forEach((skill, index) => {
      const weeklyValues = timeline.map((point) => ({
        date: point.date || "",
        value: point.values?.[index]?.extracted_value ?? 0,
      }));

      const recent = weeklyValues.slice(-12);
      const currentValue = recent.length > 0 ? recent[recent.length - 1].value : 0;
      const previousValue = recent.length > 4 ? recent[recent.length - 5].value : currentValue;

      results.set(skill.name, {
        sparkline: recent,
        currentValue,
        previousValue,
        changePercent:
          previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0,
      });
    });

    return results;
  } catch (error) {
    console.error(`[GoogleTrends] batch error: ${error.message}`);
    recordSourceWarning(sourceState, "Google Trends data could not be fetched from SerpAPI.");
    return new Map();
  }
}

async function fetchAllGoogleTrends(skills, sourceState) {
  const merged = new Map();
  for (let index = 0; index < skills.length; index += 5) {
    const batch = skills.slice(index, index + 5);
    const batchResults = await fetchGoogleTrendsBatch(batch, sourceState);
    for (const [key, value] of batchResults) {
      merged.set(key, value);
    }
    await sleep(400);
  }
  updateSourceAvailability(sourceState, merged);
  return merged;
}

function createGitHubContext(sourceState) {
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_API_KEY || null;
  if (!token) {
    recordSourceWarning(
      sourceState,
      "GitHub requests are unauthenticated. Add GITHUB_TOKEN to avoid strict rate limits."
    );
  }

  return {
    token,
    rateLimited: false,
    loggedRateLimit: false,
  };
}

function getGitHubHeaders(githubContext) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "simation-skills-market",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (githubContext.token) {
    headers.Authorization = `Bearer ${githubContext.token}`;
  }

  return headers;
}

function getGitHubRateLimitMessage(response, isAuthenticated) {
  const resetHeader = response?.headers?.["x-ratelimit-reset"];
  const prefix = isAuthenticated
    ? "GitHub Search API limit reached for this refresh even with a token."
    : "GitHub API rate limit reached without authentication.";
  if (!resetHeader) {
    return isAuthenticated
      ? `${prefix} This endpoint has strict quotas, so GitHub metrics were partially skipped.`
      : `${prefix} Add GITHUB_TOKEN to restore live GitHub metrics.`;
  }

  const resetTime = new Date(Number(resetHeader) * 1000);
  return isAuthenticated
    ? `${prefix} Reset at ${resetTime.toISOString()}. GitHub metrics were partially skipped for lower-priority skills.`
    : `${prefix} Reset at ${resetTime.toISOString()}. Add GITHUB_TOKEN to restore live GitHub metrics.`;
}

async function fetchGitHubActivity(skill, githubContext, sourceState) {
  if (githubContext.rateLimited) {
    return null;
  }

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const response = await axios.get("https://api.github.com/search/repositories", {
      params: {
        q: `topic:${skill.githubTopic} created:>${thirtyDaysAgo}`,
        sort: "stars",
        per_page: 1,
      },
      headers: getGitHubHeaders(githubContext),
      timeout: 10000,
    });

    return {
      recentRepos: response.data?.total_count || 0,
    };
  } catch (error) {
    const status = error.response?.status;
    if (status === 403 || status === 429) {
      githubContext.rateLimited = true;
      const warning = getGitHubRateLimitMessage(error.response, Boolean(githubContext.token));
      recordSourceWarning(sourceState, warning);
      if (!githubContext.loggedRateLimit) {
        console.warn(`[GitHub] ${warning}`);
        githubContext.loggedRateLimit = true;
      }
      return null;
    }

    console.error(`[GitHub] ${skill.name}: ${error.message}`);
    recordSourceWarning(sourceState, "GitHub data could not be fetched.");
    return null;
  }
}

async function fetchAllGitHub(skills, sourceState) {
  const results = new Map();
  const githubContext = createGitHubContext(sourceState);

  for (const skill of skills) {
    const result = await fetchGitHubActivity(skill, githubContext, sourceState);
    results.set(skill.name, result);

    if (githubContext.rateLimited) {
      break;
    }

    await sleep(githubContext.token ? 250 : 1200);
  }

  updateSourceAvailability(sourceState, results);
  return results;
}

async function fetchStackOverflowBatch(skillBatch, sourceState) {
  const tags = skillBatch.map((skill) => skill.soTag).join(";");

  try {
    const response = await axios.get(
      `https://api.stackexchange.com/2.3/tags/${encodeURIComponent(tags)}/info`,
      {
        params: { site: "stackoverflow" },
        timeout: 10000,
      }
    );

    const results = new Map();
    const items = response.data?.items || [];

    skillBatch.forEach((skill) => {
      const match = items.find((item) => item.name === skill.soTag);
      results.set(skill.name, {
        totalQuestions: match?.count || 0,
      });
    });

    return results;
  } catch (error) {
    console.error(`[StackOverflow] batch error: ${error.message}`);
    recordSourceWarning(sourceState, "Stack Overflow data could not be fetched.");
    return new Map();
  }
}

async function fetchAllStackOverflow(skills, sourceState) {
  const merged = new Map();
  for (let index = 0; index < skills.length; index += 20) {
    const batch = skills.slice(index, index + 20);
    const batchResults = await fetchStackOverflowBatch(batch, sourceState);
    for (const [key, value] of batchResults) {
      merged.set(key, value);
    }
    await sleep(500);
  }
  updateSourceAvailability(sourceState, merged);
  return merged;
}

async function fetchTavilyNews(skill, sourceState) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    sourceState.enabled = false;
    recordSourceWarning(sourceState, "TAVILY_API_KEY is missing, so news signals are unavailable.");
    return null;
  }

  try {
    const response = await axios.post(
      "https://api.tavily.com/search",
      {
        api_key: apiKey,
        query: `${skill.name} jobs hiring trends 2026`,
        search_depth: "basic",
        max_results: 3,
        include_answer: false,
        include_images: false,
      },
      { timeout: 15000 }
    );

    const articles = (response.data?.results || []).map((result) => ({
      title: result.title || "",
      url: result.url || "",
      snippet: (result.content || "").slice(0, 200),
    }));

    return { articles, articleCount: articles.length };
  } catch (error) {
    console.error(`[Tavily] ${skill.name}: ${error.message}`);
    recordSourceWarning(sourceState, "Tavily news data could not be fetched.");
    return null;
  }
}

async function fetchAllTavily(skills, sourceState) {
  const results = new Map();
  for (const skill of skills) {
    results.set(skill.name, await fetchTavilyNews(skill, sourceState));
    await sleep(300);
  }
  updateSourceAvailability(sourceState, results);
  return results;
}

function computeStudentSupply(skill, db) {
  try {
    const achievements = db.get("achievements").value() || [];
    const users = db.get("users").value() || [];
    const matchedStudentIds = new Set();

    achievements.forEach((achievement) => {
      const text = `${achievement.title || ""} ${achievement.description || ""}`.toLowerCase();
      const hasMatch = skill.keywords.some((keyword) => text.includes(keyword));
      if (hasMatch) {
        const studentId = achievement.studentId || achievement.userId;
        if (studentId) {
          matchedStudentIds.add(studentId);
        }
      }
    });

    users.forEach((user) => {
      if (user.role !== "student") {
        return;
      }

      const profile = `${user.branch || ""} ${user.department || ""}`.toLowerCase();
      const hasMatch = skill.keywords.some((keyword) => profile.includes(keyword));
      if (hasMatch) {
        matchedStudentIds.add(user.id);
      }
    });

    return {
      studentCount: matchedStudentIds.size,
      studentIds: [...matchedStudentIds],
    };
  } catch (error) {
    console.error(`[StudentSupply] ${skill.name}: ${error.message}`);
    return { studentCount: 0, studentIds: [] };
  }
}

function normalize(value, values) {
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 0) {
    return 0;
  }

  const lessCount = sorted.filter((item) => item < value).length;
  const equalCount = sorted.filter((item) => item === value).length;

  if (lessCount === 0 && equalCount === sorted.length) {
    return value > 0 ? 65 : 0;
  }

  const percentile = (lessCount + Math.max(equalCount - 1, 0) * 0.35) / Math.max(sorted.length - 1, 1);
  const ratio = value > 0 ? Math.log1p(value) / Math.log1p(Math.max(...sorted, 1)) : 0;
  const blended = percentile * 0.7 + ratio * 0.3;
  return Math.round(blended * 100);
}

async function fetchAllSkillsData(db) {
  const sources = createSourceStates();
  const discovery = await discoverSkills(db, sources.discovery);
  const skills = discovery.skills;

  if (!skills.length) {
    throw new Error("No skills could be discovered at runtime.");
  }

  console.log(`Refreshing skills market data for ${skills.length} discovered skills...`);
  const startTime = Date.now();

  const [jobsMap, trendsMap, githubMap, stackOverflowMap, tavilyMap] = await Promise.all([
    fetchAllGoogleJobs(skills, sources.googleJobs).catch(() => new Map()),
    fetchAllGoogleTrends(skills, sources.googleTrends).catch(() => new Map()),
    fetchAllGitHub(skills, sources.github).catch(() => new Map()),
    fetchAllStackOverflow(skills, sources.stackoverflow).catch(() => new Map()),
    fetchAllTavily(skills, sources.tavily).catch(() => new Map()),
  ]);

  const supplyMap = new Map();
  skills.forEach((skill) => {
    supplyMap.set(skill.name, computeStudentSupply(skill, db));
  });

  const rawDemand = skills.map((skill) => jobsMap.get(skill.name)?.count || 0);
  const rawGithub = skills.map((skill) => githubMap.get(skill.name)?.recentRepos || 0);
  const rawStackOverflow = skills.map(
    (skill) => stackOverflowMap.get(skill.name)?.totalQuestions || 0
  );
  const rawTrend = skills.map((skill) => trendsMap.get(skill.name)?.currentValue || 0);

  const skillsData = skills
    .map((skill, index) => {
      const jobs = jobsMap.get(skill.name);
      const trends = trendsMap.get(skill.name);
      const github = githubMap.get(skill.name);
      const stackoverflow = stackOverflowMap.get(skill.name);
      const tavily = tavilyMap.get(skill.name);
      const supply = supplyMap.get(skill.name);

      const demandSignal =
        (jobs?.count || 0) * 0.45 +
        (jobs?.topCompanies?.length || 0) * 12 +
        (jobs?.locations?.length || 0) * 7 +
        (tavily?.articleCount || 0) * 5;
      const trendSignal =
        (trends?.currentValue || 0) * 0.8 + Math.abs(trends?.changePercent || 0) * 0.2;
      const demandScore = normalize(demandSignal, skills.map((candidate) => {
        const candidateJobs = jobsMap.get(candidate.name);
        const candidateNews = tavilyMap.get(candidate.name);
        return (
          (candidateJobs?.count || 0) * 0.45 +
          (candidateJobs?.topCompanies?.length || 0) * 12 +
          (candidateJobs?.locations?.length || 0) * 7 +
          (candidateNews?.articleCount || 0) * 5
        );
      }));
      const trendScore = normalize(trendSignal, skills.map((candidate) => {
        const candidateTrend = trendsMap.get(candidate.name);
        return (
          (candidateTrend?.currentValue || 0) * 0.8 +
          Math.abs(candidateTrend?.changePercent || 0) * 0.2
        );
      }));
      const githubScore = normalize(rawGithub[index], rawGithub);
      const stackOverflowScore = normalize(rawStackOverflow[index], rawStackOverflow);
      const devActivity = Math.round(githubScore * 0.6 + stackOverflowScore * 0.4);
      const composite = Number(
        (demandScore * 0.4 + trendScore * 0.3 + devActivity * 0.3).toFixed(1)
      );
      const changePercent = trends?.changePercent
        ? Number(trends.changePercent.toFixed(1))
        : 0;

      return {
        name: skill.name,
        category: skill.category,
        composite,
        changePercent,
        demandScore,
        trendScore,
        devActivity,
        demand: {
          jobCount: jobs?.count || 0,
          topCompanies: jobs?.topCompanies || [],
          sampleTitles: jobs?.sampleTitles || [],
          locations: jobs?.locations || [],
        },
        trend: {
          sparkline: trends?.sparkline || [],
          currentValue: trends?.currentValue || 0,
          previousValue: trends?.previousValue || 0,
        },
        github: {
          recentRepos: github?.recentRepos || 0,
        },
        stackoverflow: {
          totalQuestions: stackoverflow?.totalQuestions || 0,
        },
        news: {
          articles: tavily?.articles || [],
          articleCount: tavily?.articleCount || 0,
        },
        supply: {
          studentCount: supply?.studentCount || 0,
          studentIds: supply?.studentIds || [],
        },
      };
    })
    .sort((a, b) => b.composite - a.composite);

  const elapsed = Number(((Date.now() - startTime) / 1000).toFixed(1));
  console.log(`Skills market refresh complete in ${elapsed}s`);

  return {
    skills: skillsData,
    meta: {
      cacheVersion: 2,
      lastUpdated: new Date().toISOString(),
      skillCount: skillsData.length,
      fetchDurationSeconds: elapsed,
      discoverySummary: discovery.summary,
      sources: {
        discovery: sources.discovery.available,
        googleJobs: sources.googleJobs.available,
        googleTrends: sources.googleTrends.available,
        github: sources.github.available,
        stackoverflow: sources.stackoverflow.available,
        tavily: sources.tavily.available,
      },
      sourceWarnings: Object.values(sources)
        .map((source) => source.warning)
        .filter(Boolean),
    },
  };
}

module.exports = { fetchAllSkillsData, computeStudentSupply };
