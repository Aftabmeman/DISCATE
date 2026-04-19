
# Discate | Elite Academic Mentorship

Discate is an advanced academic mentorship platform that leverages AI to generate personalized assessments and provide deep evaluation of student work.

## GitHub Terminal Instructions

Follow these exact commands to sync your lockfile and push your code:

```bash
# 1. Sync lockfile (IMPORTANT for Cloudflare)
npm install --legacy-peer-deps

# 2. Add all files to the staging area
git add .

# 3. Create a commit with a message
git commit -m "Fix Genkit dependency conflicts and finalize branding"

# 4. Set the default branch to main
git branch -M main

# 5. Add your remote repository URL (if not already added)
# git remote add origin <YOUR_GITHUB_REPO_URL>

# 6. Push the code to your repository
git push -u origin main
```

## Cloudflare Pages Deployment
To deploy to Cloudflare Pages, use the following build settings:
- **Build command**: `npm run build`
- **Output directory**: `.vercel/output/static`
- **Framework preset**: `Next.js`

## Core Features
- **Edge Runtime Enabled**: AI generations and file parsing utilize Edge runtime for 10s+ stability on Cloudflare.
- **Sequential Assessment Wizard**: 4-step process to generate MCQs, Flashcards, and Essays.
- **Multi-Format Parsing**: Elite support for PDF, DOCX, and TXT uploads.
- **Scholar Report Card**: Animated Score Circle with deep metrics (Grammar, Depth, Relevancy).
- **Regional Mix Support**: Mentorship in 10 language styles (Hinglish, Marathish, etc.) with an energetic "Baval" tone.
