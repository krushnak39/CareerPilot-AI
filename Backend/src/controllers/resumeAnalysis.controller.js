const path = require("path");

const prisma = require("../config/prisma");

const {
  analyzeResumeFile,
} = require("../services/aiml.service");

const {
  createActivity,
} = require("../services/activity.service");

// ==========================
// ANALYZE RESUME
// POST /api/resumes/:id/analyze
// body: { jobDescription?: string }
// ==========================
const analyzeResume = async (
  req,
  res,
  next
) => {
  try {
    const resume =
      await prisma.resume.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    const filePath = path.join(
      process.cwd(),
      resume.fileUrl.replace(/^\/+/, "")
    );

    const analysis =
      await analyzeResumeFile({
        filePath,
        fileName: resume.fileName,
        jobDescription:
          req.body?.jobDescription,
      });

    // Save a summary so the dashboard shows real AI results.
    // Failures here must never break the analysis response.
    try {
      const top =
        analysis.career_recommendations?.[0] ||
        null;

      await prisma.userActivity.create({
        data: {
          userId: req.user.id,
          type: "RESUME_ANALYSIS",
          entityType: "resume",
          entityId: resume.id,
          metadata: {
            resumeTitle:
              resume.title || resume.fileName,
            domain:
              analysis.domain?.domain_name ||
              null,
            skillsCount:
              analysis.skills?.length || 0,
            topCareer: top?.career || null,
            topMatch: top?.match_score ?? null,
            atsScore:
              analysis.ats?.score ?? null,
            skillGaps:
              top?.missing_skills?.length ?? 0,
          },
        },
      });

      await createActivity({
        userId: req.user.id,
        type: "RESUME_ANALYSIS",
        title: "Resume analyzed with AI",
        description: top
          ? `Best match: ${top.career} (${top.match_score}%)`
          : "Resume analysis completed",
      });
    } catch (saveError) {
      console.error(
        "Save analysis summary error:",
        saveError.message
      );
    }

    return res.json({
      success: true,
      message:
        "Resume analyzed successfully",
      data: analysis,
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
  analyzeResume,
};
