import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mentorAPI } from '../services/api';
import '../styles/MenteeList.css';

function MentorMentees() {
    const [mentees, setMentees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMentee, setSelectedMentee] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [availableStudents, setAvailableStudents] = useState([]);
    const [newAssignment, setNewAssignment] = useState({ student_id: '', start_date: '', end_date: '' });
    const navigate = useNavigate();

    useEffect(() => {
        loadMentees();
    }, []);

    const loadMentees = async () => {
        try {
            const response = await mentorAPI.getMentees();
            setMentees(response.data);
        } catch (error) {
            console.error('Error loading mentees:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableStudents = async () => {
        try {
            const res = await mentorAPI.getAllStudents();
            setAvailableStudents(res.data);
        } catch (err) {
            console.error('Error loading available students:', err);
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
                <h1>My Mentees</h1>
                <div style={{ marginBottom: 16 }}>
                    <button className="btn btn-primary" onClick={() => { setShowAdd(!showAdd); if (!showAdd) loadAvailableStudents(); }}>
                        {showAdd ? 'Close Add Mentee' : 'Add Mentee from Students'}
                    </button>
                </div>

                {showAdd && (
                    <div className="assign-form">
                        <h3>Add Mentee</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            if (!newAssignment.student_id || !newAssignment.start_date) {
                                alert('Please select student and start date');
                                return;
                            }
                            try {
                                await mentorAPI.assignMentee(newAssignment);
                                alert('Mentee assigned successfully');
                                setNewAssignment({ student_id: '', start_date: '', end_date: '' });
                                setShowAdd(false);
                                loadMentees();
                            } catch (err) {
                                console.error('Error assigning mentee:', err);
                                alert(err.response?.data?.message || 'Failed to assign mentee');
                            }
                        }}>
                            <div className="form-group">
                                <label>Student *</label>
                                <select value={newAssignment.student_id} onChange={(e) => setNewAssignment({...newAssignment, student_id: e.target.value})} required>
                                    <option value="">Select Student</option>
                                    {availableStudents.map(s => (
                                        <option key={s.student_id} value={s.student_id} disabled={!!s.assignment_id}>
                                            {s.name} ({s.roll_number}){s.assignment_id ? ` — assigned to ${s.assigned_mentor}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Start Date *</label>
                                <input type="date" value={newAssignment.start_date} onChange={(e) => setNewAssignment({...newAssignment, start_date: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>End Date</label>
                                <input type="date" value={newAssignment.end_date} onChange={(e) => setNewAssignment({...newAssignment, end_date: e.target.value})} />
                            </div>
                            <button type="submit" className="btn btn-primary">Assign</button>
                        </form>
                    </div>
                )}
                {mentees.length === 0 ? (
                    <p>No mentees assigned</p>
                ) : (
                    <div className="mentee-list">
                        {mentees.map((mentee) => (
                            <div key={mentee.student_id} className="mentee-card">
                                <h3>{mentee.name}</h3>
                                <p><strong>Roll Number:</strong> {mentee.roll_number}</p>
                                <p><strong>Email:</strong> {mentee.email}</p>
                                <p><strong>Phone:</strong> {mentee.phone}</p>
                                <p><strong>Program:</strong> {mentee.program}</p>
                                <p><strong>Year:</strong> {mentee.year}</p>
                                <p><strong>Academic Status:</strong> {mentee.academic_status}</p>
                                <p><strong>Assignment Status:</strong> {mentee.assignment_status}</p>
                                <div className="mentee-actions">
                                    <button className="btn btn-small" onClick={() => navigate(`/mentor-student-detail/${mentee.student_id}`)}>
                                        View Details
                                    </button>
                                    <button className="btn btn-small" onClick={() => navigate(`/mentor-schedule-meeting/${mentee.student_id}`)}>
                                        Schedule Meeting
                                    </button>
                                    <button className="btn btn-small" onClick={() => navigate(`/mentor-set-goal/${mentee.student_id}`)}>
                                        Set Goal
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MentorMentees;
