
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  uploadResume,
  getResumes,
  removeResume,
  replaceResume,
  downloadResume,
  getResumeHistoryController,
  viewResume,
  viewResumeVersion,
  makePrimaryResume,
  updateResumeTitleController,
} = require("../controllers/resume.controller");

const authMiddleware =
  require("../middleware/auth.middleware");

const router = express.Router();

// ==========================
// 📁 RESUME STORAGE DIRECTORY
// ==========================
const resumeStorageDirectory = path.join(
  process.cwd(),
  "uploads",
  "resumes"
);

// Automatically create the folder if it doesn't exist
fs.mkdirSync(resumeStorageDirectory, {
  recursive: true,
});

// ==========================
// 📦 MULTER STORAGE
// ==========================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resumeStorageDirectory);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${path.extname(file.originalname)}`;

    cb(null, uniqueName);
  },
});

// ==========================
// 🛡️ FILE FILTER
// ==========================
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    return cb(null, true);
  }

  const error = new Error(
    "Only PDF resumes are allowed"
  );

  error.statusCode = 400;

  return cb(error, false);
};

// ==========================
// ⚙️ MULTER CONFIGURATION
// ==========================
const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024, // Maximum: 5 MB
  },
});

// ==========================
// ⬆️ UPLOAD RESUME
// POST /api/resumes
// ==========================
router.post(
  "/",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

// ==========================
// 📋 GET USER RESUMES
// GET /api/resumes
// ==========================
router.get(
  "/",
  authMiddleware,
  getResumes
);

// ==========================
// ⭐ SET PRIMARY RESUME
// PATCH /api/resumes/:id/primary
// ==========================
router.patch(
  "/:id/primary",
  authMiddleware,
  makePrimaryResume
);

// ==========================
// ✏️ UPDATE RESUME TITLE
// PATCH /api/resumes/:id/title
// ==========================
router.patch(
  "/:id/title",
  authMiddleware,
  updateResumeTitleController
);

// ==========================
// 🕘 GET RESUME HISTORY
// GET /api/resumes/:id/history
// ==========================
router.get(
  "/:id/history",
  authMiddleware,
  getResumeHistoryController
);

// ==========================
// 👁️ VIEW CURRENT RESUME
// GET /api/resumes/:id/view
// ==========================
router.get(
  "/:id/view",
  authMiddleware,
  viewResume
);

// ==========================
// 📄 VIEW HISTORY VERSION
// GET /api/resumes/:id/history/:versionId/view
// ==========================
router.get(
  "/:id/history/:versionId/view",
  authMiddleware,
  viewResumeVersion
);

// ==========================
// ⬇️ DOWNLOAD RESUME
// GET /api/resumes/:id/download
// ==========================
router.get(
  "/:id/download",
  authMiddleware,
  downloadResume
);

// ==========================
// 🔄 REPLACE RESUME
// PUT /api/resumes/:id
// ==========================
router.put(
  "/:id",
  authMiddleware,
  upload.single("resume"),
  replaceResume
);

// ==========================
// 🗑️ DELETE RESUME
// DELETE /api/resumes/:id
// ==========================
router.delete(
  "/:id",
  authMiddleware,
  removeResume
);

module.exports = router;
