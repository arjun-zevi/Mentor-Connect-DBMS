import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsAPI, mentorAPI } from '../services/api';
import '../styles/Dashboard.css';

function MentorDashboard() {
    const [stats, setStats] = useState(null);
    const [mentorData, setMentorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [statsRes, mentorRes] = await Promise.all([
                reportsAPI.getDashboardStats(),
                mentorAPI.getProfile(),
            ]);
            setStats(statsRes.data);
            setMentorData(mentorRes.data);
        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="dashboard">
            <nav className="navbar">
                <div className="navbar-brand">Mentorship Dashboard - Mentor</div>
                <div className="navbar-menu">
                    <a href="/mentor-dashboard" className="nav-link">Dashboard</a>
                    <a href="/mentor-mentees" className="nav-link">My Mentees</a>
                    <a href="/mentor-meetings" className="nav-link">Meetings</a>
                    <a href="/mentor-goals" className="nav-link">Goals</a>
                    <a href="/mentor-reports" className="nav-link">Reports</a>
                    <button onClick={handleLogout} className="btn btn-logout">Logout</button>
                </div>
            </nav>

            <div className="dashboard-container">
                <h1>Welcome, {mentorData?.name}</h1>

                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>{stats?.total_mentees || 0}</h3>
                        <p>Total Mentees</p>
                    </div>
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
                    <div className="stat-card">
                        <h3>{stats?.active_interventions || 0}</h3>
                        <p>Active Interventions</p>
                    </div>
                </div>

                <div className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="action-buttons">
                        <button className="btn btn-primary" onClick={() => navigate('/mentor-mentees')}>View Mentees</button>
                        <button className="btn btn-primary" onClick={() => navigate('/mentor-meetings')}>Manage Meetings</button>
                        <button className="btn btn-primary" onClick={() => navigate('/mentor-goals')}>Set Goals</button>
                        <button className="btn btn-primary" onClick={() => navigate('/mentor-reports')}>View Reports</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MentorDashboard;
