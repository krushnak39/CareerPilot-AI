import api from "./axios";

const unwrap = (promise) => promise.then((r) => r.data);

// RESUME
export const analyzeResume = (resumeId, jobDescription = "") =>
  unwrap(api.post(`/ai/resumes/${resumeId}/analyze`, { jobDescription }, { timeout: 180000 }));
export const getResumeAnalysis = (resumeId) =>
  unwrap(api.get(`/ai/resumes/${resumeId}/analysis`));
export const generateRoadmapFromResume = (resumeId, career) =>
  unwrap(api.post(`/ai/resumes/${resumeId}/roadmap`, { career }));

// INTERVIEW
export const generateInterviewQuestions = (payload) =>
  unwrap(api.post("/ai/interview/questions", payload, { timeout: 120000 }));

// STUDY MATERIAL
export const askStudyMaterial = (id, question) =>
  unwrap(api.post(`/ai/study/${id}/ask`, { question }, { timeout: 180000 }));
export const generateFlashcards = (id) =>
  unwrap(api.post(`/ai/study/${id}/flashcards`, {}, { timeout: 120000 }));
export const getFlashcards = (id) => unwrap(api.get(`/ai/study/${id}/flashcards`));
export const generateQuiz = (id) =>
  unwrap(api.post(`/ai/study/${id}/quiz`, {}, { timeout: 120000 }));
export const getQuiz = (id) => unwrap(api.get(`/ai/study/${id}/quiz`));
export const submitQuizResult = (results) =>
  unwrap(api.post("/ai/study/quiz-result", { results }));
export const getWeakTopics = () => unwrap(api.get("/ai/study/weak-topics"));

export const errorMessage = (error, fallback = "Something went wrong") =>
  error?.response?.data?.message || error?.message || fallback;
