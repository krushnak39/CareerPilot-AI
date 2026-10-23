import api from "./axios";

// ==========================
// UPLOAD RESUME
// ==========================
export const uploadResume = async (
  file,
  title = ""
) => {
  const formData =
    new FormData();

  formData.append(
    "resume",
    file
  );

  if (title.trim()) {
    formData.append(
      "title",
      title.trim()
    );
  }

  const response =
    await api.post(
      "/resumes",
      formData
    );

  return response.data;
};

// ==========================
// GET USER RESUMES
// ==========================
export const getResumes = async () => {
  const response =
    await api.get(
      "/resumes"
    );

  return response.data;
};

// ==========================
// SET PRIMARY RESUME
// ==========================
export const setPrimaryResume = async (
  resumeId
) => {
  const response =
    await api.patch(
      `/resumes/${resumeId}/primary`
    );

  return response.data;
};

// ==========================
// UPDATE RESUME TITLE
// ==========================
export const updateResumeTitle = async (
  resumeId,
  title
) => {
  const response =
    await api.patch(
      `/resumes/${resumeId}/title`,
      {
        title,
      }
    );

  return response.data;
};

// ==========================
// REPLACE RESUME
// ==========================
export const replaceResume = async (
  resumeId,
  file,
  title
) => {
  const formData =
    new FormData();

  formData.append(
    "resume",
    file
  );

  if (
    title !== undefined
  ) {
    formData.append(
      "title",
      title
    );
  }

  const response =
    await api.put(
      `/resumes/${resumeId}`,
      formData
    );

  return response.data;
};

// ==========================
// VIEW CURRENT RESUME
// ==========================
export const viewResume = async (
  resumeId
) => {
  const response =
    await api.get(
      `/resumes/${resumeId}/view`,
      {
        responseType:
          "blob",
      }
    );

  return response;
};

// ==========================
// VIEW HISTORY VERSION
// ==========================
export const viewResumeVersion = async (
  resumeId,
  versionId
) => {
  const response =
    await api.get(
      `/resumes/${resumeId}/history/${versionId}/view`,
      {
        responseType:
          "blob",
      }
    );

  return response;
};

// ==========================
// DOWNLOAD CURRENT RESUME
// ==========================
export const downloadResume = async (
  resumeId
) => {
  const response =
    await api.get(
      `/resumes/${resumeId}/download`,
      {
        responseType:
          "blob",
      }
    );

  return response;
};

// ==========================
// GET RESUME HISTORY
// ==========================
export const getResumeHistory = async (
  resumeId
) => {
  const response =
    await api.get(
      `/resumes/${resumeId}/history`
    );

  return response.data;
};

// ==========================
// DELETE RESUME
// ==========================
export const deleteResume = async (
  resumeId
) => {
  const response =
    await api.delete(
      `/resumes/${resumeId}`
    );

  return response.data;
};