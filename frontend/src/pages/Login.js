import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import '../styles/Auth.css';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await authAPI.login(email, password);
                const { token, user } = response.data;

            if (!token || !user) {
                setError('Invalid response from server');
                setLoading(false);
                return;
            }

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            if (user.role === 'admin') {
                navigate('/admin-dashboard');
            } else if (user.role === 'mentor') {
                navigate('/mentor-dashboard');
            } else if (user.role === 'student') {
                navigate('/student-dashboard');
            } else if (user.role === 'parent') {
                navigate('/parent-dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>Student Mentorship App</h1>
                <h2>Login</h2>
                {error && <div className="alert alert-error">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                        />
                    </div>
                    <button type="button" onClick={handleLogin} disabled={loading} className="btn btn-primary">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <div className="login-hints">
                    <h3>Demo Credentials</h3>
                    <p><strong>Admin:</strong> admin@mentorship.com / 123</p>
                    <p><strong>Mentor:</strong> mentor1@gmail.com / 123</p>
                    <p><strong>Student:</strong> student1@gmail.com / 123</p>
                    <p><strong>Parent:</strong> parent1@gmail.com / 123</p>
                </div>
            </div>
        </div>
    );
}

export default Login;
