import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { goalAPI } from '../services/api';
import '../styles/Goals.css';

function MentorGoals() {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();

    useEffect(() => {
        loadGoals();
    }, []);

    const loadGoals = async () => {
        try {
            // fetch all goals so the filter can show completed and other statuses
            const response = await goalAPI.getAllGoals();
            setGoals(response.data);
        } catch (error) {
            console.error('Error loading goals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (goal_id, new_status) => {
        try {
            await goalAPI.updateGoal(goal_id, { status: new_status });
            loadGoals();
        } catch (error) {
            console.error('Error updating goal:', error);
        }
    };

    const handleDeleteGoal = async (goal_id) => {
        if (window.confirm('Are you sure you want to delete this goal?')) {
            try {
                await goalAPI.deleteGoal(goal_id);
                loadGoals();
            } catch (error) {
                console.error('Error deleting goal:', error);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const filteredGoals = filter === 'all' ? goals : goals.filter(g => g.status === filter);

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
                <h1>Student Goals</h1>

                <div className="filter-section">
                    <label>Filter by Status:</label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="all">All</option>
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="deferred">Deferred</option>
                    </select>
                </div>

                {filteredGoals.length === 0 ? (
                    <p>No goals found</p>
                ) : (
                    <div className="goals-list">
                        {filteredGoals.map((goal) => (
                            <div key={goal.goal_id} className="goal-card">
                                <div className="goal-header">
                                    <h3>{goal.goal_title}</h3>
                                    <span className={`status-badge status-${goal.status}`}>{goal.status}</span>
                                </div>
                                <p><strong>Student:</strong> {goal.student_name} ({goal.roll_number})</p>
                                <p><strong>Description:</strong> {goal.description}</p>
                                <p><strong>Target Date:</strong> {goal.target_date}</p>
                                <p><strong>Priority:</strong> <span className={`priority-${goal.priority}`}>{goal.priority}</span></p>
                                <div className="goal-actions">
                                    <select 
                                        value={goal.status}
                                        onChange={(e) => handleStatusChange(goal.goal_id, e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                        <option value="deferred">Deferred</option>
                                    </select>
                                    <button className="btn btn-small" onClick={() => navigate(`/mentor-edit-goal/${goal.goal_id}`)}>
                                        Edit
                                    </button>
                                    <button className="btn btn-small btn-danger" onClick={() => handleDeleteGoal(goal.goal_id)}>
                                        Delete
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

export default MentorGoals;
