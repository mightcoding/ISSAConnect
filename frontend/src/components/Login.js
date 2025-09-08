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
            const response = await axios.post(`${API_BASE_URL}/api/auth/login/`, formData);

            // Save tokens to localStorage
            localStorage.setItem('access_token', response.data.tokens.access);
            localStorage.setItem('refresh_token', response.data.tokens.refresh);
            localStorage.setItem('user_data', JSON.stringify(response.data.user));

            // Set default authorization header for future requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.tokens.access}`;

            // Add a small delay before redirect
            setTimeout(() => {
                window.location.href = '/home';
            }, 100);
        } catch (error) {
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
            <div style={{
                marginTop: '24px',
                textAlign: 'center',
                borderTop: '1px solid #e5e7eb',
                paddingTop: '20px'
            }}>
                <p style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '12px',
                    lineHeight: '1.4'
                }}>
                    By signing in, you agree to our{' '}
                    <a href="https://docs.google.com/document/d/1fYi9pyEvt2cNHA45arvgG864dEu7LHdKQr9YrrA1MEY/edit?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3b82f6', textDecoration: 'none' }}>
                        Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="https://docs.google.com/document/d/1Zsk-UokU3nCN2VChvyyvMSna_BnTkNAAh99Iy87hlzE/edit?usp=sharing"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#3b82f6', textDecoration: 'none' }}>
                        Privacy Policy
                    </a>
                </p>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap'
                }}>
                    <a href="mailto:alisher.mxghtly@gmail.com"
                        style={{ fontSize: '11px', color: '#9ca3af', textDecoration: 'none' }}>
                        Contact
                    </a>
                </div>
            </div>

        </div>
    );
};

export default Login;