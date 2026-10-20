const {
  createActivity,
  getUserActivities,
} = require("../services/activity.service");

const createActivityController = async (req, res) => {
  try {
    const { type, title, description } = req.body;

    if (!type || !title) {
      return res.status(400).json({
        success: false,
        message: "Activity type and title are required",
      });
    }

    const activity = await createActivity({
      userId: req.user.id,
      type,
      title,
      description,
    });

    res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    console.error("Create activity error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create activity",
    });
  }
};

const getActivities = async (req, res) => {
  try {
    const activities = await getUserActivities(req.user.id);

    res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error("Get activities error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load activities",
    });
  }
};

module.exports = {
  createActivityController,
  getActivities,
};