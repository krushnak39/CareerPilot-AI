const express = require("express");

const {
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
} = require("../controllers/learningRoadmap.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

// ==========================
// ROADMAP ROUTES
// ==========================

// Get all roadmaps
router.get(
  "/",
  authMiddleware,
  getRoadmaps
);

// Get one roadmap
router.get(
  "/:id",
  authMiddleware,
  getRoadmapById
);

// Create roadmap
router.post(
  "/",
  authMiddleware,
  createRoadmap
);

// Update roadmap
router.put(
  "/:id",
  authMiddleware,
  updateRoadmap
);

// Delete roadmap
router.delete(
  "/:id",
  authMiddleware,
  deleteRoadmap
);

// ==========================
// MODULE ROUTES
// ==========================

// Create module inside roadmap
router.post(
  "/:roadmapId/modules",
  authMiddleware,
  createModule
);

// Update module
router.put(
  "/modules/:moduleId",
  authMiddleware,
  updateModule
);

// Delete module
router.delete(
  "/modules/:moduleId",
  authMiddleware,
  deleteModule
);

// ==========================
// TOPIC ROUTES
// ==========================

// Create topic inside module
router.post(
  "/modules/:moduleId/topics",
  authMiddleware,
  createTopic
);

// Update topic
router.put(
  "/topics/:topicId",
  authMiddleware,
  updateTopic
);

// Delete topic
router.delete(
  "/topics/:topicId",
  authMiddleware,
  deleteTopic
);

module.exports = router;