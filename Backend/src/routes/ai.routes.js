const express = require("express");
const c = require("../controllers/ai.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();
router.use(authMiddleware);

router.get("/health", c.aiHealth);

router.post("/resumes/:id/analyze", c.analyzeResume);
router.get("/resumes/:id/analysis", c.getResumeAnalysis);
router.post("/resumes/:id/roadmap", c.generateRoadmap);

router.post("/interview/questions", c.interviewQuestions);

router.get("/study/weak-topics", c.weakTopics);
router.post("/study/quiz-result", c.submitQuiz);
router.post("/study/:id/ask", c.askMaterial);
router.post("/study/:id/flashcards", c.generateFlashcards);
router.get("/study/:id/flashcards", c.getFlashcards);
router.post("/study/:id/quiz", c.generateQuiz);
router.get("/study/:id/quiz", c.getQuiz);

module.exports = router;
