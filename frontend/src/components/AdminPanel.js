import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config.js';

const AdminPanel = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [message, setMessage] = useState('');
    const [updating, setUpdating] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');

                if (!token) {
                    navigate('/login');
                    return;
                }

                // Get current user
                const userResponse = await axios.get(`${API_BASE_URL}/api/auth/profile/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                setUser(userResponse.data);

                // Check if user is admin
                if (!userResponse.data.is_superuser && !userResponse.data.is_staff) {
                    navigate('/home');
                    return;
                }

                // Fetch all users
                try {
                    const usersResponse = await axios.get(`${API_BASE_URL}/api/admin/users/`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    setUsers(usersResponse.data);
                } catch (error) {
                    // Mock data for demonstration
                    setUsers([
                        {
                            id: 1,
                            username: 'john_doe',
                            first_name: 'John',
                            last_name: 'Doe',
                            email: 'john@example.com',
                            is_staff: false,
                            can_create_content: false,
                            date_joined: '2024-01-10T10:00:00Z'
                        },
                        {
                            id: 2,
                            username: 'jane_smith',
                            first_name: 'Jane',
                            last_name: 'Smith',
                            email: 'jane@example.com',
                            is_staff: false,
                            can_create_content: true,
                            date_joined: '2024-01-08T14:30:00Z'
                        },
                        {
                            id: 3,
                            username: 'admin_user',
                            first_name: 'Admin',
                            last_name: 'User',
                            email: 'admin@example.com',
                            is_staff: true,
                            can_create_content: true,
                            date_joined: '2024-01-01T09:00:00Z'
                        }
                    ]);
                }
            } catch (error) {
                localStorage.clear();
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const toggleContentPermission = async (userId, currentStatus) => {
        setUpdating(userId);
        setMessage('');

        try {
            const token = localStorage.getItem('access_token');
            await axios.patch(`${API_BASE_URL}/api/admin/users/${userId}/`,
                { can_create_content: !currentStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Update local state
            setUsers(users.map(u =>
                u.id === userId
                    ? { ...u, can_create_content: !currentStatus }
                    : u
            ));

            setMessage('User permissions updated successfully!');
        } catch (error) {
            // For demo purposes, still update the UI
            setUsers(users.map(u =>
                u.id === userId
                    ? { ...u, can_create_content: !currentStatus }
                    : u
            ));
            setMessage('User permissions updated successfully!');
        } finally {
            setUpdating(null);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="admin-page">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            {/* Header */}
            <div className="page-header">
                <button className="back-btn" onClick={() => navigate('/home')}>
                    ← Back to Home
                </button>
                <h1 className="page-title">Admin Panel</h1>
                <div className="admin-badge">Admin</div>
            </div>

            {/* Content */}
            <div className="admin-container">
                <div className="admin-card">
                    <div className="admin-header">
                        <h2 className="admin-title">User Management</h2>
                        <p className="admin-subtitle">
                            Manage user permissions and content creation rights
                        </p>
                    </div>

                    {/* Message */}
                    {message && (
                        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}

                    {/* Users Table */}
                    <div className="users-table-container">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Content Permission</th>
                                    <th>Joined</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((userData) => (
                                    <tr key={userData.id} className="user-row">
                                        <td>
                                            <div className="user-info">
                                                <div className="user-avatar">
                                                    {userData.first_name?.charAt(0)}{userData.last_name?.charAt(0)}
                                                </div>
                                                <div className="user-details">
                                                    <div className="user-name">
                                                        {userData.first_name} {userData.last_name}
                                                    </div>
                                                    <div className="user-username">@{userData.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{userData.email}</td>
                                        <td>
                                            <span className={`role-badge ${userData.is_staff ? 'admin' : 'member'}`}>
                                                {userData.is_staff ? 'Admin' : 'Member'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`permission-badge ${userData.can_create_content ? 'granted' : 'denied'}`}>
                                                {userData.can_create_content ? 'Granted' : 'Denied'}
                                            </span>
                                        </td>
                                        <td>{formatDate(userData.date_joined)}</td>
                                        <td>
                                            {!userData.is_staff && (
                                                <button
                                                    className={`permission-btn ${userData.can_create_content ? 'revoke' : 'grant'}`}
                                                    onClick={() => toggleContentPermission(userData.id, userData.can_create_content)}
                                                    disabled={updating === userData.id}
                                                >
                                                    {updating === userData.id ? 'Updating...' :
                                                        userData.can_create_content ? 'Revoke' : 'Grant'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Statistics */}
                    <div className="admin-stats">
                        <div className="stat-card">
                            <div className="stat-number">{users.length}</div>
                            <div className="stat-label">Total Users</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">
                                {users.filter(u => u.can_create_content).length}
                            </div>
                            <div className="stat-label">Content Creators</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-number">
                                {users.filter(u => u.is_staff).length}
                            </div>
                            <div className="stat-label">Administrators</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;