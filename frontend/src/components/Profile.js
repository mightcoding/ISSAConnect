import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config.js';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: ''
    });
    const [saveLoading, setSaveLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem('access_token');

                if (!token) {
                    navigate('/login');
                    return;
                }

                const response = await axios.get(`${API_BASE_URL}/api/auth/profile/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                setUser(response.data);
                setFormData({
                    first_name: response.data.first_name || '',
                    last_name: response.data.last_name || ''
                });

                setLoading(false); // Move this here, only after successful profile fetch

            } catch (error) {
                console.error('Profile fetch failed:', error);
                localStorage.clear();
                navigate('/login');
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSave = async () => {
        setSaveLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.put(`${API_BASE_URL}/api/auth/profile/`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setUser(response.data);
            setIsEditing(false);
            setMessage('Profile updated successfully!');

            // Update localStorage with new user data
            localStorage.setItem('user_data', JSON.stringify(response.data));
        } catch (error) {
            setMessage('Failed to update profile. Please try again.');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            first_name: user?.first_name || '',
            last_name: user?.last_name || ''
        });
        setIsEditing(false);
        setMessage('');
    };

    const getUserRole = () => {
        if (user?.is_superuser || user?.is_staff) return 'Administrator';
        if (user?.can_create_content) return 'Content Creator';
        return 'Member';
    };

    const getRoleBadgeClass = () => {
        if (user?.is_superuser || user?.is_staff) return 'admin-role';
        if (user?.can_create_content) return 'creator-role';
        return 'member-role';
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-page">
            {/* Header */}
            <header className="profile-header">
                <div className="header-container">
                    <button onClick={() => navigate('/home')} className="back-btn">
                        ← Back to Home
                    </button>
                    <div className="header-title">
                        <h1>My Profile</h1>
                        <p>Manage your personal information and account settings</p>
                    </div>
                    <div className="header-logo">
                        <span className="logo-text">IC</span>
                    </div>
                </div>
            </header>

            {/* Profile Content */}
            <main className="profile-main">
                <div className="profile-container">
                    <div className="profile-grid">
                        {/* Profile Card */}
                        <div className="profile-card">
                            {/* Avatar Section */}
                            <div className="avatar-section">
                                <div className="avatar-container">
                                    <div className="profile-avatar-large">
                                        {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                                    </div>
                                    <button className="avatar-edit-btn">
                                        <span>📷</span>
                                        Change Photo
                                    </button>
                                </div>

                                <div className="profile-info">
                                    <h2 className="profile-name">
                                        {user?.first_name} {user?.last_name}
                                    </h2>
                                    <p className="profile-username">@{user?.username}</p>
                                    <span className={`role-badge ${getRoleBadgeClass()}`}>
                                        {getUserRole()}
                                    </span>
                                </div>
                            </div>

                            {/* Profile Stats */}
                            <div className="profile-stats">
                                <div className="stat-item">
                                    <span className="stat-number">15</span>
                                    <span className="stat-label">Articles Read</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">3</span>
                                    <span className="stat-label">Events Attended</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">128</span>
                                    <span className="stat-label">Days Active</span>
                                </div>
                            </div>
                        </div>

                        {/* Information Card */}
                        <div className="info-card">
                            {/* Success/Error Message */}
                            {message && (
                                <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                                    <span className="message-icon">
                                        {message.includes('success') ? '✅' : '❌'}
                                    </span>
                                    {message}
                                </div>
                            )}

                            {/* Personal Information */}
                            <div className="info-section">
                                <div className="section-header">
                                    <h3>Personal Information</h3>
                                    <p>Update your personal details below</p>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label">First Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="first_name"
                                                value={formData.first_name}
                                                onChange={handleInputChange}
                                                className="form-input"
                                                placeholder="Enter your first name"
                                            />
                                        ) : (
                                            <div className="info-display">
                                                <span className="info-value">
                                                    {user?.first_name || 'Not set'}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Last Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="last_name"
                                                value={formData.last_name}
                                                onChange={handleInputChange}
                                                className="form-input"
                                                placeholder="Enter your last name"
                                            />
                                        ) : (
                                            <div className="info-display">
                                                <span className="info-value">
                                                    {user?.last_name || 'Not set'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="form-actions">
                                    {!isEditing ? (
                                        <button
                                            className="edit-profile-btn"
                                            onClick={() => setIsEditing(true)}
                                        >
                                            <span className="btn-icon">✏️</span>
                                            Edit Information
                                        </button>
                                    ) : (
                                        <div className="edit-actions">
                                            <button
                                                className="save-btn"
                                                onClick={handleSave}
                                                disabled={saveLoading}
                                            >
                                                <span className="btn-icon">💾</span>
                                                {saveLoading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                className="cancel-btn"
                                                onClick={handleCancel}
                                            >
                                                <span className="btn-icon">❌</span>
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="info-section">
                                <div className="section-header">
                                    <h3>Account Information</h3>
                                    <p>View your account details and settings</p>
                                </div>

                                <div className="readonly-grid">
                                    <div className="readonly-item">
                                        <label>Username</label>
                                        <div className="readonly-value">
                                            <span>{user?.username}</span>
                                            <span className="readonly-badge">Cannot be changed</span>
                                        </div>
                                    </div>

                                    <div className="readonly-item">
                                        <label>Email Address</label>
                                        <div className="readonly-value">
                                            <span>{user?.email || 'Not set'}</span>
                                            <span className="readonly-badge">Contact admin to change</span>
                                        </div>
                                    </div>

                                    <div className="readonly-item">
                                        <label>Member Since</label>
                                        <div className="readonly-value">
                                            <span>
                                                {new Date(user?.date_joined || Date.now()).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="readonly-item">
                                        <label>Account Type</label>
                                        <div className="readonly-value">
                                            <span className={`role-badge ${getRoleBadgeClass()}`}>
                                                {getUserRole()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;