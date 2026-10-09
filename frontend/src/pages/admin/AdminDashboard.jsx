import { useEffect, useState } from "react";

import { getStudents } from "../../services/studentService";
import { getStaff } from "../../services/staffService";
import { getCourses } from "../../services/courseService";
import { getAttendanceReport } from "../../services/attendanceService";

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Dashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    staff: 0,
    courses: 0,
    attendance: 0,
    absent: 0,
    leave: 0,
    attendancePercentage: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const today = getToday();

      const [
        studentResponse,
        staffResponse,
        courseResponse,
        reportResponse
      ] = await Promise.all([
        getStudents(),
        getStaff(),
        getCourses(),
        getAttendanceReport(today, today, "all", "all")
      ]);

      const students = studentResponse?.data || [];
      const staff = staffResponse?.data || [];
      const courses = courseResponse?.data || [];
      const report = reportResponse?.data || {};

      setStats({
        students: students.length,
        staff: staff.length,
        courses: courses.length,
        attendance: report.present || 0,
        absent: report.absent || 0,
        leave: report.leave || 0,
        attendancePercentage: report.attendancePercentage || 0
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(
        err.response?.data?.message || "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="page-loading">
          Loading dashboard metrics and statistics...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>
            Monitor students, staff, courses, and real-time attendance overview.
          </p>
        </div>
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Students</h3>
          <strong>{stats.students}</strong>
          <p>Enrolled students</p>
        </div>

        <div className="stat-card">
          <h3>Staff Members</h3>
          <strong>{stats.staff}</strong>
          <p>Active faculty & staff</p>
        </div>

        <div className="stat-card">
          <h3>Courses</h3>
          <strong>{stats.courses}</strong>
          <p>Offered academic courses</p>
        </div>

        <div className="stat-card">
          <h3>Present Today</h3>
          <strong>{stats.attendance}</strong>
          <p>Marked present</p>
        </div>
      </div>

      <div className="form-container">
        <div className="form-header">
          <div>
            <h2>Today's Attendance Status</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
              Live attendance summary calculated for {getToday()}
            </p>
          </div>
        </div>

        <div className="report-stats" style={{ marginBottom: "0" }}>
          <div className="report-stat-card">
            <div>
              <p>Present</p>
              <h2>{stats.attendance}</h2>
              <span>Present today</span>
            </div>
          </div>

          <div className="report-stat-card">
            <div>
              <p>Absent</p>
              <h2>{stats.absent}</h2>
              <span>Absent today</span>
            </div>
          </div>

          <div className="report-stat-card">
            <div>
              <p>On Leave</p>
              <h2>{stats.leave}</h2>
              <span>Leave requests</span>
            </div>
          </div>

          <div className="report-stat-card">
            <div>
              <p>Attendance Rate</p>
              <h2>{stats.attendancePercentage}%</h2>
              <span>Today's turnout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="form-container">
        <div className="form-header">
          <div>
            <h2>Institutional Overview</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
              Consolidated registry figures and performance rates
            </p>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>Total Registered Students</label>
            <input
              type="text"
              readOnly
              value={`${stats.students} Students`}
              style={{ background: "var(--surface-subtle)", fontWeight: "600" }}
            />
          </div>

          <div className="form-field">
            <label>Total Registered Staff</label>
            <input
              type="text"
              readOnly
              value={`${stats.staff} Staff Members`}
              style={{ background: "var(--surface-subtle)", fontWeight: "600" }}
            />
          </div>

          <div className="form-field">
            <label>Active Courses Offered</label>
            <input
              type="text"
              readOnly
              value={`${stats.courses} Courses`}
              style={{ background: "var(--surface-subtle)", fontWeight: "600" }}
            />
          </div>

          <div className="form-field">
            <label>Today's Turnout Percentage</label>
            <input
              type="text"
              readOnly
              value={`${stats.attendancePercentage}% Present`}
              style={{
                background: "var(--surface-subtle)",
                fontWeight: "700",
                color: "var(--primary)"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;