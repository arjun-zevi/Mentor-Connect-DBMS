import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mentorAPI, meetingAPI, goalAPI } from '../services/api';
import '../styles/MenteeList.css';

function MentorStudentDetail() {
    const { student_id } = useParams();
    const [student, setStudent] = useState(null);
    const [meetings, setMeetings] = useState([]);
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const menteesRes = await mentorAPI.getMentees();
            const found = menteesRes.data.find(s => String(s.student_id) === String(student_id));
            setStudent(found || null);

            // fetch meetings (mentor route expects mentor token)
            const meetRes = await meetingAPI.getStudentMeetings(student_id).catch(() => ({ data: [] }));
            setMeetings(meetRes.data || []);

            // fetch goals (mentor route)
            const goalsRes = await goalAPI.getStudentGoals(student_id).catch(() => ({ data: [] }));
            setGoals(goalsRes.data || []);
        } catch (err) {
            console.error('Error loading student detail:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="container">
            <h1>Student Detail: {student?.name || 'Student'}</h1>
            <div className="detail-grid">
                <div className="card">
                    <h3>Profile</h3>
                    <p><strong>Roll:</strong> {student?.roll_number}</p>
                    <p><strong>Email:</strong> {student?.email}</p>
                    <p><strong>Program:</strong> {student?.program}</p>
                </div>

                <div className="card">
                    <h3>Meetings</h3>
                    {meetings.length === 0 ? <p>No meetings</p> : (
                        <ul>
                            {meetings.map(m => (
                                <li key={m.meeting_id}>{m.meeting_date} {m.meeting_time} — {m.status}</li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="card">
                    <h3>Goals</h3>
                    {goals.length === 0 ? <p>No goals</p> : (
                        <ul>
                            {goals.map(g => (
                                <li key={g.goal_id}>{g.goal_title} — {g.status}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MentorStudentDetail;
