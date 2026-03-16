# Audit: Current Google/Vertex Usage and Migration Scope

Date: 2026-03-16

## Migration Status (Updated)

- Vertex runtime integration removed.
- New provider utilities added:
  - `backend/utils/ai.js` (Groq)
  - `backend/utils/tavily.js` (Tavily)
  - `backend/utils/serpapi.js` (SerpApi)
- AI routes switched from Vertex to Groq:
  - `backend/routes/resume.js`
  - `backend/routes/quiz.js`
  - `backend/routes/home.js`
- `backend/utils/vertex.js` deleted.
- Google dependencies removed from `backend/package.json` and `backend/package-lock.json`.
- `.env`/`.env.example` standardized for Groq, Tavily, SerpApi.

## 1) What is currently using Google services?

Runtime Google usage is concentrated in one backend utility and three routes.

### Active runtime integration
- `backend/utils/vertex.js`
  - Imports `@google-cloud/vertexai` and initializes `VertexAI` client.
  - Reads `GOOGLE_PROJECT` and `GOOGLE_LOCATION`.
  - Hard-codes model `gemini-2.0-flash-001`.
  - Exposes `callVertexJSON(...)` used for strict JSON responses.

### Routes that call Vertex
- `backend/routes/resume.js`
  - Uses `callVertexJSON` for ATS analysis output.
- `backend/routes/quiz.js`
  - Uses `callVertexJSON` for career matching + roadmap output.
- `backend/routes/home.js`
  - Uses `callVertexJSON` for 15 daily suggestions.

### Dependency-level Google usage
- `backend/package.json`
  - `@google-cloud/aiplatform`
  - `@google-cloud/vertexai`
- `backend/package-lock.json`
  - Contains full Google auth and gax transitive tree.

### Docs/config mentions (not runtime)
- `README.md` mentions Vertex/GCP setup and Google env vars.
- `backend/server.js` comment says `Cloud Run PORT` (comment only).
- `backend/routes/achievements.js` has a placeholder comment mentioning Vertex.

## 2) Current AI call flow

1. Frontend calls backend APIs:
   - `POST /api/resume/analyse-file`
   - `POST /api/quiz/analyze`
   - `GET /api/home`
2. Route builds prompt + JSON schema.
3. Route calls `callVertexJSON(...)`.
4. Vertex enforces JSON with `responseMimeType + responseSchema`.
5. Route returns parsed JSON or `502` on schema/JSON failure.

## 3) What must change to fully remove Google/Vertex

### A) Replace AI client layer
- Replace `backend/utils/vertex.js` with a provider abstraction (for Groq first).
- New utility should:
  - Use `GROQ_API_KEY`.
  - Keep strict JSON guarantees (prefer JSON schema/function-calling style where possible).
  - Keep same function contract to avoid touching all routes at once.

### B) Route-level updates
- Update imports in:
  - `backend/routes/resume.js`
  - `backend/routes/quiz.js`
  - `backend/routes/home.js`
- Preserve same response shapes to avoid frontend breakage.

### C) Add search stack (Tavily + SerpApi)
- Decide feature placement:
  - `home.js` suggestions enrichment from live web.
  - New route for research/search aggregation.
- Add utilities:
  - `backend/utils/tavily.js`
  - `backend/utils/serpapi.js`
- Add timeout/retry/fallback strategy when search APIs fail.

### D) Dependency cleanup
- Remove:
  - `@google-cloud/vertexai`
  - `@google-cloud/aiplatform`
- Add:
  - `groq-sdk` (or compatible HTTP client pattern)
  - optionally `zod` / JSON schema validation helper

### E) Documentation cleanup
- Update `README.md`:
  - AI section, prerequisites, env setup, and architecture notes.
- Remove GCP service-account key instructions.

## 4) Risks to handle during migration

- JSON shape regressions can break frontend rendering.
- Home route may become slower if web search is added synchronously.
- Provider differences in token limits may truncate long resume analysis.
- Cost/rate limits across 3 providers need centralized throttling.

## 5) Recommended migration order

1. Introduce provider abstraction with Groq only (same API contracts).
2. Switch the 3 existing routes to Groq and verify UI still works.
3. Add Tavily/SerpApi utilities and wire into home/search feature.
4. Remove Google packages and Google env vars.
5. Update docs and deployment settings.

## 6) New env keys prepared

Created:
- `backend/.env`
- `backend/.env.example`
- root `.gitignore` now ignores env/secret files

Expected keys:
- `GROQ_API_KEY`
- `TAVILY_API_KEY`
- `SERPAPI_API_KEY`
