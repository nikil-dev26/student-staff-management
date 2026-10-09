import api from "./api";

export const getStaff = async () => {
  const response = await api.get("/staff");
  return response.data;
};

export const createStaff = async (staffData) => {
  const response = await api.post("/staff", staffData);
  return response.data;
};

export const updateStaff = async (staffId, staffData) => {
  const response = await api.put(`/staff/${staffId}`, staffData);
  return response.data;
};

export const deleteStaff = async (staffId) => {
  const response = await api.delete(`/staff/${staffId}`);
  return response.data;
};

export const getMyStaffProfile = async () => {
  const response = await api.get("/staff/me");
  return response.data;
};