import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        },

        duration: {
            type: String,
            required: true,
            trim: true
        },

        fee: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

export const Course = mongoose.model("Course", courseSchema);