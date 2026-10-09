import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import { validateEnv } from "./config/env.js";

import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import classRoutes from "./routes/classRoutes.js";

import { errorMiddleware } from "./middleware/errorMiddleware.js";


// Load environment variables
dotenv.config();


// Validate environment variables
validateEnv();


// Create Express app
const app = express();


// Disable Express technology header
app.disable("x-powered-by");


// CORS
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true
    })
);


// JSON body parser
app.use(
    express.json({
        limit: "10kb"
    })
);


// Health / root route
app.get("/", (req, res) => {
    return res.status(200).json({
        success: true,
        message: "Student, Staff Management API is running"
    });
});


// API routes
app.use("/api/auth", authRoutes);

app.use("/api/students", studentRoutes);

app.use("/api/staff", staffRoutes);

app.use("/api/courses", courseRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/classes", classRoutes);


// 404 route
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});


// Global error middleware
app.use(errorMiddleware);


// Port
const PORT = process.env.PORT || 5000;


// Start server
const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });


        // Handle unhandled promise rejections
        process.on("unhandledRejection", (error) => {
            console.error(
                "Unhandled Rejection:",
                error
            );

            server.close(() => {
                process.exit(1);
            });
        });


        // Handle uncaught exceptions
        process.on("uncaughtException", (error) => {
            console.error(
                "Uncaught Exception:",
                error
            );

            server.close(() => {
                process.exit(1);
            });
        });

    } catch (error) {
        console.error(
            "Server startup failed:",
            error.message
        );

        process.exit(1);
    }
};


startServer();