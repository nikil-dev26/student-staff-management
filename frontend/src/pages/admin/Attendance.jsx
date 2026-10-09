import { useEffect, useState } from "react";

import {
  getAllStudentAttendance,
  getAllStaffAttendance,
  getAttendanceReport,
  markStudentAttendance,
  markStaffAttendance
} from "../../services/attendanceService";

import { getStudents } from "../../services/studentService";
import { getStaff } from "../../services/staffService";

const getToday = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);

  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [userType, setUserType] = useState("all");
  const [status, setStatus] = useState("all");

  const [summary, setSummary] = useState({
    total: 0,
    present: 0,
    absent: 0,
    leave: 0
  });

  const [studentForm, setStudentForm] = useState({
    studentId: "",
    date: getToday(),
    status: "Present"
  });

  const [staffForm, setStaffForm] = useState({
    staffId: "",
    date: getToday(),
    status: "Present"
  });

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      if (fromDate || toDate) {
        if (!fromDate || !toDate) {
          setError("Please select both from date and to date.");
          setAttendance([]);
          setSummary({
            total: 0,
            present: 0,
            absent: 0,
            leave: 0,
            percentage: 0
          });
          return;
        }

        const response = await getAttendanceReport(
          fromDate,
          toDate,
          userType,
          status
        );

        const report = response.data || {};

        setAttendance(report.attendance || []);
        setSummary({
          total: report.total || 0,
          present: report.present || 0,
          absent: report.absent || 0,
          leave: report.leave || 0,
          percentage: report.attendancePercentage || 0
        });
        return;
      }

      const [studentResponse, staffResponse] = await Promise.all([
        getAllStudentAttendance(),
        getAllStaffAttendance()
      ]);

      let records = [
        ...(studentResponse.data || []),
        ...(staffResponse.data || [])
      ];

      if (userType !== "all") {
        records = records.filter((item) => item.userType === userType);
      }

      if (status !== "all") {
        records = records.filter((item) => item.status === status);
      }

      setAttendance(records);

      const total = records.length;
      const present = records.filter((item) => item.status === "Present").length;
      const absent = records.filter((item) => item.status === "Absent").length;
      const leave = records.filter((item) => item.status === "Leave").length;
      const percentage =
        total > 0 ? Number(((present / total) * 100).toFixed(2)) : 0;

      setSummary({
        total,
        present,
        absent,
        leave,
        percentage
      });
    } catch (err) {
      console.error("Fetch attendance error:", err);
      setError(
        err.response?.data?.message || "Failed to fetch attendance"
      );
      setAttendance([]);
      setSummary({
        total: 0,
        present: 0,
        absent: 0,
        leave: 0,
        percentage: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await getStudents();
      setStudents(response.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch students");
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await getStaff();
      setStaff(response.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to fetch staff");
    }
  };

  const calculatePercentage = (value) => {
    if (summary.total === 0) return 0;
    return Math.round((value / summary.total) * 100);
  };

  useEffect(() => {
    fetchStudents();
    fetchStaff();
    fetchAttendance();
  }, []);

  const handleSearch = () => {
    if (fromDate && toDate && fromDate > toDate) {
      setError("From date cannot be greater than to date");
      return;
    }
    fetchAttendance();
  };

  const handleClearFilters = () => {
    setFromDate("");
    setToDate("");
    setUserType("all");
    setStatus("all");
    setError("");
    setMessage("");

    setTimeout(() => {
      fetchAttendance();
    }, 0);
  };

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentForm({ ...studentForm, [name]: value });
  };

  const handleStaffChange = (e) => {
    const { name, value } = e.target;
    setStaffForm({ ...staffForm, [name]: value });
  };

  const handleMarkStudentAttendance = async (e) => {
    e.preventDefault();
    if (!studentForm.studentId || !studentForm.date || !studentForm.status) {
      alert("Please fill all student attendance fields");
      return;
    }

    try {
      setMarking(true);
      setError("");
      setMessage("");

      await markStudentAttendance(studentForm);
      setMessage("Student attendance marked successfully");
      setStudentForm({
        studentId: "",
        date: getToday(),
        status: "Present"
      });
      await fetchAttendance();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to mark student attendance"
      );
    } finally {
      setMarking(false);
    }
  };

  const handleMarkStaffAttendance = async (e) => {
    e.preventDefault();
    if (!staffForm.staffId || !staffForm.date || !staffForm.status) {
      alert("Please fill all staff attendance fields");
      return;
    }

    try {
      setMarking(true);
      setError("");
      setMessage("");

      await markStaffAttendance(staffForm);
      setMessage("Staff attendance marked successfully");
      setStaffForm({
        staffId: "",
        date: getToday(),
        status: "Present"
      });
      await fetchAttendance();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to mark staff attendance"
      );
    } finally {
      setMarking(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleDateString("en-IN");
  };

  const formatTime = (timeValue) => {
    if (!timeValue) return "-";
    return new Date(timeValue).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusClass = (attendanceStatus) => {
    if (attendanceStatus === "Present") return "attendance-status present";
    if (attendanceStatus === "Absent") return "attendance-status absent";
    if (attendanceStatus === "Leave") return "attendance-status leave";
    return "attendance-status";
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="page-loading">Loading attendance records...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Attendance Management</h1>
          <p>Manage and monitor student and staff attendance.</p>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="page-error">{error}</div>}

      <div className="form-container">
        <div className="form-header">
          <h2>Mark Student Attendance</h2>
        </div>

        <form onSubmit={handleMarkStudentAttendance}>
          <div className="attendance-grid-form">
            <div className="form-field">
              <label>Student</label>
              <select
                name="studentId"
                value={studentForm.studentId}
                onChange={handleStudentChange}
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.user?.name || "Unknown Student"}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={studentForm.date}
                onChange={handleStudentChange}
              />
            </div>

            <div className="form-field">
              <label>Status</label>
              <select
                name="status"
                value={studentForm.status}
                onChange={handleStudentChange}
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
              </select>
            </div>

            <div className="attendance-submit-field">
              <button
                type="submit"
                className="primary-btn w-full"
                disabled={marking}
              >
                {marking ? "Marking..." : "Mark Student"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="form-container">
        <div className="form-header">
          <h2>Mark Staff Attendance</h2>
        </div>

        <form onSubmit={handleMarkStaffAttendance}>
          <div className="attendance-grid-form">
            <div className="form-field">
              <label>Staff</label>
              <select
                name="staffId"
                value={staffForm.staffId}
                onChange={handleStaffChange}
              >
                <option value="">Select Staff</option>
                {staff.map((staffMember) => (
                  <option key={staffMember._id} value={staffMember._id}>
                    {staffMember.user?.name || "Unknown Staff"}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Date</label>
              <input
                type="date"
                name="date"
                value={staffForm.date}
                onChange={handleStaffChange}
              />
            </div>

            <div className="form-field">
              <label>Status</label>
              <select
                name="status"
                value={staffForm.status}
                onChange={handleStaffChange}
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
              </select>
            </div>

            <div className="attendance-submit-field">
              <button
                type="submit"
                className="primary-btn w-full"
                disabled={marking}
              >
                {marking ? "Marking..." : "Mark Staff"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="form-container">
        <div className="form-header">
          <h2>Attendance Filters</h2>
        </div>

        <div className="attendance-filter-grid">
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
              onChange={(e) => setUserType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="student">Student</option>
              <option value="staff">Staff</option>
            </select>
          </div>

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

        <div className="form-actions" style={{ borderTop: "none", marginTop: "16px", paddingTop: "0" }}>
          <button
            type="button"
            className="secondary-btn"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={handleSearch}
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Records</h3>
          <strong>{summary.total}</strong>
          <p>Total logged count</p>
        </div>

        <div className="stat-card">
          <h3>Present</h3>
          <strong>{summary.present}</strong>
          <p>{calculatePercentage(summary.present)}% rate</p>
        </div>

        <div className="stat-card">
          <h3>Absent</h3>
          <strong>{summary.absent}</strong>
          <p>{calculatePercentage(summary.absent)}% rate</p>
        </div>

        <div className="stat-card">
          <h3>Leave</h3>
          <strong>{summary.leave}</strong>
          <p>{calculatePercentage(summary.leave)}% rate</p>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <div>
            <h2>Attendance Records</h2>
            <p>Showing filtered attendance logs</p>
          </div>
        </div>

        {attendance.length === 0 ? (
          <div className="empty-state">No attendance records found.</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Login</th>
                  <th>Logout</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div className="attendance-user">
                        <div>
                          <strong>{item.user?.name || "Unknown"}</strong>
                        </div>
                      </div>
                    </td>
                    <td>{item.user?.email || "-"}</td>
                    <td>
                      <span
                        className={`user-type-badge ${
                          item.userType ? item.userType.toLowerCase() : ""
                        }`}
                      >
                        {item.userType}
                      </span>
                    </td>
                    <td>{formatDate(item.date)}</td>
                    <td>
                      <span className={getStatusClass(item.status)}>
                        {item.status}
                      </span>
                    </td>
                    <td>{formatTime(item.loginTime)}</td>
                    <td>{formatTime(item.logoutTime)}</td>
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

export default Attendance;