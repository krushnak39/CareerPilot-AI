const fs = require("fs");
const path = require("path");

const AI_URL = (process.env.AI_SERVICE_URL || "http://localhost:8000").replace(/\/$/, "");
const TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 120000);

class AIServiceError extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

const request = async (route, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(`${AI_URL}${route}`, {
      ...options,
      signal: controller.signal,
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.success === false) {
      throw new AIServiceError(
        body.error || `AI service error (${response.status})`,
        response.status >= 500 ? 502 : response.status
      );
    }
    return body.data;
  } catch (error) {
    if (error instanceof AIServiceError) throw error;
    throw new AIServiceError(
      error.name === "AbortError"
        ? "AI service timed out"
        : "AI service is not reachable. Start it with: python -m AIML.service.app"
    );
  } finally {
    clearTimeout(timer);
  }
};

const fileForm = (filePath, fileName, fields = {}) => {
  const form = new FormData();
  const buffer = fs.readFileSync(filePath);
  form.append("file", new Blob([buffer]), fileName || path.basename(filePath));
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== null) form.append(k, String(v));
  });
  return form;
};

const analyzeResume = (filePath, fileName, jobDescription) =>
  request("/analyze-resume", {
    method: "POST",
    body: fileForm(filePath, fileName, { jobDescription }),
  });

const generateInterviewQuestions = (payload) =>
  request("/interview/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

const askStudyMaterial = (filePath, fileName, question) =>
  request("/study/ask", {
    method: "POST",
    body: fileForm(filePath, fileName, { question }),
  });

const generateFlashcards = (filePath, fileName, limit = 10) =>
  request("/study/flashcards", {
    method: "POST",
    body: fileForm(filePath, fileName, { limit }),
  });

const generateQuiz = (filePath, fileName, limit = 5) =>
  request("/study/quiz", {
    method: "POST",
    body: fileForm(filePath, fileName, { limit }),
  });

const health = () => request("/health").catch(() => null);

module.exports = {
  AIServiceError,
  analyzeResume,
  generateInterviewQuestions,
  askStudyMaterial,
  generateFlashcards,
  generateQuiz,
  health,
};
