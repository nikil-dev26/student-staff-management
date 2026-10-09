import { useEffect, useState } from "react";

import { getMyStaffProfile } from "../../services/staffService";

const AssignedStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMyStaffProfile();
        const assignedStudents =
          response.data?.assignedStudents || [];

        setStudents(assignedStudents);
      } catch (error) {
        console.error("Failed to load assigned students:", error);
        setError(
          error.response?.data?.message ||
          "Failed to load assigned students"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="page-loading">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Assigned Students</h1>
          <p>Students assigned to you.</p>
        </div>
      </div>

      {error && <div className="page-error">{error}</div>}

      <div className="table-card">
        {students.length === 0 ? (
          <div className="empty-state">
            <h3>No students assigned</h3>
            <p>There are no students assigned to you yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Course</th>
                  <th>Address</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => {
                  const courseName =
                    typeof student.course === "object"
                      ? student.course?.name
                      : student.course;

                  return (
                    <tr key={student._id}>
                      <td>{student.user?.name || "-"}</td>
                      <td>{student.user?.email || "-"}</td>
                      <td>{student.phone || "-"}</td>
                      <td>
                        <span className="badge">
                          {courseName || "No course"}
                        </span>
                      </td>
                      <td>{student.address || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedStudents;