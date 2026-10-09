import { useEffect, useState } from "react";

import { getMyStaffProfile } from "../../services/staffService";
import { getMyAttendance } from "../../services/attendanceService";
import {
  createClass,
  getMyClasses
} from "../../services/classService";
import { getCourses } from "../../services/courseService";

const StaffDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    course: "",
    topic: "",
    date: "",
    startTime: "",
    endTime: "",
    description: ""
  });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          profileResponse,
          attendanceResponse,
          coursesResponse,
          classesResponse
        ] = await Promise.all([
          getMyStaffProfile(),
          getMyAttendance(),
          getCourses(),
          getMyClasses()
        ]);

        setProfile(profileResponse.data || null);
        setAttendance(attendanceResponse.data || []);
        setCourses(coursesResponse.data || []);
        setClasses(classesResponse.data || []);
      } catch (err) {
        console.error("Staff dashboard error:", err);
        setError(
          err.response?.data?.message || "Failed to load staff dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await createClass(formData);

      setSuccess(
        response.message || "Class scheduled successfully"
      );

      setFormData({
        course: "",
        topic: "",
        date: "",
        startTime: "",
        endTime: "",
        description: ""
      });

      const classesResponse = await getMyClasses();
      setClasses(classesResponse.data || []);
    } catch (err) {
      console.error("Create class error:", err);
      setError(
        err.response?.data?.message || "Failed to schedule class"
      );
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="page-loading">
          Loading staff dashboard, schedules, and student lists...
        </div>
      </div>
    );
  }

  const assignedStudents = profile?.assignedStudents || [];
  const presentCount = attendance.filter(
    (item) => item.status === "Present"
  ).length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {profile?.user?.name || "Staff Member"}</h1>
          <p>
            Manage assigned students, schedule lectures, and review your attendance log.
          </p>
        </div>
      </div>

      {error && <div className="page-error">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Assigned Students</h3>
          <strong>{assignedStudents.length}</strong>
          <p>Students under your mentorship</p>
        </div>

        <div className="stat-card">
          <h3>Total Attendance Logs</h3>
          <strong>{attendance.length}</strong>
          <p>Recorded working days</p>
        </div>

        <div className="stat-card">
          <h3>Days Present</h3>
          <strong>{presentCount}</strong>
          <p>Verified present days</p>
        </div>

        <div className="stat-card">
          <h3>Scheduled Classes</h3>
          <strong>{classes.length}</strong>
          <p>Total lectures posted</p>
        </div>
      </div>

      <div className="form-container">
        <div className="form-header">
          <div>
            <h2>Post New Class</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "13px", marginTop: "2px" }}>
              Schedule an upcoming lecture or practical session for students
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Course</label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Topic</label>
              <input
                type="text"
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                placeholder="Today's Topic"
                required
              />
            </div>

            <div className="form-field">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label>Time Slot</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-field" style={{ gridColumn: "1 / -1" }}>
              <label>Description (Optional)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Add description"
                rows="3"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={saving}
              className="primary-btn"
            >
              {saving ? "Scheduling..." : "Post Class"}
            </button>
          </div>
        </form>
      </div>

      <div className="table-card" style={{ marginBottom: "28px" }}>
        <div className="table-header">
          <div>
            <h2>My Scheduled Classes</h2>
            <p>Classes published and managed by you</p>
          </div>
          <span className="badge">
            {classes.length} {classes.length === 1 ? "Class" : "Classes"}
          </span>
        </div>

        {classes.length === 0 ? (
          <div className="empty-state">
            <h3>No Classes Scheduled</h3>
            <p style={{ marginTop: "6px" }}>
              You haven't posted any classes yet. Use the form above to add a new session.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Topic</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <span className="badge">
                        {item.course?.name || "General Course"}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: "var(--text-main)" }}>
                        {item.topic}
                      </strong>
                    </td>
                    <td>{formatDate(item.date)}</td>
                    <td>
                      <span style={{ fontWeight: "600", color: "#334155" }}>
                        {item.startTime} - {item.endTime}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: "var(--text-muted)" }}>
                        {item.description || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <h2>Assigned Students</h2>
            <p>Students currently assigned under your direct guidance</p>
          </div>
          <span className="badge">
            {assignedStudents.length} Students
          </span>
        </div>

        {assignedStudents.length === 0 ? (
          <div className="empty-state">
            <h3>No Students Assigned</h3>
            <p style={{ marginTop: "6px" }}>
              There are currently no students mapped to your staff profile.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Enrolled Course</th>
                </tr>
              </thead>
              <tbody>
                {assignedStudents.map((student) => (
                  <tr key={student._id}>
                    <td>
                      <div className="attendance-user">
                        <div>
                          <strong>{student.user?.name || "Unknown"}</strong>
                        </div>
                      </div>
                    </td>
                    <td>{student.user?.email || "-"}</td>
                    <td>
                      <span className="badge">
                        {student.course?.name || "No course"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;