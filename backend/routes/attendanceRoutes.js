import express from "express";

import {
    markLoginAttendance,
    markLogoutAttendance,
    markStudentAttendance,
    markStaffAttendance,
    viewMyAttendance,
    getStudentAttendance,
    getAllStudentAttendance,
    getAllStaffAttendance,
    getAttendanceReport
} from "../controllers/attendanceController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();


// ==========================================
// LOGIN / LOGOUT
// ==========================================

router.post(
    "/login",
    protect,
    authorizeRoles("student", "staff"),
    asyncHandler(markLoginAttendance)
);

router.post(
    "/logout",
    protect,
    authorizeRoles("student", "staff"),
    asyncHandler(markLogoutAttendance)
);


// ==========================================
// MANUAL STUDENT ATTENDANCE
// Admin / Staff
// ==========================================

router.post(
    "/student",
    protect,
    authorizeRoles("admin", "staff"),
    asyncHandler(markStudentAttendance)
);


// ==========================================
// MANUAL STAFF ATTENDANCE
// Admin only
// ==========================================

router.post(
    "/staff",
    protect,
    authorizeRoles("admin"),
    asyncHandler(markStaffAttendance)
);


// ==========================================
// MY ATTENDANCE
// Student / Staff
// ==========================================

router.get(
    "/my",
    protect,
    authorizeRoles("student", "staff"),
    asyncHandler(viewMyAttendance)
);


// ==========================================
// PARTICULAR STUDENT
// Admin / Staff
// ==========================================

router.get(
    "/student/:studentId",
    protect,
    authorizeRoles("admin", "staff"),
    asyncHandler(getStudentAttendance)
);


// ==========================================
// ALL STUDENT ATTENDANCE
// Admin
// ==========================================

router.get(
    "/student",
    protect,
    authorizeRoles("admin"),
    asyncHandler(getAllStudentAttendance)
);


// ==========================================
// ALL STAFF ATTENDANCE
// Admin
// ==========================================

router.get(
    "/staff",
    protect,
    authorizeRoles("admin"),
    asyncHandler(getAllStaffAttendance)
);


// ==========================================
// REPORT
// Admin
// ==========================================

router.get(
    "/report",
    protect,
    authorizeRoles("admin"),
    asyncHandler(getAttendanceReport)
);


export default router;