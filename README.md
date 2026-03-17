<p align="center">
  <h1 align="center">Simation</h1>
  <p align="center"><strong>AI-Powered Skills Intelligence Platform for Campus Talent Development</strong></p>
  <p align="center">
    Real-time labor market analytics · AI skill gap identification · Personalized career pathways<br/>
    Every data point is live. Nothing hardcoded. Nothing fake.
  </p>
</p>

---

## Problem Statement

> *Educational programs frequently fail to keep pace with rapidly evolving industry skill requirements, creating a significant gap between graduate capabilities and workforce demands. This mismatch limits employability, slows innovation, and creates inefficiencies in talent development.*
>
> *The challenge is to design an AI-powered platform that analyzes student skills, academic records, job market trends, and industry requirements to identify skill gaps and generate personalized career pathways. By combining labor market analytics with intelligent recommendations, the system should help students, educators, and policymakers align learning outcomes with real-world workforce needs and build a future-ready talent pipeline.*

---

## Why This Problem Matters (The Real-World Context)

The problem statement describes a systemic failure. Here's how it manifests in Indian engineering colleges every single year:

**Students operate blind.** A second-year CSE student decides to learn Django because a senior recommended it. Meanwhile, the job market shifted — 73% of backend roles now ask for Node.js or Go. The student won't discover this mismatch until two years later when they sit for placements and no company's JD matches their skillset. There was no system telling them in Year 2 what Year 4 recruiters would demand.

**Institutions measure the wrong things.** Colleges track CGPA, attendance, and course completion. None of these correlate with employability. A student with 8.5 CGPA and zero projects is less hireable than a student with 7.0 CGPA who shipped three full-stack apps and won a hackathon. But the institution has no way to measure, track, or surface the second student's capabilities.

**Recruiters waste cycles.** When a company visits campus with a JD requiring "React, Node.js, Docker, AWS," the placement cell broadcasts it to 500 students. 400 apply. The company interviews 80. They hire 5. That's a 1.25% conversion rate. The inefficiency exists because nobody mapped student skills to job requirements before the interview stage.

**The talent pipeline is reactive, not proactive.** Students build skills randomly. Companies evaluate skills once (during placement). There's no continuous feedback loop where market demand informs student learning, and student capability informs recruiter search. That feedback loop is what Simation builds.

---

## How Simation Solves Each Requirement

The problem statement specifies six capabilities. Here's how Simation addresses each one with real implementation, not mockups:

| Problem Statement Requirement | Simation Implementation | Data Source |
|---|---|---|
| **Analyze student skills** | GitHub Auto-Import extracts skills from actual code repos using AI. Achievements are enriched with structured skill tags via Groq LLM. | GitHub API + Groq LLM |
| **Analyze academic records** | Student profiles include department, branch, year, and are used in matching and leaderboard ranking. | Internal student database |
| **Analyze job market trends** | Skills Market Dashboard tracks 30+ skills with live demand scores, trend sparklines, and developer activity. | Google Jobs, Google Trends, GitHub, Stack Overflow, Tavily |
| **Analyze industry requirements** | JD Intelligence Engine extracts structured skill requirements from real job descriptions using AI. | Groq LLM + recruiter-submitted JDs |
| **Identify skill gaps** | Skills Assessment compares student self-ratings against live market demand. Dashboard shows per-skill student supply vs demand with GAP badges. | Market data vs student profiles |
| **Generate personalized career pathways** | Assessment results include: marketability score, radar chart (You vs Market), gap-specific real course recommendations from Tavily, and strength identification. | Groq LLM + Tavily + Market data |

Additionally, the problem statement asks the system to help **students, educators, and policymakers align learning outcomes with workforce needs.** Simation achieves this through:

- **For students:** Year-aware experience — Years 1-3 focus on skill building with market-informed direction. Year 4 activates placement matching where their 3-year portfolio becomes their application.
- **For educators/policymakers:** The Skills Market Dashboard itself is an institutional intelligence tool — it shows which skills are in demand, which ones the student body lacks (GAP indicators), and where to focus curriculum development. The JD Engine's talent gap analysis explicitly surfaces skills that no student in the institution possesses.
- **For recruiters (industry side):** JD Intelligence Engine creates a direct bridge from industry requirements to student capabilities, replacing the broken broadcast-and-hope model of campus placements.

---

## Core Features

### 1. Skills Market Dashboard

**What it does:** A real-time market intelligence board — structured like a stock screener — that shows what the job market actually values right now. Every number comes from a live API, updated on demand.

**The data pipeline:**

```
Google Jobs API (SerpAPI)  →  Job count, companies hiring, sample titles
Google Trends API (SerpAPI) →  12-week interest timeseries, trend direction
GitHub Search API           →  New repos created in last 30 days per technology
Stack Overflow API          →  Total question count per technology tag
Tavily Search API           →  Recent news articles and hiring trends
Internal Student DB         →  How many students have each skill
```

**What students see for each skill:**

| Column | Source | Signal |
|---|---|---|
| Composite Score | Weighted blend of all signals | Overall market value (0-100) |
| Change % | Google Trends week-over-week | Rising or falling demand |
| Sparkline | Google Trends 12-week data | Visual momentum at a glance |
| Demand Score | Google Jobs posting count | Active hiring volume |
| Dev Activity | GitHub new repos + SO questions | Developer ecosystem health |
| Student Supply | Internal DB achievement matching | How many peers have this skill |

**Skill Gap Identification:** When a skill shows high demand but zero student supply, it displays a `GAP` badge. This is the problem statement's "skill gap identification" made tangible — not a report that sits in a PDF, but a live signal that updates every time market data or student profiles change.

**Click any skill** to see the expanded view: trend chart (3 months), companies actively hiring (real names), sample job titles from live postings, Stack Overflow community size, recent news articles with links, and the list of students who have this skill in their portfolio.

**Ticker tape** scrolls across the top showing the biggest movers — immediate visual signal of market shifts that keeps students informed passively.

---

### 2. GitHub Auto-Import with Selective Repo Import

**What it does:** Converts a student's existing GitHub work into a structured, AI-analyzed skill portfolio in under 15 seconds. Eliminates the cold-start problem that kills every portfolio platform.

**Why it exists:** The problem statement requires analyzing student skills. The most honest signal of what a student can actually build isn't a self-reported survey — it's their code. GitHub is where students already put their work. Instead of asking them to re-describe it, Simation reads it directly.

**The flow:**

1. Student enters their GitHub username
2. System fetches all public repositories via GitHub REST API (no authentication needed)
3. Preview screen shows: profile photo, bio, follower count, all repos with language badges, star counts, and descriptions
4. **Student selects which repos to import** — checkbox per repo, language filter dropdown, select all / deselect all. Smart defaults auto-select repos with stars or meaningful descriptions
5. Only selected repos are sent to Groq LLM for analysis
6. AI generates per-repo: descriptive title, technical description, domain classification, skill tags, difficulty level, and point score
7. Achievements are saved to database with structured skill tags that feed into the Skills Market (student supply count) and JD matching engine

**Why selective import matters:** A real GitHub profile has tutorial forks, abandoned experiments, and homework repos alongside genuine projects. Importing everything dilutes the signal. The selection UI gives students control over their narrative while the AI handles the structured extraction.

**Post-import effect:** Every imported achievement immediately updates:
- The student's point total and leaderboard rank
- The Skills Market Dashboard's student supply counts (a skill that showed "0 students" might now show "1")
- The JD matching engine's candidate pool (recruiters searching for React developers now find this student)

This creates the feedback loop the problem statement envisions: student action → system-wide data update → better matching for everyone.

---

### 3. Skills Assessment with Market-Benchmarked Gap Analysis

**What it does:** Students self-rate their proficiency across skill tracks, and the system compares their ratings against live job market demand to identify personalized skill gaps with actionable course recommendations.

**How it addresses the problem statement:**

The problem statement asks for "personalized career pathways" — not generic advice like "learn Python." Simation's assessment generates pathways that are personal (based on the student's actual ratings), current (benchmarked against today's market data), and actionable (linked to real courses).

**The flow:**

1. Student selects a career track: Web Development, AI/ML, Data Engineering, Cybersecurity, or Mobile Development
2. Each track presents 8 relevant skills with slider-based self-rating (0-5 scale)
3. System maps ratings against the Skills Market Dashboard's live demand data
4. Results page shows:

**Marketability Score (0-100):** Single number representing how hireable this student is based on their skills vs current market demand. A student with strong Python but weak Docker might score 52/100 because Docker appears in 68% of relevant job descriptions.

**Radar Chart — "You vs Market Demand":** Two overlapping polygons. Purple = student's self-rated level. Red dashed = what the market demands. The visual gap between them IS the skill gap — no explanation needed, the shape tells the story.

**Gap Breakdown Bar Chart:** Horizontal bars comparing student level vs market demand per skill, sorted by severity. The biggest gaps are at the top.

**Per-Gap Course Recommendations:** For each identified gap, the system uses Tavily to search for real, current courses and tutorials. Results show actual titles, URLs, and source badges (coursera.org, youtube.com, freecodecamp.org). These are not curated links — they're fetched live, so they reflect what's actually available today.

**Strength Identification:** Skills where the student meets or exceeds market demand are highlighted with trending indicators — "React: 4/5 — ↑ trending" tells the student their existing strength is becoming more valuable.

**Data persistence:** Assessment results are saved to the student's profile, including their marketability score and top gaps. This data feeds into the action plan and can be tracked over time as the student closes gaps and retakes the assessment.

---

### 4. JD Intelligence Engine (Recruiter Side)

**What it does:** A recruiter pastes any job description in raw text. AI extracts every skill requirement, categorizes them, then instantly scans the student database to surface ranked candidate matches with skill-level comparison.

**How it addresses the problem statement:**

This is the "industry requirements" analysis the problem statement asks for. Instead of requiring recruiters to fill checkboxes or structured forms, Simation accepts the format companies already use — unstructured JD text — and makes it machine-readable.

**The flow:**

1. Recruiter pastes a job description (any format, any length)
2. Groq LLM extracts: job title, company name, must-have skills (with categories), nice-to-have skills, experience level, and role summary
3. System scans all Year 3-4 students (Year 2 included if "internships" toggle is on) and computes per-student match scores:
   - Must-have skills matched vs missing (70% weight)
   - Nice-to-have skills matched (30% weight)
   - Match percentage computed from weighted coverage
4. Results display:

**Extracted Skills as Colored Chips:** Must-have skills in red, nice-to-have in blue, each tagged with its category (Programming Language, Framework, Cloud/DevOps, etc.). The recruiter immediately sees if the AI understood the JD correctly.

**Ranked Candidate Cards:** Each student shows:
- Match percentage ring (color-coded: green ≥70%, amber ≥40%, red below)
- Department, branch, year, total achievement points
- Skills matched (green chips) and skills missing (red crossed-out chips)
- Expandable section with radar chart (skill coverage by category) and relevant achievements from their portfolio

**Talent Gap Analysis:** Skills that NO student in the database possesses are surfaced in an amber warning section: "No students found with Kubernetes or Terraform — consider posting a workshop." This is the institutional feedback the problem statement envisions — recruiters don't just find talent, they signal where talent is missing so institutions can respond.

**Year-Aware Matching:** By default, only Year 3-4 students appear in recruiter results. This reflects reality — Year 1-2 students aren't placement-ready. A toggle allows including Year 2 for internship-specific JDs. This separation ensures recruiters see relevant candidates and younger students aren't overwhelmed by placement signals before they're ready.

**Shortlist → Notification Bridge:** When a recruiter clicks "Shortlist," the system creates a notification in the database. The student sees it on their profile:

> *"TechCorp shortlisted you for Full Stack Developer — 68% match. Skills matched: React, Node.js, JavaScript. Skills missing: Docker, PostgreSQL."*

This closes the feedback loop: the student now knows exactly which skills to build to improve their match for similar roles. The problem statement's "personalized career pathway" isn't just a recommendation — it's driven by actual recruiter behavior.

---

### 5. Leaderboard

**What it does:** Ranks all students by total achievement points with filters for department, branch, and year. Uses dense ranking (students with equal points share the same rank).

**How it addresses the problem statement:**

The leaderboard is the engagement mechanism for Years 1-3 students who aren't yet in the recruiter matching pool. It creates peer competition that motivates skill building. A student who sees "I'm ranked 14th in CSE, Karan is 12th" has a concrete, social reason to import one more GitHub repo or complete one more certification.

Filters allow department-level comparison (CSE vs ECE vs ME), branch-level (AIML vs IOT vs Cybersecurity), and year-level — so a first-year student competes with other first-years, not against fourth-years with three more years of projects.

---

### 6. Year-Aware Student Experience

**What it does:** The platform adapts its interface and functionality based on whether the student is in Years 1-3 (Growth Mode) or Year 4 (Placement Mode).

**Growth Mode (Years 1-3):**
- Skills Market Dashboard for career direction
- GitHub Import and manual achievement tracking for portfolio building
- Skills Assessment for gap identification and course recommendations
- Leaderboard for peer competition
- Profile shows: "Recruiter matching activates in Year 4"
- No recruiter-related UI noise

**Placement Mode (Year 4):**
- Everything from Growth Mode
- Profile shows: "Your profile is visible to recruiters"
- Shortlist notifications appear on profile when recruiters match the student's skills
- Each notification shows match percentage, skills matched, and skills missing — creating an actionable feedback loop

**Why this matters:** The problem statement asks for a system that builds a "future-ready talent pipeline." A pipeline implies progression over time. Simation's year-aware design means the platform isn't a one-time tool used during placement season — it's a 4-year companion that evolves with the student.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│              React + Tailwind CSS + Recharts                │
│                                                             │
│  Landing Page ──→ Skills Market ──→ Profile ──→ Assessment  │
│       │                                                     │
│       └──→ Recruiter Dashboard ──→ JD Intelligence Engine   │
└──────────────────────────┬──────────────────────────────────┘
                           │ REST API
┌──────────────────────────┴──────────────────────────────────┐
│                        BACKEND                              │
│                 Express.js + LowDB                          │
│                                                             │
│  /api/skills-market    ← SerpAPI + GitHub + SO + Tavily     │
│  /api/github/import    ← GitHub API + Groq LLM             │
│  /api/jd/analyze       ← Groq LLM + Student DB             │
│  /api/courses/skill-gaps ← Market Data + Tavily             │
│  /api/notifications    ← Shortlist bridge                   │
│  /api/leaderboard      ← Student DB                        │
│  /api/achievements     ← File uploads + DB                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│                    EXTERNAL APIs                            │
│                                                             │
│  Groq (LLaMA 3.3 70B) ── JD extraction, GitHub analysis,   │
│                           achievement enrichment             │
│  SerpAPI ── Google Jobs (demand), Google Trends (direction)  │
│  GitHub API ── Repo data, new repo counts                    │
│  Stack Overflow API ── Question counts per technology        │
│  Tavily ── Course search, news articles, market context      │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 18 + Vite | Fast builds, modern JSX, hot reload |
| **Styling** | Tailwind CSS 4 | Utility-first, rapid UI iteration |
| **Charts** | Recharts | Radar charts, sparklines, bar charts, area charts — all used for data visualization |
| **Backend** | Express.js 5 (Node.js) | Lightweight, fast API layer |
| **Database** | LowDB (JSON file) | Zero-config, sufficient for demo scale, instant reads/writes |
| **AI/LLM** | Groq (LLaMA 3.3 70B Versatile) | Fastest LLM inference available, structured JSON output via json_schema mode |
| **Job Market Data** | SerpAPI (Google Jobs + Google Trends engines) | Real-time hiring data and search interest trends |
| **Developer Signals** | GitHub REST API + Stack Overflow API | Repository activity and community engagement metrics |
| **Course/News Search** | Tavily Search API | Real-time web search for courses, tutorials, and industry news |
| **Deployment** | Docker + Render | Multi-stage Dockerfile, single-service deploy |

---

## Data Integrity: The "No Hardcoding" Principle

Every data point displayed to users comes from a live source:

| What the user sees | Where it actually comes from |
|---|---|
| "Docker demand: 72" | Google Jobs API returned 7 active job postings with "Docker" in the requirements |
| "React trending ▲ 12%" | Google Trends timeseries shows 12% increase over the last 4 weeks |
| "847 new repos this month" | GitHub Search API counted repos with topic:react created in the last 30 days |
| "124,892 Stack Overflow questions" | Stack Overflow API tag info endpoint for the "reactjs" tag |
| "Free Docker course on Coursera" | Tavily searched "best free Docker course tutorial" and returned this result |
| "3 students have this skill" | Internal DB counted achievements with skill tags matching "Docker" |
| "Must-have: React, Node.js" | Groq LLM extracted these from the recruiter's raw JD text |
| "Your match: 68%" | Computed by comparing student's skill tags against extracted JD requirements |

The Skills Market data is cached after fetching (to avoid hitting API rate limits on every page load) with a visible "Updated X minutes ago" timestamp. A "Refresh Data" button triggers a fresh fetch from all sources. The cache is rebuilt from scratch — not appended — so stale data never persists.

---

## API Architecture

### Student APIs

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/skills-market` | GET | Returns cached skills market data with optional category/sort filters |
| `/api/skills-market/refresh` | POST | Triggers fresh fetch from all 5 external APIs |
| `/api/skills-market/:name` | GET | Returns detailed data for a single skill including matched students |
| `/api/github/preview/:username` | GET | Fetches GitHub profile and repos for selection |
| `/api/github/import` | POST | Imports selected repos as AI-analyzed achievements |
| `/api/courses/skill-gaps` | POST | Accepts skill ratings, returns gaps + real courses |
| `/api/courses/recommend` | GET | Returns courses for a specific skill |
| `/api/achievements/:userId` | GET | Returns all achievements for a student |
| `/api/achievements/add` | POST | Adds manual achievement with optional file upload |
| `/api/leaderboard` | GET | Returns ranked students with optional department/branch/year filters |
| `/api/notifications/:userId` | GET | Returns shortlist notifications for a student |

### Recruiter APIs

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/jd/analyze` | POST | Extracts skills from JD text, matches against Year 3-4 students |
| `/api/notifications/shortlist` | POST | Creates notification when recruiter shortlists a student |

### Enrichment APIs

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/jd/enrich` | POST | AI-enriches a single achievement with skill tags |
| `/api/jd/enrich-all` | POST | Bulk-enriches all unenriched achievements (background job) |

---

## The Feedback Loop (Why This Is an Ecosystem, Not a Tool)

The problem statement asks for a system that helps "students, educators, and policymakers align learning outcomes with real-world workforce needs." Alignment requires a feedback loop — not a one-directional recommendation engine. Here's how Simation creates that loop:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   MARKET SIGNAL                                         │
│   Google Jobs shows Docker demand ↑ 34%                 │
│                    │                                    │
│                    ▼                                    │
│   STUDENT SEES IT                                       │
│   Skills Market Dashboard: "Docker: Demand 87, GAP"    │
│                    │                                    │
│                    ▼                                    │
│   STUDENT ACTS                                          │
│   Takes Docker course (real link from Tavily)           │
│   Builds Docker project, imports from GitHub            │
│                    │                                    │
│                    ▼                                    │
│   DATA UPDATES                                          │
│   Student supply for Docker: 0 → 1                     │
│   Student's leaderboard rank improves                   │
│   Student's match % for Docker-requiring JDs increases  │
│                    │                                    │
│                    ▼                                    │
│   RECRUITER BENEFITS                                    │
│   Next JD analysis finds this student as a match        │
│   Talent gap for Docker shrinks                         │
│                    │                                    │
│                    ▼                                    │
│   STUDENT GETS NOTIFIED                                 │
│   "TechCorp shortlisted you — 72% match"               │
│   "Skills missing: Kubernetes" ← next gap to close     │
│                    │                                    │
│                    ▼                                    │
│   CYCLE REPEATS                                         │
│   Student now works on Kubernetes                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Every action by any user type makes the system more valuable for every other user type. Students building portfolios improve recruiter search results. Recruiters posting JDs generate demand signals that inform student learning. The gap analysis surfaces institutional blind spots that educators can address.

---

## Demo Flow (3-Minute Walkthrough)

### Minute 1: The Student Journey

**Open landing page.** Dark, clean interface with two paths: Student and Recruiter. Two student profiles are available — Year 2 (Preeti, Growth Mode) and Year 4 (Karan, Placement Mode).

**Enter as Year 2 Student (Preeti).** Skills Market Dashboard loads with live data. Ticker tape scrolls top movers. Click "Docker" — modal shows 7 active job postings, companies like Amazon and Flipkart hiring, trending up 23%. Student supply: 0. GAP badge. "This is what the market wants, and nobody in your college has it yet."

**Go to Profile.** Type a real GitHub username. Preview loads with repos, languages, star counts. Select 5 repos. Hit Import. In 8 seconds, AI generates 5 structured achievements with skill tags. Points update. "These skills now appear in your profile — and on the Skills Market, the student count for React just went from 3 to 4."

**Take Skills Assessment.** Select "Web Development" track. Rate 8 skills with sliders. Submit. Radar chart shows the gap between self-rating and market demand. Marketability score: 43/100. Top gap: Docker (student rated 0/5, market demand 87/100). Below the gap: 4 real courses from Coursera and YouTube, fetched live. "This isn't a generic recommendation — these courses exist right now, for the exact skill the market says you need."

### Minute 2: The Year 4 Experience

**Switch to Year 4 Student (Karan) via sidebar.** Same dashboard, but profile now shows "Placement Mode — your profile is visible to recruiters." Sidebar shows the green badge.

### Minute 3: The Recruiter Closes the Loop

**Switch to Recruiter.** Paste a real Full Stack Developer JD (or use a sample JD from the interface). Hit Analyze. In 3 seconds: skills extracted as colored chips (React: must-have, Docker: nice-to-have), 12 candidates ranked by match percentage. Top candidate: Karan Singh, 72% match, radar chart showing strong frontend but weak DevOps.

**Click Shortlist on Karan.** Button confirms.

**Switch back to Year 4 Student (Karan).** Profile now shows a notification: "TechCorp shortlisted you for Full Stack Developer — 72% match. Skills matched: React, Node.js, JavaScript. Skills missing: Docker, PostgreSQL."

**The judge sees:** A student built skills over time. A recruiter found them through AI. The student got feedback on exactly what to improve. The loop closed in front of their eyes. This is the "future-ready talent pipeline" the problem statement asks for.

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- npm
- API keys for: [Groq](https://console.groq.com), [SerpAPI](https://serpapi.com), [Tavily](https://tavily.com)

### Local Development

```bash
# Clone
git clone https://github.com/NISARGA-ux/Simation.git
cd Simation

# Backend
cd backend
cp .env.example .env
# Add your API keys to .env
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

### Environment Variables

```env
PORT=5000
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
SERPAPI_API_KEY=your_serpapi_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

### Pre-Demo Data Seeding

```bash
cd backend

# Enrich all achievements with AI skill tags (takes ~2 minutes)
node scripts/seedDemo.js --enrich-only

# Refresh skills market data from all APIs (takes ~60 seconds)
node scripts/seedDemo.js --market-only

# Run both
node scripts/seedDemo.js
```

### Docker Deployment

```bash
# From repo root
docker build -t simation .
docker run -p 5000:5000 \
  -e GROQ_API_KEY=your_key \
  -e TAVILY_API_KEY=your_key \
  -e SERPAPI_API_KEY=your_key \
  simation
```

### Render Deployment

1. Push to GitHub
2. Create Web Service on Render → select Docker runtime
3. Set Dockerfile path: `./Dockerfile`, context: `.`
4. Add environment variables in Render dashboard
5. Deploy — app is live at `https://your-service.onrender.com`

---

## Project Structure

```
Simation/
├── Dockerfile                 # Multi-stage: builds frontend + runs backend
├── .dockerignore
├── render.yaml                # Render blueprint for one-click deploy
│
├── backend/
│   ├── server.js              # Express app, route registration, static serving
│   ├── db.json                # LowDB data store (students, achievements, cache)
│   ├── package.json
│   ├── data/
│   │   └── trackedSkills.js   # Skill definitions for market tracking
│   ├── routes/
│   │   ├── skillsMarket.js    # Skills Market Dashboard API
│   │   ├── github.js          # GitHub preview + selective import
│   │   ├── jd.js              # JD analysis + achievement enrichment
│   │   ├── courses.js         # Course recommendations + skill gap analysis
│   │   ├── notifications.js   # Shortlist notification bridge
│   │   ├── achievements.js    # Achievement CRUD + file upload
│   │   ├── leaderboard.js     # Ranked student listing
│   │   ├── students.js        # Student profile endpoints
│   │   ├── auth.js            # Login endpoint
│   │   └── search.js          # Achievement search
│   ├── utils/
│   │   ├── ai.js              # Groq LLM wrapper with JSON schema enforcement
│   │   ├── skillsFetcher.js   # Multi-API data pipeline for skills market
│   │   ├── tavily.js          # Tavily search wrapper
│   │   ├── serpapi.js          # SerpAPI wrapper
│   │   ├── db.js              # LowDB initialization
│   │   └── jsonHelper.js      # Safe JSON extraction from LLM responses
│   └── scripts/
│       └── seedDemo.js        # Pre-demo data enrichment + market refresh
│
└── frontend/
    ├── src/
    │   ├── App.jsx            # Route definitions, role-based access
    │   ├── pages/
    │   │   ├── Landing.jsx    # Hero page — Student vs Recruiter selection
    │   │   ├── Home.jsx       # Skills Market Dashboard
    │   │   ├── Profile.jsx    # Portfolio + GitHub Import + Notifications
    │   │   ├── Quiz.jsx       # Skills Assessment with market benchmarking
    │   │   ├── Leaderboard.jsx
    │   │   ├── RecHome.jsx    # Recruiter dashboard
    │   │   └── RecJD.jsx      # JD Intelligence Engine
    │   ├── components/
    │   │   ├── GitHubImport.jsx  # Selective repo import component
    │   │   ├── Sidebar.jsx       # Year-aware navigation
    │   │   └── Navbar.jsx        # Search bar + branding
    │   ├── context/
    │   │   └── AuthContext.jsx   # Demo role switching (Year 2, Year 4, Recruiter)
    │   └── layouts/
    │       └── MainLayout.jsx
    └── package.json
```

---

## What Makes This Different

**Every other hackathon project in this category** does one of these:
- Scrapes job listings and shows a word cloud of "trending skills"
- Builds a quiz that says "you should be a Data Scientist"
- Makes a resume parser that gives an ATS score
- Creates a dashboard with hardcoded mock data

**Simation is different because:**

1. **The data is real.** Not sample data, not mock APIs, not curated lists. Live Google Jobs postings, live Google Trends timeseries, live GitHub repo counts, live Stack Overflow stats. Every number links to its source.

2. **The AI does real work.** Groq doesn't generate motivational text — it extracts structured skills from unstructured JDs, analyzes GitHub repos to identify technologies, and compares student profiles against industry requirements. The LLM is a structured data extraction engine, not a chatbot.

3. **The features feed each other.** GitHub Import → updates student supply counts in Skills Market → improves JD matching results for recruiters → generates shortlist notifications for students → student sees what skills to build next → takes assessment → gets courses → builds more projects → cycle continues. Remove any feature and the others still work, but together they create a system that's greater than the sum of its parts.

4. **The year-based separation reflects reality.** Year 1-3 students and Year 4 students have fundamentally different needs. Showing a first-year student recruiter notifications is noise. Showing a fourth-year student a leaderboard without recruiter context is incomplete. Simation gives each cohort exactly what they need.

5. **The recruiter side creates demand signals, not just consumes them.** When a recruiter analyzes a JD, the extracted skills become data that informs student recommendations. When they shortlist, the notification tells the student specifically what to improve. Recruiters aren't just searching a database — they're contributing to the intelligence layer.

---

## Live Demo

🔗 **[https://simation.onrender.com](https://simation.onrender.com)**

---

## Team

Built for the hackathon challenge: *"Design an AI-powered platform that analyzes student skills, academic records, job market trends, and industry requirements to identify skill gaps and generate personalized career pathways."*

---

<p align="center">
  <sub>Every number on this platform comes from a live API. Every AI analysis uses real LLM inference. Every course link exists right now. Nothing is mocked. Nothing is hardcoded. This is how talent pipelines should work.</sub>
</p>
