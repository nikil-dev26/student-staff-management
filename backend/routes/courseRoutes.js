import express from "express";

import {
    createCourse,
    getCourse,
    updateCourse,
    deleteCourse
} from "../controllers/courseController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();


// ===============================
// CREATE COURSE
// Admin only
// ===============================

router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    asyncHandler(createCourse)
);


// ===============================
// GET ALL COURSES
// Public
// ===============================
// Register page needs this before
// the student logs in.

router.get(
    "/",
    asyncHandler(getCourse)
);


// ===============================
// UPDATE COURSE
// Admin only
// ===============================

router.put(
    "/:id",
    protect,
    authorizeRoles("admin"),
    asyncHandler(updateCourse)
);


// ===============================
// DELETE COURSE
// Admin only
// ===============================

router.delete(
    "/:id",
    protect,
    authorizeRoles("admin"),
    asyncHandler(deleteCourse)
);


export default router;