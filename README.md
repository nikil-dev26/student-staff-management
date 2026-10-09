# Student–Staff Management System

A MERN Stack web application for managing students, staff members, and attendance through role-based access.

## Features

- User Registration and Login
- Role-Based Access Control (Admin, Staff, Student)
- Student Management
- Staff Management
- Student Attendance Management
- Staff Attendance Management
- Login and Logout Attendance Tracking
- Attendance History and Reports
- JWT Authentication and Protected Routes

## Tech Stack

**Frontend**
- React.js
- JavaScript
- HTML and CSS
- Axios
- React Router

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs

## Project Structure


student-staff-management/
├── backend/
└── frontend/


## Getting Started

### 1. Clone the repository


git clone https://github.com/nikil-dev26/student-staff-management.git
cd student-staff-management

### 2. Setup the Backend


cd backend
npm install


Create a `.env` file in the backend directory and configure the required environment variables according to your project.

Start the backend using the script defined in `backend/package.json`.

### 3. Setup the Frontend

Open another terminal:


cd frontend
npm install


Start the frontend using the script defined in `frontend/package.json`.

## Security

- Environment variables and credentials should not be committed to GitHub.
- Configure your own MongoDB connection and JWT secret before running the application.

## Author

**Nikil V**

GitHub: https://github.com/nikil-dev26
