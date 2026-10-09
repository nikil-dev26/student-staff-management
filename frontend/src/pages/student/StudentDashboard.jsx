import { useContext, useEffect, useState } from "react";

import { AuthContext } from "../../context/AuthContext";
import { getMyAttendance } from "../../services/attendanceService";
import { getTodayClasses } from "../../services/classService";

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);

  const [attendance, setAttendance] = useState([]);
  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const [attendanceResponse, classesResponse] = await Promise.all([
          getMyAttendance(),
          getTodayClasses()
        ]);

        setAttendance(attendanceResponse.data || []);
        setClasses(classesResponse.data || []);
      } catch (err) {
        console.error("Student dashboard error:", err);
        setError(
          err.response?.data?.message || "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const totalAttendance = attendance.length;
  const presentDays = attendance.filter(
    (item) => item.status === "Present"
  ).length;

  const attendanceRate =
    totalAttendance > 0
      ? Math.round((presentDays / totalAttendance) * 100)
      : 0;

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  if (loading) {
    return (
      <div className="dashboard">
        <div className="page-loading">
          Loading student dashboard and schedule...
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user?.name || "Student"}</h1>
          <p>
            Here is your daily class schedule, attendance statistics, and learning overview.
          </p>
        </div>
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Sessions</h3>
          <strong>{totalAttendance}</strong>
          <p>Recorded sessions</p>
        </div>

        <div className="stat-card">
          <h3>Present Days</h3>
          <strong>{presentDays}</strong>
          <p>Days attended</p>
        </div>

        <div className="stat-card">
          <h3>Attendance Rate</h3>
          <strong>{attendanceRate}%</strong>
          <p>Overall presence</p>
        </div>

        <div className="stat-card">
          <h3>Today's Classes</h3>
          <strong>{classes.length}</strong>
          <p>Scheduled for today</p>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <h2>Today's Class Schedule</h2>
            <p>{today}</p>
          </div>
          <span className="badge">
            {classes.length} {classes.length === 1 ? "Session" : "Sessions"}
          </span>
        </div>

        {classes.length === 0 ? (
          <div className="empty-state">
            <h3>No Classes Today</h3>
            <p style={{ marginTop: "6px" }}>
              There are no lecture or lab sessions scheduled for your course today. Enjoy your day!
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Topic</th>
                  <th>Time Slot</th>
                  <th>Trainer</th>
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
                    <td>
                      <span style={{ fontWeight: "600", color: "#334155" }}>
                        {item.startTime} - {item.endTime}
                      </span>
                    </td>
                    <td>
                      <div className="attendance-user">
                        <div>
                          <strong>{item.trainer?.name || "Instructor"}</strong>
                          <span>{item.trainer?.email || "Faculty"}</span>
                        </div>
                      </div>
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
    </div>
  );
};

export default StudentDashboard;