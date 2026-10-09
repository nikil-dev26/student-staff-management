import { NavLink } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    const adminMenu = [
        {
            name: "Dashboard",
            path: "/admin"
        },
        {
            name: "Students",
            path: "/admin/students"
        },
        {
            name: "Staff",
            path: "/admin/staff"
        },
        {
            name: "Courses",
            path: "/admin/courses"
        },
        {
            name: "Attendance",
            path: "/admin/attendance"
        },
        {
            name: "Reports",
            path: "/admin/reports"
        }
    ];

    const staffMenu = [
        {
            name: "Dashboard",
            path: "/staff"
        },
        {
            name: "Profile",
            path: "/staff/profile"
        },
        {
            name: "Assigned Students",
            path: "/staff/students"
        },
        {
            name: "Student Attendance",
            path: "/staff/attendance"
        },
        {
            name: "My Attendance",
            path: "/staff/my-attendance"
        }
    ];

    const studentMenu = [
        {
            name: "Dashboard",
            path: "/student"
        },
        {
            name: "Profile",
            path: "/student/profile"
        },
        {
            name: "My Attendance",
            path: "/student/my-attendance"
        }
    ];

    let menu = [];

    if (user?.role === "admin") {
        menu = adminMenu;
    } else if (user?.role === "staff") {
        menu = staffMenu;
    } else if (user?.role === "student") {
        menu = studentMenu;
    }

    return (
        <aside className="sidebar">

            <div className="sidebar-title">
                <h2>Menu</h2>
            </div>

            <nav className="sidebar-menu">

                {menu.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === `/${user?.role}`}
                        className={({ isActive }) =>
                            isActive
                                ? "sidebar-link active"
                                : "sidebar-link"
                        }
                    >
                        {item.name}
                    </NavLink>
                ))}

            </nav>

        </aside>
    );
};

export default Sidebar;