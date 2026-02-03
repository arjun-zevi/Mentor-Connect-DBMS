import React, { useState, useEffect } from 'react';
import { notesAPI } from '../services/api';
import '../styles/Form.css';

function StudentNotes() {
    const [meetingNotes, setMeetingNotes] = useState([]);
    const [generalNotes, setGeneralNotes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadNotes() {
            try {
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const student_id = user.student_id;
                if (!student_id) return;

                const [mnRes, gnRes] = await Promise.all([
                    notesAPI.getMeetingNotesForStudent(student_id).catch(() => ({ data: [] })),
                    notesAPI.getGeneralNotes(student_id).catch(() => ({ data: [] })),
                ]);

                setMeetingNotes(mnRes.data || []);
                setGeneralNotes(gnRes.data || []);
            } catch (err) {
                console.error('Error loading notes:', err);
            } finally {
                setLoading(false);
            }
        }

        loadNotes();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="dashboard">
            <div className="container">
                <h1>My Notes</h1>

                <h2>Meeting Notes</h2>
                {meetingNotes.length === 0 ? <p>No meeting notes</p> : (
                    meetingNotes.map(n => (
                        <div key={n.note_id} className="note-card">
                            <p><strong>Date:</strong> {n.meeting_date} {n.meeting_time}</p>
                            <p><strong>Mentor:</strong> {n.mentor_name}</p>
                            <p>{n.note_content}</p>
                            <hr />
                        </div>
                    ))
                )}

                <h2>General Notes</h2>
                {generalNotes.length === 0 ? <p>No general notes</p> : (
                    generalNotes.map(n => (
                        <div key={n.general_note_id} className="note-card">
                            <p><strong>Date:</strong> {n.created_at}</p>
                            <p><strong>Type:</strong> {n.note_type}</p>
                            <p>{n.note_content}</p>
                            <hr />
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default StudentNotes;
