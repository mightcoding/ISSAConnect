import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config.js';

const Login = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Making login request to:', `${API_BASE_URL}/api/auth/login/`);
            const response = await axios.post(`${API_BASE_URL}/api/auth/login/`, formData);

            console.log('Login response received:', response.data);
            console.log('Response tokens:', response.data.tokens);

            // Save tokens to localStorage
            localStorage.setItem('access_token', response.data.tokens.access);
            localStorage.setItem('refresh_token', response.data.tokens.refresh);
            localStorage.setItem('user_data', JSON.stringify(response.data.user));

            console.log('Checking saved tokens:');
            console.log('access_token:', localStorage.getItem('access_token'));
            console.log('refresh_token:', localStorage.getItem('refresh_token'));

            // Set default authorization header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.tokens.access}`;

            console.log('About to navigate to /home');

            // Use React Router navigation instead of window.location
            window.location.href = '/home';
        } catch (error) {
            console.error('Login error:', error);
            setError(error.response?.data?.non_field_errors?.[0] ||
                error.response?.data?.detail ||
                'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your account</p>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label className="form-label">Username</label>
                    <input
                        type="text"
                        name="username"
                        className="form-input"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                        type="password"
                        name="password"
                        className="form-input"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
            <p className="auth-link">
                Don't have an account? <Link to="/register">Sign up</Link>
            </p>
        </div>
    );
};

export default Login;