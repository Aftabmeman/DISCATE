
# Discate | Elite Academic Mentorship

Discate is an advanced academic mentorship platform that leverages AI to generate personalized assessments and provide deep evaluation of student work.

## GitHub & Deployment Instructions

Follow these exact commands to sync your lockfile and push your code. This is required because Cloudflare uses `npm clean-install`, and Render also benefits from a clean state.

### 1. Sync Lockfile Locally
Run this command in your local terminal:
```bash
npm install --legacy-peer-deps
```

### 2. Push to GitHub
```bash
git add .
git commit -m "Fix: Forced CDN PDF worker for environment stability"
git push origin main
```

## Core Features
- **Node.js Runtime**: Optimized for stability across Render and Cloudflare.
- **Sequential Assessment Wizard**: 4-step process to generate MCQs, Flashcards, and Essays.
- **Elite Multi-Format Parsing**: Support for PDF, DOCX, and TXT (Max 5MB).
- **Scholar Report Card**: Animated Score Circle with deep metrics (Grammar, Depth, Relevancy).
- **Regional Mix Support**: Mentorship in 10 language styles (Hinglish, Marathish, etc.) with an energetic "Baval" tone.
