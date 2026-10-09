import express from "express";

import {
    createStudent,
    getStudents,
    updateStudent,
    deleteStudent
} from "../controllers/studentController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

import { asyncHandler } from "../utils/asyncHandler.js";


const router = express.Router();


// CREATE STUDENT
router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    asyncHandler(createStudent)
);


// GET ALL STUDENTS
router.get(
    "/",
    protect,
    authorizeRoles("admin"),
    asyncHandler(getStudents)
);


// UPDATE STUDENT
router.put(
    "/:id",
    protect,
    authorizeRoles("admin"),
    asyncHandler(updateStudent)
);


// DELETE STUDENT
router.delete(
    "/:id",
    protect,
    authorizeRoles("admin"),
    asyncHandler(deleteStudent)
);


export default router;