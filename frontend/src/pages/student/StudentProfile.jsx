import { useContext } from "react";

import { AuthContext } from "../../context/AuthContext";

const StudentProfile = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>My Profile</h1>
          <p>View your profile information.</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          {user?.name?.charAt(0)?.toUpperCase()}
        </div>

        <div className="profile-info">
          <div className="profile-item">
            <span>Name</span>
            <strong>{user?.name}</strong>
          </div>

          <div className="profile-item">
            <span>Email</span>
            <strong>{user?.email}</strong>
          </div>

          <div className="profile-item">
            <span>Role</span>
            <strong>{user?.role}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;