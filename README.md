# ✨ Zenith Cortex

> An AI-powered campus career ecosystem connecting students, recruiters, and mentors.

[![Demo Video](https://img.shields.io/badge/Demo-Watch%20on%20Loom-blueviolet?style=for-the-badge&logo=loom)](https://www.loom.com/share/d21c72a0508f4305b209fb520a7509a1)

![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![Google Cloud](https://img.shields.io/badge/Vertex%20AI-Gemini-4285F4?style=flat-square&logo=google-cloud)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

---

## 🎬 Demo

**[📺 Watch the full walkthrough on Loom](https://www.loom.com/share/d21c72a0508f4305b209fb520a7509a1)**

---

## 🤔 What is Zenith Cortex?

Zenith Cortex is a full-stack platform that brings together three key players in the campus placement ecosystem:

| 👨‍🎓 **Students** | 👔 **Recruiters** | 👩‍🏫 **Mentors** |
|:---:|:---:|:---:|
| Track achievements & build profile | Find talent with AI-powered filtering | Post opportunities for students |
| Get AI resume analysis (ATS scoring) | Quiz-based candidate matching | Manage hackathons, workshops, seminars |
| Take career quizzes with roadmaps | View leaderboard rankings | Guide students through the platform |
| Compete on department leaderboards | Search by skills & achievements | |

---

## ⚡ Features

### 🎯 For Students
- **Achievement Portfolio** - Add projects, hackathons, certifications, internships with proof uploads
- **AI Resume Analyzer** - Get ATS score (0-10), pros/cons, improvements, and keyword suggestions powered by Vertex AI
- **Career Quiz** - 20 questions → AI generates top 5 profession matches with personalized roadmaps (beginner → advanced)
- **Leaderboard** - Compete with peers, filter by department/branch/year
- **Mentor Hub** - View upcoming opportunities posted by faculty

### 🔍 For Recruiters  
- **Smart Candidate Quiz** - Select branches, roles, years, and specific skills
- **AI-Powered Matching** - Get matched students with their relevant achievements
- **Achievement Search** - Search across all student achievements by keywords
- **Leaderboard Access** - View top performers across filters

### 📢 For Mentors/Faculty
- **Post Opportunities** - Create hackathons, workshops, seminars, conferences
- **Rich Event Details** - Add venue, date, time, registration links
- **Student Visibility** - Posted opportunities appear in student Mentor Hub

### 🤖 AI-Powered (Vertex AI + Gemini)
- **Resume Analysis** - Structured JSON output with schema validation
- **Career Matching** - Profession recommendations with match percentages
- **Daily Suggestions** - 15 curated tech/career suggestions on student home

---

## 🛠️ Tech Stack

### Frontend
- **React 18** + Vite
- **Tailwind CSS** - Pastel gradient aesthetic
- **React Router v6** - Role-based routing
- **Axios** - API calls
- **react-dropzone** - Resume upload

### Backend
- **Express.js 5**
- **LowDB** - JSON file database (lightweight, no setup)
- **Multer** - File uploads
- **pdf-parse** & **mammoth** - Resume text extraction (PDF/DOCX)
- **JWT** - Authentication ready

### AI/Cloud
- **Google Vertex AI** - Gemini 2.0 Flash
- **Structured JSON Output** - Schema-enforced responses
- **Google Cloud Platform** - Deployment ready

---

## 📁 Project Structure

```
zenith-cortex/
├── backend/
│   ├── routes/
│   │   ├── auth.js          # Login (student/recruiter/mentor)
│   │   ├── achievements.js  # CRUD achievements
│   │   ├── resume.js        # AI resume analysis
│   │   ├── quiz.js          # Student career quiz
│   │   ├── recquiz.js       # Recruiter matching quiz
│   │   ├── leaderboard.js   # Filtered rankings
│   │   ├── opportunities.js # Mentor posts
│   │   ├── search.js        # Achievement search
│   │   └── home.js          # AI daily suggestions
│   ├── utils/
│   │   ├── vertex.js        # Vertex AI wrapper
│   │   └── db.js            # LowDB setup
│   ├── db.json              # Database file
│   └── server.js            # Express app
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Student dashboard
│   │   │   ├── Profile.jsx        # Achievement management
│   │   │   ├── Resume.jsx         # AI resume analyzer
│   │   │   ├── Quiz.jsx           # Career quiz
│   │   │   ├── Leaderboard.jsx    # Rankings
│   │   │   ├── MentorHub.jsx      # View opportunities
│   │   │   ├── RecHome.jsx        # Recruiter dashboard
│   │   │   ├── RecQuiz.jsx        # Candidate matching
│   │   │   ├── MentorHome.jsx     # Mentor dashboard
│   │   │   └── MentorOpportunities.jsx
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Search bar
│   │   │   └── Sidebar.jsx        # Role-based menu
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state
│   │   └── data/
│   │       ├── quiz.questions.json
│   │       └── rec.questions.json
│   └── index.html
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Google Cloud account with Vertex AI enabled

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/zenith-cortex.git
cd zenith-cortex

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Environment Setup

Create `backend/.env`:
```env
PORT=5000
GOOGLE_PROJECT=your-gcp-project-id
GOOGLE_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./vertex-key.json
```

Add your GCP service account key as `backend/vertex-key.json`

### 3. Run Development

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Test Logins

| Role | Username | Password |
|------|----------|----------|
| Student | student1 | pass123 |
| Recruiter | recruiter1 | pass123 |
| Mentor | mentor1 | mentor123 |

---

## 📸 Architecture thinking

<details>
<summary>Click to expand</summary>

### Student Dashboard
AI-generated daily suggestions with pastel card design

### Resume Analyzer
Upload PDF/DOCX → Get ATS score with detailed feedback

### Career Quiz Results
Top profession matches with personalized roadmaps

### Recruiter Matching
Filter students by branch, year, skills → See matched achievements

### Leaderboard
Dense ranking with department/branch/year filters

</details>

---

## 🎨 Design Philosophy

- **Pastel Gradients** - Soft pinks, purples, blues, greens
- **Card-based UI** - Clean, scannable information
- **Role-aware Navigation** - Different sidebar menus per user type
- **Mobile Responsive** - Works on all screen sizes

---

## 🔮 Future Scope

- [ ] Email notifications for new opportunities
- [ ] Student-recruiter messaging
- [ ] Achievement verification by mentors
- [ ] Integration with LinkedIn
- [ ] Export resume analysis as PDF
- [ ] Real-time leaderboard updates

---

## 🙌 Contributing

Pull requests are welcome! For major changes, please open an issue first.

---

<p align="center">
  Built with 💜 by <a href="https://github.com/harpreet-2146">Harpreet Kaur</a>
</p>
