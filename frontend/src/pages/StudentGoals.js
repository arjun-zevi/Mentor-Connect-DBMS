import React, { useState, useEffect } from 'react';
import { goalAPI } from '../services/api';
import '../styles/Goals.css';

function StudentGoals() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadGoals(); }, []);

    const loadGoals = async () => {
        try {
            const res = await goalAPI.getMyGoals();
            setGoals(res.data || []);
        } catch (err) {
            console.error('Error loading student goals:', err);
        } finally {
            setLoading(false);
        }
    };

    const markDone = async (goal_id) => {
        try {
            await goalAPI.markGoal(goal_id, { status: 'completed' });
            loadGoals();
        } catch (err) {
            console.error('Error marking goal done:', err);
            alert(err.response?.data?.message || 'Failed to update goal');
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="container">
            <h1>My Goals</h1>
            {goals.length === 0 ? <p>No goals assigned</p> : (
                <div className="goals-list">
                    {goals.map(g => (
                        <div key={g.goal_id} className="goal-card">
                            <div className="goal-header">
                                <h3>{g.goal_title}</h3>
                                <span className={`status-badge status-${g.status}`}>{g.status}</span>
                            </div>
                            <p><strong>Mentor:</strong> {g.mentor_name}</p>
                            <p><strong>Target Date:</strong> {g.target_date}</p>
                            <p>{g.description}</p>
                            <div className="goal-actions">
                                {g.status !== 'completed' && <button className="btn btn-small" onClick={() => markDone(g.goal_id)}>Mark Done</button>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default StudentGoals;
