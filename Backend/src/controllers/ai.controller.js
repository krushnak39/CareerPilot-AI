const path = require("path");
const fs = require("fs");

const prisma = require("../config/prisma");
const ai = require("../services/ai.service");
const { createActivity } = require("../services/activity.service");

const handle = (fn) => async (req, res, next) => {
  try {
    await fn(req, res);
  } catch (error) {
    if (error instanceof ai.AIServiceError) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    next(error);
  }
};

const resumePath = (resume) =>
  path.join(process.cwd(), "uploads", "resumes", path.basename(resume.fileUrl));

const getOwnedResume = async (req, res) => {
  const resume = await prisma.resume.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!resume) {
    res.status(404).json({ success: false, message: "Resume not found" });
    return null;
  }
  const file = resumePath(resume);
  if (!fs.existsSync(file)) {
    res.status(404).json({ success: false, message: "Resume file not found on server" });
    return null;
  }
  return { resume, file };
};

const getOwnedMaterial = async (req, res) => {
  const material = await prisma.studyMaterial.findFirst({
    where: { id: req.params.id, userId: req.user.id },
  });
  if (!material || !fs.existsSync(material.filePath)) {
    res.status(404).json({ success: false, message: "Study material not found" });
    return null;
  }
  return material;
};

// Persist detected skills + skill gaps so Dashboard / Learning pages use real data
const persistSkills = async (userId, analysis) => {
  const detected = analysis.skills || [];
  const best = (analysis.careerRecommendations || [])[0];

  for (const s of detected) {
    const skill = await prisma.skill.upsert({
      where: { name: s.name },
      update: {},
      create: { name: s.name, category: "Detected" },
    });
    await prisma.userSkill.upsert({
      where: { userId_skillId: { userId, skillId: skill.id } },
      update: { source: "resume" },
      create: { userId, skillId: skill.id, proficiency: 3, source: "resume" },
    });
  }

  if (best) {
    const priorityOf = (i, total) =>
      i < total / 3 ? "high" : i < (2 * total) / 3 ? "medium" : "low";
    const missing = best.missing_skills || [];
    for (const [i, name] of missing.entries()) {
      const skill = await prisma.skill.upsert({
        where: { name },
        update: {},
        create: { name, category: "Required" },
      });
      await prisma.skillGap.upsert({
        where: {
          userId_skillId_targetRole: { userId, skillId: skill.id, targetRole: best.career },
        },
        update: { priority: priorityOf(i, missing.length) },
        create: {
          userId,
          skillId: skill.id,
          targetRole: best.career,
          currentLevel: 0,
          requiredLevel: 3,
          priority: priorityOf(i, missing.length),
        },
      });
    }
  }
};

// ---------------- RESUME ----------------
const analyzeResume = handle(async (req, res) => {
  const owned = await getOwnedResume(req, res);
  if (!owned) return;

  const jobDescription = (req.body?.jobDescription || "").trim();
  const data = await ai.analyzeResume(owned.file, owned.resume.fileName, jobDescription);

  const saved = await prisma.resumeAnalysis.upsert({
    where: { resumeId: owned.resume.id },
    update: {
      atsScore: data.ats.score,
      domain: data.domain?.domain_name || null,
      jobDescription: jobDescription || null,
      result: data,
    },
    create: {
      userId: req.user.id,
      resumeId: owned.resume.id,
      atsScore: data.ats.score,
      domain: data.domain?.domain_name || null,
      jobDescription: jobDescription || null,
      result: data,
    },
  });

  await persistSkills(req.user.id, data);
  await createActivity({
    userId: req.user.id,
    type: "RESUME_ANALYZED",
    title: "Resume analyzed",
    description: `${owned.resume.fileName} - ATS ${data.ats.score}%`,
  });

  res.json({ success: true, data: { ...data, analysisId: saved.id, updatedAt: saved.updatedAt } });
});

const getResumeAnalysis = handle(async (req, res) => {
  const analysis = await prisma.resumeAnalysis.findFirst({
    where: { resumeId: req.params.id, userId: req.user.id },
  });
  if (!analysis) {
    return res.status(404).json({ success: false, message: "No analysis yet" });
  }
  res.json({ success: true, data: { ...analysis.result, updatedAt: analysis.updatedAt } });
});

// ---------------- ROADMAP ----------------
const generateRoadmap = handle(async (req, res) => {
  const analysis = await prisma.resumeAnalysis.findFirst({
    where: { resumeId: req.params.id, userId: req.user.id },
  });
  if (!analysis) {
    return res.status(400).json({ success: false, message: "Analyze the resume first" });
  }
  const recs = analysis.result.careerRecommendations || [];
  const rec = recs.find((r) => r.career === req.body?.career) || recs[0];
  if (!rec || !rec.roadmap?.length) {
    return res.status(400).json({ success: false, message: "No missing skills - nothing to learn" });
  }

  const groups = {};
  rec.roadmap.forEach((item) => {
    (groups[item.priority] = groups[item.priority] || []).push(item);
  });

  const roadmap = await prisma.learningRoadmap.create({
    data: {
      userId: req.user.id,
      title: `${rec.career} Roadmap`,
      description: `AI-generated from your resume (${rec.match_score}% match)`,
      role: rec.career,
      modules: {
        create: Object.entries(groups).map(([priority, items], mi) => ({
          title: `${priority} priority skills`,
          order: mi,
          topics: {
            create: items.map((it, ti) => ({
              title: `${it.skill} (${it.learning_duration})`,
              description: [it.reason, ...(it.resources || [])].join("\n"),
              order: ti,
            })),
          },
        })),
      },
    },
    include: { modules: { include: { topics: true } } },
  });

  res.status(201).json({ success: true, data: roadmap });
});

// ---------------- INTERVIEW ----------------
const interviewQuestions = handle(async (req, res) => {
  const { resumeId, sessionId, role, limit } = req.body || {};
  let skills = [];
  let resumeText = "";
  let missingSkills = [];
  let career = role;
  let domain;

  if (resumeId) {
    const analysis = await prisma.resumeAnalysis.findFirst({
      where: { resumeId, userId: req.user.id },
    });
    if (analysis) {
      skills = analysis.result.skills || [];
      domain = analysis.result.domain?.domain;
      const rec = (analysis.result.careerRecommendations || [])[0];
      career = career || rec?.career;
      missingSkills = rec?.missing_skills || [];
    }
  }

  let session = null;
  if (sessionId) {
    session = await prisma.interviewSession.findFirst({
      where: { id: sessionId, userId: req.user.id },
    });
    if (!session) {
      return res.status(404).json({ success: false, message: "Interview session not found" });
    }
    career = career || session.role;
  }

  const data = await ai.generateInterviewQuestions({
    resumeText, skills, domain, career, role: career, missingSkills, limit: limit || 10,
  });

  if (session) {
    await prisma.interviewSession.update({
      where: { id: session.id },
      data: { questions: data.questions },
    });
  }
  res.json({ success: true, data });
});

// ---------------- STUDY MATERIAL ----------------
const askMaterial = handle(async (req, res) => {
  const question = (req.body?.question || "").trim();
  if (!question) {
    return res.status(400).json({ success: false, message: "question is required" });
  }
  const material = await getOwnedMaterial(req, res);
  if (!material) return;
  const data = await ai.askStudyMaterial(material.filePath, material.fileName, question);
  res.json({ success: true, data });
});

const makeArtifact = (kind, generate, pick) =>
  handle(async (req, res) => {
    const material = await getOwnedMaterial(req, res);
    if (!material) return;
    const data = await generate(material.filePath, material.fileName, req.body?.limit);
    const items = pick(data);
    await prisma.studyArtifact.deleteMany({
      where: { userId: req.user.id, materialId: material.id, kind },
    });
    await prisma.studyArtifact.create({
      data: { userId: req.user.id, materialId: material.id, kind, data: items },
    });
    res.json({ success: true, data: items });
  });

const generateFlashcards = makeArtifact("FLASHCARDS", ai.generateFlashcards, (d) => d.flashcards);
const generateQuiz = makeArtifact("QUIZ", ai.generateQuiz, (d) => d.questions);

const getArtifact = (kind) =>
  handle(async (req, res) => {
    const artifact = await prisma.studyArtifact.findFirst({
      where: { userId: req.user.id, materialId: req.params.id, kind },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: artifact ? artifact.data : [] });
  });

const submitQuiz = handle(async (req, res) => {
  const results = Array.isArray(req.body?.results) ? req.body.results : [];
  for (const r of results) {
    if (!r?.topic) continue;
    await prisma.weakTopic.upsert({
      where: { userId_topic: { userId: req.user.id, topic: String(r.topic) } },
      update: r.correct
        ? { correctCount: { increment: 1 } }
        : { wrongCount: { increment: 1 } },
      create: {
        userId: req.user.id,
        topic: String(r.topic),
        correctCount: r.correct ? 1 : 0,
        wrongCount: r.correct ? 0 : 1,
      },
    });
  }
  const correct = results.filter((r) => r.correct).length;
  await createActivity({
    userId: req.user.id,
    type: "QUIZ_COMPLETED",
    title: "Quiz completed",
    description: `${correct}/${results.length} correct`,
  });
  res.json({ success: true, data: { correct, total: results.length } });
});

const weakTopics = handle(async (req, res) => {
  const rows = await prisma.weakTopic.findMany({
    where: { userId: req.user.id, wrongCount: { gt: 0 } },
    orderBy: { wrongCount: "desc" },
    take: 10,
  });
  res.json({ success: true, data: rows });
});

const aiHealth = handle(async (req, res) => {
  const status = await ai.health();
  res.json({ success: true, data: { online: !!status, ...(status || {}) } });
});

module.exports = {
  analyzeResume, getResumeAnalysis, generateRoadmap, interviewQuestions,
  askMaterial, generateFlashcards, generateQuiz,
  getFlashcards: getArtifact("FLASHCARDS"), getQuiz: getArtifact("QUIZ"),
  submitQuiz, weakTopics, aiHealth,
};
