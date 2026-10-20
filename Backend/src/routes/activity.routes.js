const express = require("express");

const {
  createActivityController,
  getActivities,
} = require("../controllers/activity.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware, createActivityController);

router.get("/", authMiddleware, getActivities);

module.exports = router;