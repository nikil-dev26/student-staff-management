import bcrypt from "bcryptjs";

import { User } from "../models/User.js";
import { Staff } from "../models/staff.js";
import { Student } from "../models/student.js";

import {
    isValidEmail,
    isValidPassword,
    isValidObjectId
} from "../utils/validate.js";


// CREATE STAFF
export const createStaff = async (req, res) => {
    const {
        name,
        email,
        password,
        phone,
        address,
        designation,
        assignedStudents
    } = req.body;

    // Required fields
    if (
        !name ||
        !email ||
        !password ||
        !phone ||
        !address ||
        !designation
    ) {
        return res.status(400).json({
            success: false,
            message: "Name, email, password, phone, address and designation are required"
        });
    }

    // Empty field validation
    if (
        !name.trim() ||
        !phone.trim() ||
        !address.trim() ||
        !designation.trim()
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

    // assignedStudents must be an array if provided
    if (
        assignedStudents !== undefined &&
        !Array.isArray(assignedStudents)
    ) {
        return res.status(400).json({
            success: false,
            message: "assignedStudents must be an array"
        });
    }

    // Validate assigned students
    let validAssignedStudents = [];

    if (assignedStudents !== undefined) {
        for (const studentId of assignedStudents) {
            if (!isValidObjectId(studentId)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid student ID: ${studentId}`
                });
            }
        }

        validAssignedStudents = await Student.find({
            _id: { $in: assignedStudents }
        }).select("_id");

        if (
            validAssignedStudents.length !==
            new Set(assignedStudents).size
        ) {
            return res.status(404).json({
                success: false,
                message: "One or more students not found"
            });
        }

        validAssignedStudents = validAssignedStudents.map(
            (student) => student._id
        );
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

    // Create User
    const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: "staff"
    });

    try {
        // Create Staff profile
        const staff = await Staff.create({
            user: user._id,
            phone: phone.trim(),
            address: address.trim(),
            designation: designation.trim(),
            assignedStudents: validAssignedStudents
        });

        const userData = user.toObject();
        delete userData.password;

        return res.status(201).json({
            success: true,
            message: "Staff created successfully",
            data: {
                staff,
                user: userData
            }
        });
    } catch (error) {
        // Remove user if staff profile creation fails
        await User.findByIdAndDelete(user._id);

        throw error;
    }
};


// GET ALL STAFF
export const getStaff = async (req, res) => {
    const staff = await Staff.find()
        .populate(
            "user",
            "name email role isActive"
        )
        .populate({
            path: "assignedStudents",
            select: "user phone address course",
            populate: {
                path: "user",
                select: "name email role isActive"
            }
        })
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        message: "Staff fetched successfully",
        data: staff
    });
};


// GET MY STAFF PROFILE
export const getMyStaffProfile = async (req, res) => {
    const staff = await Staff.findOne({
        user: req.user.userId
    })
        .populate(
            "user",
            "name email role isActive"
        )
        .populate({
            path: "assignedStudents",
            select: "user phone address course",

            populate: [
                {
                    path: "user",
                    select: "name email role isActive"
                },
                {
                    path: "course",
                    select: "name"
                }
            ]
        });

    if (!staff) {
        return res.status(404).json({
            success: false,
            message: "Staff profile not found"
        });
    }

    return res.status(200).json({
        success: true,
        message: "Staff profile fetched successfully",
        data: staff
    });
};
// UPDATE STAFF
export const updateStaff = async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid staff ID"
        });
    }

    const staff = await Staff.findById(id);

    if (!staff) {
        return res.status(404).json({
            success: false,
            message: "Staff not found"
        });
    }

    const {
        name,
        email,
        phone,
        address,
        designation,
        assignedStudents
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

    // Validate designation
    if (designation !== undefined) {
        if (
            typeof designation !== "string" ||
            !designation.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Designation cannot be empty"
            });
        }
    }

    // Validate assigned students
    let validAssignedStudents;

    if (assignedStudents !== undefined) {
        if (!Array.isArray(assignedStudents)) {
            return res.status(400).json({
                success: false,
                message: "assignedStudents must be an array"
            });
        }

        for (const studentId of assignedStudents) {
            if (!isValidObjectId(studentId)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid student ID: ${studentId}`
                });
            }
        }

        const students = await Student.find({
            _id: { $in: assignedStudents }
        }).select("_id");

        if (
            students.length !==
            new Set(assignedStudents).size
        ) {
            return res.status(404).json({
                success: false,
                message: "One or more students not found"
            });
        }

        validAssignedStudents = students.map(
            (student) => student._id
        );
    }

    // Find related user
    const user = await User.findById(staff.user);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "Staff user not found"
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

    // Update name
    if (name !== undefined) {
        user.name = name.trim();
    }

    await user.save();

    // Update staff fields
    if (phone !== undefined) {
        staff.phone = phone.trim();
    }

    if (address !== undefined) {
        staff.address = address.trim();
    }

    if (designation !== undefined) {
        staff.designation = designation.trim();
    }

    if (assignedStudents !== undefined) {
        staff.assignedStudents = validAssignedStudents;
    }

    await staff.save();

    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
        success: true,
        message: "Staff updated successfully",
        data: {
            staff,
            user: userData
        }
    });
};


// DELETE STAFF
export const deleteStaff = async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid staff ID"
        });
    }

    const staff = await Staff.findById(id);

    if (!staff) {
        return res.status(404).json({
            success: false,
            message: "Staff not found"
        });
    }

    const user = await User.findById(staff.user);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: "Staff user not found"
        });
    }

    // Delete staff profile
    await Staff.findByIdAndDelete(staff._id);

    // Delete staff login account
    await User.findByIdAndDelete(staff.user);

    return res.status(200).json({
        success: true,
        message: "Staff deleted successfully"
    });
};