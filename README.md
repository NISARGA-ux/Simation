# Simation

AI-powered campus career ecosystem connecting students, recruiters, and mentors.

Made by **Harpreet Kaur Gothra** and **Nisarga Bhat**.

## Stack

- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Express.js + LowDB + Multer + JWT
- AI/Search: Groq + Tavily + SerpApi

## Core Features

- Student achievement portfolio
- AI resume analyzer (ATS score, pros/cons, improvements, keywords)
- Career quiz with profession matches and learning roadmaps
- Recruiter matching and achievement search
- Mentor opportunity posting
- Leaderboards and profile views

## Project Structure

```text
simation/
├── backend/
│   ├── routes/
│   ├── utils/
│   │   ├── ai.js
│   │   ├── tavily.js
│   │   └── serpapi.js
│   ├── db.json
│   └── server.js
├── frontend/
│   ├── src/
│   └── index.html
└── Dockerfile
```

## Environment

Create `backend/.env`:

```env
PORT=5000
GROQ_API_KEY=your_groq_key
TAVILY_API_KEY=your_tavily_key
SERPAPI_API_KEY=your_serpapi_key
GROQ_MODEL=llama-3.3-70b-versatile
TAVILY_MAX_RESULTS=5
SERPAPI_ENGINE=google
```

## Run Locally

```bash
# backend
cd backend
npm install
npm run dev
```

```bash
# frontend
cd frontend
npm install
npm run dev
```

## Test Accounts

| Role | Username | Password |
|------|----------|----------|
| Student | student1 | pass123 |
| Recruiter | recruiter1 | pass123 |
| Mentor | mentor1 | mentor123 |
