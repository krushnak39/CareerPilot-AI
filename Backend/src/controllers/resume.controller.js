const fs = require("fs");

const path = require("path");

const prisma = require("../config/prisma");

const { createActivity } = require("../services/activity.service");

const {
  createResume,
  getUserResumes,
  deleteResume,
  updateResume,
  updateResumeTitle,
  getResumeHistory,
  setPrimaryResume,
} = require("../services/resume.service");

// ==========================
// HELPER: DELETE NEW FILE
// IF DATABASE ACTION FAILS
// ==========================

const cleanupUploadedFile = (file) => {
  try {
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  } catch (error) {
    console.error(
      "Uploaded File Cleanup Error:",
      error.message
    );
  }
};

// ==========================
// UPLOAD RESUME
// ==========================

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a resume file",
      });
    }

    const resume = await createResume({
      userId: req.user.id,
      title: req.body?.title,
      fileName: req.file.originalname,
      fileUrl: `/uploads/resumes/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });

    await createActivity({
      userId: req.user.id,
      type: "RESUME_UPLOADED",
      title: "Resume uploaded",
      description: resume.fileName,
    });

    return res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      data: resume,
    });
  } catch (error) {
    console.error(
      "Resume Upload Error:",
      error.message
    );

    cleanupUploadedFile(req.file);

    return next(error);
  }
};

// ==========================
// GET USER RESUMES
// ==========================

const getResumes = async (req, res, next) => {
  try {
    const resumes = await getUserResumes(req.user.id);

    return res.status(200).json({
      success: true,
      data: resumes,
    });
  } catch (error) {
    console.error(
      "Get Resumes Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// SET PRIMARY RESUME
// ==========================

const makePrimaryResume = async (req, res, next) => {
  try {
    const resume = await setPrimaryResume({
      resumeId: req.params.id,
      userId: req.user.id,
    });

    await createActivity({
      userId: req.user.id,
      type: "PRIMARY_RESUME_CHANGED",
      title: "Primary resume changed",
      description: resume.fileName,
    });

    return res.status(200).json({
      success: true,
      message: "Primary resume updated successfully",
      data: resume,
    });
  } catch (error) {
    console.error(
      "Set Primary Resume Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// UPDATE RESUME TITLE
// ==========================

const updateResumeTitleController = async (
  req,
  res,
  next
) => {
  try {
    const { title } = req.body;

    if (
      title !== undefined &&
      typeof title !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Resume title must be text",
      });
    }

    if (
      typeof title === "string" &&
      title.trim().length > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Resume title must be 100 characters or fewer",
      });
    }

    const resume = await updateResumeTitle({
      resumeId: req.params.id,
      userId: req.user.id,
      title,
    });

    return res.status(200).json({
      success: true,
      message: "Resume title updated successfully",
      data: resume,
    });
  } catch (error) {
    console.error(
      "Update Resume Title Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// REPLACE RESUME
// ==========================

const replaceResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a new resume file",
      });
    }

    const resume = await updateResume({
      resumeId: req.params.id,
      userId: req.user.id,
      title: req.body?.title,
      fileName: req.file.originalname,
      fileUrl: `/uploads/resumes/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });

    await createActivity({
      userId: req.user.id,
      type: "RESUME_REPLACED",
      title: "Resume replaced",
      description: resume.fileName,
    });

    return res.status(200).json({
      success: true,
      message: "Resume replaced successfully",
      data: resume,
    });
  } catch (error) {
    console.error(
      "Resume Replace Error:",
      error.message
    );

    cleanupUploadedFile(req.file);

    return next(error);
  }
};

// ==========================
// DOWNLOAD CURRENT RESUME
// ==========================

const downloadResume = async (req, res, next) => {
  try {
    const resume = await prisma.resume.findFirst({
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

    const relativePath = resume.fileUrl.replace(
      /^\/+/,
      ""
    );

    const filePath = path.join(
      process.cwd(),
      relativePath
    );

    return res.download(
      filePath,
      resume.fileName
    );
  } catch (error) {
    console.error(
      "Resume Download Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// GET RESUME HISTORY
// ==========================

const getResumeHistoryController = async (
  req,
  res,
  next
) => {
  try {
    const history = await getResumeHistory({
      resumeId: req.params.id,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error(
      "Resume History Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// DELETE RESUME
// ==========================

const removeResume = async (req, res, next) => {
  try {
    const resume = await deleteResume({
      resumeId: req.params.id,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Resume deleted successfully",
      data: resume,
    });
  } catch (error) {
    console.error(
      "Resume Delete Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// VIEW CURRENT RESUME
// ==========================

const viewResume = async (req, res, next) => {
  try {
    const resume = await prisma.resume.findFirst({
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

    const relativePath = resume.fileUrl.replace(
      /^\/+/,
      ""
    );

    const filePath = path.join(
      process.cwd(),
      relativePath
    );

    return res.sendFile(filePath);
  } catch (error) {
    console.error(
      "Resume View Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// VIEW RESUME HISTORY VERSION
// ==========================

const viewResumeVersion = async (
  req,
  res,
  next
) => {
  try {
    const version =
      await prisma.resumeVersion.findFirst({
        where: {
          id: req.params.versionId,
          resume: {
            id: req.params.id,
            userId: req.user.id,
          },
        },
      });

    if (!version) {
      return res.status(404).json({
        success: false,
        message: "Resume version not found",
      });
    }

    const relativePath = version.fileUrl.replace(
      /^\/+/,
      ""
    );

    const filePath = path.join(
      process.cwd(),
      relativePath
    );

    return res.sendFile(filePath);
  } catch (error) {
    console.error(
      "Resume Version View Error:",
      error.message
    );

    return next(error);
  }
};

module.exports = {
  uploadResume,
  getResumes,
  makePrimaryResume,
  updateResumeTitleController,
  getResumeHistoryController,
  removeResume,
  replaceResume,
  downloadResume,
  viewResume,
  viewResumeVersion,
};