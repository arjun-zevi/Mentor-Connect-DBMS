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

### Database Setup

1. **Create Database:**
   ```bash
   mysql -u root -p
   ```

2. **Import Schema:**
   ```bash
   mysql -u root -p mentorship_db < database/schema.sql
   ```

   Or execute the entire schema.sql file in MySQL Workbench/CLI.

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```
   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=root
   DB_NAME=mentorship_db
   NODE_ENV=development
   ```

4. **Start backend server:**
   ```bash
   npm start
   ```
   or for development with auto-reload:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   ```
   
   App will open at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register-student` - Register new student
- `POST /api/auth/register-mentor` - Register new mentor

### Mentors
- `GET /api/mentors/mentees` - Get assigned mentees
- `GET /api/mentors/profile` - Get mentor profile
- `PUT /api/mentors/profile` - Update mentor profile

### Meetings
- `POST /api/meetings` - Create meeting
- `GET /api/meetings/upcoming` - Get upcoming meetings
- `GET /api/meetings/student/:student_id` - Get student meetings
- `PUT /api/meetings/:meeting_id` - Update meeting status
- `GET /api/meetings/overdue/list` - Get overdue meetings

### Goals
- `POST /api/goals` - Create goal
- `GET /api/goals/student/:student_id` - Get student goals
- `PUT /api/goals/:goal_id` - Update goal
- `GET /api/goals/active/all` - Get all active goals
- `DELETE /api/goals/:goal_id` - Delete goal

### Notes
- `POST /api/notes` - Add meeting notes
- `GET /api/notes/meeting/:meeting_id` - Get meeting notes
- `POST /api/notes/general/add` - Add general note
- `GET /api/notes/general/student/:student_id` - Get general notes
- `PUT /api/notes/general/:note_id` - Update general note

### Interventions
- `POST /api/interventions` - Create intervention
- `GET /api/interventions/student/:student_id` - Get student interventions
- `PUT /api/interventions/:intervention_id` - Update intervention
- `GET /api/interventions/active/all` - Get active interventions

### Admin
- `GET /api/admin/all` - Get all students
- `GET /api/admin/mentors/all` - Get all mentors
- `POST /api/admin/assign` - Assign mentor to student
- `GET /api/admin/assignments/all` - Get all assignments
- `PUT /api/admin/assign/:assignment_id` - Update assignment

### Reports
- `GET /api/reports/upcoming-meetings` - Upcoming meetings
- `GET /api/reports/overdue-meetings` - Overdue meetings
- `GET /api/reports/at-risk-students` - At-risk students
- `GET /api/reports/mentee-count` - Total mentees
- `GET /api/reports/dashboard-stats` - Dashboard statistics

## Database Schema

### Tables:
1. **users** - User authentication (admin, mentor, student)
2. **students** - Student profiles
3. **mentors** - Mentor profiles
4. **assignments** - Mentor-mentee assignments
5. **meetings** - Meeting records
6. **goals** - Student goals
7. **meeting_notes** - Notes from meetings
8. **general_notes** - General student feedback
9. **interventions** - Support actions for struggling students

## Demo Credentials

### Admin
- Email: `admin@mentorship.com`
- Password: `admin123`

### Mentor
- Email: `mentor1@college.com`
- Password: `mentor123`

### Student
- Email: `student1@college.com`
- Password: `student123`

## Usage Guide

### Admin Dashboard
1. Login with admin credentials
2. View all students and mentors
3. Create mentor-mentee assignments
4. Manage assignments (activate/deactivate)

### Mentor Dashboard
1. Login with mentor credentials
2. View assigned mentees
3. Schedule meetings
4. Set goals for students
5. Add meeting notes and general feedback
6. Record interventions for struggling students
7. View reports and analytics

### Features Walkthrough

**Schedule Meeting:**
- Go to My Mentees → Select Student → Schedule Meeting
- Enter date, time, duration, mode, and location
- Meeting will appear in Meetings section

**Set Goal:**
- Go to My Mentees → Select Student → Set Goal
- Enter goal title, description, target date, priority
- Track goal progress through Goals section

**Add Notes:**
- After completing a meeting, click "Add Notes"
- Write detailed notes about the meeting
- Can also add general feedback about student behavior/performance

**Record Intervention:**
- For struggling students, record interventions
- Document counseling, tutoring, or parental meetings
- Track outcome and completion status

**View Reports:**
- Dashboard shows key metrics
- Upcoming meetings for the week
- Overdue meetings requiring action
- List of at-risk students needing support
- Mentor workload distribution

## Error Handling

The application includes comprehensive error handling:
- Authentication errors (invalid credentials)
- Authorization errors (insufficient permissions)
- Validation errors (missing/invalid data)
- Database errors (connection issues)
- API errors with meaningful messages

## Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Role-based access control (admin, mentor, student)
- Protected routes and API endpoints
- Input validation on both frontend and backend

## Future Enhancements

1. Email notifications for meetings
2. Meeting video conferencing integration
3. Attendance tracking
4. GPA and academic performance analytics
5. Mobile app version
6. Student dashboard (view own goals, meetings, feedback)
7. Export reports to PDF
8. Calendar integration
9. Real-time notifications
10. Bulk student/mentor upload

## Troubleshooting

### Backend won't start
- Check MySQL is running
- Verify database credentials in `.env`
- Check if port 5000 is available

### Frontend won't connect to backend
- Ensure backend is running on port 5000
- Check CORS configuration in server.js
- Verify API_BASE_URL in services/api.js

### Database connection error
- Ensure MySQL server is running
- Verify credentials in `.env`
- Check if database `mentorship_db` exists

## Support

For issues or questions, please refer to the code comments and documentation within each file.

## License

This project is created as a DBMS course project.

---

**Project Status**: Complete and Fully Functional ✅


myre