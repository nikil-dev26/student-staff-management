import { useEffect, useState } from "react";

import { getAttendanceReport } from "../../services/attendanceService";
import { getStudents } from "../../services/studentService";
import { getStaff } from "../../services/staffService";

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Reports = () => {
  const today = getToday();

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [userType, setUserType] = useState("all");
  const [userId, setUserId] = useState("");
  const [status, setStatus] = useState("all");

  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const [studentResponse, staffResponse] = await Promise.all([
          getStudents(),
          getStaff()
        ]);

        setStudents(studentResponse?.data || []);
        setStaff(staffResponse?.data || []);
      } catch (err) {
        console.error("Fetch users error:", err);
        setError(
          err.response?.data?.message ||
          "Failed to load students and staff"
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const generateReport = async () => {
    try {
      setLoading(true);
      setError("");

      if (!fromDate || !toDate) {
        setError("Please select both from date and to date.");
        return;
      }

      if (fromDate > toDate) {
        setError("From date cannot be greater than to date.");
        return;
      }

      const response = await getAttendanceReport(
        fromDate,
        toDate,
        userType,
        status,
        userId
      );

      setReport(response.data || null);
    } catch (err) {
      console.error("Generate report error:", err);
      setError(
        err.response?.data?.message ||
        "Failed to generate attendance report"
      );
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUserTypeChange = (value) => {
    setUserType(value);
    setUserId("");
    setReport(null);
  };

  const clearReport = () => {
    setFromDate(today);
    setToDate(today);
    setUserType("all");
    setUserId("");
    setStatus("all");
    setReport(null);
    setError("");
  };

  const selectedUser =
    userType === "student"
      ? students.find((student) => student.user?._id === userId)?.user
      : userType === "staff"
        ? staff.find((staffMember) => staffMember.user?._id === userId)?.user
        : null;

  const attendance = report?.attendance || [];

  const showStaffTimeColumns =
    userType === "staff" || userType === "all";

  const getStatusClass = (attendanceStatus) => {
    if (attendanceStatus === "Present") return "attendance-status present";
    if (attendanceStatus === "Absent") return "attendance-status absent";
    if (attendanceStatus === "Leave") return "attendance-status leave";
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
          <h1>Attendance Reports</h1>
          <p>
            Generate detailed attendance reports for students and staff.
          </p>
        </div>
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="report-filter-card">
        <div className="report-filter-header">
          <h2>Report Filters</h2>
          <p>Select date range and filter criteria.</p>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label>From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label>User Type</label>
            <select
              value={userType}
              onChange={(e) => handleUserTypeChange(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
          </div>

          {userType !== "all" && (
            <div className="form-field">
              <label>
                Select {userType === "student" ? "Student" : "Staff"}
              </label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              >
                <option value="">
                  All {userType === "student" ? "Students" : "Staff Members"}
                </option>
                {userType === "student"
                  ? students.map((student) => (
                      <option
                        key={student.user?._id}
                        value={student.user?._id}
                      >
                        {student.user?.name || "Unknown Student"}
                      </option>
                    ))
                  : staff.map((staffMember) => (
                      <option
                        key={staffMember.user?._id}
                        value={staffMember.user?._id}
                      >
                        {staffMember.user?.name || "Unknown Staff"}
                      </option>
                    ))}
              </select>
            </div>
          )}

          <div className="form-field">
            <label>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Leave">Leave</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="secondary-btn"
            onClick={clearReport}
          >
            Clear Filters
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={generateReport}
            disabled={loading || loadingUsers}
          >
            {loading ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {report && selectedUser && (
        <div className="profile-card" style={{ marginBottom: "28px" }}>
          <div className="profile-avatar">
            {(selectedUser.name || "U")[0].toUpperCase()}
          </div>

          <div className="profile-info">
            <div className="profile-item">
              <span>Full Name</span>
              <strong>{selectedUser.name}</strong>
            </div>

            <div className="profile-item">
              <span>Email Address</span>
              <strong>{selectedUser.email || "-"}</strong>
            </div>

            <div className="profile-item">
              <span>Role</span>
              <strong style={{ textTransform: "capitalize" }}>
                {selectedUser.role || userType}
              </strong>
            </div>

            <div className="profile-item">
              <span>Reporting Range</span>
              <strong>
                {formatDate(report.fromDate)} to {formatDate(report.toDate)} (
                {report.totalDays || 0} Days)
              </strong>
            </div>
          </div>
        </div>
      )}

      {report && (
        <div className="report-stats">
          <div className="report-stat-card">
            <div>
              <p>Total Records</p>
              <h2>{report.total || 0}</h2>
              <span>Expected attendance</span>
            </div>
          </div>

          <div className="report-stat-card">
            <div>
              <p>Present</p>
              <h2>{report.present || 0}</h2>
              <span>Present days logged</span>
            </div>
          </div>

          <div className="report-stat-card">
            <div>
              <p>Absent</p>
              <h2>{report.absent || 0}</h2>
              <span>Absent days recorded</span>
            </div>
          </div>

          <div className="report-stat-card">
            <div>
              <p>Leave</p>
              <h2>{report.leave || 0}</h2>
              <span>Approved leave days</span>
            </div>
          </div>
        </div>
      )}

      {report && (
        <div
          className="stat-card"
          style={{
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div>
            <h3>Overall Attendance Rate</h3>
            <p>
              Calculated present attendance across the selected period
            </p>
          </div>

          <strong
            style={{
              fontSize: "38px",
              color: "var(--primary)",
              margin: 0
            }}
          >
            {report.attendancePercentage || 0}%
          </strong>
        </div>
      )}

      {report && (
        <div className="table-card">
          <div className="table-header">
            <div>
              <h2>Attendance Records</h2>
              <p>
                {report.filteredTotal || attendance.length || 0} records found
              </p>
            </div>
          </div>

          {attendance.length === 0 ? (
            <div className="empty-report">
              No attendance records found for this criteria.
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    {showStaffTimeColumns && (
                      <>
                        <th>Login</th>
                        <th>Logout</th>
                      </>
                    )}
                    <th>Source</th>
                  </tr>
                </thead>

                <tbody>
                  {attendance.map((item) => {
                    const isStaff = item.userType === "staff";

                    return (
                      <tr key={item._id}>
                        <td>
                          {formatDate(item.attendanceDay || item.date)}
                        </td>
                        <td>
                          <strong>{item.user?.name || "-"}</strong>
                        </td>
                        <td>
                          <span
                            className={`user-type-badge ${
                              item.userType ? item.userType.toLowerCase() : ""
                            }`}
                          >
                            {item.userType || "-"}
                          </span>
                        </td>
                        <td>
                          <span className={getStatusClass(item.status)}>
                            {item.status || "-"}
                          </span>
                        </td>
                        {showStaffTimeColumns && (
                          <>
                            <td>
                              {isStaff ? formatTime(item.loginTime) : "-"}
                            </td>
                            <td>
                              {isStaff ? formatTime(item.logoutTime) : "-"}
                            </td>
                          </>
                        )}
                        <td>
                          <span
                            className="badge"
                            style={{
                              background: item.isCalculatedAbsent
                                ? "var(--surface-subtle)"
                                : "var(--primary-light)",
                              color: item.isCalculatedAbsent
                                ? "var(--text-muted)"
                                : "var(--primary)"
                            }}
                          >
                            {item.isCalculatedAbsent
                              ? "Calculated"
                              : "Recorded"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;