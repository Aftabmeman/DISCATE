
# Discate | Elite Academic Mentorship

Discate is an advanced academic mentorship platform that leverages AI to generate personalized assessments and provide deep evaluation of student work.

## GitHub Terminal Instructions

Follow these exact commands to push your code to your GitHub repository:

```bash
# 1. Initialize the git repository
git init

# 2. Add all files to the staging area
git add .

# 3. Create a commit with a message
git commit -m "Initial commit - Discate Elite Academic Mentorship"

# 4. Set the default branch to main
git branch -M main

# 5. Add your remote repository URL
# Replace <URL> with your actual GitHub repository URL (e.g., https://github.com/username/repo.git)
git remote add origin <YOUR_GITHUB_REPO_URL>

# 6. Push the code to your repository
git push -u origin main
```

## Cloudflare Pages Deployment
To deploy to Cloudflare Pages, use the following build settings:
- **Build command**: `npm run build`
- **Output directory**: `.vercel/output/static` (Note: Cloudflare next-on-pages produces a compatible output)
- **Framework preset**: `None` or `Next.js`

## Core Features
- **Edge Runtime Enabled**: AI generations and file parsing utilize Edge runtime for 10s+ stability on Cloudflare.
- **Sequential Assessment Wizard**: 4-step process to generate MCQs, Flashcards, and Essays.
- **Multi-Format Parsing**: Elite support for PDF, DOCX, and TXT uploads.
- **Professional Exam Report Card**: Animated Score Circle with deep metrics (Grammar, Depth, Relevancy).
- **Regional Mix Support**: Mentorship in 10 language styles (Hinglish, Marathish, etc.) with an energetic "Baval" tone.
- **Secure Architecture**: Built with Next.js, Firebase Auth, and Firestore user silos.
