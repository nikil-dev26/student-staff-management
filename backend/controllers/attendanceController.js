import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { Attendance } from "../models/attendance.js";
import { Student } from "../models/student.js";
import { Staff } from "../models/staff.js";
import { User } from "../models/User.js";

import { getAttendanceDay } from "../utils/attendance.js";

// ======================================================
// Helper Functions
// ======================================================

const isValidDateFormat = (date) => {
    return /^\d{4}-\d{2}-\d{2}$/.test(date);
};

const getDateRange = (fromDate, toDate) => {
    const dates = [];

    const current = new Date(
        `${fromDate}T12:00:00`
    );

    const end = new Date(
        `${toDate}T12:00:00`
    );

    while (current <= end) {
        const year = current.getFullYear();

        const month = String(
            current.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            current.getDate()
        ).padStart(2, "0");

        dates.push(
            `${year}-${month}-${day}`
        );

        current.setDate(
            current.getDate() + 1
        );
    }

    return dates;
};

const getDateKey = (date) => {
    const value = new Date(date);

    const year = value.getFullYear();

    const month = String(
        value.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        value.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

// ======================================================
// LOGIN ATTENDANCE
// Student / Staff
// ======================================================

export const markLoginAttendance = async (
    req,
    res
) => {
    try {
        const userId =
            req.user.userId;

        const user =
            await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (
            !["student", "staff"].includes(
                user.role
            )
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Only students and staff can mark login attendance"
            });
        }

        const today =
            new Date();

        const attendanceDay =
            getAttendanceDay(today);

        const existingAttendance =
            await Attendance.findOne({
                user: userId,
                attendanceDay
            });

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message:
                    "Attendance already marked for this date.",
                attendance:
                    existingAttendance
            });
        }

        const attendance =
            await Attendance.create({
                user: userId,
                userType: user.role,
                date: today,
                attendanceDay,
                status: "Present",
                loginTime: today,
                logoutTime: null
            });

        return res.status(201).json({
            success: true,
            message:
                "Login attendance marked successfully",
            attendance
        });

    } catch (error) {
        console.error(
            "Login attendance error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to mark login attendance",
            error: error.message
        });
    }
};

// ======================================================
// LOGOUT ATTENDANCE
// Student / Staff
// ======================================================

export const markLogoutAttendance = async (
    req,
    res
) => {
    try {
        const userId =
            req.user.userId;

        const today =
            new Date();

        const attendanceDay =
            getAttendanceDay(today);

        const attendance =
            await Attendance.findOne({
                user: userId,
                attendanceDay
            });

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message:
                    "Login attendance not found for today."
            });
        }

        if (attendance.logoutTime) {
            return res.status(400).json({
                success: false,
                message:
                    "Logout attendance already marked."
            });
        }

        attendance.logoutTime =
            today;

        await attendance.save();

        return res.status(200).json({
            success: true,
            message:
                "Logout attendance marked successfully",
            attendance
        });

    } catch (error) {
        console.error(
            "Logout attendance error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to mark logout attendance",
            error: error.message
        });
    }
};

// ======================================================
// MARK STUDENT ATTENDANCE
// Admin / Staff
// ======================================================

export const markStudentAttendance = async (
    req,
    res
) => {
    try {
        const {
            studentId,
            date,
            status
        } = req.body;

        if (
            !studentId ||
            !date ||
            !status
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Student, date and status are required"
            });
        }

        if (
            !["Present", "Absent", "Leave"].includes(
                status
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid attendance status"
            });
        }

        const student =
            await Student.findById(
                studentId
            ).populate(
                "user",
                "name email role"
            );

        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found"
            });
        }

        if (!student.user) {
            return res.status(404).json({
                success: false,
                message:
                    "Student user not found"
            });
        }

        // Staff can mark only assigned students
        if (
            req.user.role === "staff"
        ) {
            const staff =
                await Staff.findOne({
                    user: req.user.userId
                });

            if (!staff) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Staff profile not found"
                });
            }

            const isAssigned =
                staff.assignedStudents.some(
                    (id) =>
                        id.toString() ===
                        studentId.toString()
                );

            if (!isAssigned) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to mark attendance for this student"
                });
            }
        }

        const attendanceDate =
            new Date(`${date}T00:00:00`);

        if (
            isNaN(
                attendanceDate.getTime()
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid attendance date"
            });
        }

        const attendanceDay =
            getAttendanceDay(
                attendanceDate
            );

        const existingAttendance =
            await Attendance.findOne({
                user: student.user._id,
                attendanceDay
            });

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message:
                    "Attendance already marked for this date.",
                attendance:
                    existingAttendance
            });
        }

        const attendance =
            await Attendance.create({
                user: student.user._id,
                userType: "student",
                date: attendanceDate,
                attendanceDay,
                status,
                loginTime: null,
                logoutTime: null
            });

        return res.status(201).json({
            success: true,
            message:
                "Student attendance marked successfully",
            attendance
        });

    } catch (error) {
        console.error(
            "Mark student attendance error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to mark student attendance",
            error: error.message
        });
    }
};

// ======================================================
// MARK STAFF ATTENDANCE
// Admin
// ======================================================

export const markStaffAttendance = async (
    req,
    res
) => {
    try {
        const {
            staffId,
            date,
            status
        } = req.body;

        if (
            !staffId ||
            !date ||
            !status
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Staff, date and status are required"
            });
        }

        if (
            !["Present", "Absent", "Leave"].includes(
                status
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid attendance status"
            });
        }

        const staff =
            await Staff.findById(
                staffId
            ).populate(
                "user",
                "name email role"
            );

        if (!staff) {
            return res.status(404).json({
                success: false,
                message:
                    "Staff not found"
            });
        }

        if (!staff.user) {
            return res.status(404).json({
                success: false,
                message:
                    "Staff user not found"
            });
        }

        const attendanceDate =
            new Date(`${date}T00:00:00`);

        if (
            isNaN(
                attendanceDate.getTime()
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid attendance date"
            });
        }

        const attendanceDay =
            getAttendanceDay(
                attendanceDate
            );

        const existingAttendance =
            await Attendance.findOne({
                user: staff.user._id,
                attendanceDay
            });

        if (existingAttendance) {
            return res.status(400).json({
                success: false,
                message:
                    "Attendance already marked for this date.",
                attendance:
                    existingAttendance
            });
        }

        const attendance =
            await Attendance.create({
                user: staff.user._id,
                userType: "staff",
                date: attendanceDate,
                attendanceDay,
                status,
                loginTime: null,
                logoutTime: null
            });

        return res.status(201).json({
            success: true,
            message:
                "Staff attendance marked successfully",
            attendance
        });

    } catch (error) {
        console.error(
            "Mark staff attendance error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to mark staff attendance",
            error: error.message
        });
    }
};

// ======================================================
// VIEW MY ATTENDANCE
// Student / Staff
// ======================================================

export const viewMyAttendance = async (
    req,
    res
) => {
    try {
        const userId =
            req.user.userId;

        const attendance =
            await Attendance.find({
                user: userId
            })
                .sort({
                    attendanceDay: -1
                })
                .lean();

        return res.status(200).json({
            success: true,
            message:
                "Attendance fetched successfully",
            data: attendance
        });

    } catch (error) {
        console.error(
            "View my attendance error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch attendance",
            error: error.message
        });
    }
};

// ======================================================
// GET SINGLE STUDENT ATTENDANCE
// Admin / Staff
// ======================================================

export const getStudentAttendance = async (
    req,
    res
) => {
    try {
        const {
            studentId
        } = req.params;

        const student =
            await Student.findById(
                studentId
            ).populate(
                "user",
                "name email role"
            );

        if (!student) {
            return res.status(404).json({
                success: false,
                message:
                    "Student not found"
            });
        }

        // Staff can view only assigned students
        if (
            req.user.role === "staff"
        ) {
            const staff =
                await Staff.findOne({
                    user: req.user.userId
                });

            if (!staff) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Staff profile not found"
                });
            }

            const isAssigned =
                staff.assignedStudents.some(
                    (id) =>
                        id.toString() ===
                        studentId.toString()
                );

            if (!isAssigned) {
                return res.status(403).json({
                    success: false,
                    message:
                        "You are not authorized to view this student's attendance"
                });
            }
        }

        const attendance =
            await Attendance.find({
                user: student.user._id,
                userType: "student"
            })
                .sort({
                    attendanceDay: -1
                })
                .lean();

        return res.status(200).json({
            success: true,
            message:
                "Student attendance fetched successfully",
            data: attendance
        });

    } catch (error) {
        console.error(
            "Get student attendance error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch student attendance",
            error: error.message
        });
    }
};

// ======================================================
// GET ALL STUDENT ATTENDANCE
// Admin
// ======================================================

export const getAllStudentAttendance = async (
    req,
    res
) => {
    try {
        const attendance =
            await Attendance.find({
                userType: "student"
            })
                .populate(
                    "user",
                    "name email role isActive"
                )
                .sort({
                    attendanceDay: -1
                })
                .lean();

        return res.status(200).json({
            success: true,
            message:
                "All student attendance fetched successfully",
            data: attendance
        });

    } catch (error) {
        console.error(
            "Get all student attendance error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch student attendance",
            error: error.message
        });
    }
};

// ======================================================
// GET ALL STAFF ATTENDANCE
// Admin
// ======================================================

export const getAllStaffAttendance = async (
    req,
    res
) => {
    try {
        const attendance =
            await Attendance.find({
                userType: "staff"
            })
                .populate(
                    "user",
                    "name email role isActive"
                )
                .sort({
                    attendanceDay: -1
                })
                .lean();

        return res.status(200).json({
            success: true,
            message:
                "All staff attendance fetched successfully",
            data: attendance
        });

    } catch (error) {
        console.error(
            "Get all staff attendance error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to fetch staff attendance",
            error: error.message
        });
    }
};

// ======================================================
// NEXT LEVEL ATTENDANCE REPORT
// Admin
//
// Supports:
// - Date range
// - All / Student / Staff
// - Single Student / Staff using userId
// - Status filter
// - Missing attendance = calculated Absent
// - Attendance percentage
// ======================================================

export const getAttendanceReport = async (
    req,
    res
) => {
    try {
        const {
            fromDate: queryFromDate,
            toDate: queryToDate,
            date,
            userType = "all",
            status = "all",
            userId
        } = req.query;

        // -----------------------------------------
        // Date handling
        // -----------------------------------------

        const fromDate =
            queryFromDate || date;

        const toDate =
            queryToDate || date;

        if (!fromDate || !toDate) {
            return res.status(400).json({
                success: false,
                message:
                    "From date and to date are required"
            });
        }

        if (
            !isValidDateFormat(fromDate) ||
            !isValidDateFormat(toDate)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid date format. Use YYYY-MM-DD"
            });
        }

        if (fromDate > toDate) {
            return res.status(400).json({
                success: false,
                message:
                    "From date cannot be greater than to date"
            });
        }

        // -----------------------------------------
        // Future date validation
        // -----------------------------------------

        const today =
            getAttendanceDay(
                new Date()
            );

        if (toDate > today) {
            return res.status(400).json({
                success: false,
                message:
                    "To date cannot be a future date"
            });
        }

        // -----------------------------------------
        // User type validation
        // -----------------------------------------

        if (
            ![
                "all",
                "student",
                "staff"
            ].includes(userType)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid user type"
            });
        }

        // -----------------------------------------
        // Status validation
        // -----------------------------------------

        if (
            ![
                "all",
                "Present",
                "Absent",
                "Leave"
            ].includes(status)
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid attendance status"
            });
        }

        // -----------------------------------------
        // User ID validation
        // -----------------------------------------

        if (
            userId &&
            !mongoose.Types.ObjectId.isValid(
                userId
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid user ID"
            });
        }

        // -----------------------------------------
        // Generate date range
        // -----------------------------------------

        const dates =
            getDateRange(
                fromDate,
                toDate
            );

        // -----------------------------------------
        // Get students and staff
        // -----------------------------------------

        const [
            students,
            staff
        ] = await Promise.all([
            Student.find()
                .populate(
                    "user",
                    "name email role isActive createdAt"
                )
                .lean(),

            Staff.find()
                .populate(
                    "user",
                    "name email role isActive createdAt"
                )
                .lean()
        ]);

        // -----------------------------------------
        // Build eligible users
        // -----------------------------------------

        let eligibleUsers = [];

        // Students
        if (
            userType === "all" ||
            userType === "student"
        ) {
            const studentUsers =
                students
                    .filter(
                        (student) =>
                            student.user
                    )
                    .map(
                        (student) => ({
                            user:
                                student.user,

                            userType:
                                "student"
                        })
                    );

            eligibleUsers.push(
                ...studentUsers
            );
        }

        // Staff
        if (
            userType === "all" ||
            userType === "staff"
        ) {
            const staffUsers =
                staff
                    .filter(
                        (staffMember) =>
                            staffMember.user
                    )
                    .map(
                        (staffMember) => ({
                            user:
                                staffMember.user,

                            userType:
                                "staff"
                        })
                    );

            eligibleUsers.push(
                ...staffUsers
            );
        }

        // -----------------------------------------
        // Single user filter
        // -----------------------------------------

        if (userId) {
            eligibleUsers =
                eligibleUsers.filter(
                    (item) =>
                        item.user._id.toString() ===
                        userId
                );
        }

        // -----------------------------------------
        // Attendance query
        // -----------------------------------------

        const attendanceQuery = {
            attendanceDay: {
                $gte: fromDate,
                $lte: toDate
            }
        };

        if (userType !== "all") {
            attendanceQuery.userType =
                userType;
        }

        if (userId) {
            attendanceQuery.user =
                userId;
        }

        // -----------------------------------------
        // Get actual attendance records
        // -----------------------------------------

        const attendanceRecords =
            await Attendance.find(
                attendanceQuery
            )
                .populate(
                    "user",
                    "name email role isActive createdAt"
                )
                .sort({
                    attendanceDay: 1,
                    userType: 1
                })
                .lean();

        // -----------------------------------------
        // Attendance lookup map
        // -----------------------------------------

        const attendanceMap =
            new Map();

        attendanceRecords.forEach(
            (record) => {
                if (!record.user) {
                    return;
                }

                const key =
                    `${record.user._id.toString()}_${record.attendanceDay}`;

                attendanceMap.set(
                    key,
                    record
                );
            }
        );

        // -----------------------------------------
        // Generate complete attendance report
        // -----------------------------------------

        const reportAttendance = [];

        eligibleUsers.forEach(
            (eligibleUser) => {

                const user =
                    eligibleUser.user;

                const userCreatedDate =
                    getDateKey(
                        user.createdAt
                    );

                dates.forEach(
                    (day) => {

                        // User should not have
                        // attendance before creation.
                        if (
                            day <
                            userCreatedDate
                        ) {
                            return;
                        }

                        const key =
                            `${user._id.toString()}_${day}`;

                        const existingRecord =
                            attendanceMap.get(
                                key
                            );

                        // Actual attendance
                        if (
                            existingRecord
                        ) {
                            reportAttendance.push(
                                existingRecord
                            );

                            return;
                        }

                        // Missing attendance
                        // = calculated Absent
                        reportAttendance.push({
                            _id:
                                `calculated-${user._id}-${day}`,

                            user: {
                                _id:
                                    user._id,

                                name:
                                    user.name,

                                email:
                                    user.email,

                                role:
                                    user.role,

                                isActive:
                                    user.isActive
                            },

                            userType:
                                eligibleUser.userType,

                            date:
                                new Date(
                                    `${day}T00:00:00`
                                ),

                            attendanceDay:
                                day,

                            status:
                                "Absent",

                            loginTime:
                                null,

                            logoutTime:
                                null,

                            isCalculatedAbsent:
                                true
                        });
                    }
                );
            }
        );

        // -----------------------------------------
        // Overall summary
        // -----------------------------------------

        const total =
            reportAttendance.length;

        const present =
            reportAttendance.filter(
                (item) =>
                    item.status ===
                    "Present"
            ).length;

        const absent =
            reportAttendance.filter(
                (item) =>
                    item.status ===
                    "Absent"
            ).length;

        const leave =
            reportAttendance.filter(
                (item) =>
                    item.status ===
                    "Leave"
            ).length;

        const attendancePercentage =
            total > 0
                ? Number(
                    (
                        (present / total) *
                        100
                    ).toFixed(2)
                )
                : 0;

        // -----------------------------------------
        // Status filter
        // -----------------------------------------

        const filteredAttendance =
            status === "all"
                ? reportAttendance
                : reportAttendance.filter(
                    (item) =>
                        item.status ===
                        status
                );

        // -----------------------------------------
        // Response
        // -----------------------------------------

        return res.status(200).json({
            success: true,

            message:
                "Attendance report generated successfully",

            data: {
                fromDate,

                toDate,

                userType,

                userId:
                    userId || null,

                status,

                totalDays:
                    dates.length,

                eligibleUsers:
                    eligibleUsers.length,

                total,

                present,

                absent,

                leave,

                attendancePercentage,

                filteredTotal:
                    filteredAttendance.length,

                attendance:
                    filteredAttendance
            }
        });

    } catch (error) {
        console.error(
            "Get attendance report error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to generate attendance report",
            error: error.message
        });
    }
};