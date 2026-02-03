import React, { useState, useEffect } from 'react';
import { meetingAPI } from '../services/api';
import '../styles/Meetings.css';

function StudentMeetings() {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMeetings();
    }, []);

    const loadMeetings = async () => {
        try {
            const res = await meetingAPI.getMyMeetings();
            setMeetings(res.data || []);
        } catch (err) {
            console.error('Error loading student meetings:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="container">
            <h1>My Meetings</h1>
            {meetings.length === 0 ? (
                <p>No meetings scheduled</p>
            ) : (
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Mentor</th>
                            <th>Mode</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {meetings.map(m => (
                            <tr key={m.meeting_id}>
                                <td>{m.meeting_date}</td>
                                <td>{m.meeting_time}</td>
                                <td>{m.mentor_name}</td>
                                <td>{m.mode}</td>
                                <td>{m.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default StudentMeetings;
