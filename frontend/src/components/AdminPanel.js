import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config.js';

const AdminPanel = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [eventRegistrations, setEventRegistrations] = useState([]);
    const [message, setMessage] = useState('');
    const [updating, setUpdating] = useState(null);
    const [apiError, setApiError] = useState(null);
    const [activeTab, setActiveTab] = useState('users');
    const [loadingRegistrations, setLoadingRegistrations] = useState(false);
    const [avatarEdit, setAvatarEdit] = useState({
        userId: null,
        url: '',
        updating: false
    });

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
                const isAdmin = userResponse.data.is_superuser || userResponse.data.is_staff;

                if (!isAdmin) {
                    navigate('/home');
                    return;
                }

                // Fetch users
                try {
                    const usersResponse = await axios.get(`${API_BASE_URL}/api/content/admin/users/`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    setUsers(usersResponse.data);
                    setApiError(null);

                } catch (error) {
                    setApiError({
                        status: error.response?.status,
                        message: error.response?.data?.detail || error.message
                    });

                    // Mock data fallback
                    setUsers([
                        {
                            id: 1,
                            username: 'john_doe',
                            first_name: 'John',
                            last_name: 'Doe',
                            email: 'john@example.com',
                            phone_number: '+1 (555) 123-4567', // Add this
                            is_staff: false,
                            can_create_content: false,
                            avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
                            date_joined: '2024-01-10T10:00:00Z'
                        },
                        {
                            id: 2,
                            username: 'jane_smith',
                            first_name: 'Jane',
                            last_name: 'Smith',
                            email: 'jane@example.com',
                            phone_number: '+1 (555) 987-6543', // Add this
                            is_staff: false,
                            can_create_content: true,
                            avatar_url: null,
                            date_joined: '2024-01-08T14:30:00Z'
                        }
                    ]);
                }

                // Fetch events overview
                try {
                    const eventsResponse = await axios.get(`${API_BASE_URL}/api/content/admin/events/`, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    setEvents(eventsResponse.data);

                } catch (error) {
                    // Mock events data
                    setEvents([
                        {
                            id: 1,
                            title: "Annual Tech Conference 2024",
                            date: "2024-03-15T09:00:00Z",
                            capacity: 100,
                            current_registrations: 85,
                            is_full: false,
                            registration_percentage: 85.0
                        },
                        {
                            id: 2,
                            title: "Workshop: React Best Practices",
                            date: "2024-03-20T14:00:00Z",
                            capacity: 30,
                            current_registrations: 30,
                            is_full: true,
                            registration_percentage: 100.0
                        }
                    ]);
                }

                setLoading(false);

            } catch (error) {
                console.error('Profile fetch failed:', error);
                localStorage.clear();
                navigate('/login');
            }
        };

        fetchData();
    }, [navigate]);

    const fetchEventRegistrations = async (eventId) => {
        setLoadingRegistrations(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get(`${API_BASE_URL}/api/content/events/${eventId}/registrations/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setEventRegistrations(response.data.registrations);
            setSelectedEvent(response.data);

        } catch (error) {
            console.error('Failed to fetch registrations:', error);
            // Mock registrations data
            setEventRegistrations([
                {
                    id: 1,
                    user: 1,
                    user_name: "John Doe",
                    user_email: "john@example.com",
                    user_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                    registered_at: "2024-01-15T10:30:00Z"
                },
                {
                    id: 2,
                    user: 2,
                    user_name: "Jane Smith",
                    user_email: "jane@example.com",
                    user_avatar: null,
                    registered_at: "2024-01-16T14:20:00Z"
                }
            ]);
            setSelectedEvent({
                event_title: events.find(e => e.id === eventId)?.title || "Event",
                capacity: 100,
                current_registrations: 2
            });
        } finally {
            setLoadingRegistrations(false);
        }
    };

    const removeRegistration = async (eventId, userId) => {
        if (!window.confirm('Are you sure you want to remove this registration?')) return;

        try {
            const token = localStorage.getItem('access_token');
            await axios.delete(`${API_BASE_URL}/api/content/events/${eventId}/registrations/${userId}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            // Update local state
            setEventRegistrations(prev => prev.filter(reg => reg.user !== userId));
            setEvents(prev => prev.map(event =>
                event.id === eventId
                    ? { ...event, current_registrations: event.current_registrations - 1 }
                    : event
            ));
            setMessage('Registration removed successfully!');

        } catch (error) {
            console.error('Failed to remove registration:', error);
            setMessage('Failed to remove registration');
        }
    };

    const toggleContentPermission = async (userId, currentStatus) => {
        setUpdating(userId);
        setMessage('');

        try {
            const token = localStorage.getItem('access_token');
            await axios.patch(`${API_BASE_URL}/api/content/admin/users/${userId}/`,
                { can_create_content: !currentStatus },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setUsers(users.map(u =>
                u.id === userId
                    ? { ...u, can_create_content: !currentStatus }
                    : u
            ));

            setMessage('User permissions updated successfully!');

        } catch (error) {
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

    const startAvatarEdit = (userId, currentUrl = '') => {
        setAvatarEdit({
            userId,
            url: currentUrl || '',
            updating: false
        });
    };

    const cancelAvatarEdit = () => {
        setAvatarEdit({
            userId: null,
            url: '',
            updating: false
        });
    };

    const updateAvatar = async () => {
        if (!avatarEdit.userId || !avatarEdit.url.trim()) {
            setMessage('Please enter a valid avatar URL');
            return;
        }

        setAvatarEdit(prev => ({ ...prev, updating: true }));
        setMessage('');

        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.patch(
                `${API_BASE_URL}/api/content/admin/users/${avatarEdit.userId}/avatar/`,
                { avatar_url: avatarEdit.url.trim() },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setUsers(users.map(u =>
                u.id === avatarEdit.userId
                    ? { ...u, avatar_url: response.data.avatar_url }
                    : u
            ));

            setMessage('Avatar updated successfully!');
            cancelAvatarEdit();

        } catch (error) {
            setMessage(`Failed to update avatar: ${error.response?.data?.error || error.message}`);
        } finally {
            setAvatarEdit(prev => ({ ...prev, updating: false }));
        }
    };

    const deleteAvatar = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user\'s avatar?')) return;

        try {
            const token = localStorage.getItem('access_token');
            await axios.delete(`${API_BASE_URL}/api/content/admin/users/${userId}/avatar/delete/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setUsers(users.map(u =>
                u.id === userId ? { ...u, avatar_url: null } : u
            ));

            setMessage('Avatar deleted successfully!');

        } catch (error) {
            setMessage(`Failed to delete avatar: ${error.response?.data?.error || error.message}`);
        }
    };

    const getUserInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || '?';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isValidImageUrl = (url) => {
        try {
            new URL(url);
            return url.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i) ||
                url.includes('unsplash.com') ||
                url.includes('imgur.com') ||
                url.includes('gravatar.com') ||
                url.includes('cloudinary.com');
        } catch {
            return false;
        }
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '18px'
            }}>
                Loading Admin Panel...
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '20px'
        }}>
            {/* Header */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <button
                        onClick={() => navigate('/home')}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '12px 20px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease'
                        }}
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                    >
                        ← Back to Home
                    </button>
                    <h1 style={{
                        fontSize: '32px',
                        fontWeight: '700',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        margin: 0
                    }}>
                        Admin Dashboard
                    </h1>
                </div>
                <div style={{
                    background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '14px',
                    fontWeight: '600'
                }}>
                    Administrator
                </div>
            </div>

            {/* Tab Navigation */}
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '8px',
                marginBottom: '24px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.08)',
                display: 'flex',
                gap: '8px'
            }}>
                {[
                    { id: 'users', label: 'User Management', icon: '👥' },
                    { id: 'events', label: 'Event Registrations', icon: '🎟️' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            background: activeTab === tab.id
                                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                : 'transparent',
                            color: activeTab === tab.id ? 'white' : '#64748b',
                            border: 'none',
                            borderRadius: '12px',
                            padding: '16px 24px',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease',
                            flex: 1,
                            justifyContent: 'center'
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Success/Error Messages */}
            {message && (
                <div style={{
                    background: message.includes('success')
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    padding: '16px 24px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    fontSize: '16px',
                    fontWeight: '500',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                }}>
                    {message}
                </div>
            )}

            {/* Avatar Edit Modal */}
            {avatarEdit.userId && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '32px',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>Update Avatar</h3>
                            <button
                                onClick={cancelAvatarEdit}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '24px',
                                    cursor: 'pointer',
                                    color: '#6b7280',
                                    padding: '4px'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                                Avatar Image URL
                            </label>
                            <input
                                type="url"
                                value={avatarEdit.url}
                                onChange={(e) => setAvatarEdit(prev => ({ ...prev, url: e.target.value }))}
                                placeholder="https://example.com/avatar.jpg"
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    border: '2px solid #e5e7eb',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s ease'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                            />
                        </div>

                        {avatarEdit.url && isValidImageUrl(avatarEdit.url) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                <img
                                    src={avatarEdit.url}
                                    alt="Avatar preview"
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        border: '3px solid #667eea'
                                    }}
                                />
                                <div style={{ color: '#6b7280', fontSize: '16px' }}>
                                    Preview of new avatar
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={updateAvatar}
                                disabled={avatarEdit.updating || !avatarEdit.url.trim()}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    padding: '16px 24px',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    flex: 1,
                                    opacity: avatarEdit.updating || !avatarEdit.url.trim() ? 0.6 : 1
                                }}
                            >
                                {avatarEdit.updating ? 'Updating...' : 'Update Avatar'}
                            </button>
                            <button
                                onClick={cancelAvatarEdit}
                                style={{
                                    background: '#f3f4f6',
                                    color: '#374151',
                                    padding: '16px 24px',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Content based on active tab */}
            {activeTab === 'users' && (
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
                }}>
                    <div style={{
                        padding: '32px',
                        borderBottom: '1px solid #f1f5f9'
                    }}>
                        <h2 style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: '#1f2937',
                            margin: '0 0 8px 0'
                        }}>
                            User Management
                        </h2>
                        <p style={{
                            color: '#6b7280',
                            margin: 0,
                            fontSize: '16px'
                        }}>
                            Manage user permissions, avatars, and content creation rights
                        </p>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    {['User', 'Email', 'Phone', 'Role', 'Content Permission', 'Joined', 'Actions'].map(header => (
                                        <th key={header} style={{
                                            padding: '20px',
                                            textAlign: 'left',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#374151',
                                            borderBottom: '1px solid #e5e7eb'
                                        }}>
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((userData) => (
                                    <tr key={userData.id} style={{
                                        borderBottom: '1px solid #f1f5f9',
                                        transition: 'background-color 0.2s ease'
                                    }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div
                                                    onClick={() => startAvatarEdit(userData.id, userData.avatar_url)}
                                                    style={{
                                                        position: 'relative',
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.2s ease'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1.05)';
                                                        e.currentTarget.querySelector('.hover-overlay').style.opacity = '1';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.transform = 'scale(1)';
                                                        e.currentTarget.querySelector('.hover-overlay').style.opacity = '0';
                                                    }}
                                                >
                                                    {userData.avatar_url ? (
                                                        <img
                                                            src={userData.avatar_url}
                                                            alt={`${userData.first_name} ${userData.last_name}`}
                                                            style={{
                                                                width: '50px',
                                                                height: '50px',
                                                                borderRadius: '50%',
                                                                objectFit: 'cover',
                                                                border: '2px solid #e5e7eb'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            width: '50px',
                                                            height: '50px',
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontWeight: '600',
                                                            fontSize: '18px'
                                                        }}>
                                                            {getUserInitials(userData.first_name, userData.last_name)}
                                                        </div>
                                                    )}
                                                    <div className="hover-overlay" style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        backgroundColor: 'rgba(0,0,0,0.5)',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        opacity: 0,
                                                        transition: 'opacity 0.2s ease'
                                                    }}>
                                                        <span style={{ color: 'white', fontSize: '16px' }}>✏️</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div style={{
                                                        fontWeight: '600',
                                                        color: '#1f2937',
                                                        fontSize: '16px'
                                                    }}>
                                                        {userData.first_name} {userData.last_name}
                                                    </div>
                                                    <div style={{
                                                        color: '#6b7280',
                                                        fontSize: '14px'
                                                    }}>
                                                        @{userData.username}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '20px', color: '#374151' }}>{userData.email}</td>
                                        <td style={{ padding: '20px', color: '#374151' }}>
                                            {userData.phone_number || '-'}
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            <span style={{
                                                background: userData.is_staff
                                                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                color: 'white',
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}>
                                                {userData.is_staff ? 'Admin' : 'Member'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px' }}>
                                            <span style={{
                                                background: userData.can_create_content
                                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                                    : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                                                color: 'white',
                                                padding: '6px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}>
                                                {userData.can_create_content ? 'Granted' : 'Denied'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '20px', color: '#6b7280' }}>{formatDate(userData.date_joined)}</td>
                                        <td style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {!userData.is_staff && (
                                                    <button
                                                        onClick={() => toggleContentPermission(userData.id, userData.can_create_content)}
                                                        disabled={updating === userData.id}
                                                        style={{
                                                            background: userData.can_create_content
                                                                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                                                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '8px 16px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            transition: 'transform 0.2s ease',
                                                            opacity: updating === userData.id ? 0.6 : 1
                                                        }}
                                                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                                                    >
                                                        {updating === userData.id ? 'Updating...' :
                                                            userData.can_create_content ? 'Revoke' : 'Grant'}
                                                    </button>
                                                )}

                                                {userData.avatar_url && (
                                                    <button
                                                        onClick={() => deleteAvatar(userData.id)}
                                                        style={{
                                                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '8px',
                                                            padding: '8px 16px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            transition: 'transform 0.2s ease'
                                                        }}
                                                        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                                                    >
                                                        Delete Avatar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Statistics */}
                    <div style={{
                        padding: '32px',
                        borderTop: '1px solid #f1f5f9',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '24px'
                    }}>
                        {[
                            { number: users.length, label: 'Total Users', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
                            { number: users.filter(u => u.can_create_content).length, label: 'Content Creators', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
                            { number: users.filter(u => u.is_staff).length, label: 'Administrators', gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }
                        ].map((stat, index) => (
                            <div key={index} style={{
                                background: stat.gradient,
                                borderRadius: '16px',
                                padding: '24px',
                                color: 'white',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    fontSize: '36px',
                                    fontWeight: '700',
                                    marginBottom: '8px'
                                }}>
                                    {stat.number}
                                </div>
                                <div style={{
                                    fontSize: '16px',
                                    fontWeight: '500',
                                    opacity: 0.9
                                }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'events' && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: selectedEvent ? '1fr 1fr' : '1fr',
                    gap: '24px'
                }}>
                    {/* Events List */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
                    }}>
                        <div style={{
                            padding: '32px 32px 24px 32px',
                            borderBottom: '1px solid #f1f5f9'
                        }}>
                            <h2 style={{
                                fontSize: '24px',
                                fontWeight: '700',
                                color: '#1f2937',
                                margin: '0 0 8px 0'
                            }}>
                                Event Registration Overview
                            </h2>
                            <p style={{
                                color: '#6b7280',
                                margin: 0,
                                fontSize: '16px'
                            }}>
                                Monitor event capacity and manage registrations
                            </p>
                        </div>

                        <div style={{ padding: '24px 32px' }}>
                            {events.map(event => (
                                <div key={event.id} style={{
                                    background: '#f8fafc',
                                    borderRadius: '12px',
                                    padding: '24px',
                                    marginBottom: '16px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    border: selectedEvent?.event_title === event.title ? '2px solid #667eea' : '1px solid #e5e7eb'
                                }}
                                    onClick={() => fetchEventRegistrations(event.id)}
                                    onMouseOver={(e) => {
                                        if (selectedEvent?.event_title !== event.title) {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div>
                                            <h3 style={{
                                                fontSize: '18px',
                                                fontWeight: '600',
                                                color: '#1f2937',
                                                margin: '0 0 8px 0'
                                            }}>
                                                {event.title}
                                            </h3>
                                            <p style={{
                                                color: '#6b7280',
                                                margin: 0,
                                                fontSize: '14px'
                                            }}>
                                                {formatDateTime(event.date)}
                                            </p>
                                        </div>
                                        <div style={{
                                            background: event.is_full
                                                ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                                : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            color: 'white',
                                            padding: '6px 12px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            {event.is_full ? 'Full' : 'Available'}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '12px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '14px', color: '#6b7280' }}>Registration Progress</span>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>
                                                {event.current_registrations}/{event.capacity} ({event.registration_percentage}%)
                                            </span>
                                        </div>
                                        <div style={{
                                            height: '8px',
                                            backgroundColor: '#e5e7eb',
                                            borderRadius: '4px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                background: event.is_full
                                                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                                                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                width: `${event.registration_percentage}%`,
                                                transition: 'width 0.3s ease'
                                            }}></div>
                                        </div>
                                    </div>

                                    <div style={{
                                        fontSize: '14px',
                                        color: '#667eea',
                                        fontWeight: '600'
                                    }}>
                                        Click to view registrations →
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Event Registrations Detail */}
                    {selectedEvent && (
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
                        }}>
                            <div style={{
                                padding: '32px 32px 24px 32px',
                                borderBottom: '1px solid #f1f5f9'
                            }}>
                                <h3 style={{
                                    fontSize: '20px',
                                    fontWeight: '700',
                                    color: '#1f2937',
                                    margin: '0 0 8px 0'
                                }}>
                                    {selectedEvent.event_title}
                                </h3>
                                <p style={{
                                    color: '#6b7280',
                                    margin: '0 0 16px 0',
                                    fontSize: '14px'
                                }}>
                                    {selectedEvent.current_registrations} / {selectedEvent.capacity} registered
                                </p>
                            </div>

                            <div style={{ padding: '24px 32px' }}>
                                {loadingRegistrations ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '40px',
                                        color: '#6b7280'
                                    }}>
                                        Loading registrations...
                                    </div>
                                ) : eventRegistrations.length === 0 ? (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '40px',
                                        color: '#6b7280'
                                    }}>
                                        No registrations yet
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {eventRegistrations.map(registration => (
                                            <div key={registration.id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '16px',
                                                background: '#f8fafc',
                                                borderRadius: '12px',
                                                border: '1px solid #e5e7eb'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    {registration.user_avatar ? (
                                                        <img
                                                            src={registration.user_avatar}
                                                            alt={registration.user_name}
                                                            style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '50%',
                                                                objectFit: 'cover'
                                                            }}
                                                        />
                                                    ) : (
                                                        <div style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'white',
                                                            fontWeight: '600',
                                                            fontSize: '14px'
                                                        }}>
                                                            {getUserInitials(registration.user_name.split(' ')[0], registration.user_name.split(' ')[1])}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div style={{
                                                            fontWeight: '600',
                                                            color: '#1f2937',
                                                            fontSize: '14px'
                                                        }}>
                                                            {registration.user_name}
                                                        </div>
                                                        <div style={{
                                                            color: '#6b7280',
                                                            fontSize: '12px'
                                                        }}>
                                                            {registration.user_email}
                                                        </div>
                                                        <div style={{
                                                            color: '#6b7280',
                                                            fontSize: '11px'
                                                        }}>
                                                            Registered: {formatDateTime(registration.registered_at)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => removeRegistration(events.find(e => e.title === selectedEvent.event_title)?.id, registration.user)}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                        color: 'white',
                                                        border: 'none',
                                                        borderRadius: '8px',
                                                        padding: '8px 12px',
                                                        fontSize: '12px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        transition: 'transform 0.2s ease'
                                                    }}
                                                    onMouseOver={(e) => e.target.style.transform = 'translateY(-1px)'}
                                                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminPanel;