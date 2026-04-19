
# Discate | Elite Academic Mentorship

Discate is an advanced academic mentorship platform that leverages AI to generate personalized assessments and provide deep evaluation of student work.

## GitHub Terminal Instructions

Follow these exact commands to sync your lockfile and push your code. This is required because Cloudflare uses `npm ci`, which will fail if the `package-lock.json` is not in sync with the recent dependency fixes.

```bash
# 1. Sync lockfile (IMPORTANT for Cloudflare)
npm install --legacy-peer-deps

# 2. Add all files to the staging area
git add .

# 3. Create a commit with a message
git commit -m "Fix dependency conflicts and lockfile sync for Cloudflare"

# 4. Set the default branch to main
git branch -M main

# 5. Push the code to your repository
# git remote add origin <YOUR_GITHUB_REPO_URL>
git push -u origin main
```

## Cloudflare Pages Deployment
To deploy to Cloudflare Pages, use the following build settings:
- **Build command**: `npm run build`
- **Output directory**: `.vercel/output/static`
- **Framework preset**: `Next.js`

## Core Features
- **Edge Runtime Enabled**: AI generations and file parsing utilize Edge runtime for stability on Cloudflare.
- **Sequential Assessment Wizard**: 4-step process to generate MCQs, Flashcards, and Essays.
- **Multi-Format Parsing**: Elite support for PDF, DOCX, and TXT uploads using `pdfjs-dist`.
- **Scholar Report Card**: Animated Score Circle with deep metrics (Grammar, Depth, Relevancy).
- **Regional Mix Support**: Mentorship in 10 language styles (Hinglish, Marathish, etc.) with an energetic "Baval" tone.
