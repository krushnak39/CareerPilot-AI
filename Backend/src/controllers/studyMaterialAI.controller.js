const path = require("path");

const prisma = require("../config/prisma");

const {
  runStudyAction,
} = require("../services/aiml.service");

const ACTIONS = [
  "ask",
  "summary",
  "flashcards",
  "quiz",
];

// ==========================
// STUDY MATERIAL AI
// POST /api/study-materials/:id/ai
// body: { action, question? }
// ==========================
const studyMaterialAI = async (
  req,
  res,
  next
) => {
  try {
    const action = String(
      req.body?.action || ""
    ).toLowerCase();

    const question = String(
      req.body?.question || ""
    )
      .trim()
      .slice(0, 500);

    if (!ACTIONS.includes(action)) {
      return res.status(400).json({
        success: false,
        message: `action must be one of: ${ACTIONS.join(", ")}`,
      });
    }

    if (action === "ask" && !question) {
      return res.status(400).json({
        success: false,
        message: "question is required",
      });
    }

    const material =
      await prisma.studyMaterial.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Study material not found",
      });
    }

    const data = await runStudyAction({
      filePath: path.resolve(
        material.filePath
      ),
      fileName: material.fileName,
      action,
      question,
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      return res
        .status(error.statusCode)
        .json({
          success: false,
          message: error.message,
        });
    }

    next(error);
  }
};

module.exports = {
  studyMaterialAI,
};
