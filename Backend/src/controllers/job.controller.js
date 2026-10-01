const {
  createJobApplication,
  getUserJobApplications,
  getJobApplicationById,
  updateJobApplication,
  deleteJobApplication,
} = require("../services/job.service");
const { createActivity } = require("../services/activity.service");

// ==========================
// CREATE JOB APPLICATION
// ==========================
const createJob = async (
  req,
  res,
  next
) => {
  try {
    const {
      jobTitle,
      company,
      location,
      jobType,
      description,
      status,
      appliedDate,
    } = req.body;

    const job =
      await createJobApplication({
        userId:
          req.user.id,

        jobTitle,
        company,
        location,
        jobType,
        description,
        status,
        appliedDate,
      });
      await createActivity({
        userId: req.user.id,
        type: "JOB_APPLICATION_ADDED",
        title: "Job application added",
        description: `${job.jobTitle} at ${job.company}`,
      });

    return res.status(201).json({
      success: true,
      message:
        "Job application created successfully",
      data: job,
    });
  } catch (error) {
    console.error(
      "Create Job Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// GET ALL USER JOBS
// ==========================
const getJobs = async (
  req,
  res,
  next
) => {
  try {
    const jobs =
      await getUserJobApplications(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error(
      "Get Jobs Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// GET SINGLE JOB
// ==========================
const getJob = async (
  req,
  res,
  next
) => {
  try {
    const job =
      await getJobApplicationById({
        jobId:
          req.params.id,

        userId:
          req.user.id,
      });

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error(
      "Get Job Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// UPDATE JOB APPLICATION
// ==========================
const updateJob = async (
  req,
  res,
  next
) => {
  try {
    const {
      jobTitle,
      company,
      location,
      jobType,
      description,
      status,
      appliedDate,
    } = req.body;

    const job =
      await updateJobApplication({
        jobId:
          req.params.id,

        userId:
          req.user.id,

        jobTitle,
        company,
        location,
        jobType,
        description,
        status,
        appliedDate,
      });

      await createActivity({
        userId: req.user.id,
        type: "JOB_APPLICATION_UPDATED",
        title: "Job application updated",
        description: `${job.jobTitle} at ${job.company}`,
      });

    return res.status(200).json({
      success: true,
      message:
        "Job application updated successfully",
      data: job,
    });
  } catch (error) {
    console.error(
      "Update Job Error:",
      error.message
    );

    return next(error);
  }
};

// ==========================
// DELETE JOB APPLICATION
// ==========================
const removeJob = async (
  req,
  res,
  next
) => {
  try {
    const job =
      await deleteJobApplication({
        jobId:
          req.params.id,

        userId:
          req.user.id,
      });

      await createActivity({
        userId: req.user.id,
        type: "JOB_APPLICATION_DELETED",
        title: "Job application deleted",
        description: `${job.jobTitle} at ${job.company}`,
      });

    return res.status(200).json({
      success: true,
      message:
        "Job application deleted successfully",
      data: job,
    });
  } catch (error) {
    console.error(
      "Delete Job Error:",
      error.message
    );

    return next(error);
  }
};

module.exports = {
  createJob,
  getJobs,
  getJob,
  updateJob,
  removeJob,
};