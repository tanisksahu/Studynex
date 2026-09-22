# StudyNex

> **AI-Powered Student Operating System** — a productivity workspace for students to manage subjects, materials, tasks, exams, study plans, progress, and an AI command center from one place.

[![Live App](https://img.shields.io/badge/Live%20App-studynex--app.web.app-176B4D?style=for-the-badge)](https://studynex-app.web.app/)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-111827?style=flat-square)](https://react.dev/)
[![Backend](https://img.shields.io/badge/Backend-Node%20%2B%20Express-111827?style=flat-square)](https://expressjs.com/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20Atlas-111827?style=flat-square)](https://www.mongodb.com/atlas)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini-111827?style=flat-square)](https://ai.google.dev/)

## Live

**Frontend:** https://studynex-app.web.app/

**Backend health:** https://studynex-backend-s7j1.onrender.com/health

## What is StudyNex?

StudyNex is designed as a student operating system rather than a single-purpose planner. It brings academic information and everyday study workflows into one context-aware workspace.

### Core capabilities

- **Dashboard** — priorities, study progress, today's plan, upcoming exams, deadlines, and study insights.
- **Subjects & units** — organize academic structure and track progress.
- **Materials** — manage learning resources in one inbox/workspace.
- **Planner** — schedule study sessions and tasks.
- **Exams** — keep dates, times, and upcoming academic milestones visible.
- **Progress** — monitor study and subject progress over time.
- **Global Command Center** — natural-language AI assistance with context-aware commands and approval-based actions.
- **Document intelligence** — upload academic documents, resumes, transcripts, and exam schedules for structured extraction and proposed updates.
- **Customization** — personalize dashboard layout and core workspace behavior.
- **Responsive UI** — designed for desktop and mobile study workflows.

## AI Command Center

The Command Center is intended to operate as an **autonomous study agent with guardrails**, not just a chatbot.

It can support requests such as:

```text
Plan my day
What are my weak subjects?
What should I study today?
Mark Data Structures Unit 1 complete
Prepare me for my next exam
```

State-changing actions can be presented for review before they are applied. Document uploads are designed to become structured actions such as subject creation, exam scheduling, or profile updates.

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Framer Motion
- Recharts
- Lucide React
- Firebase Hosting

### Backend

- Node.js
- Express
- Multer
- Google Generative AI SDK
- MongoDB / Mongoose
- Render

### AI & data

- Google Gemini for natural-language and multimodal workflows
- MongoDB Atlas for application persistence

## Architecture

```text
Browser
  │
  ▼
React + Vite frontend
  │
  │ HTTPS / REST
  ▼
Node + Express backend
  ├── Google Gemini
  └── MongoDB Atlas
```

## Local development

### Prerequisites

- Node.js 20+ recommended
- npm
- A MongoDB connection
- A Google Gemini API key

### Install

```bash
npm install
cd backend
npm install
cd ..
```

### Environment variables

Keep secrets out of Git. The repository ignores local environment files including `.env`, `.env.local`, and `backend/.env`.

Example backend configuration:

```env
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-flash-latest
MONGODB_URI=your_mongodb_uri
FRONTEND_URL=http://localhost:5173
PORT=5000
```

Example frontend production API configuration:

```env
VITE_API_URL=https://studynex-backend-s7j1.onrender.com
```

### Run locally

Frontend:

```bash
npm run dev
```

Backend (from the repository root):

```bash
cd backend
node server.js
```

## Production

The public frontend is hosted on **Firebase Hosting** and the backend is hosted on **Render**.

```text
Frontend → https://studynex-app.web.app/
Backend  → https://studynex-backend-s7j1.onrender.com/
```

Production environment variables must be configured in the hosting provider dashboards rather than committed to Git.

## Project structure

```text
Studynex/
├── src/                 # React application
├── backend/             # Express API and AI services
├── public/              # Public frontend assets
├── firebase.json        # Firebase Hosting configuration
├── render.yaml          # Render service configuration
├── vercel.json          # Vercel configuration / secondary deployment
├── package.json
└── README.md
```

## Security notes

- Never commit API keys, database credentials, `.env` files, or other secrets.
- Keep Gemini credentials on the backend.
- Use environment variables for production configuration.

## Status

StudyNex is an actively developed portfolio project. The production deployment is intended to be the canonical public demo, while the repository contains the implementation and deployment configuration used to maintain it.

## Roadmap

Planned improvements include deeper multimodal academic extraction, richer autonomous planning, stronger study analytics, and continued UX refinement.

## License

This project is currently maintained as a personal portfolio project. Licensing terms can be added here when the repository is ready for public reuse.
