import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        phone: {
            type: String,
            trim: true
        },

        address: {
            type: String,
            trim: true
        },

        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Student = mongoose.model(
    "Student",
    studentSchema
);