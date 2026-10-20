# CareerPilot AI – Deployment Guide

Three pieces: **Frontend** (Vercel) → **Backend API** (Render) → **AI service** (Render) + Neon database.

## 1. AI service (Python) – Render
1. Render → New → Web Service → connect this repo.
2. Runtime **Docker**, Dockerfile path `./Dockerfile.aiml`, context `.`
3. Env vars: `AIML_LIGHT_MODE=1`, `AIML_SERVICE_KEY=<any long random string>`
4. Deploy, then open `https://<aiml-url>/health` → should return `{"success":true}`.

## 2. Backend API – Render
1. New → Web Service, root directory `Backend`, runtime Node.
2. Build: `npm install` (this also runs `prisma generate`). Start: `npm start`.
3. Env vars (see `Backend/.env.example`):
   - `DATABASE_URL` (Neon, pooled URL, must be set BEFORE the first build)
   - `JWT_SECRET`, `NODE_ENV=production`
   - `CORS_ORIGINS=https://<your-frontend>.vercel.app`
   - `AIML_SERVICE_URL=https://<aiml-url>` and the same `AIML_SERVICE_KEY`
   - `GOOGLE_CLIENT_ID`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
   - `GITHUB_CALLBACK_URL=https://<your-frontend>.vercel.app/login`
4. Sync the database tables once from your laptop (safe, only adds missing tables): `cd Backend && npx prisma db push` (needs DATABASE_URL in your local `Backend/.env`)
5. Check `https://<api-url>/api/health`.

(`render.yaml` in the repo root can create both Render services automatically.)

## 3. Frontend – Vercel
1. New Project → import repo → Root Directory `Frontend` (Vite preset).
2. Env vars: `VITE_API_URL=https://<api-url>/api`, `VITE_GOOGLE_CLIENT_ID`, `VITE_GITHUB_CLIENT_ID`
3. Deploy. `vercel.json` already handles page refreshes on React Router URLs.

## 4. OAuth settings after you know the final URLs
- Google Cloud Console → add `https://<your-frontend>.vercel.app` as an Authorized JavaScript origin.
- GitHub OAuth App → Homepage URL `https://<your-frontend>.vercel.app`, callback `https://<your-frontend>.vercel.app/login`.

## Known limits
- Render's free plan sleeps after inactivity: the first request can take ~1 minute.
- Uploaded resumes are stored on the server disk, which is wiped on every redeploy/restart (free plan). Re-upload resumes after a redeploy. Permanent storage needs S3/Cloudinary.
- `AIML_LIGHT_MODE=1` uses string similarity instead of sentence-transformers so it fits in small memory. For the full model, install `AIML/requirements-full.txt` on a ≥2 GB instance and unset the variable.

## What the AI service powers
- **Resume page → Analyze Resume:** skills, ATS score vs a job description, career matches, skill gaps, roadmap, interview questions. Roadmaps can be saved into **Learning Roadmap**.
- **Study Materials → AI Study Assistant:** summary, flashcards, quiz and question answering for PDF/DOCX/PPTX/TXT. This runs without an LLM (retrieval + rules), so it works on free hosting. The original Ollama/FAISS RAG code is kept in `AIML/study_material/` for local use.
