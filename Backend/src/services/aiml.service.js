const fs = require("fs");
const path = require("path");

const AIML_SERVICE_URL = (
  process.env.AIML_SERVICE_URL || "http://localhost:8000"
).replace(/\/+$/, "");

const AIML_TIMEOUT_MS = Number(process.env.AIML_TIMEOUT_MS) || 120000;

// ==========================
// ANALYZE A RESUME FILE
// Sends the stored PDF to the Python AIML service
// ==========================
const analyzeResumeFile = async ({
  filePath,
  fileName,
  jobDescription,
}) => {
  if (!fs.existsSync(filePath)) {
    const error = new Error(
      "Resume file is no longer available on the server. Please upload it again."
    );
    error.statusCode = 404;
    throw error;
  }

  const form = new FormData();

  form.append(
    "resume",
    new Blob([fs.readFileSync(filePath)], {
      type: "application/pdf",
    }),
    fileName || path.basename(filePath)
  );

  if (jobDescription && jobDescription.trim()) {
    form.append(
      "job_description",
      jobDescription.trim()
    );
  }

  const headers = {};

  if (process.env.AIML_SERVICE_KEY) {
    headers["X-AIML-KEY"] =
      process.env.AIML_SERVICE_KEY;
  }

  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    AIML_TIMEOUT_MS
  );

  try {
    const response = await fetch(
      `${AIML_SERVICE_URL}/analyze`,
      {
        method: "POST",
        body: form,
        headers,
        signal: controller.signal,
      }
    );

    const body = await response
      .json()
      .catch(() => null);

    if (!response.ok || !body?.success) {
      const error = new Error(
        body?.message ||
          "Resume analysis failed"
      );

      error.statusCode =
        response.status === 422 ? 422 : 502;

      throw error;
    }

    return body.data;
  } catch (error) {
    if (error.name === "AbortError") {
      const timeout = new Error(
        "Resume analysis timed out. The AI service may be waking up - please try again in a minute."
      );

      timeout.statusCode = 504;

      throw timeout;
    }

    if (!error.statusCode) {
      const unreachable = new Error(
        "AI analysis service is unreachable. Please try again shortly."
      );

      unreachable.statusCode = 503;

      throw unreachable;
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
};

// ==========================
// STUDY MATERIAL ACTIONS
// ask | summary | flashcards | quiz
// ==========================
const runStudyAction = async ({
  filePath,
  fileName,
  action,
  question,
}) => {
  if (!fs.existsSync(filePath)) {
    const error = new Error(
      "Study material file is no longer available on the server. Please upload it again."
    );
    error.statusCode = 404;
    throw error;
  }

  const form = new FormData();

  form.append(
    "file",
    new Blob([fs.readFileSync(filePath)]),
    fileName || path.basename(filePath)
  );

  form.append("action", action);

  if (question) {
    form.append("question", question);
  }

  const headers = {};

  if (process.env.AIML_SERVICE_KEY) {
    headers["X-AIML-KEY"] =
      process.env.AIML_SERVICE_KEY;
  }

  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    AIML_TIMEOUT_MS
  );

  try {
    const response = await fetch(
      `${AIML_SERVICE_URL}/study`,
      {
        method: "POST",
        body: form,
        headers,
        signal: controller.signal,
      }
    );

    const body = await response
      .json()
      .catch(() => null);

    if (!response.ok || !body?.success) {
      const error = new Error(
        body?.message ||
          "Study assistant failed"
      );

      error.statusCode =
        response.status === 422 ||
        response.status === 400
          ? 422
          : 502;

      throw error;
    }

    return body.data;
  } catch (error) {
    if (error.name === "AbortError") {
      const timeout = new Error(
        "The AI service timed out. It may be waking up - please try again in a minute."
      );

      timeout.statusCode = 504;

      throw timeout;
    }

    if (!error.statusCode) {
      const unreachable = new Error(
        "AI service is unreachable. Please try again shortly."
      );

      unreachable.statusCode = 503;

      throw unreachable;
    }

    throw error;
  } finally {
    clearTimeout(timer);
  }
};

module.exports = {
  analyzeResumeFile,
  runStudyAction,
};
