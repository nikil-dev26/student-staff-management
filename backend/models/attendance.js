import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        userType: {
            type: String,
            enum: ["student", "staff"],
            required: true
        },

        date: {
            type: Date,
            required: true
        },

        attendanceDay: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["Present", "Absent", "Leave"],
            default: "Present"
        },

        loginTime: {
            type: Date,
            default: null
        },

        logoutTime: {
            type: Date,
            default: null
        }
    },
    {
        timestamps: true
    }
);

// One attendance record per user per day
attendanceSchema.index(
    { user: 1, attendanceDay: 1 },
    { unique: true }
);

// Faster date-wise attendance reports
attendanceSchema.index({
    attendanceDay: 1,
    userType: 1
});

export const Attendance = mongoose.model(
    "Attendance",
    attendanceSchema
);