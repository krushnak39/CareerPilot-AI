const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middleware/auth.middleware");

const {
  getLearningResources,
  startLearningResource,
  updateLearningProgress,
} = require("../controllers/learning.controller");

// ==========================
// GET LEARNING RESOURCES
// GET /api/learning/resources
// ==========================
router.get(
  "/resources",
  authMiddleware,
  getLearningResources
);

// ==========================
// START LEARNING RESOURCE
// POST /api/learning/resources/:resourceId/start
// ==========================
router.post(
  "/resources/:resourceId/start",
  authMiddleware,
  startLearningResource
);

router.patch(
  "/resources/:resourceId/progress",
  authMiddleware,
  updateLearningProgress
);

module.exports = router;