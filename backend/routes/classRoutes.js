import express from "express";

import {
    createClass,
    getMyClasses,
    getTodayClasses
} from "../controllers/classController.js";

import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

import { asyncHandler } from "../utils/asyncHandler.js";


const router = express.Router();


// ========================================
// CREATE CLASS
// Staff only
// ========================================

router.post(
    "/",
    protect,
    authorizeRoles("staff"),
    asyncHandler(createClass)
);


// ========================================
// GET MY CLASSES
// Staff only
// ========================================

router.get(
    "/my",
    protect,
    authorizeRoles("staff"),
    asyncHandler(getMyClasses)
);


// ========================================
// GET TODAY'S CLASSES
// Student only
// ========================================

router.get(
    "/today",
    protect,
    authorizeRoles("student"),
    asyncHandler(getTodayClasses)
);


export default router;