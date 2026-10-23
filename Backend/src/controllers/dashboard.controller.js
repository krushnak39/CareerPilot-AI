const prisma = require("../config/prisma");

const getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const [
      resumeCount,
      jobCount,
      interviewCount,
      learningProgress,
      skillGapCount,
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

      prisma.learningProgress.findMany({
        where: { userId },
        select: { progress: true },
      }),

      prisma.skillGap.count({
        where: { userId },
      }),
    ]);

    const learningProgressPercent =
      learningProgress.length > 0
        ? Math.round(
            learningProgress.reduce(
              (total, item) => total + item.progress,
              0
            ) / learningProgress.length
          )
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        resumeCount,
        jobCount,
        interviewCount,
        learningProgressPercent,
        skillGapCount,
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