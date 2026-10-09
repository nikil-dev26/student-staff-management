import { useEffect, useState } from "react";

import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent
} from "../../services/studentService";

import { getCourses } from "../../services/courseService";

const initialForm = {
  name: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  course: ""
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getStudents();
      setStudents(response.data || []);
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.message || "Failed to load students"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await getCourses();
      setCourses(response.data || []);
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.message || "Failed to load courses"
      );
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchStudents(), fetchCourses()]);
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.course
    ) {
      setError("Please fill all required fields");
      return;
    }

    if (!editingId && !form.password) {
      setError("Password is required");
      return;
    }

    if (!editingId && form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.phone)) {
      setError("Phone number must contain 10 digits");
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        const updateData = {
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          course: form.course
        };

        await updateStudent(editingId, updateData);
      } else {
        const createData = {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
          address: form.address.trim(),
          course: form.course
        };

        await createStudent(createData);
      }

      await fetchStudents();
      resetForm();
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.message || "Failed to save student"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (student) => {
    setEditingId(student._id);
    setForm({
      name: student.user?.name || "",
      email: student.user?.email || "",
      password: "",
      phone: student.phone || "",
      address: student.address || "",
      course: student.course?._id || ""
    });
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (studentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await deleteStudent(studentId);
      await fetchStudents();
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.message || "Failed to delete student"
      );
    }
  };

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
          <h1>Students</h1>
          <p>Manage student records.</p>
        </div>

        <button
          className="primary-btn"
          onClick={() => {
            setError("");
            setForm(initialForm);
            setEditingId(null);
            setShowForm(true);
          }}
        >
          + Add Student
        </button>
      </div>

      {error && <div className="page-error">{error}</div>}

      {showForm && (
        <div className="form-container">
          <div className="form-header">
            <h2>{editingId ? "Edit Student" : "Add Student"}</h2>

            <button
              type="button"
              className="form-close-btn"
              onClick={resetForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-field">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter student name"
                />
              </div>

              <div className="form-field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />
              </div>

              {!editingId && (
                <div className="form-field">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                  />
                </div>
              )}

              <div className="form-field">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter 10-digit phone number"
                  maxLength="10"
                />
              </div>

              <div className="form-field">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                />
              </div>

              <div className="form-field">
                <label>Course</label>
                <select
                  name="course"
                  value={form.course}
                  onChange={handleChange}
                >
                  <option value="">Select Course</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={resetForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-btn"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Student"
                    : "Create Student"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-header">
          <div>
            <h2>Student Records</h2>
            <p>
              Showing <strong>{students.length}</strong> student
              {students.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {students.length === 0 ? (
          <div className="empty-state">
            <h3>No students found</h3>
            <p>There are no student records available yet.</p>
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
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.user?.name || "-"}</td>
                    <td>{student.user?.email || "-"}</td>
                    <td>{student.phone || "-"}</td>
                    <td>
                      <span className="badge">
                        {student.course?.name || "-"}
                      </span>
                    </td>
                    <td>{student.address || "-"}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          type="button"
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(student)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(student._id)}
                        >
                          Delete
                        </button>
                      </div>
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

export default Students;