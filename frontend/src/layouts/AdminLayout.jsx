import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="app-layout">
      <Navbar role="Admin" />
      <div className="layout">
        <Sidebar role="admin" />
        <main className="main-content">
          <div className="content-container">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;