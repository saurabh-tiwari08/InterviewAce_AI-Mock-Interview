# InterviewAce — AI Mock Interview Platform

A production-ready AI mock interview platform built with Next.js 14 and Gemini AI.

## Features vs Basic Assessify

| Feature | Assessify | InterviewAce |
|---|---|---|
| Voice input | ✅ | ✅ |
| Real-time transcription | ✅ | ✅ |
| AI feedback | ✅ | ✅ |
| Adaptive follow-up questions | ❌ | ✅ |
| Per-question analysis | ❌ | ✅ |
| 5-dimension scoring | ❌ | ✅ (Technical, Communication, STAR, Problem-solving, Confidence) |
| Role-specific interview | ❌ | ✅ (SWE, Frontend, Backend, PM) |
| Company targeting | ❌ | ✅ |
| Timer with visual progress | ❌ | ✅ |
| Hiring recommendation | ❌ | ✅ |
| Dark terminal aesthetic | ❌ | ✅ |

## Tech Stack

- **Next.js 14** — App Router, API Routes
- **Gemini 1.5 Flash** — Questions, follow-ups, evaluation
- **Web Speech API** — Browser-native voice recognition
- **Speech Synthesis API** — AI speaks questions aloud
- **Framer Motion** — Animations
- **Tailwind CSS** — Styling

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local and add your Gemini API key
# Get key: https://aistudio.google.com/app/apikey

# 3. Run dev server
npm run dev
# Open http://localhost:3000
```

## Deploy to Vercel

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ai-interview-ace
git push -u origin main

# 2. Go to vercel.com → Import your repo
# 3. Add environment variable:
#    GEMINI_API_KEY = your_key_here
# 4. Deploy!
```

## Project Structure

```
app/
├── page.tsx          # Landing page with 3-step config
├── interview/
│   └── page.tsx      # Live interview with voice
├── results/
│   └── page.tsx      # Scorecard with AI evaluation
├── api/
│   └── interview/
│       └── route.ts  # Gemini API handler
└── globals.css       # Dark terminal theme
```

## Environment Variables

| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key (required) |

---

Built by Saurabh Tiwari
