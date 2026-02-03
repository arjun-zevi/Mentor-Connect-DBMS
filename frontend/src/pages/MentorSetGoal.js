import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mentorAPI, goalAPI } from '../services/api';
import '../styles/Goals.css';

function MentorSetGoal() {
    const { student_id } = useParams();
    const [student, setStudent] = useState(null);
    const [assignmentId, setAssignmentId] = useState('');
    const [form, setForm] = useState({ goal_title: '', description: '', target_date: '', priority: 'medium' });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadStudentInfo();
    }, []);

    const loadStudentInfo = async () => {
        try {
            const res = await mentorAPI.getMentees();
            const found = res.data.find(s => String(s.student_id) === String(student_id));
            if (found) {
                setStudent(found);
                setAssignmentId(found.assignment_id || '');
            }
        } catch (err) {
            console.error('Error loading mentee info:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!assignmentId) return alert('No assignment found for this student');
        try {
            await goalAPI.createGoal({ assignment_id: assignmentId, student_id, goal_title: form.goal_title, description: form.description, target_date: form.target_date, priority: form.priority });
            alert('Goal set successfully');
            navigate('/mentor-goals');
        } catch (err) {
            console.error('Error creating goal:', err);
            alert(err.response?.data?.message || 'Failed to create goal');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="container">
            <h1>Set Goal for {student?.name || 'Student'}</h1>
            <form onSubmit={handleSubmit} className="goal-form">
                <div className="form-group">
                    <label>Goal Title</label>
                    <input value={form.goal_title} onChange={e => setForm({...form, goal_title: e.target.value})} required />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>
                <div className="form-group">
                    <label>Target Date</label>
                    <input type="date" value={form.target_date} onChange={e => setForm({...form, target_date: e.target.value})} required />
                </div>
                <div className="form-group">
                    <label>Priority</label>
                    <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <button className="btn btn-primary" type="submit">Create Goal</button>
            </form>
        </div>
    );
}

export default MentorSetGoal;
