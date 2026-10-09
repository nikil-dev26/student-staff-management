import { useEffect, useState } from "react";

import { getMyStaffProfile } from "../../services/staffService";

const StaffProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getMyStaffProfile();
        setProfile(response.data);
      } catch (error) {
        setError(
          error.response?.data?.message || "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        Loading profile...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        {error}
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>My Profile</h1>
          <p>View your staff profile.</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          {profile?.user?.name?.charAt(0)?.toUpperCase()}
        </div>

        <div className="profile-info">
          <div className="profile-item">
            <span>Name</span>
            <strong>{profile?.user?.name}</strong>
          </div>

          <div className="profile-item">
            <span>Email</span>
            <strong>{profile?.user?.email}</strong>
          </div>

          <div className="profile-item">
            <span>Phone</span>
            <strong>{profile?.phone || "-"}</strong>
          </div>

          <div className="profile-item">
            <span>Address</span>
            <strong>{profile?.address || "-"}</strong>
          </div>

          <div className="profile-item">
            <span>Designation</span>
            <strong>{profile?.designation || "-"}</strong>
          </div>

          <div className="profile-item">
            <span>Role</span>
            <strong>{profile?.user?.role}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffProfile;