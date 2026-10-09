import { Class } from "../models/class.js";
import { Course } from "../models/course.js";
import { Student } from "../models/student.js";
import { Staff } from "../models/staff.js";

import { isValidObjectId } from "../utils/validate.js";


// ========================================
// CREATE CLASS
// Staff only
// ========================================

export const createClass = async (req, res) => {
    const {
        course,
        topic,
        date,
        startTime,
        endTime,
        description
    } = req.body;


    // Required fields
    if (
        !course ||
        !topic ||
        !date ||
        !startTime ||
        !endTime
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Course, topic, date, startTime and endTime are required"
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
    const existingCourse =
        await Course.findById(course);

    if (!existingCourse) {
        return res.status(404).json({
            success: false,
            message: "Course not found"
        });
    }


    // String validation
    if (
        typeof topic !== "string" ||
        !topic.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "Topic cannot be empty"
        });
    }


    if (
        typeof startTime !== "string" ||
        !startTime.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "Start time cannot be empty"
        });
    }


    if (
        typeof endTime !== "string" ||
        !endTime.trim()
    ) {
        return res.status(400).json({
            success: false,
            message: "End time cannot be empty"
        });
    }


    // Date validation
    const classDate = new Date(date);

    if (Number.isNaN(classDate.getTime())) {
        return res.status(400).json({
            success: false,
            message: "Invalid class date"
        });
    }


    // Time validation
    const timeRegex =
        /^([01]\d|2[0-3]):([0-5]\d)$/;


    if (!timeRegex.test(startTime)) {
        return res.status(400).json({
            success: false,
            message:
                "Start time must be in HH:mm format"
        });
    }


    if (!timeRegex.test(endTime)) {
        return res.status(400).json({
            success: false,
            message:
                "End time must be in HH:mm format"
        });
    }


    // Start time must be before end time
    if (startTime >= endTime) {
        return res.status(400).json({
            success: false,
            message:
                "End time must be later than start time"
        });
    }


    // Check logged-in staff
    const staff = await Staff.findOne({
        user: req.user.userId
    });

    if (!staff) {
        return res.status(404).json({
            success: false,
            message: "Staff profile not found"
        });
    }


    // Create class
    const newClass = await Class.create({
        course,
        trainer: req.user.userId,
        topic: topic.trim(),
        date: classDate,
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        description:
            typeof description === "string"
                ? description.trim()
                : ""
    });


    // Populate response
    await newClass.populate([
        {
            path: "course",
            select: "name description duration"
        },
        {
            path: "trainer",
            select: "name email role"
        }
    ]);


    return res.status(201).json({
        success: true,
        message: "Class scheduled successfully",
        data: newClass
    });
};


// ========================================
// GET MY CLASSES
// Staff only
// ========================================

export const getMyClasses = async (req, res) => {

    const classes = await Class.find({
        trainer: req.user.userId
    })
        .populate(
            "course",
            "name description duration"
        )
        .populate(
            "trainer",
            "name email role"
        )
        .sort({
            date: 1,
            startTime: 1
        });


    return res.status(200).json({
        success: true,
        message: "Classes fetched successfully",
        data: classes
    });
};


// ========================================
// GET TODAY'S CLASSES
// Student only
// ========================================

export const getTodayClasses = async (req, res) => {

    // Find logged-in student
    const student = await Student.findOne({
        user: req.user.userId
    });

    if (!student) {
        return res.status(404).json({
            success: false,
            message: "Student profile not found"
        });
    }


    // Today's date
    const today = new Date();

    const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999
    );


    // Find today's classes for student's course
    const classes = await Class.find({
        course: student.course,
        date: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    })
        .populate(
            "course",
            "name"
        )
        .populate(
            "trainer",
            "name email role"
        )
        .sort({
            startTime: 1
        });


    return res.status(200).json({
        success: true,
        message: "Today's classes fetched successfully",
        data: classes
    });
};