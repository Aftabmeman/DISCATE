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
git commit -m "Fix: PDF parsing worker error and dependency sync"
git push origin main
```

## Cloudflare Pages Deployment
To deploy to Cloudflare Pages, use the following build settings:
- **Build command**: `npx @cloudflare/next-on-pages`
- **Output directory**: `.vercel/output/static`
- **Framework preset**: `Next.js`

## Core Features
- **Node.js Runtime**: Optimized for OpenNext and Cloudflare stability.
- **Sequential Assessment Wizard**: 4-step process to generate MCQs, Flashcards, and Essays.
- **Multi-Format Parsing**: Elite support for PDF, DOCX, and TXT uploads using `pdfjs-dist`.
- **Scholar Report Card**: Animated Score Circle with deep metrics (Grammar, Depth, Relevancy).
- **Regional Mix Support**: Mentorship in 10 language styles (Hinglish, Marathish, etc.) with an energetic "Baval" tone.
