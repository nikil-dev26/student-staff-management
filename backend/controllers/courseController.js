import { Course } from "../models/course.js";
import { isValidObjectId } from "../utils/validate.js";


// CREATE COURSE
export const createCourse = async (req, res) => {
    const {
        name,
        description,
        duration,
        fee
    } = req.body;

    // Required fields
    if (
        name === undefined ||
        description === undefined ||
        duration === undefined ||
        fee === undefined
    ) {
        return res.status(400).json({
            success: false,
            message: "Name, description, duration and fee are required"
        });
    }

    // String validation
    if (
        typeof name !== "string" ||
        typeof description !== "string" ||
        typeof duration !== "string"
    ) {
        return res.status(400).json({
            success: false,
            message: "Name, description and duration must be strings"
        });
    }

    // Empty field validation
    if (
        !name.trim() ||
        !description.trim() ||
        !duration.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "Course fields cannot be empty"
        });
    }

    // Fee validation
    if (
        typeof fee !== "number" ||
        Number.isNaN(fee) ||
        fee < 0
    ) {
        return res.status(400).json({
            success: false,
            message: "Fee must be a valid number greater than or equal to 0"
        });
    }

    // Duplicate course check
    const existingCourse = await Course.findOne({
        name: name.trim()
    });

    if (existingCourse) {
        return res.status(400).json({
            success: false,
            message: "Course already exists"
        });
    }

    const course = await Course.create({
        name: name.trim(),
        description: description.trim(),
        duration: duration.trim(),
        fee
    });

    return res.status(201).json({
        success: true,
        message: "Course created successfully",
        data: course
    });
};


// GET ALL COURSES
export const getCourse = async (req, res) => {
    const courses = await Course.find()
        .sort({ createdAt: -1 });

    return res.status(200).json({
        success: true,
        message: "Courses fetched successfully",
        data: courses
    });
};


// UPDATE COURSE
export const updateCourse = async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid course ID"
        });
    }

    const course = await Course.findById(id);

    if (!course) {
        return res.status(404).json({
            success: false,
            message: "Course not found"
        });
    }

    const {
        name,
        description,
        duration,
        fee
    } = req.body;

    // Name validation
    if (name !== undefined) {
        if (
            typeof name !== "string" ||
            !name.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Course name cannot be empty"
            });
        }

        const existingCourse = await Course.findOne({
            name: name.trim(),
            _id: { $ne: id }
        });

        if (existingCourse) {
            return res.status(400).json({
                success: false,
                message: "Course already exists"
            });
        }

        course.name = name.trim();
    }

    // Description validation
    if (description !== undefined) {
        if (
            typeof description !== "string" ||
            !description.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Description cannot be empty"
            });
        }

        course.description = description.trim();
    }

    // Duration validation
    if (duration !== undefined) {
        if (
            typeof duration !== "string" ||
            !duration.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Duration cannot be empty"
            });
        }

        course.duration = duration.trim();
    }

    // Fee validation
    if (fee !== undefined) {
        if (
            typeof fee !== "number" ||
            Number.isNaN(fee) ||
            fee < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Fee must be a valid number greater than or equal to 0"
            });
        }

        course.fee = fee;
    }

    await course.save();

    return res.status(200).json({
        success: true,
        message: "Course updated successfully",
        data: course
    });
};


// DELETE COURSE
export const deleteCourse = async (req, res) => {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid course ID"
        });
    }

    const course = await Course.findById(id);

    if (!course) {
        return res.status(404).json({
            success: false,
            message: "Course not found"
        });
    }

    await Course.findByIdAndDelete(id);

    return res.status(200).json({
        success: true,
        message: "Course deleted successfully"
    });
};