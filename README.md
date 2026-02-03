# Student Mentorship App - Complete Full-Stack Application

A comprehensive DBMS project featuring a fully functional Student Mentorship Application built with React (Frontend), Node.js/Express (Backend), and MySQL (Database).

## Project Structure

```
final dbms/
├── frontend/              # React Application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── styles/       # CSS files
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── backend/              # Node.js/Express Server
│   ├── config/           # Database configuration
│   ├── middleware/       # Authentication middleware
│   ├── routes/           # API routes
│   ├── server.js         # Main server file
│   ├── .env              # Environment variables
│   └── package.json
└── database/
    └── schema.sql        # MySQL database schema
```

## Core Features

### 1. Mentor-Mentee Assignment Management
- Admin assigns mentors to students
- Track assignment dates and status (active/inactive/completed)
- Each mentor can view assigned mentees
- View mentee workload per mentor

### 2. Student Profile Management
- Store complete student details (name, roll number, email, phone, program, year, academic status)
- View mentee list per mentor
- Search and filter students

### 3. Mentor Profile Management
- Store mentor details (name, email, department, availability)
- Track mentor workload (number of mentees)
- Update mentor profile

### 4. Meeting Scheduling
- Schedule meetings with mentees
- Meeting details: date, time, duration, mode (online/offline), location
- Track meeting status: scheduled, done, missed, cancelled
- View upcoming and overdue meetings

### 5. Goal Tracking
- Set goals for students
- Goal status: open, in-progress, completed, deferred
- Target date tracking
- Priority levels (low, medium, high)

### 6. Notes and Feedback
- Add notes after each meeting
- General notes for students (behaviour, performance, attendance)
- Edit and manage student feedback

### 7. Interventions / Support Actions
- Record special actions for struggling students
- Types: counseling, tutoring, parental meeting, other
- Track outcome
- Status: pending, completed, ongoing

### 8. Reports & Analytics
- Upcoming meetings list
- Overdue meetings report
- Students at-risk (attendance issues, missed meetings, deferred goals)
- Number of mentees per mentor
- Dashboard statistics

## Technology Stack

### Frontend
- React 18
- React Router (for navigation)
- Axios (for API calls)
- CSS3 (styled components)

### Backend
- Node.js
- Express.js
- MySQL2 (database driver)
- JWT (authentication)
- bcryptjs (password hashing)

### Database
- MySQL
- 9 interconnected tables with proper relationships

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm or yarn

