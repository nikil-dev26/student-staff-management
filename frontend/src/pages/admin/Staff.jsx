import { useEffect, useState } from "react";

import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff
} from "../../services/staffService";

import { getStudents } from "../../services/studentService";

const Staff = () => {
  const [staff, setStaff] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    designation: "",
    assignedStudents: []
  });

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getStaff();
      console.log("Staff:", data);
      setStaff(data.data || []);
    } catch (error) {
      console.error(error);
      setError(
        error.response?.data?.message ||
        "Failed to fetch staff"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await getStudents();
      console.log("Students:", data);
      setStudents(data.data || []);
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
        "Failed to fetch students"
      );
    }
  };

  useEffect(() => {
    fetchStaff();
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleStudentChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const selectedStudentIds = selectedOptions.map((option) => option.value);

    setFormData({
      ...formData,
      assignedStudents: selectedStudentIds
    });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      designation: "",
      assignedStudents: []
    });
    setEditingStaff(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.designation
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.designation.trim()
    ) {
      alert("Fields cannot be empty");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Phone number must contain 10 digits");
      return;
    }

    if (!editingStaff && !formData.password) {
      alert("Password is required");
      return;
    }

    if (!editingStaff && formData.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setSaving(true);

    try {
      if (editingStaff) {
        const updateData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          designation: formData.designation,
          assignedStudents: formData.assignedStudents
        };

        const data = await updateStaff(editingStaff._id, updateData);
        console.log("Updated Staff:", data);
        alert("Staff updated successfully");
      } else {
        const createData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          designation: formData.designation,
          assignedStudents: formData.assignedStudents
        };

        const data = await createStaff(createData);
        console.log("Created Staff:", data);
        alert("Staff created successfully");
      }

      resetForm();
      setShowForm(false);
      await fetchStaff();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
        "Failed to save staff"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      name: staffMember.user?.name || "",
      email: staffMember.user?.email || "",
      password: "",
      phone: staffMember.phone || "",
      address: staffMember.address || "",
      designation: staffMember.designation || "",
      assignedStudents:
        staffMember.assignedStudents?.map((student) => student._id) || []
    });
    setShowForm(true);
  };

  const handleDelete = async (staffId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this staff?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await deleteStaff(staffId);
      alert("Staff deleted successfully");
      await fetchStaff();
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.message ||
        "Failed to delete staff"
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
          <p>Loading staff...</p>
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
            <h3>Unable to load staff</h3>
            <p>{error}</p>
            <button className="primary-btn" onClick={fetchStaff}>
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
          <h1>Staff</h1>
          <p>
            Manage staff members, designations and student assignments.
          </p>
        </div>

        <button
          className={showForm ? "secondary-btn" : "primary-btn"}
          onClick={handleToggleForm}
        >
          {showForm ? "Close Form" : "+ Add Staff"}
        </button>
      </div>

      {showForm && (
        <div className="form-container">
          <div className="form-header">
            <div>
              <h2>{editingStaff ? "Edit Staff" : "Add Staff"}</h2>
              <p>
                {editingStaff
                  ? "Update staff information"
                  : "Enter staff information to create a new record"}
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
                Staff Name <span>*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter staff name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>
                Email <span>*</span>
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            {!editingStaff && (
              <div className="form-field">
                <label>
                  Password <span>*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="form-field">
              <label>
                Phone <span>*</span>
              </label>
              <input
                type="text"
                name="phone"
                placeholder="Enter 10-digit phone number"
                value={formData.phone}
                onChange={handleChange}
                maxLength="10"
              />
            </div>

            <div className="form-field">
              <label>
                Address <span>*</span>
              </label>
              <input
                type="text"
                name="address"
                placeholder="Enter address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>
                Designation <span>*</span>
              </label>
              <input
                type="text"
                name="designation"
                placeholder="Enter designation"
                value={formData.designation}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label>Assigned Students</label>
              <select
                multiple
                value={formData.assignedStudents}
                onChange={handleStudentChange}
              >
                {students.length === 0 ? (
                  <option disabled>No students available</option>
                ) : (
                  students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.user?.name || "Unknown Student"}
                    </option>
                  ))
                )}
              </select>
              <small>Hold Ctrl and select multiple students.</small>
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
                  : editingStaff
                    ? "Update Staff"
                    : "Save Staff"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="table-card">
        <div className="table-header">
          <div>
            <h2>Staff Records</h2>
            <p>
              Showing <strong>{staff.length}</strong> staff member
              {staff.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {staff.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">S</div>
            <h3>No staff found</h3>
            <p>There are no staff records available yet.</p>
            <button
              className="primary-btn"
              onClick={() => setShowForm(true)}
            >
              + Add Staff
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Designation</th>
                  <th>Assigned Students</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {staff.map((staffMember) => (
                  <tr key={staffMember._id}>
                    <td>
                      <strong>
                        {staffMember.user?.name || "-"}
                      </strong>
                    </td>
                    <td>
                      {staffMember.user?.email || "-"}
                    </td>
                    <td>{staffMember.phone || "-"}</td>
                    <td>
                      <span className="designation-badge">
                        {staffMember.designation || "-"}
                      </span>
                    </td>
                    <td>
                      {staffMember.assignedStudents?.length > 0 ? (
                        <div className="assigned-students">
                          {staffMember.assignedStudents.map((student) => (
                            <span className="student-badge" key={student._id}>
                              {student.user?.name || "Unknown"}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="muted-text">No students</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={
                          staffMember.user?.isActive
                            ? "status-badge active"
                            : "status-badge inactive"
                        }
                      >
                        {staffMember.user?.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(staffMember)}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(staffMember._id)}
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

export default Staff;