import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const StaffLayout = ({ children }) => {
  return (
    <div className="app-layout staff-theme">
      <Navbar role="Staff" />
      <div className="layout">
        <Sidebar role="staff" />
        <main className="main-content">
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;