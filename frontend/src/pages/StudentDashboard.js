import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsAPI, goalAPI, meetingAPI } from '../services/api';
import '../styles/Dashboard.css';

function StudentDashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        const parsed = userData ? JSON.parse(userData) : null;
        if (parsed) setUser(parsed);
        loadStudentData(parsed);
    }, []);

    // Listen for meeting creation events so dashboard updates immediately
    useEffect(() => {
        const handler = (e) => {
            const created = e?.detail;
            const userData = localStorage.getItem('user');
            const parsed = userData ? JSON.parse(userData) : null;
            // if this event is for this logged-in student, refresh data
            if (parsed && parsed.role === 'student' && created && parseInt(created.student_id, 10) === parseInt(parsed.student_id, 10)) {
                loadStudentData(parsed);
            }
        };
        window.addEventListener('meetingCreated', handler);
        return () => window.removeEventListener('meetingCreated', handler);
    }, []);

    const loadStudentData = async (userParam) => {
        try {
            const u = userParam || user;
            if (!u) return;
            const [upcomingRes, goalsRes] = await Promise.all([
                meetingAPI.getStudentUpcoming().catch(() => ({ data: [] })),
                goalAPI.getMyGoals().catch(() => ({ data: [] })),
            ]);
            setStats({
                upcoming_meetings: upcomingRes.data?.length || 0,
                overdue_meetings: 0,
                active_goals: goalsRes.data?.length || 0,
            });
            setUpcomingMeetings(upcomingRes.data || []);
            setMyGoals(goalsRes.data || []);
        } catch (error) {
            console.error('Error loading student data:', error);
        } finally {
            setLoading(false);
        }
    };

    const [upcomingMeetings, setUpcomingMeetings] = useState([]);
    const [myGoals, setMyGoals] = useState([]);

    const markGoalDone = async (goal_id) => {
        try {
            await goalAPI.markGoal(goal_id, { status: 'completed' });
            await loadStudentData();
        } catch (err) {
            console.error('Error marking goal:', err);
            alert(err.response?.data?.message || 'Failed to update goal');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading || !user) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="dashboard">
            <nav className="navbar">
                <div className="navbar-brand">Mentorship Dashboard - Student</div>
                <div className="navbar-menu">
                    <a href="/student-dashboard" className="nav-link">Dashboard</a>
                    <a href="/add-notes" className="nav-link">My Notes</a>
                    <a href="/student-meetings" className="nav-link">My Meetings</a>
                    <button onClick={handleLogout} className="btn btn-logout">Logout</button>
                </div>
            </nav>

            <div className="dashboard-container">
                <h1>Welcome, {user.name || user.email}</h1>

                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>{stats?.upcoming_meetings || 0}</h3>
                        <p>Upcoming Meetings</p>
                    </div>
                    <div className="stat-card">
                        <h3>{stats?.overdue_meetings || 0}</h3>
                        <p>Overdue Meetings</p>
                    </div>
                    <div className="stat-card">
                        <h3>{stats?.active_goals || 0}</h3>
                        <p>Active Goals</p>
                    </div>
                </div>

                <div className="quick-actions">
                    <div style={{ marginTop: 16 }} className="action-buttons">
                        <button className="btn btn-primary" onClick={() => navigate('/student-meetings')}>My Meetings</button>
                        <button className="btn btn-primary" onClick={() => navigate('/student-goals')}>My Goals</button>
                        <button className="btn btn-primary" onClick={() => navigate('/schedule-meeting')}>Schedule Meeting</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StudentDashboard;
