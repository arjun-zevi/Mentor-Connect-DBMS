import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportsAPI } from '../services/api';
import '../styles/Reports.css';

function MentorReports() {
    const [upcomingMeetings, setUpcomingMeetings] = useState([]);
    const [overdueMeetings, setOverdueMeetings] = useState([]);
    const [atRiskStudents, setAtRiskStudents] = useState([]);
    const [menteeCount, setMenteeCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadReportData();
    }, []);

    const loadReportData = async () => {
        try {
            const [upcomingRes, overdueRes, atRiskRes, countRes] = await Promise.all([
                reportsAPI.getUpcomingMeetings(),
                reportsAPI.getOverdueMeetings(),
                reportsAPI.getAtRiskStudents(),
                reportsAPI.getMenteeCount(),
            ]);
            setUpcomingMeetings(upcomingRes.data);
            setOverdueMeetings(overdueRes.data);
            setAtRiskStudents(atRiskRes.data);
            setMenteeCount(countRes.data.total_mentees);
        } catch (error) {
            console.error('Error loading report data:', error);
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
                <div className="navbar-brand">Mentorship System</div>
                <div className="navbar-menu">
                    <a href="/mentor-dashboard" className="nav-link">Dashboard</a>
                    <a href="/mentor-mentees" className="nav-link">My Mentees</a>
                    <a href="/mentor-meetings" className="nav-link">Meetings</a>
                    <a href="/mentor-goals" className="nav-link">Goals</a>
                    <a href="/mentor-reports" className="nav-link">Reports</a>
                    <button onClick={handleLogout} className="btn btn-logout">Logout</button>
                </div>
            </nav>

            <div className="container">
                <h1>Reports & Analytics</h1>

                <div className="summary-stats">
                    <div className="summary-card">
                        <h3>Total Mentees</h3>
                        <p className="big-number">{menteeCount}</p>
                    </div>
                    <div className="summary-card warning">
                        <h3>Overdue Meetings</h3>
                        <p className="big-number">{overdueMeetings.length}</p>
                    </div>
                    <div className="summary-card danger">
                        <h3>At-Risk Students</h3>
                        <p className="big-number">{atRiskStudents.length}</p>
                    </div>
                </div>

                <div className="report-section">
                    <h2>Upcoming Meetings (Next 7 Days)</h2>
                    {upcomingMeetings.length === 0 ? (
                        <p>No upcoming meetings</p>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Time</th>
                                    <th>Student</th>
                                    <th>Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {upcomingMeetings.map((meeting, idx) => (
                                    <tr key={idx}>
                                        <td>{meeting.meeting_date}</td>
                                        <td>{meeting.meeting_time}</td>
                                        <td>{meeting.student_name}</td>
                                        <td>{meeting.meeting_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="report-section">
                    <h2>Overdue Meetings</h2>
                    {overdueMeetings.length === 0 ? (
                        <p>No overdue meetings</p>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Student</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {overdueMeetings.map((meeting) => (
                                    <tr key={meeting.meeting_id}>
                                        <td>{meeting.meeting_date}</td>
                                        <td>{meeting.student_name} ({meeting.roll_number})</td>
                                        <td><span className={`status-badge status-${meeting.status}`}>{meeting.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="report-section">
                    <h2>Students At Risk</h2>
                    {atRiskStudents.length === 0 ? (
                        <p>No at-risk students</p>
                    ) : (
                        <div className="at-risk-list">
                            {atRiskStudents.map((student) => (
                                <div key={student.student_id} className="at-risk-card">
                                    <h3>{student.name} ({student.roll_number})</h3>
                                    <p><strong>Status:</strong> {student.academic_status}</p>
                                    <p><strong>Missed Meetings:</strong> {student.missed_meetings}</p>
                                    <p><strong>Deferred Goals:</strong> {student.deferred_goals}</p>
                                    <p><strong>Active Interventions:</strong> {student.active_interventions}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MentorReports;
