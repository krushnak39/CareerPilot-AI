const prisma = require("../config/prisma");

// ==========================
// GET LEARNING RESOURCES
// GET /api/learning/resources
// ==========================
const getLearningResources = async (req, res, next) => {
  try {
    const resources = await prisma.learningResource.findMany({
      where: {
        isActive: true,
      },

      include: {
        LearningResourceSkill: {
          include: {
            Skill: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: resources,
    });
  } catch (error) {
    console.error(
      "Get Learning Resources Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// START LEARNING RESOURCE
// POST /api/learning/resources/:resourceId/start
// ==========================
const startLearningResource = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const userId = req.user.id;

    // Check that the resource exists
    const resource = await prisma.learningResource.findUnique({
      where: {
        id: resourceId,
      },
    });

    if (!resource || !resource.isActive) {
      return res.status(404).json({
        success: false,
        message: "Learning resource not found",
      });
    }

    // Create progress or return existing progress
    const learningProgress =
      await prisma.learningProgress.upsert({
        where: {
          userId_resourceId: {
            userId,
            resourceId,
          },
        },

        update: {
          status: "in_progress",
          startedAt: new Date(),
        },

        create: {
          userId,
          resourceId,
          progress: 0,
          status: "in_progress",
          startedAt: new Date(),
        },
      });

    return res.status(200).json({
      success: true,
      message: "Learning resource started",
      data: learningProgress,
    });
  } catch (error) {
    console.error(
      "Start Learning Resource Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// UPDATE LEARNING PROGRESS
// PATCH /api/learning/resources/:resourceId/progress
// ==========================
const updateLearningProgress = async (req, res, next) => {
  try {
    const { resourceId } = req.params;
    const userId = req.user.id;
    const progress = Number(req.body.progress);

    if (!Number.isInteger(progress) || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: "Progress must be an integer between 0 and 100",
      });
    }

    const existingProgress =
      await prisma.learningProgress.findUnique({
        where: {
          userId_resourceId: {
            userId,
            resourceId,
          },
        },
      });

    if (!existingProgress) {
      return res.status(404).json({
        success: false,
        message: "Learning progress not found. Start the resource first.",
      });
    }

    const isCompleted = progress === 100;

    const updatedProgress =
      await prisma.learningProgress.update({
        where: {
          userId_resourceId: {
            userId,
            resourceId,
          },
        },
        data: {
          progress,
          status: isCompleted ? "completed" : "in_progress",
          completedAt: isCompleted ? new Date() : null,
        },
      });

    return res.status(200).json({
      success: true,
      message: isCompleted
        ? "Learning resource completed"
        : "Learning progress updated",
      data: updatedProgress,
    });
  } catch (error) {
    console.error(
      "Update Learning Progress Error:",
      error.message
    );

    return next(error);
  }
};


module.exports = {
  getLearningResources,
  startLearningResource,
  updateLearningProgress,
};