# InterviewAce - AI Mock Interview Platform

A production-ready AI mock interview platform built with **Next.js 14** and **Gemini AI** that simulates real technical interviews with voice interaction, adaptive questioning, and detailed performance evaluation.

InterviewAce helps students and developers practice interviews in a realistic environment and receive structured feedback to improve their technical and communication skills.

---

## Features

* Voice-based interview interaction
* Real-time speech transcription
* AI-generated interview questions
* Adaptive follow-up questions based on responses
* Per-question performance analysis
* 5-dimension scoring system

  * Technical Skills
  * Communication
  * STAR Method
  * Problem-solving
  * Confidence
* Role-specific interviews

  * Software Engineer
  * Frontend Developer
  * Backend Developer
  * Product Manager
* Company-targeted interview preparation
* Built-in interview timer with visual progress
* AI hiring recommendation system
* Dark terminal-style user interface
* Smooth animations and modern UI

---

## Tech Stack

* **Next.js 14** - App Router and API Routes
* **Gemini 1.5 Flash** - Question generation, follow-ups, and evaluation
* **Web Speech API** - Browser-based voice recognition
* **Speech Synthesis API** - AI voice output
* **Framer Motion** - UI animations
* **Tailwind CSS** - Styling and layout
* **TypeScript** - Type safety and maintainability

---

## How It Works

1. User selects role and target company
2. AI generates interview questions
3. User answers using voice or text
4. AI asks adaptive follow-up questions
5. System evaluates performance
6. Detailed scorecard is generated

---

## Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local

# 3. Add your Gemini API key
# Get key from:
# https://aistudio.google.com/app/apikey

# 4. Run development server
npm run dev

# Open in browser
http://localhost:3000
```

---

## Deploy to Vercel

```bash
# Initialize repository
git init

# Add files
git add .

# Commit changes
git commit -m "Initial commit"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/interview-ace

# Push code
git push -u origin main
```

### Deployment Steps

1. Go to vercel.com
2. Import your GitHub repository
3. Add environment variable:

```
GEMINI_API_KEY=your_key_here
```

4. Click Deploy

---

## Project Structure

```
app/
├── page.tsx
│   Landing page with configuration options
│
├── interview/
│   └── page.tsx
│   Live interview interface with voice interaction
│
├── results/
│   └── page.tsx
│   Performance scorecard and AI evaluation
│
├── api/
│   └── interview/
│       └── route.ts
│       Gemini API handler
│
└── globals.css
    Dark terminal theme styling
```

---

## Environment Variables

| Variable       | Description                      |
| -------------- | -------------------------------- |
| GEMINI_API_KEY | Google Gemini API key (required) |

---

## Use Cases

* Practicing technical interviews
* Preparing for internships and job placements
* Improving communication skills
* Simulating real interview environments
* Building AI-powered portfolio projects

---

## Future Enhancements

* Resume-based question generation
* Multi-language interview support
* Coding challenge integration
* Interview history tracking
* Performance analytics dashboard
* Authentication and user profiles

---

## Author

**Saurabh Tiwari**
Software Developer | Computer Science Student

Built with dedication to help students
