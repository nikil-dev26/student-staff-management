import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">

            <div className="navbar-brand">
                <h2>ACADEMIX</h2>
            </div>

            <div className="navbar-right">

                <div className="navbar-user">
                    <strong>
                        {user?.name || "User"}
                    </strong>

                    <span>
                        {user?.role || ""}
                    </span>
                </div>

                <button
                    className="logout-btn"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </nav>
    );
};

export default Navbar;