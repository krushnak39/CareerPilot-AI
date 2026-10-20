const express = require("express");

const cors = require("cors");

const helmet = require("helmet");

const morgan = require("morgan");

const fs = require("fs");

const path = require("path");

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

const activityRoutes =
  require("./routes/activity.routes");

const learningRoutes =
  require("./routes/learning.routes");

const studyMaterialRoutes =
  require("./routes/studyMaterial.routes");

const learningRoadmapRoutes =
  require("./routes/learningRoadmap.routes");

const {
  notFoundHandler,
  errorHandler,
} = require(
  "./middleware/error.middleware"
);

const app = express();

// Render / Railway / Vercel sit behind a proxy. Needed so
// rate limiting and client IPs work correctly in production.
app.set("trust proxy", 1);

// Make sure upload folders exist (they are git-ignored, so a
// fresh deployment would otherwise fail on the first upload).
["uploads/resumes", "private_uploads"].forEach(
  (dir) =>
    fs.mkdirSync(
      path.join(process.cwd(), dir),
      { recursive: true }
    )
);

// Comma-separated list of allowed frontend origins, e.g.
// CORS_ORIGINS=https://careerpilot.vercel.app,http://localhost:5173
const allowedOrigins = (
  process.env.CORS_ORIGINS ||
  process.env.FRONTEND_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((origin) =>
    origin.trim().replace(/\/+$/, "")
  )
  .filter(Boolean);

// ==========================
// MIDDLEWARE
// ==========================

app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser tools (no Origin header)
      if (
        !origin ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(
          `Origin ${origin} not allowed by CORS`
        )
      );
    },
    credentials: true,
  })
);

app.use(
  helmet({
    // frontend is on a different domain and loads /uploads files
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  "/uploads",
  express.static(
    path.join(
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

app.use(
  "/api/activities",
  activityRoutes
);

app.use(
  "/api/learning",
  learningRoutes
);

app.use(
  "/api/study-materials",
  studyMaterialRoutes
);

app.use(
  "/api/learning-roadmaps",
  learningRoadmapRoutes
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