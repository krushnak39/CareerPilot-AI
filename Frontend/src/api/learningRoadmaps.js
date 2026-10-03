import api from "./axios";

// Get all learning roadmaps
export const getLearningRoadmaps = async () => {
  const response = await api.get("/learning-roadmaps");
  return response.data;
};

// Get one learning roadmap
export const getLearningRoadmap = async (roadmapId) => {
  const response = await api.get(`/learning-roadmaps/${roadmapId}`);
  return response.data;
};

// Create a learning roadmap
export const createLearningRoadmap = async (roadmapData) => {
  const response = await api.post("/learning-roadmaps", roadmapData);
  return response.data;
};

// Update a learning roadmap
export const updateLearningRoadmap = async (roadmapId, roadmapData) => {
  const response = await api.put(
    `/learning-roadmaps/${roadmapId}`,
    roadmapData
  );
  return response.data;
};

// Delete a learning roadmap
export const deleteLearningRoadmap = async (roadmapId) => {
  const response = await api.delete(`/learning-roadmaps/${roadmapId}`);
  return response.data;
};

// Create a module inside a roadmap
export const createRoadmapModule = async (roadmapId, moduleData) => {
  const response = await api.post(
    `/learning-roadmaps/${roadmapId}/modules`,
    moduleData
  );
  return response.data;
};

// Update a roadmap module
export const updateRoadmapModule = async (moduleId, moduleData) => {
  const response = await api.put(
    `/learning-roadmaps/modules/${moduleId}`,
    moduleData
  );
  return response.data;
};

// Delete a roadmap module
export const deleteRoadmapModule = async (moduleId) => {
  const response = await api.delete(
    `/learning-roadmaps/modules/${moduleId}`
  );
  return response.data;
};

// Create a topic inside a module
export const createRoadmapTopic = async (moduleId, topicData) => {
  const response = await api.post(
    `/learning-roadmaps/modules/${moduleId}/topics`,
    topicData
  );
  return response.data;
};

// Update a roadmap topic
export const updateRoadmapTopic = async (topicId, topicData) => {
  const response = await api.put(
    `/learning-roadmaps/topics/${topicId}`,
    topicData
  );
  return response.data;
};

// Delete a roadmap topic
export const deleteRoadmapTopic = async (topicId) => {
  const response = await api.delete(
    `/learning-roadmaps/topics/${topicId}`
  );
  return response.data;
};