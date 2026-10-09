import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        designation: {
            type: String,
            required: true,
            trim: true
        },

        assignedStudents: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student"
            }
        ]
    },
    {
        timestamps: true
    }
);

export const Staff = mongoose.model("Staff", staffSchema);