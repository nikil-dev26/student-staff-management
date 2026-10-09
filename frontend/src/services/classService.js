import api from "./api";

export const createClass = async (classData) => {
  const response = await api.post("/classes", classData);
  return response.data;
};

export const getMyClasses = async () => {
  const response = await api.get("/classes/my");
  return response.data;
};

export const getTodayClasses = async () => {
  const response = await api.get("/classes/today");
  return response.data;
};