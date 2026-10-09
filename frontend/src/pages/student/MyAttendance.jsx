import { useEffect, useState } from "react";
import { getMyAttendance } from "../../services/attendanceService";

const MyAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyAttendance();
        setAttendance(response.data || []);
      } catch (err) {
        console.error("Attendance error:", err);
        setError(
          err.response?.data?.message || "Failed to load attendance"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const totalDays = attendance.length;

  const presentDays = attendance.filter(
    (item) => item.status === "Present"
  ).length;

  const absentDays = attendance.filter(
    (item) => item.status === "Absent"
  ).length;

  const leaveDays = attendance.filter(
    (item) => item.status === "Leave"
  ).length;

  const attendancePercentage =
    totalDays > 0
      ? Math.round((presentDays / totalDays) * 100)
      : 0;

  const getStatusClass = (status) => {
    if (status === "Present") return "attendance-status present";
    if (status === "Absent") return "attendance-status absent";
    if (status === "Leave") return "attendance-status leave";
    return "attendance-status";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const formatTime = (timeValue) => {
    if (!timeValue) return "-";
    return new Date(timeValue).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>My Attendance</h1>
          <p>View your personal attendance history, logs, and overall performance.</p>
        </div>
      </div>

      {error && <div className="page-error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="report-stats">
            <div className="report-stat-card">
              <div>
                <p>Total Sessions</p>
                <h2>{totalDays}</h2>
                <span>Recorded sessions</span>
              </div>
            </div>

            <div className="report-stat-card">
              <div>
                <p>Present</p>
                <h2>{presentDays}</h2>
                <span>Days attended</span>
              </div>
            </div>

            <div className="report-stat-card">
              <div>
                <p>Absent</p>
                <h2>{absentDays}</h2>
                <span>Unattended days</span>
              </div>
            </div>

            <div className="report-stat-card">
              <div>
                <p>Leave</p>
                <h2>{leaveDays}</h2>
                <span>Approved leave</span>
              </div>
            </div>
          </div>

          <div
            className="stat-card"
            style={{
              marginBottom: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
            <div>
              <h3>Overall Attendance Rate</h3>
              <p>Percentage of classes attended out of total recorded sessions</p>
            </div>
            <strong
              style={{
                fontSize: "36px",
                color: "var(--primary)",
                margin: 0
              }}
            >
              {attendancePercentage}%
            </strong>
          </div>
        </>
      )}

      <div className="table-card">
        <div className="table-header">
          <div>
            <h2>Attendance History</h2>
            <p>Your complete chronological attendance records</p>
          </div>
          <span className="badge">
            {attendance.length} {attendance.length === 1 ? "Record" : "Records"}
          </span>
        </div>

        {loading ? (
          <div className="page-loading">Loading attendance records...</div>
        ) : attendance.length === 0 ? (
          <div className="empty-state">
            <h3>No Attendance Records</h3>
            <p style={{ marginTop: "6px" }}>
              Your attendance records will appear here once marked by staff or administrators.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <strong style={{ color: "var(--text-main)" }}>
                        {formatDate(item.date)}
                      </strong>
                    </td>
                    <td>
                      <span className={getStatusClass(item.status)}>
                        {item.status}
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

export default MyAttendance;