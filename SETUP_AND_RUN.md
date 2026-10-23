# CareerPilot AI - Setup & Run

You need 3 processes: **AI service (Python)**, **Backend (Node)**, **Frontend (React)**.

## 1. AI service (port 8000)
```bash
python -m venv venv && source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m AIML.service.app                           # run from repo root
```
Check: http://localhost:8000/health

Optional: install [Ollama](https://ollama.com) and run `ollama pull llama3.2` for LLM-quality study answers.
Without Ollama the "Ask" feature automatically falls back to retrieval-based answers.

## 2. Backend (port 5000)
```bash
cd Backend
cp .env.example .env          # fill DATABASE_URL and JWT_SECRET
npm install
npx prisma generate
npx prisma db push            # creates the new AI tables (ResumeAnalysis, StudyArtifact, WeakTopic)
node prisma/seed.js           # optional
npm run dev
```
Set `AI_SERVICE_URL` in `.env` if the AI service is not on http://localhost:8000.

## 3. Frontend
```bash
cd Frontend
npm install
npm run dev
```

## New API endpoints (all need login)
| Method | Route | Purpose |
|---|---|---|
| POST | /api/ai/resumes/:id/analyze | Parse resume, ATS score, skills, careers, skill gaps |
| GET | /api/ai/resumes/:id/analysis | Last saved analysis |
| POST | /api/ai/resumes/:id/roadmap | Create a Learning Roadmap from the skill gap |
| POST | /api/ai/interview/questions | Personalised interview questions |
| POST | /api/ai/study/:id/ask | Ask a question about a study material |
| POST/GET | /api/ai/study/:id/flashcards | Generate / load flashcards |
| POST/GET | /api/ai/study/:id/quiz | Generate / load quiz |
| POST | /api/ai/study/quiz-result | Save quiz result (feeds weak topics) |
| GET | /api/ai/study/weak-topics | Weak topics |

## Test the AI service
`python -m AIML.tests.test_service`
