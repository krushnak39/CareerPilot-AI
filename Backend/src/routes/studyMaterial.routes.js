const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  getStudyMaterials,
  uploadStudyMaterial,
  viewStudyMaterial,
  downloadStudyMaterial,
  removeStudyMaterial,
} = require("../controllers/studyMaterial.controller");

const authMiddleware =
  require("../middleware/auth.middleware");

const router = express.Router();

// ==========================
// PRIVATE STORAGE DIRECTORY
// ==========================
const storageDirectory =
  path.join(
    process.cwd(),
    "private_uploads",
    "study-materials"
  );

fs.mkdirSync(
  storageDirectory,
  {
    recursive: true,
  }
);

// ==========================
// MULTER STORAGE
// ==========================
const storage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        storageDirectory
      );
    },

    filename: (
      req,
      file,
      cb
    ) => {
      const extension =
        path.extname(
          file.originalname
        );

      const uniqueName =
        `${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${extension}`;

      cb(
        null,
        uniqueName
      );
    },
  });

// ==========================
// ALLOWED FILE TYPES
// ==========================
const allowedMimeTypes = [
  "application/pdf",

  "application/msword",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.ms-powerpoint",

  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  "image/jpeg",

  "image/png",

  "image/gif",

  "image/webp",
];

// ==========================
// FILE FILTER
// ==========================
const fileFilter = (
  req,
  file,
  cb
) => {
  if (
    allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    cb(
      null,
      true
    );
  } else {
    const error =
      new Error(
        "Only PDF, DOC, DOCX, PPT, PPTX, JPG, JPEG, PNG, GIF and WEBP files are allowed"
      );

    error.statusCode = 400;

    cb(
      error,
      false
    );
  }
};

// ==========================
// MULTER CONFIG
// ==========================
const upload =
  multer({
    storage,

    fileFilter,

    limits: {
      fileSize:
        20 * 1024 * 1024,
    },
  });

// ==========================
// GET USER MATERIALS
// GET /api/study-materials
// ==========================
router.get(
  "/",
  authMiddleware,
  getStudyMaterials
);

// ==========================
// UPLOAD MATERIAL
// POST /api/study-materials
// ==========================
router.post(
  "/",
  authMiddleware,
  upload.single("material"),
  uploadStudyMaterial
);

// ==========================
// VIEW MATERIAL
// GET /api/study-materials/:id/view
// ==========================
router.get(
  "/:id/view",
  authMiddleware,
  viewStudyMaterial
);

// ==========================
// DOWNLOAD MATERIAL
// GET /api/study-materials/:id/download
// ==========================
router.get(
  "/:id/download",
  authMiddleware,
  downloadStudyMaterial
);

// ==========================
// DELETE MATERIAL
// DELETE /api/study-materials/:id
// ==========================
router.delete(
  "/:id",
  authMiddleware,
  removeStudyMaterial
);

// ==========================
// EXPORT ROUTER
// ==========================
module.exports = router;