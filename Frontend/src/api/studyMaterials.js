import api from "./axios";

// Get all study materials
export const getStudyMaterials = async () => {
  const response = await api.get(
    "/study-materials"
  );

  return response.data;
};

// Upload a study material
export const uploadStudyMaterial = async (
  file,
  title
) => {
  const formData = new FormData();

  formData.append(
    "title",
    title
  );

  formData.append(
    "material",
    file
  );

  const response = await api.post(
    "/study-materials",
    formData
  );

  return response.data;
};

// View a study material
export const viewStudyMaterial = async (
  materialId
) => {
  return await api.get(
    `/study-materials/${materialId}/view`,
    {
      responseType: "blob",
    }
  );
};

// Download a study material
export const downloadStudyMaterial = async (
  materialId
) => {
  return await api.get(
    `/study-materials/${materialId}/download`,
    {
      responseType: "blob",
    }
  );
};

// Delete a study material
export const deleteStudyMaterial = async (
  materialId
) => {
  const response = await api.delete(
    `/study-materials/${materialId}`
  );

  return response.data;
};

// AI assistant: ask | summary | flashcards | quiz
export const runStudyAssistant = async (
  materialId,
  action,
  question = ""
) => {
  const response = await api.post(
    `/study-materials/${materialId}/ai`,
    { action, question },
    { timeout: 150000 }
  );

  return response.data;
};
