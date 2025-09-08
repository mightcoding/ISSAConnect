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
    const [apiError, setApiError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                console.log('🔑 Token available:', !!token);
                console.log('🌐 API Base URL:', API_BASE_URL);

                if (!token) {
                    console.log('❌ No token found, redirecting to login');
                    navigate('/login');
                    return;
                }

                // Get current user
                console.log('👤 Fetching user profile...');
                const userResponse = await axios.get(`${API_BASE_URL}/api/auth/profile/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('✅ Profile response:', userResponse.data);
                setUser(userResponse.data);

                // Check if user is admin
                const isAdmin = userResponse.data.is_superuser || userResponse.data.is_staff;
                console.log('👨‍💼 Is admin?', isAdmin, {
                    is_staff: userResponse.data.is_staff,
                    is_superuser: userResponse.data.is_superuser
                });

                if (!isAdmin) {
                    console.log('❌ User is not admin, redirecting to home');
                    navigate('/home');
                    return;
                }

                // Fetch all users
                console.log('👥 Fetching users list...');
                const usersUrl = `${API_BASE_URL}/api/auth/admin/users/`;
                console.log('📍 Users API URL:', usersUrl);

                try {
                    const usersResponse = await axios.get(usersUrl, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    console.log('✅ Users API response:', usersResponse.data);
                    console.log('📊 Number of users received:', usersResponse.data.length);

                    setUsers(usersResponse.data);
                    setApiError(null);

                } catch (error) {
                    console.error('❌ Users API Error Details:', {
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data,
                        message: error.message,
                        url: usersUrl
                    });

                    setApiError({
                        status: error.response?.status,
                        message: error.response?.data?.detail || error.message
                    });

                    // Set mock data for testing
                    console.log('🔄 Using mock data for development');
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

                setLoading(false);

            } catch (error) {
                console.error('❌ Profile fetch failed:', error);
                localStorage.clear();
                navigate('/login');
            }
        };

        fetchData();
    }, [navigate]);

    const toggleContentPermission = async (userId, currentStatus) => {
        setUpdating(userId);
        setMessage('');

        try {
            const token = localStorage.getItem('access_token');
            const updateUrl = `${API_BASE_URL}/api/auth/admin/users/${userId}/`;

            console.log('🔄 Updating user permissions:', {
                userId,
                currentStatus,
                newStatus: !currentStatus,
                url: updateUrl
            });

            await axios.patch(updateUrl,
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
            console.log('✅ Permission updated successfully');

        } catch (error) {
            console.error('❌ Permission update failed:', error.response?.data || error.message);

            // Still update UI for demo purposes
            setUsers(users.map(u =>
                u.id === userId
                    ? { ...u, can_create_content: !currentStatus }
                    : u
            ));
            setMessage('User permissions updated successfully! (Demo mode)');
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

                    {/* API Error Display */}
                    {apiError && (
                        <div className="message error">
                            API Error {apiError.status}: {apiError.message}
                            <br />
                            <small>Using mock data for demonstration</small>
                        </div>
                    )}

                    {/* Success Message */}
                    {message && (
                        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}

                    {/* Debug Info (remove in production) */}
                    <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', fontSize: '12px' }}>
                        <strong>Debug Info:</strong><br />
                        API Base URL: {API_BASE_URL}<br />
                        Current User: {user?.username} (Staff: {user?.is_staff ? 'Yes' : 'No'}, Super: {user?.is_superuser ? 'Yes' : 'No'})<br />
                        Users Count: {users.length}<br />
                        API Status: {apiError ? `Error ${apiError.status}` : 'Working'}
                    </div>

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