<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NeuroX — Clinical AI Platform

A production-ready hospital workflow platform for automated peripheral nerve segmentation in musculoskeletal ultrasound imagery using ResUNet architecture and Gemini AI.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Tailwind CSS v4 + Framer Motion
- **Backend:** Express.js + SQLite + JWT Authentication
- **AI:** Google Gemini Vision API for nerve segmentation analysis
- **Build:** Vite 6 monorepo (frontend + backend in one project)
- **Deployment:** Railway (Node.js)

## Features

- 🔐 JWT-based authentication with role-based access control
- 🏥 Radiologist dashboard: upload ultrasound images, get AI analysis, transfer cases
- 👨‍⚕️ Specialist dashboard (Doctor/Anesthesiologist): review transferred cases, update status
- 🤖 Gemini AI integration: automatic nerve segmentation with SVG overlay visualization
- ⏱️ Shift tracking: login time, elapsed duration, cases handled counter
- 📊 Analytics dashboard: case statistics and AI confidence metrics
- 🌙 Dark clinical terminal aesthetic with cyan (#00d4ff) accents

## Quick Start

**Prerequisites:** Node.js 18+

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env and set GEMINI_API_KEY, JWT_SECRET
   ```

3. Initialize the database (optional — auto-runs on first start):
   ```bash
   npm run db:init
   ```

4. Start development (Vite on :5173, Express on :3000):
   ```bash
   npm run dev
   ```

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Radiologist | radiologist@neurox.com | password123 |
| Doctor | doctor@neurox.com | password123 |
| Anesthesiologist | anesthesiologist@neurox.com | password123 |

## Production Deployment (Railway)

Set these environment variables in Railway:

```
GEMINI_API_KEY=your_key_here
JWT_SECRET=your_long_random_secret
NODE_ENV=production
DATABASE_URL=neurox.db
PORT=3000
```

The `npm run build` command compiles the React app to `dist/`, and `npm start` serves both the API and the static frontend from Express.

## Project Structure

```
/
├── server.ts              # Express entry point
├── server/
│   ├── db.ts              # SQLite setup + seeding
│   ├── auth.ts            # JWT middleware
│   └── routes/
│       ├── auth.ts        # POST /api/login, /api/logout
│       ├── cases.ts       # Cases CRUD + Gemini AI
│       ├── users.ts       # GET /api/users, /api/shift-stats
│       └── health.ts      # GET /api/health
├── src/
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RadiologistDashboard.tsx
│   │   └── SpecialistDashboard.tsx
│   ├── components/        # Reusable UI components
│   ├── api/client.ts      # Typed API client
│   └── types/index.ts     # Shared TypeScript types
└── uploads/               # Uploaded ultrasound images
```
