import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User } from "../models/User.js";
import { Student } from "../models/student.js";

// ===============================
// REGISTER STUDENT
// ===============================

export const register = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            address,
            course,
        } = req.body;

        // ===============================
        // VALIDATION
        // ===============================

        if (
            !name?.trim() ||
            !email?.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, email and password are required",
            });
        }

        // ===============================
        // PASSWORD VALIDATION
        // ===============================

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 6 characters long",
            });
        }

        // ===============================
        // EMAIL
        // ===============================

        const normalizedEmail =
            email.trim().toLowerCase();

        // ===============================
        // CHECK EXISTING USER
        // ===============================

        const existingUser =
            await User.findOne({
                email: normalizedEmail,
            });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        // ===============================
        // HASH PASSWORD
        // ===============================

        const hashedPassword =
            await bcrypt.hash(password, 10);

        // ===============================
        // CREATE USER
        // ===============================

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,

            // Public registration is ONLY
            // for students.
            role: "student",

            isActive: true,
        });

        // ===============================
        // CREATE STUDENT PROFILE
        // ===============================

        let student;

        try {
            student = await Student.create({
                user: user._id,
                phone: phone?.trim() || "",
                address: address?.trim() || "",
                course: course || "",
            });
        } catch (studentError) {
            // Rollback User if Student
            // creation fails.

            await User.findByIdAndDelete(
                user._id
            );

            throw studentError;
        }

        // ===============================
        // REMOVE PASSWORD
        // ===============================

        const userData = user.toObject();

        delete userData.password;

        // ===============================
        // RESPONSE
        // ===============================

        return res.status(201).json({
            success: true,

            message:
                "Student registered successfully",

            data: {
                user: userData,
                student,
            },
        });
    } catch (error) {
        console.error(
            "Register error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Registration failed",
        });
    }
};

// ===============================
// LOGIN
// ===============================

export const login = async (req, res) => {
    try {
        const {
            email,
            password,
        } = req.body;

        // ===============================
        // VALIDATION
        // ===============================

        if (
            !email?.trim() ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Email and password are required",
            });
        }

        // ===============================
        // FIND USER
        // ===============================

        const user =
            await User.findOne({
                email:
                    email.trim().toLowerCase(),
            });

        if (!user) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password",
            });
        }

        // ===============================
        // ACTIVE CHECK
        // ===============================

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message:
                    "Your account is inactive",
            });
        }

        // ===============================
        // PASSWORD CHECK
        // ===============================

        const isPasswordMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message:
                    "Invalid email or password",
            });
        }

        // ===============================
        // JWT
        // ===============================

        const token = jwt.sign(
            {
                userId: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d",
            }
        );

        // ===============================
        // REMOVE PASSWORD
        // ===============================

        const userData =
            user.toObject();

        delete userData.password;

        // ===============================
        // RESPONSE
        // ===============================

        return res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            data: userData,
        });
    } catch (error) {
        console.error(
            "Login error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
};