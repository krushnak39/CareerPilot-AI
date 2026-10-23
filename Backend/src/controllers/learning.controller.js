
const prisma = require("../config/prisma");

// ==========================
// HELPER: VALIDATE PROGRESS
// ==========================
const parseProgress = (value) => {
  // Reject missing, empty, and unexpected input types.
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    (typeof value !== "number" && typeof value !== "string") ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null;
  }

  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < 0 ||
    parsed > 100
  ) {
    return null;
  }

  return parsed;
};

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

    // Validate the resource ID.
    if (
      typeof resourceId !== "string" ||
      resourceId.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid learning resource ID is required",
      });
    }

    // Confirm the resource exists and is active.
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

    const now = new Date();

    // Create progress if missing.
    // If progress already exists, preserve the original startedAt.
    const learningProgress =
      await prisma.learningProgress.upsert({
        where: {
          userId_resourceId: {
            userId,
            resourceId,
          },
        },
        update: {
          // Keep existing progress and timestamps.
          // Restarting a resource must not reset its history.
        },
        create: {
          userId,
          resourceId,
          progress: 0,
          status: "in_progress",
          startedAt: now,
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

    // Validate the resource ID.
    if (
      typeof resourceId !== "string" ||
      resourceId.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid learning resource ID is required",
      });
    }

    // Validate progress without converting empty strings to zero.
    const progress = parseProgress(req.body?.progress);

    if (progress === null) {
      return res.status(400).json({
        success: false,
        message: "Progress must be an integer between 0 and 100",
      });
    }

    // Only allow progress updates for resources the user has started.
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
        message:
          "Learning progress not found. Start the resource first.",
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

// ==========================
// EXPORT CONTROLLERS
// ==========================
module.exports = {
  getLearningResources,
  startLearningResource,
  updateLearningProgress,
};
