import { useEffect, useState } from "react";

import {
  getMyAttendance,
  markLoginAttendance,
  markLogoutAttendance
} from "../../services/attendanceService";

const MyAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchAttendance = async () => {
    try {
      const response = await getMyAttendance();
      setAttendance(response.data || []);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load attendance"
      );
    }
  };

  useEffect(() => {
    const load = async () => {
      await fetchAttendance();
      setLoading(false);
    };

    load();
  }, []);

  const handleLogin = async () => {
    try {
      setActionLoading(true);
      const response = await markLoginAttendance();
      setMessage(
        response.message || "Login attendance marked successfully"
      );
      await fetchAttendance();
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to mark login attendance"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setActionLoading(true);
      const response = await markLogoutAttendance();
      setMessage(
        response.message || "Logout attendance marked successfully"
      );
      await fetchAttendance();
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to mark logout attendance"
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        Loading attendance...
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>My Attendance</h1>
          <p>View your login and logout attendance.</p>
        </div>

        <div className="attendance-actions">
          <button
            className="primary-btn"
            onClick={handleLogin}
            disabled={actionLoading}
          >
            Mark Login
          </button>

          <button
            className="secondary-btn"
            onClick={handleLogout}
            disabled={actionLoading}
          >
            Mark Logout
          </button>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="page-error">{error}</div>}

      <div className="table-card">
        {attendance.length === 0 ? (
          <div className="empty-state">
            No attendance records found.
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Login Time</th>
                  <th>Logout Time</th>
                </tr>
              </thead>

              <tbody>
                {attendance.map((item) => (
                  <tr key={item._id}>
                    <td>
                      {item.date
                        ? new Date(item.date).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>
                      <span className="badge">
                        {item.status}
                      </span>
                    </td>

                    <td>
                      {item.loginTime
                        ? new Date(item.loginTime).toLocaleTimeString()
                        : "-"}
                    </td>

                    <td>
                      {item.logoutTime
                        ? new Date(item.logoutTime).toLocaleTimeString()
                        : "-"}
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