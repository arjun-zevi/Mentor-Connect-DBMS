import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { meetingAPI, reportsAPI } from '../services/api';
import '../styles/Meetings.css';

function MentorMeetings() {
    const [meetings, setMeetings] = useState([]);
    const [overdueMeetings, setOverdueMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('upcoming');
    const navigate = useNavigate();

    useEffect(() => {
        loadMeetings();
    }, []);

    const loadMeetings = async () => {
        try {
            const [upcomingRes, overdueRes] = await Promise.all([
                meetingAPI.getUpcomingMeetings(),
                meetingAPI.getOverdueMeetings(),
            ]);
            setMeetings(upcomingRes.data);
            setOverdueMeetings(overdueRes.data);
        } catch (error) {
            console.error('Error loading meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (meeting_id, new_status) => {
        try {
            await meetingAPI.updateMeeting(meeting_id, { status: new_status });
            loadMeetings();
        } catch (error) {
            console.error('Error updating meeting:', error);
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
                <h1>Manage Meetings</h1>

                <div className="tabs">
                    <button 
                        className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        Upcoming Meetings ({meetings.length})
                    </button>
                    <button 
                        className={`tab ${activeTab === 'overdue' ? 'active' : ''}`}
                        onClick={() => setActiveTab('overdue')}
                    >
                        Overdue Meetings ({overdueMeetings.length})
                    </button>
                </div>

                {activeTab === 'upcoming' && (
                    <div className="meetings-list">
                        {meetings.length === 0 ? (
                            <p>No upcoming meetings</p>
                        ) : (
                            meetings.map((meeting) => (
                                <div key={meeting.meeting_id} className="meeting-card">
                                    <h3>{meeting.student_name} ({meeting.roll_number})</h3>
                                    {meeting.requested_by_name && (
                                        <p><strong>Requested By:</strong> {meeting.requested_by_role === 'parent' ? `Parent: ${meeting.requested_by_name}` : meeting.requested_by_name}</p>
                                    )}
                                    <p><strong>Date:</strong> {meeting.meeting_date}</p>
                                    <p><strong>Time:</strong> {meeting.meeting_time}</p>
                                    <p><strong>Duration:</strong> {meeting.duration} mins</p>
                                    <p><strong>Mode:</strong> {meeting.mode}</p>
                                    <p><strong>Location:</strong> {meeting.location || 'N/A'}</p>
                                    <div className="meeting-actions">
                                        {/* If meeting was requested by parent/student, show explicit Accept/Reject buttons */}
                                        {(meeting.status === 'requested' || meeting.status === 'pending') ? (
                                            <>
                                                <button className="btn btn-small" onClick={() => handleStatusChange(meeting.meeting_id, 'scheduled')}>Accept</button>
                                                <button className="btn btn-small btn-danger" onClick={() => handleStatusChange(meeting.meeting_id, 'cancelled')}>Reject</button>
                                                <button className="btn btn-small" onClick={() => navigate(`/mentor-add-note/${meeting.meeting_id}`)}>
                                                    Add Notes
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <select 
                                                    value={meeting.status}
                                                    onChange={(e) => handleStatusChange(meeting.meeting_id, e.target.value)}
                                                    className="status-select"
                                                >
                                                    <option value="scheduled">Scheduled</option>
                                                    <option value="done">Done</option>
                                                    <option value="missed">Missed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                <button className="btn btn-small" onClick={() => navigate(`/mentor-add-note/${meeting.meeting_id}`)}>
                                                    Add Notes
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'overdue' && (
                    <div className="meetings-list">
                        {overdueMeetings.length === 0 ? (
                            <p>No overdue meetings</p>
                        ) : (
                            overdueMeetings.map((meeting) => (
                                <div key={meeting.meeting_id} className="meeting-card overdue">
                                    <h3>{meeting.student_name} ({meeting.roll_number})</h3>
                                    <p><strong>Date:</strong> {meeting.meeting_date}</p>
                                    <p><strong>Time:</strong> {meeting.meeting_time}</p>
                                    <p><strong>Status:</strong> {meeting.status}</p>
                                    <div className="meeting-actions">
                                        <select 
                                            value={meeting.status}
                                            onChange={(e) => handleStatusChange(meeting.meeting_id, e.target.value)}
                                            className="status-select"
                                        >
                                            <option value="scheduled">Scheduled</option>
                                            <option value="done">Done</option>
                                            <option value="missed">Missed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MentorMeetings;
