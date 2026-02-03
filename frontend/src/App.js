import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import MentorDashboard from './pages/MentorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import MentorMentees from './pages/MentorMentees';
import MentorMeetings from './pages/MentorMeetings';
import MentorGoals from './pages/MentorGoals';
import MentorReports from './pages/MentorReports';
import ParentDashboard from './pages/ParentDashboard';
import ScheduleMeeting from './pages/ScheduleMeeting';
import AddNotes from './pages/AddNotes';
import MentorSetGoal from './pages/MentorSetGoal';
import MentorStudentDetail from './pages/MentorStudentDetail';
import StudentMeetings from './pages/StudentMeetings';
import StudentGoals from './pages/StudentGoals';
import StudentNotes from './pages/StudentNotes';
import './App.css';
import './styles/theme.css';

function App() {
    const isAuthenticated = !!localStorage.getItem('token');

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin-dashboard" element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />} />
                <Route path="/mentor-dashboard" element={isAuthenticated ? <MentorDashboard /> : <Navigate to="/login" />} />
                <Route path="/parent-dashboard" element={isAuthenticated ? <ParentDashboard /> : <Navigate to="/login" />} />
                <Route path="/student-dashboard" element={isAuthenticated ? <StudentDashboard /> : <Navigate to="/login" />} />
                <Route path="/mentor-mentees" element={isAuthenticated ? <MentorMentees /> : <Navigate to="/login" />} />
                <Route path="/mentor-meetings" element={isAuthenticated ? <MentorMeetings /> : <Navigate to="/login" />} />
                <Route path="/mentor-goals" element={isAuthenticated ? <MentorGoals /> : <Navigate to="/login" />} />
                <Route path="/mentor-reports" element={isAuthenticated ? <MentorReports /> : <Navigate to="/login" />} />
                <Route path="/mentor-schedule-meeting/:student_id" element={isAuthenticated ? <ScheduleMeeting /> : <Navigate to="/login" />} />
                <Route path="/schedule-meeting" element={isAuthenticated ? <ScheduleMeeting /> : <Navigate to="/login" />} />
                <Route path="/mentor-set-goal/:student_id" element={isAuthenticated ? <MentorSetGoal /> : <Navigate to="/login" />} />
                <Route path="/mentor-student-detail/:student_id" element={isAuthenticated ? <MentorStudentDetail /> : <Navigate to="/login" />} />
                <Route path="/mentor-add-note/:meeting_id" element={isAuthenticated ? <AddNotes /> : <Navigate to="/login" />} />
                <Route path="/student-meetings" element={isAuthenticated ? <StudentMeetings /> : <Navigate to="/login" />} />
                <Route path="/student-goals" element={isAuthenticated ? <StudentGoals /> : <Navigate to="/login" />} />
                <Route path="/add-notes" element={isAuthenticated ? <StudentNotes /> : <Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
