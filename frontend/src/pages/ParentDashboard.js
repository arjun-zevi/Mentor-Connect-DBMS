import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentAPI, meetingAPI } from '../services/api';
import '../styles/Dashboard.css';

function ParentDashboard() {
    const navigate = useNavigate();
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState('');
    const [formData, setFormData] = useState({ meeting_date: '', meeting_time: '', duration: 60, mode: 'online', location: '' });
    const [loading, setLoading] = useState(true);
    const [meetings, setMeetings] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadChildren();
    }, []);

    // If children list changes, auto-select the first child (assigned child)
    useEffect(() => {
        if (children && children.length > 0) {
            setSelectedChild(children[0].student_id);
        }
    }, [children]);

    // Load meetings when selected child changes
    useEffect(() => {
        if (selectedChild) loadMeetings(selectedChild);
    }, [selectedChild]);

    const loadChildren = async () => {
        try {
            const res = await parentAPI.getChildren();
            setChildren(res.data || []);
        } catch (err) {
            console.error('Error loading children:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        if (!selectedChild) return setMessage('Please select a child');
        try {
            await meetingAPI.createMeeting({ student_id: selectedChild, meeting_date: formData.meeting_date, meeting_time: formData.meeting_time, duration: formData.duration, mode: formData.mode, location: formData.location });
            setMessage('Meeting scheduled — mentor will see it in their meetings list');
            setFormData({ meeting_date: '', meeting_time: '', duration: 60, mode: 'online', location: '' });
            // refresh meetings list
            await loadMeetings(selectedChild);
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to request meeting');
        }
    };

    const loadMeetings = async (childId) => {
        try {
            const res = await meetingAPI.getStudentMeetings(childId);
            setMeetings(res.data || []);
        } catch (err) {
            console.error('Error loading meetings for child:', err);
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
                <div className="navbar-brand">Parent Dashboard</div>
                <div className="navbar-menu">
                    <button onClick={handleLogout} className="btn btn-logout">Logout</button>
                </div>
            </nav>

            <div className="container">
                <h1>Welcome</h1>
                <h3>Your children</h3>
                {children.length === 0 ? <p>No children linked to your account.</p> : (
                    <ul>
                        {children.map(c => (
                            <li key={c.student_id}>{c.name} ({c.roll_number})</li>
                        ))}
                    </ul>
                )}

                <div style={{ marginTop: 20 }}>
                    <h2>Request Meeting with Mentor</h2>
                    {message && <div className="alert alert-error">{message}</div>}
                    <form onSubmit={handleSubmit} className="form">
                        <div className="form-group">
                            <label>Child</label>
                            {/* Child is already assigned to parent; show the assigned child and do not allow changing */}
                            {children.length > 0 ? (
                                <div className="readonly-field">{children[0].name} ({children[0].roll_number})</div>
                            ) : (
                                <div className="readonly-field">No child assigned</div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" name="meeting_date" value={formData.meeting_date} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Time</label>
                            <input type="time" name="meeting_time" value={formData.meeting_time} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Duration (minutes)</label>
                            <input type="number" name="duration" value={formData.duration} onChange={handleChange} />
                        </div>
                        {/* Mode removed: meetings will use default backend behavior */}
                        <div className="form-group">
                            <label>Location</label>
                            <input name="location" value={formData.location} onChange={handleChange} />
                        </div>
                        <button className="btn btn-primary" type="submit">Schedule Meeting</button>
                    </form>
                </div>

                <div style={{ marginTop: 20 }}>
                    <h2>Meetings for {children.length > 0 ? children[0].name : 'your child'}</h2>
                    {meetings.length === 0 ? <p>No meetings found.</p> : (
                        <div className="meetings-list">
                            {meetings.map(m => (
                                <div key={m.meeting_id} className="meeting-card">
                                    <p><strong>Date:</strong> {m.meeting_date}</p>
                                    <p><strong>Time:</strong> {m.meeting_time}</p>
                                    <p><strong>Duration:</strong> {m.duration} mins</p>
                                    <p><strong>Mentor:</strong> {m.mentor_name || 'TBD'}</p>
                                    {m.requested_by_name && <p><strong>Requested By:</strong> {m.requested_by_role === 'parent' ? `Parent: ${m.requested_by_name}` : m.requested_by_name}</p>}
                                    <p><strong>Status:</strong> {m.status}</p>
                                    <p><strong>Location:</strong> {m.location || 'N/A'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ParentDashboard;
