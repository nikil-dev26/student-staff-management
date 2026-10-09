import { useEffect, useState } from "react";

import {
  getMyStaffProfile
} from "../../services/staffService";

import {
  markStudentAttendance
} from "../../services/attendanceService";

const StudentAttendance = () => {
  const [students, setStudents] = useState([]);

  const [studentId, setStudentId] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Present");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const response = await getMyStaffProfile();
        setStudents(response.data?.assignedStudents || []);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load students"
        );
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!studentId || !date || !status) {
      setError("Student, date and status are required");
      return;
    }

    try {
      setSaving(true);

      const response = await markStudentAttendance({
        studentId,
        date,
        status
      });

      setMessage(
        response.message || "Attendance marked successfully"
      );

      setStudentId("");
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to mark attendance"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        Loading students...
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Student Attendance</h1>
          <p>Mark attendance for assigned students.</p>
        </div>
      </div>

      {error && <div className="page-error">{error}</div>}

      {message && <div className="success-message">{message}</div>}

      <div className="form-container">
        <div className="form-header">
          <h2>Mark Attendance</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-field">
              <label>Student</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.user?.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label>Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">Leave</option>
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="primary-btn"
              disabled={saving}
            >
              {saving ? "Saving..." : "Mark Attendance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentAttendance;