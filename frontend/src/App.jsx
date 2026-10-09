import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Students from "./pages/admin/Students";
import Staff from "./pages/admin/Staff";
import Courses from "./pages/admin/Courses";
import Attendance from "./pages/admin/Attendance";
import Reports from "./pages/admin/Reports";

import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffProfile from "./pages/staff/StaffProfile";
import AssignedStudents from "./pages/staff/AssignedStudents";
import StudentAttendance from "./pages/staff/StudentAttendance";
import StaffMyAttendance from "./pages/staff/MyAttendance";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";
import StudentMyAttendance from "./pages/student/MyAttendance";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import StaffLayout from "./layouts/StaffLayout";
import StudentLayout from "./layouts/StudentLayout";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <Students />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <Staff />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <Courses />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <Attendance />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout>
                <Reports />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffLayout>
                <StaffDashboard />
              </StaffLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/profile"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffLayout>
                <StaffProfile />
              </StaffLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/students"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffLayout>
                <AssignedStudents />
              </StaffLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/attendance"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffLayout>
                <StudentAttendance />
              </StaffLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/my-attendance"
          element={
            <ProtectedRoute allowedRoles={["staff"]}>
              <StaffLayout>
                <StaffMyAttendance />
              </StaffLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLayout>
                <StudentDashboard />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/profile"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLayout>
                <StudentProfile />
              </StudentLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/my-attendance"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentLayout>
                <StudentMyAttendance />
              </StudentLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;