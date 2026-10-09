import express from "express";

import {
    register,
    login
} from "../controllers/authController.js";

import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();


// ===============================
// REGISTER
// ===============================

router.post(
    "/register",
    asyncHandler(register)
);


// ===============================
// LOGIN
// ===============================

router.post(
    "/login",
    asyncHandler(login)
);


export default router;