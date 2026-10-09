import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
    {
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true
        },

        trainer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        topic: {
            type: String,
            required: true,
            trim: true
        },

        date: {
            type: Date,
            required: true
        },

        startTime: {
            type: String,
            required: true,
            trim: true
        },

        endTime: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

classSchema.index({
    course: 1,
    date: 1
});

export const Class = mongoose.model(
    "Class",
    classSchema
);