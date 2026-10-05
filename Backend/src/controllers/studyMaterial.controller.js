const fs = require("fs");
const path = require("path");

const prisma = require("../config/prisma");

const {
  createActivity,
} = require("../services/activity.service");

// ==========================
// PRIVATE STUDY MATERIAL DIRECTORY
// ==========================
const studyMaterialsDirectory =
  path.join(
    process.cwd(),
    "private_uploads",
    "study-materials"
  );

// ==========================
// GET USER STUDY MATERIALS
// GET /api/study-materials
// ==========================
const getStudyMaterials = async (
  req,
  res,
  next
) => {
  try {
    const materials =
      await prisma.studyMaterial.findMany({
        where: {
          userId: req.user.id,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      data: materials,
    });
  } catch (error) {
    console.error(
      "Get Study Materials Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// UPLOAD STUDY MATERIAL
// POST /api/study-materials
// ==========================
const uploadStudyMaterial = async (
  req,
  res,
  next
) => {
  try {
    // ==========================
    // CHECK FILE
    // ==========================
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please select a study material file",
      });
    }

    // ==========================
    // GET TITLE
    // ==========================
    const title =
      typeof req.body?.title ===
      "string"
        ? req.body.title.trim()
        : "";

    if (!title) {
      // Delete uploaded file if title
      // validation fails.
      if (
        req.file.path &&
        fs.existsSync(req.file.path)
      ) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        success: false,
        message:
          "Study material title is required",
      });
    }

    if (title.length > 150) {
      if (
        req.file.path &&
        fs.existsSync(req.file.path)
      ) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        success: false,
        message:
          "Study material title must be 150 characters or less",
      });
    }

    // ==========================
    // CREATE DATABASE RECORD
    // ==========================
    const material =
      await prisma.studyMaterial.create({
        data: {
          userId: req.user.id,

          title,

          fileName:
            req.file.originalname,

          storedName:
            req.file.filename,

          filePath:
            req.file.path,

          fileType:
            req.file.mimetype,

          fileSize:
            req.file.size,
        },
      });

    // ==========================
    // ACTIVITY
    // ==========================
    await createActivity({
      userId: req.user.id,

      type: "STUDY_MATERIAL_UPLOADED",

      title:
        "Study material uploaded",

      description:
        `"${title}" was uploaded successfully`,
    });

    return res.status(201).json({
      success: true,

      message:
        "Study material uploaded successfully",

      data: material,
    });
  } catch (error) {
    // ==========================
    // CLEANUP FILE IF DB CREATION
    // FAILS
    // ==========================
    if (
      req.file?.path &&
      fs.existsSync(req.file.path)
    ) {
      try {
        fs.unlinkSync(
          req.file.path
        );
      } catch (cleanupError) {
        console.error(
          "Study Material File Cleanup Error:",
          cleanupError.message
        );
      }
    }

    console.error(
      "Upload Study Material Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// VIEW STUDY MATERIAL
// GET /api/study-materials/:id/view
// ==========================
const viewStudyMaterial = async (
  req,
  res,
  next
) => {
  try {
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
        message:
          "Study material not found",
      });
    }

    if (
      !fs.existsSync(
        material.filePath
      )
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Study material file not found",
      });
    }

    return res.sendFile(
      path.resolve(
        material.filePath
      )
    );
  } catch (error) {
    console.error(
      "View Study Material Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// DOWNLOAD STUDY MATERIAL
// GET /api/study-materials/:id/download
// ==========================
const downloadStudyMaterial =
  async (
    req,
    res,
    next
  ) => {
    try {
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
          message:
            "Study material not found",
        });
      }

      if (
        !fs.existsSync(
          material.filePath
        )
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Study material file not found",
        });
      }

      return res.download(
        path.resolve(
          material.filePath
        ),
        material.fileName
      );
    } catch (error) {
      console.error(
        "Download Study Material Error:",
        error.message
      );

      return next(error);
    }
  };

// ==========================
// DELETE STUDY MATERIAL
// DELETE /api/study-materials/:id
// ==========================
const removeStudyMaterial =
  async (
    req,
    res,
    next
  ) => {
    try {
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
          message:
            "Study material not found",
        });
      }

      // ==========================
      // DELETE DATABASE RECORD
      // ==========================
      await prisma.studyMaterial.delete({
        where: {
          id: material.id,
        },
      });

      // ==========================
      // DELETE PHYSICAL FILE
      // ==========================
      if (
        material.filePath &&
        fs.existsSync(
          material.filePath
        )
      ) {
        try {
          fs.unlinkSync(
            material.filePath
          );
        } catch (fileError) {
          console.error(
            "Study Material File Delete Error:",
            fileError.message
          );
        }
      }

      // ==========================
      // ACTIVITY
      // ==========================
      await createActivity({
        userId: req.user.id,

        type: "STUDY_MATERIAL_DELETED",

        title:
          "Study material deleted",

        description:
          `"${material.title}" was deleted`,
      });

      return res.status(200).json({
        success: true,

        message:
          "Study material deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete Study Material Error:",
        error.message
      );

      return next(error);
    }
  };

module.exports = {
  getStudyMaterials,
  uploadStudyMaterial,
  viewStudyMaterial,
  downloadStudyMaterial,
  removeStudyMaterial,
};