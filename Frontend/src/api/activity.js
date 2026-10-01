import api from "./axios";

export const getActivities = () => {
  return api.get("/activities");
};