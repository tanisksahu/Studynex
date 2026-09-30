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

Create your local environment files and keep credentials out of Git.

### Start

```bash
npm run dev
```

For the backend:

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