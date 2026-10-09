import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { registerUser } from "../services/authService";
import { getCourses } from "../services/courseService";

const INITIAL_FORM_DATA = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  address: "",
  course: "",
};

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCourses = async () => {
      try {
        setCoursesLoading(true);
        const response = await getCourses();

        const courseList = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
          ? response.data.data
          : [];

        if (isMounted) {
          setCourses(courseList);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Failed to load courses:", err);
          setCourses([]);
          setError(
            err.response?.data?.message || "Failed to load courses"
          );
        }
      } finally {
        if (isMounted) {
          setCoursesLoading(false);
        }
      }
    };

    loadCourses();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!success) return;

    const timer = setTimeout(() => {
      navigate("/login");
    }, 1500);

    return () => clearTimeout(timer);
  }, [success, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword, phone, course } =
      formData;

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword ||
      !course
    ) {
      return "Please fill in all required fields";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address";
    }

    if (password.length < 6 || password.trim().length === 0) {
      return "Password must be at least 6 characters long";
    }

    if (password !== confirmPassword) {
      return "Passwords do not match";
    }

    if (phone.trim()) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone.trim())) {
        return "Phone number must contain exactly 10 digits";
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        course: formData.course,
      };

      const response = await registerUser(payload);

      setSuccess(
        response?.message || "Student registered successfully"
      );
      setFormData(INITIAL_FORM_DATA);
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const passwordsMatch = Boolean(
    formData.confirmPassword &&
      formData.password === formData.confirmPassword
  );
  const passwordsMismatch = Boolean(
    formData.confirmPassword &&
      formData.password !== formData.confirmPassword
  );

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      <div className="auth-card register-card">
        <div className="auth-header">
          <div className="login-logo">
            <svg
              viewBox="0 0 24 24"
              width="28"
              height="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>

          <h1>Create Student Account</h1>
          <p>Register your information</p>
        </div>

        {error && (
          <div className="auth-error" role="alert">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-success" role="status">
            <span>{success}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <fieldset
            disabled={loading}
            style={{ border: "none", padding: 0, margin: 0 }}
          >
            <div className="register-grid">
              <div className="form-group">
                <label htmlFor="name">
                  Full Name{" "}
                  <span className="required-star">*</span>
                </label>
                <div className="input-group">
                  <input
                    id="name"
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  Email Address{" "}
                  <span className="required-star">*</span>
                </label>
                <div className="input-group">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-group">
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength="10"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="course">
                  Course{" "}
                  <span className="required-star">*</span>
                </label>
                <div className="input-group">
                  <select
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    disabled={loading || coursesLoading}
                    required
                  >
                    <option value="">
                      {coursesLoading
                        ? "Loading courses..."
                        : "Select your course"}
                    </option>
                    {courses.map((course) => (
                      <option
                        key={course._id}
                        value={course._id}
                      >
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group grid-full">
                <label htmlFor="address">
                  Residential Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  autoComplete="street-address"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  Password{" "}
                  <span className="required-star">*</span>
                </label>
                <div className="input-group">
                  <input
                    id="password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    name="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="input-action-btn"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <div className="form-field-header">
                  <label htmlFor="confirmPassword">
                    Confirm Password{" "}
                    <span className="required-star">
                      *
                    </span>
                  </label>

                  {passwordsMatch && (
                    <span className="match-tag valid">
                      Matches
                    </span>
                  )}

                  {passwordsMismatch && (
                    <span className="match-tag invalid">
                      Doesn't match
                    </span>
                  )}
                </div>

                <div className="input-group">
                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    aria-invalid={passwordsMismatch}
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="input-action-btn"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) => !prev
                      )
                    }
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="auth-button register-btn"
              disabled={
                loading ||
                coursesLoading ||
                courses.length === 0
              }
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>
          </fieldset>
        </form>

        <div className="auth-footer">
          <p>Already have an account?</p>
          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;