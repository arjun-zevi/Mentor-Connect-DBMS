import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { meetingAPI } from '../services/api';
import { mentorAPI } from '../services/api';
import '../styles/Form.css';

function ScheduleMeeting() {
    const { student_id } = useParams();
    const storedUser = localStorage.getItem('user');
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const role = parsedUser?.role;
    const effectiveStudentId = student_id || parsedUser?.student_id || parsedUser?.user_id;
    const [formData, setFormData] = useState({
        assignment_id: '',
        meeting_date: '',
        meeting_time: '',
        duration: 60,
        mode: 'online',
        location: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [hasAssignment, setHasAssignment] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // If the logged-in user is a mentor and a student_id param is provided,
        // fetch the mentor's mentees to find the assignment_id for that student.
        async function fetchAssignmentForMentor(targetStudentId) {
            try {
                const res = await mentorAPI.getMentees();
                const mentees = res.data || [];
                const match = mentees.find(m => String(m.student_id) === String(targetStudentId));
                if (match && match.assignment_id) {
                    setFormData(prev => ({ ...prev, assignment_id: match.assignment_id }));
                    setHasAssignment(true);
                } else {
                    setHasAssignment(false);
                }
            } catch (err) {
                console.error('Error fetching mentees:', err);
            }
        }

        if (role === 'mentor' && student_id) {
            fetchAssignmentForMentor(student_id);
        }
    }, [student_id, role]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);

        try {
            const payload = {
                meeting_date: formData.meeting_date,
                meeting_time: formData.meeting_time,
                duration: parseInt(formData.duration, 10),
                location: formData.location,
            };
            // only include assignment_id when provided (mentors) or when desired
            if (formData.assignment_id) payload.assignment_id = parseInt(formData.assignment_id, 10);
            // include mode if present
            if (formData.mode) payload.mode = formData.mode;
            // student_id derived from route or logged-in user
            payload.student_id = parseInt(effectiveStudentId, 10);

            const res = await meetingAPI.createMeeting(payload);
            const createdMeeting = res.data?.meeting || null;
            setSuccess('Meeting scheduled successfully!');
            // dispatch a window event so other pages (student dashboard) can react and refresh
            try {
                window.dispatchEvent(new CustomEvent('meetingCreated', { detail: createdMeeting }));
            } catch (e) {
                console.warn('Could not dispatch meetingCreated event', e);
            }
            setTimeout(() => {
                if (role === 'mentor') navigate('/mentor-meetings');
                else navigate('/student-meetings');
            }, 1000);
        } catch (err) {
            if (err.response?.status === 409) {
                setError(err.response?.data?.message || 'Not available at this time');
            } else {
                setError(err.response?.data?.message || 'Failed to schedule meeting');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="dashboard">
            <nav className="navbar">
                <div className="navbar-brand">Mentorship System</div>
                <div className="navbar-menu">
                    {role === 'mentor' ? (
                        <>
                            <a href="/mentor-dashboard" className="nav-link">Dashboard</a>
                            <a href="/mentor-mentees" className="nav-link">My Mentees</a>
                            <a href="/mentor-meetings" className="nav-link">Meetings</a>
                        </>
                    ) : (
                        <>
                            <a href="/student-dashboard" className="nav-link">Dashboard</a>
                            <a href="/student-meetings" className="nav-link">My Meetings</a>
                        </>
                    )}
                    <button onClick={handleLogout} className="btn btn-logout">Logout</button>
                </div>
            </nav>

            <div className="container">
                <h1>Schedule Meeting</h1>
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit} className="form">
                    {/* Assignment: mentors supply assignment; students/parents should not see/enter assignment_id */}
                        {role === 'mentor' ? (
                            <div className="form-group">
                                <label>Assignment ID *</label>
                                <input
                                    type="number"
                                    name="assignment_id"
                                    value={formData.assignment_id}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter assignment ID or select mentee"
                                />
                                {/* Mentor may create an assignment if none exists for this student */}
                                {!hasAssignment && (
                                    <div style={{ marginTop: '8px' }}>
                                        <small>No active assignment found for this student.</small>
                                        <br />
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={async () => {
                                                setError('');
                                                setSuccess('');
                                                setLoading(true);
                                                try {
                                                    const today = new Date().toISOString().slice(0,10);
                                                    await mentorAPI.assignMentee({ student_id: parseInt(effectiveStudentId, 10), start_date: today });
                                                    // refetch assignment
                                                    const res = await mentorAPI.getMentees();
                                                    const mentees = res.data || [];
                                                    const match = mentees.find(m => String(m.student_id) === String(effectiveStudentId));
                                                    if (match && match.assignment_id) {
                                                        setFormData(prev => ({ ...prev, assignment_id: match.assignment_id }));
                                                        setHasAssignment(true);
                                                        setSuccess('Assignment created — you can now schedule the meeting.');
                                                    } else {
                                                        setError('Assignment creation succeeded but assignment not found.');
                                                    }
                                                } catch (err) {
                                                    setError(err.response?.data?.message || 'Failed to create assignment');
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }}
                                        >
                                            {loading ? 'Creating...' : 'Create assignment for this student'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="form-group">
                                <label>Student</label>
                                <div className="readonly-field">ID: {effectiveStudentId}</div>
                            </div>
                        )}

                    <div className="form-group">
                        <label>Meeting Date *</label>
                        <input
                            type="date"
                            name="meeting_date"
                            value={formData.meeting_date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Meeting Time *</label>
                        <input
                            type="time"
                            name="meeting_time"
                            value={formData.meeting_time}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Duration (minutes)</label>
                        <input
                            type="number"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form-group">
                        <label>Mode *</label>
                        <select name="mode" value={formData.mode} onChange={handleChange} required>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Enter location (if offline)"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">Schedule Meeting</button>
                </form>
            </div>
        </div>
    );
}

export default ScheduleMeeting;
