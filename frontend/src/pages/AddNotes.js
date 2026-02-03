import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { notesAPI } from '../services/api';
import '../styles/Form.css';

function AddNotes() {
    const { meeting_id } = useParams();
    const [note_content, setNoteContent] = useState('');
    const [student_id, setStudentId] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // fetch meeting details to pre-fill student_id
        async function fetchMeeting() {
            try {
                const res = await fetch(`http://localhost:5000/api/meetings/details/${meeting_id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (!res.ok) return;
                const data = await res.json();
                if (data && data.student_id) setStudentId(data.student_id);
            } catch (err) {
                console.error('Error fetching meeting details:', err);
            }
        }

        if (meeting_id) fetchMeeting();
    }, [meeting_id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!student_id || !note_content) {
            setError('Please fill all required fields');
            return;
        }

        try {
            await notesAPI.addMeetingNote({
                meeting_id: parseInt(meeting_id),
                student_id: parseInt(student_id),
                note_content,
            });
            setSuccess('Note added successfully!');
            setTimeout(() => navigate('/mentor-meetings'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add note');
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
                    <a href="/mentor-dashboard" className="nav-link">Dashboard</a>
                    <a href="/mentor-meetings" className="nav-link">Meetings</a>
                    <button onClick={handleLogout} className="btn btn-logout">Logout</button>
                </div>
            </nav>

            <div className="container">
                <h1>Add Meeting Notes</h1>
                {error && <div className="alert alert-error">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label>Student ID *</label>
                        <input
                            type="number"
                            value={student_id}
                            onChange={(e) => setStudentId(e.target.value)}
                            required
                            placeholder="Enter student ID"
                            readOnly={!!student_id}
                        />
                        {student_id && <small>Student ID auto-filled from meeting</small>}
                    </div>

                    <div className="form-group">
                        <label>Notes *</label>
                        <textarea
                            value={note_content}
                            onChange={(e) => setNoteContent(e.target.value)}
                            required
                            placeholder="Write your meeting notes here"
                            rows="8"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary">Save Notes</button>
                </form>
            </div>
        </div>
    );
}

export default AddNotes;
