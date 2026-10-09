import { useEffect, useState } from "react";

import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse
} from "../../services/courseService";

const Courses = () => {
  const [courses, setCourses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    fee: ""
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCourses();

      console.log("Courses:", data);

      setCourses(data.data || []);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
        "Failed to fetch courses"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      duration: "",
      fee: ""
    });

    setEditingCourse(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.description ||
      !formData.duration ||
      formData.fee === ""
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.duration.trim()
    ) {
      alert("Fields cannot be empty");
      return;
    }

    const fee = Number(formData.fee);

    if (Number.isNaN(fee)) {
      alert("Fee must be a valid number");
      return;
    }

    if (fee < 0) {
      alert("Fee cannot be negative");
      return;
    }

    setSaving(true);

    try {
      if (editingCourse) {
        const updateData = {
          name: formData.name,
          description: formData.description,
          duration: formData.duration,
          fee: fee
        };

        const data = await updateCourse(
          editingCourse._id,
          updateData
        );

        console.log("Updated Course:", data);

        alert("Course updated successfully");
      } else {
        const createData = {
          name: formData.name,
          description: formData.description,
          duration: formData.duration,
          fee: fee
        };

        const data = await createCourse(createData);

        console.log("Created Course:", data);

        alert("Course created successfully");
      }

      resetForm();
      setShowForm(false);

      await fetchCourses();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to save course"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);

    setFormData({
      name: course.name || "",
      description: course.description || "",
      duration: course.duration || "",
      fee: course.fee ?? ""
    });

    setShowForm(true);
  };

  const handleDelete = async (courseId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this course?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteCourse(courseId);

      alert("Course deleted successfully");

      await fetchCourses();
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
        "Failed to delete course"
      );
    }
  };

  const handleToggleForm = () => {
    if (showForm) {
      resetForm();
      setShowForm(false);
    } else {
      resetForm();
      setShowForm(true);
    }
  };

  const handleCloseForm = () => {
    resetForm();
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="page-loading">
          <div className="loading-spinner"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="page-error">
          <div className="page-error-icon">!</div>
          <div>
            <h3>Unable to load courses</h3>
            <p>{error}</p>
            <button
              className="primary-btn"
              onClick={fetchCourses}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Courses</h1>
          <p>Manage courses, duration and fees.</p>
        </div>

        <button
          className={showForm ? "secondary-btn" : "primary-btn"}
          onClick={handleToggleForm}
        >
          {showForm ? "Close Form" : "+ Add Course"}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <div className="form-header">
            <div>
              <h2>{editingCourse ? "Edit Course" : "Add Course"}</h2>
              <p>
                {editingCourse
                  ? "Update course information"
                  : "Enter course information to create a new record"}
              </p>
            </div>

            <button
              type="button"
              className="form-close-btn"
              onClick={handleCloseForm}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label>
                Course Name <span>*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter course name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>
                Description <span>*</span>
              </label>
              <textarea
                name="description"
                placeholder="Enter course description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
              />
            </div>

            <div className="form-field">
              <label>
                Duration <span>*</span>
              </label>
              <input
                type="text"
                name="duration"
                placeholder="Example: 6 months"
                value={formData.duration}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>
                Course Fee <span>*</span>
              </label>
              <div className="input-with-prefix">
                <span>₹</span>
                <input
                  type="number"
                  name="fee"
                  placeholder="Enter course fee"
                  min="0"
                  value={formData.fee}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={handleCloseForm}
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
                  : editingCourse
                    ? "Update Course"
                    : "Save Course"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-header">
          <div>
            <h2>Course Records</h2>
            <p>
              Showing <strong>{courses.length}</strong> course
              {courses.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">C</div>
            <h3>No courses found</h3>
            <p>There are no course records available yet.</p>
            <button
              className="primary-btn"
              onClick={() => setShowForm(true)}
            >
              + Add Course
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Description</th>
                  <th>Duration</th>
                  <th>Fee</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id}>
                    <td>
                      <strong>{course.name || "-"}</strong>
                    </td>
                    <td>
                      <span className="description-text">
                        {course.description || "-"}
                      </span>
                    </td>
                    <td>
                      <span className="duration-badge">
                        {course.duration || "-"}
                      </span>
                    </td>
                    <td>
                      <strong>₹{course.fee ?? 0}</strong>
                    </td>
                    <td>
                      {course.createdAt
                        ? new Date(course.createdAt).toLocaleDateString("en-IN")
                        : "-"}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(course)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(course._id)}
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

export default Courses;