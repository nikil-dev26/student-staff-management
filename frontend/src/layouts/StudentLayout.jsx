import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const StudentLayout = ({ children }) => {
  return (
    <div className="app-layout student-theme">
      <Navbar role="Student" />
      <div className="layout">
        <Sidebar role="student" />
        <main className="main-content">
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;