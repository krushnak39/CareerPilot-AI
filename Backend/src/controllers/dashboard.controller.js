const prisma = require("../config/prisma");

const percent = (part, total) =>
  total > 0
    ? Math.round((part / total) * 100)
    : 0;

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      resumeCount,
      jobCount,
      interviewCount,
      completedInterviews,
      roadmapCount,
      studyMaterialCount,
      totalTopics,
      completedTopics,
      latestAnalysis,
    ] = await Promise.all([
      prisma.resume.count({
        where: { userId },
      }),
      prisma.jobApplication.count({
        where: { userId },
      }),
      prisma.interviewSession.count({
        where: { userId },
      }),
      prisma.interviewSession.count({
        where: {
          userId,
          status: "COMPLETED",
        },
      }),
      prisma.learningRoadmap.count({
        where: { userId },
      }),
      prisma.studyMaterial.count({
        where: { userId },
      }),
      prisma.roadmapTopic.count({
        where: {
          module: { roadmap: { userId } },
        },
      }),
      prisma.roadmapTopic.count({
        where: {
          completed: true,
          module: { roadmap: { userId } },
        },
      }),
      prisma.userActivity.findFirst({
        where: {
          userId,
          type: "RESUME_ANALYSIS",
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const meta = latestAnalysis?.metadata || {};

    const analysis = latestAnalysis
      ? {
          analyzedAt: latestAnalysis.createdAt,
          resumeTitle: meta.resumeTitle || null,
          domain: meta.domain || null,
          skillsCount: meta.skillsCount || 0,
          topCareer: meta.topCareer || null,
          topMatch: meta.topMatch ?? null,
          atsScore: meta.atsScore ?? null,
          skillGaps: meta.skillGaps ?? 0,
        }
      : null;

    const learningProgress = percent(
      completedTopics,
      totalTopics
    );

    const interviewProgress = percent(
      completedInterviews,
      interviewCount
    );

    // Every value is calculated from the user's real data.
    // No data yet = 0, never a made-up number.
    const chart = [
      {
        name: "Career Match",
        score: Math.round(
          Number(analysis?.topMatch) || 0
        ),
      },
      {
        name: "ATS Match",
        score: Math.round(
          Number(analysis?.atsScore) || 0
        ),
      },
      {
        name: "Learning",
        score: learningProgress,
      },
      {
        name: "Interview",
        score: interviewProgress,
      },
    ];

    return res.status(200).json({
      success: true,
      data: {
        resumeCount,
        jobCount,
        interviewCount,
        roadmapCount,
        studyMaterialCount,
        learningProgress,
        interviewProgress,
        analysis,
        chart,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};

module.exports = {
  getDashboard,
};
