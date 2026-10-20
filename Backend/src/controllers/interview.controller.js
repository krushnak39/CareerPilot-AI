const {
  createInterviewSession,
  getUserInterviewSessions,
  getInterviewSessionById,
  updateInterviewSession,
  deleteInterviewSession,
} = require("../services/interview.service");

const { createActivity } = require("../services/activity.service");

// ==========================
// CREATE INTERVIEW SESSION
// ==========================
const createInterview = async (
  req,
  res,
  next
) => {
  try {
    const {
      title,
      type,
      company,
      role,
      status,
      scheduledAt,
      notes,
    } = req.body;

    const interview =
      await createInterviewSession({
        userId:
          req.user.id,

        title,
        type,
        company,
        role,
        status,
        scheduledAt,
        notes,
      });

      await createActivity({
        userId: req.user.id,
        type: "INTERVIEW_CREATED",
        title: "Interview session created",
        description: `${interview.title}${interview.company ? ` at ${interview.company}` : ""}`,
      });

    return res.status(201).json({
      success: true,
      message:
        "Interview session created successfully",
      data: interview,
    });
  } catch (error) {
    console.error(
      "Create Interview Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// GET ALL USER INTERVIEWS
// ==========================
const getInterviews = async (
  req,
  res,
  next
) => {
  try {
    const interviews =
      await getUserInterviewSessions(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data: interviews,
    });
  } catch (error) {
    console.error(
      "Get Interviews Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// GET SINGLE INTERVIEW
// ==========================
const getInterview = async (
  req,
  res,
  next
) => {
  try {
    const interview =
      await getInterviewSessionById({
        interviewId:
          req.params.id,

        userId:
          req.user.id,
      });

    return res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.error(
      "Get Interview Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// UPDATE INTERVIEW SESSION
// ==========================
const updateInterview = async (
  req,
  res,
  next
) => {
  try {
    const {
      title,
      type,
      company,
      role,
      status,
      scheduledAt,
      notes,
    } = req.body;

    const interview =
      await updateInterviewSession({
        interviewId:
          req.params.id,

        userId:
          req.user.id,

        title,
        type,
        company,
        role,
        status,
        scheduledAt,
        notes,
      });

      await createActivity({
        userId: req.user.id,
        type: "INTERVIEW_UPDATED",
        title: "Interview session updated",
        description: `${interview.title}${interview.company ? ` at ${interview.company}` : ""}`,
      });

    return res.status(200).json({
      success: true,
      message:
        "Interview session updated successfully",
      data: interview,
    });
  } catch (error) {
    console.error(
      "Update Interview Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// DELETE INTERVIEW SESSION
// ==========================
const removeInterview = async (
  req,
  res,
  next
) => {
  try {
    const interview =
      await deleteInterviewSession({
        interviewId:
          req.params.id,

        userId:
          req.user.id,
      });

      await createActivity({
        userId: req.user.id,
        type: "INTERVIEW_DELETED",
        title: "Interview session deleted",
        description: `${interview.title}${interview.company ? ` at ${interview.company}` : ""}`,
      });

    return res.status(200).json({
      success: true,
      message:
        "Interview session deleted successfully",
      data: interview,
    });
  } catch (error) {
    console.error(
      "Delete Interview Error:",
      error.message
    );

    return next(error);
  }
};

module.exports = {
  createInterview,
  getInterviews,
  getInterview,
  updateInterview,
  removeInterview,
};