import bcrypt from "bcryptjs";

import { User } from "../models/User.js";
import { Student } from "../models/student.js";
import { Course } from "../models/course.js";
import { Staff } from "../models/staff.js";

import {
    isValidEmail,
    isValidPassword,
    isValidObjectId
} from "../utils/validate.js";


// CREATE STUDENT
export const createStudent = async (req, res) => {
    const {
        name,
        email,
        password,
        phone,
        address,
        course
    } = req.body;

    // Required fields
    if (
        !name ||
        !email ||
        !password ||
        !phone ||
        !address ||
        !course
    ) {
        return res.status(400).json({
            success: false,
            message: "Name, email, password, phone, address and course are required"
        });
    }

    // Empty field validation
    if (
        !name.trim() ||
        !phone.trim() ||
        !address.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "Fields cannot be empty"
        });
    }

    // Email validation
    if (!isValidEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }

    // Password validation
    if (!isValidPassword(password)) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters"
        });
    }

    // Course ID validation
    if (!isValidObjectId(course)) {
        return res.status(400).json({
            success: false,
            message: "Invalid course ID"
        });
    }

    // Check course
    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
        return res.status(404).json({
            success: false,
            message: "Course not found"
        });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const existingUser = await User.findOne({
        email: normalizedEmail
    });

    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: "Email already exists"
        });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
        password,
        10
    );

    // Create user
    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "student"
    });

    // Create student profile
    const student = await Student.create({
        user: user._id,
        phone: phone.trim(),
        address: address.trim(),
        course
    });

    // Remove password
    const userData = user.toObject();
    delete userData.password;

    return res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: {
            student,
            user: userData
        }
    });
};


// GET ALL STUDENTS
export const getStudents = async (req, res) => {
    const students = await Student.find()
        .populate("user", "name email role isActive")
        .populate("course", "name description duration fee")
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        message: "Students fetched successfully",
        data: students
    });
};


// UPDATE STUDENT
export const updateStudent = async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid student ID"
        });
    }

    const student = await Student.findById(id);

    if (!student) {
        return res.status(404).json({
            success: false,
            message: "Student not found"
        });
    }

    const {
        name,
        email,
        phone,
        address,
        course
    } = req.body;

    // Validate name
    if (name !== undefined) {
        if (
            typeof name !== "string" ||
            !name.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Name cannot be empty"
            });
        }
    }

    // Validate email
    if (email !== undefined) {
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }
    }

    // Validate phone
    if (phone !== undefined) {
        if (
            typeof phone !== "string" ||
            !phone.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Phone cannot be empty"
            });
        }
    }

    // Validate address
    if (address !== undefined) {
        if (
            typeof address !== "string" ||
            !address.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Address cannot be empty"
            });
        }
    }

    // Validate course
    if (course !== undefined) {
        if (!isValidObjectId(course)) {
            return res.status(400).json({
                success: false,
                message: "Invalid course ID"
            });
        }

        const existingCourse = await Course.findById(course);

        if (!existingCourse) {
            return res.status(404).json({
                success: false,
                message: "Course not found"
            });
        }
    }

    // Find user
    const user = await User.findById(student.user);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "Student user not found"
        });
    }

    // Update email
    if (email !== undefined) {
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
            _id: { $ne: user._id }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        user.email = normalizedEmail;
    }

    // Update user name
    if (name !== undefined) {
        user.name = name.trim();
    }

    await user.save();

    // Update student fields
    if (phone !== undefined) {
        student.phone = phone.trim();
    }

    if (address !== undefined) {
        student.address = address.trim();
    }

    if (course !== undefined) {
        student.course = course;
    }

    await student.save();

    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
        success: true,
        message: "Student updated successfully",
        data: {
            student,
            user: userData
        }
    });
};


// DELETE STUDENT
export const deleteStudent = async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid student ID"
        });
    }

    const student = await Student.findById(id);

    if (!student) {
        return res.status(404).json({
            success: false,
            message: "Student not found"
        });
    }

    // Find related user
    const user = await User.findById(student.user);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "Student user not found"
        });
    }

    // Remove student from staff assignments
    await Staff.updateMany(
        {
            assignedStudents: student._id
        },
        {
            $pull: {
                assignedStudents: student._id
            }
        }
    );

    // Delete student profile
    await Student.findByIdAndDelete(student._id);

    // Delete user account
    await User.findByIdAndDelete(student.user);

    return res.status(200).json({
        success: true,
        message: "Student deleted successfully"
    });
};