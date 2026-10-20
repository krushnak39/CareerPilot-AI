const prisma = require("../config/prisma");

// ==========================
// GET ALL ROADMAPS
// ==========================

const getRoadmaps = async (req, res) => {
  try {
    const roadmaps = await prisma.learningRoadmap.findMany({
      where: {
        userId: req.user.id,
      },
      include: {
        modules: {
          orderBy: {
            order: "asc",
          },
          include: {
            topics: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      data: roadmaps,
    });
  } catch (error) {
    console.error("Get Roadmaps Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch roadmaps",
    });
  }
};

// ==========================
// GET ONE ROADMAP
// ==========================

const getRoadmapById = async (req, res) => {
  try {
    const { id } = req.params;

    const roadmap = await prisma.learningRoadmap.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
      include: {
        modules: {
          orderBy: {
            order: "asc",
          },
          include: {
            topics: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    res.status(200).json({
      success: true,
      data: roadmap,
    });
  } catch (error) {
    console.error("Get Roadmap Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch roadmap",
    });
  }
};

// ==========================
// CREATE ROADMAP
// ==========================

const createRoadmap = async (req, res) => {
  try {
    const {
      title,
      description,
      role,
      isTemplate = false,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Roadmap title is required",
      });
    }

    const roadmap = await prisma.learningRoadmap.create({
      data: {
        userId: req.user.id,
        title: title.trim(),
        description: description?.trim() || null,
        role: role?.trim() || null,
        isTemplate: Boolean(isTemplate),
      },
      include: {
        modules: {
          include: {
            topics: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Roadmap created successfully",
      data: roadmap,
    });
  } catch (error) {
    console.error("Create Roadmap Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create roadmap",
    });
  }
};

// ==========================
// UPDATE ROADMAP
// ==========================

const updateRoadmap = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      role,
      isTemplate,
    } = req.body;

    const existingRoadmap =
      await prisma.learningRoadmap.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      });

    if (!existingRoadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    const roadmap =
      await prisma.learningRoadmap.update({
        where: {
          id,
        },
        data: {
          ...(title !== undefined && {
            title: title.trim(),
          }),

          ...(description !== undefined && {
            description:
              description?.trim() || null,
          }),

          ...(role !== undefined && {
            role: role?.trim() || null,
          }),

          ...(isTemplate !== undefined && {
            isTemplate: Boolean(isTemplate),
          }),
        },
        include: {
          modules: {
            orderBy: {
              order: "asc",
            },
            include: {
              topics: {
                orderBy: {
                  order: "asc",
                },
              },
            },
          },
        },
      });

    res.status(200).json({
      success: true,
      message: "Roadmap updated successfully",
      data: roadmap,
    });
  } catch (error) {
    console.error("Update Roadmap Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update roadmap",
    });
  }
};

// ==========================
// DELETE ROADMAP
// ==========================

const deleteRoadmap = async (req, res) => {
  try {
    const { id } = req.params;

    const existingRoadmap =
      await prisma.learningRoadmap.findFirst({
        where: {
          id,
          userId: req.user.id,
        },
      });

    if (!existingRoadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    await prisma.learningRoadmap.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      success: true,
      message: "Roadmap deleted successfully",
    });
  } catch (error) {
    console.error("Delete Roadmap Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete roadmap",
    });
  }
};

// ==========================
// CREATE MODULE
// ==========================

const createModule = async (req, res) => {
  try {
    const { roadmapId } = req.params;

    const {
      title,
      description,
      order,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Module title is required",
      });
    }

    const roadmap =
      await prisma.learningRoadmap.findFirst({
        where: {
          id: roadmapId,
          userId: req.user.id,
        },
      });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: "Roadmap not found",
      });
    }

    const moduleCount =
      await prisma.roadmapModule.count({
        where: {
          roadmapId,
        },
      });

    const newModule =
      await prisma.roadmapModule.create({
        data: {
          roadmapId,
          title: title.trim(),
          description:
            description?.trim() || null,
          order: order ?? moduleCount,
        },
        include: {
          topics: true,
        },
      });

    res.status(201).json({
      success: true,
      message: "Module created successfully",
      data: newModule,
    });
  } catch (error) {
    console.error("Create Module Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create module",
    });
  }
};

// ==========================
// UPDATE MODULE
// ==========================

const updateModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const {
      title,
      description,
      order,
    } = req.body;

    const module =
      await prisma.roadmapModule.findFirst({
        where: {
          id: moduleId,
          roadmap: {
            userId: req.user.id,
          },
        },
      });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    const updatedModule =
      await prisma.roadmapModule.update({
        where: {
          id: moduleId,
        },
        data: {
          ...(title !== undefined && {
            title: title.trim(),
          }),

          ...(description !== undefined && {
            description:
              description?.trim() || null,
          }),

          ...(order !== undefined && {
            order: Number(order),
          }),
        },
        include: {
          topics: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });

    res.status(200).json({
      success: true,
      message: "Module updated successfully",
      data: updatedModule,
    });
  } catch (error) {
    console.error("Update Module Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update module",
    });
  }
};

// ==========================
// DELETE MODULE
// ==========================

const deleteModule = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const module =
      await prisma.roadmapModule.findFirst({
        where: {
          id: moduleId,
          roadmap: {
            userId: req.user.id,
          },
        },
      });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    await prisma.roadmapModule.delete({
      where: {
        id: moduleId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error) {
    console.error("Delete Module Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete module",
    });
  }
};

// ==========================
// CREATE TOPIC
// ==========================

const createTopic = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const {
      title,
      description,
      order,
      dueDate,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Topic title is required",
      });
    }

    const module =
      await prisma.roadmapModule.findFirst({
        where: {
          id: moduleId,
          roadmap: {
            userId: req.user.id,
          },
        },
      });

    if (!module) {
      return res.status(404).json({
        success: false,
        message: "Module not found",
      });
    }

    const topicCount =
      await prisma.roadmapTopic.count({
        where: {
          moduleId,
        },
      });

    const topic =
      await prisma.roadmapTopic.create({
        data: {
          moduleId,
          title: title.trim(),
          description:
            description?.trim() || null,
          order: order ?? topicCount,
          dueDate: dueDate
            ? new Date(dueDate)
            : null,
        },
      });

    res.status(201).json({
      success: true,
      message: "Topic created successfully",
      data: topic,
    });
  } catch (error) {
    console.error("Create Topic Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create topic",
    });
  }
};

// ==========================
// UPDATE TOPIC
// ==========================

const updateTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    const {
      title,
      description,
      order,
      completed,
      dueDate,
    } = req.body;

    const topic =
      await prisma.roadmapTopic.findFirst({
        where: {
          id: topicId,
          module: {
            roadmap: {
              userId: req.user.id,
            },
          },
        },
      });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    const updatedTopic =
      await prisma.roadmapTopic.update({
        where: {
          id: topicId,
        },
        data: {
          ...(title !== undefined && {
            title: title.trim(),
          }),

          ...(description !== undefined && {
            description:
              description?.trim() || null,
          }),

          ...(order !== undefined && {
            order: Number(order),
          }),

          ...(completed !== undefined && {
            completed: Boolean(completed),
          }),

          ...(dueDate !== undefined && {
            dueDate: dueDate
              ? new Date(dueDate)
              : null,
          }),
        },
      });

    res.status(200).json({
      success: true,
      message: "Topic updated successfully",
      data: updatedTopic,
    });
  } catch (error) {
    console.error("Update Topic Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update topic",
    });
  }
};

// ==========================
// DELETE TOPIC
// ==========================

const deleteTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    const topic =
      await prisma.roadmapTopic.findFirst({
        where: {
          id: topicId,
          module: {
            roadmap: {
              userId: req.user.id,
            },
          },
        },
      });

    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    await prisma.roadmapTopic.delete({
      where: {
        id: topicId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Topic deleted successfully",
    });
  } catch (error) {
    console.error("Delete Topic Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete topic",
    });
  }
};

// ==========================
// EXPORTS
// ==========================

module.exports = {
  getRoadmaps,
  getRoadmapById,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  createModule,
  updateModule,
  deleteModule,
  createTopic,
  updateTopic,
  deleteTopic,
};