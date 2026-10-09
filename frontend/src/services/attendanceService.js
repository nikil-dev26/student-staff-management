import api from "./api";

export const markLoginAttendance = async () => {
  const response = await api.post("/attendance/login");
  return response.data;
};

export const markLogoutAttendance = async () => {
  const response = await api.post("/attendance/logout");
  return response.data;
};

export const getMyAttendance = async () => {
  const response = await api.get("/attendance/my");
  return response.data;
};

export const getAllStudentAttendance = async () => {
  const response = await api.get("/attendance/student");
  return response.data;
};

export const getAllStaffAttendance = async () => {
  const response = await api.get("/attendance/staff");
  return response.data;
};

export const getStudentAttendance = async (studentId) => {
  const response = await api.get(`/attendance/student/${studentId}`);
  return response.data;
};

export const markStudentAttendance = async (attendanceData) => {
  const response = await api.post("/attendance/student", attendanceData);
  return response.data;
};

export const markStaffAttendance = async (attendanceData) => {
  const response = await api.post("/attendance/staff", attendanceData);
  return response.data;
};

export const getAttendanceReport = async (
  fromDate,
  toDate = fromDate,
  userType = "all",
  status = "all",
  userId = ""
) => {
  const params = new URLSearchParams();

  params.append("fromDate", fromDate);
  params.append("toDate", toDate);

  if (userType !== "all") {
    params.append("userType", userType);
  }

  if (status !== "all") {
    params.append("status", status);
  }

  if (userId) {
    params.append("userId", userId);
  }

  const response = await api.get(`/attendance/report?${params.toString()}`);
  return response.data;
};