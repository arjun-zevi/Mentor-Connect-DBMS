import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css';

function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-container">
            <div className="home-content">
                <h1>Student Mentorship App</h1>
                <p>A comprehensive platform for managing mentor-mentee relationships</p>
                
                <div className="features">
                    <h2>Key Features</h2>
                    <ul>
                        <li>Mentor-Mentee Assignment Management</li>
                        <li>Meeting Scheduling & Tracking</li>
                        <li>Goal Setting & Progress Tracking</li>
                        <li>Notes & Feedback Management</li>
                        <li>Intervention & Support Actions</li>
                        <li>Comprehensive Reports & Analytics</li>
                    </ul>
                </div>

                <button className="btn btn-primary" onClick={() => navigate('/login')}>
                    Login to Continue
                </button>
            </div>
        </div>
    );
}

export default Home;
