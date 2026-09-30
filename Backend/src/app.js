const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes =
  require("./routes/auth.routes");

const dashboardRoutes =
  require("./routes/dashboard.routes");

const resumeRoutes =
  require("./routes/resume.routes");

const profileRoutes =
  require("./routes/profile.routes");

const jobRoutes =
  require("./routes/job.routes");

const interviewRoutes =
  require("./routes/interview.routes");

const {
  notFoundHandler,
  errorHandler,
} = require(
  "./middleware/error.middleware"
);

const app = express();

// ==========================
// MIDDLEWARE
// ==========================
app.use(cors());

app.use(helmet());

app.use(morgan("dev"));

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  "/uploads",
  express.static(
    require("path").join(
      process.cwd(),
      "uploads"
    )
  )
);

// ==========================
// HEALTH CHECK
// ==========================
app.get(
  "/api/health",
  (req, res) => {
    res.json({
      success: true,
      message:
        "CareerPilot AI Backend is running 🚀",
    });
  }
);

// ==========================
// ROUTES
// ==========================
app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/dashboard",
  dashboardRoutes
);

app.use(
  "/api/resumes",
  resumeRoutes
);

app.use(
  "/api/profile",
  profileRoutes
);

app.use(
  "/api/jobs",
  jobRoutes
);

app.use(
  "/api/interviews",
  interviewRoutes
);

// ==========================
// 404 HANDLER
// MUST BE AFTER ROUTES
// ==========================
app.use(
  notFoundHandler
);

// ==========================
// GLOBAL ERROR HANDLER
// MUST BE LAST
// ==========================
app.use(
  errorHandler
);

module.exports = app;