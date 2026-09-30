# StudyNex

> **AI-powered Student Operating System** for managing subjects, materials, tasks, exams, study plans, progress, and intelligent academic workflows.

[![Live App](https://img.shields.io/badge/Live%20App-StudyNex-111827?style=for-the-badge)](https://studynex-app.web.app/)

## Overview

StudyNex brings everyday academic workflows into one focused workspace.

### Highlights

- 📚 Subjects, units & study materials
- ✅ Tasks, planners & exam tracking
- 📊 Progress and study insights
- 🤖 AI-powered academic assistance
- 📄 Document intelligence for structured academic data
- 📱 Responsive student-focused interface

## Tech Stack

**Frontend:** React 19, Vite, React Router, Framer Motion, Recharts  
**Backend:** Node.js, Express, Multer  
**Database:** MongoDB Atlas, Mongoose  
**AI:** Google Gemini  
**Deployment:** Firebase Hosting + Render

## Architecture

```text
Browser
   │
   ▼
React + Vite
   │  HTTPS / REST
   ▼
Node + Express
   ├── Google Gemini
   └── MongoDB Atlas
```

## Run Locally

### Prerequisites

- Node.js 20+
- npm
- MongoDB
- Google Gemini API key

### Install

```bash
npm install
cd backend
npm install
cd ..
```

### Configure

Create your local environment files and keep credentials out of Git. You can copy `backend/.env.example` to `backend/.env`.

Example `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.8-flash
GEMINI_FALLBACK_MODEL=gemini-3-flash-preview
MONGODB_URI=your_mongodb_uri
FRONTEND_URL=http://localhost:5173
PORT=5000
```

### Start

Frontend:

```bash
npm run dev
```

Backend:

```bash
cd backend
node server.js
```

## Live

🌐 **Frontend:** https://studynex-app.web.app/  
⚙️ **Backend:** https://studynex-backend-s7j1.onrender.com/

## Project Structure

```text
Studynex/
├── src/          # React application
├── backend/      # Express API & AI services
├── public/       # Frontend assets
├── package.json
└── README.md
```

## Security

- Secrets are kept outside source control.
- API credentials are configured through environment variables.
- Gemini credentials remain on the backend.

---

Built as a personal product project by **Tanisk Sahu**.