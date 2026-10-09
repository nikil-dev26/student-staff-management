import express from "express";

import {
    createStaff,
    getStaff,
    updateStaff,
    deleteStaff,
    getMyStaffProfile
} from "../controllers/staffController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

import { asyncHandler } from "../utils/asyncHandler.js";


const router = express.Router();


// CREATE STAFF
// Admin only
router.post(
    "/",
    protect,
    authorizeRoles("admin"),
    asyncHandler(createStaff)
);


// GET ALL STAFF
// Admin only
router.get(
    "/",
    protect,
    authorizeRoles("admin"),
    asyncHandler(getStaff)
);


// GET MY STAFF PROFILE
// Staff only
router.get(
    "/me",
    protect,
    authorizeRoles("staff"),
    asyncHandler(getMyStaffProfile)
);


// UPDATE STAFF
// Admin only
router.put(
    "/:id",
    protect,
    authorizeRoles("admin"),
    asyncHandler(updateStaff)
);


// DELETE STAFF
// Admin only
router.delete(
    "/:id",
    protect,
    authorizeRoles("admin"),
    asyncHandler(deleteStaff)
);


export default router;