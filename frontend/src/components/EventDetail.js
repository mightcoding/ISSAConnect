import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config.js';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [user, setUser] = useState(null);
    const [userAvatar, setUserAvatar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        category: '',
        capacity: '',
        ticket_price: '',
        image: ''
    });

    const MOCK_EVENT = {
        id: parseInt(id),
        title: "Issa Connect Annual Conference 2024: The Future of Digital Workplace",
        description: `Join us for our flagship annual conference featuring keynote speakers from leading tech companies, interactive workshops, and networking opportunities. Discover the latest trends in digital collaboration, learn best practices from industry experts, and connect with fellow professionals shaping the future of work.

## Event Highlights

**Keynote Speakers**
Hear from industry leaders including CEOs from major tech companies, renowned researchers, and innovation experts who are shaping the future of digital collaboration.

**Interactive Workshops**
Participate in hands-on workshops covering topics such as:
- Advanced workflow automation
- Team productivity optimization
- Digital transformation strategies
- Remote work best practices

**Networking Opportunities**
Connect with professionals from various industries, share experiences, and build lasting professional relationships.

## Schedule Overview

**Day 1 - March 15th**
- 9:00 AM: Registration & Welcome Coffee
- 10:00 AM: Opening Keynote
- 11:30 AM: Workshop Session 1
- 1:00 PM: Lunch & Networking
- 2:30 PM: Panel Discussion
- 4:00 PM: Workshop Session 2
- 6:00 PM: Welcome Reception

**Day 2 - March 16th**
- 9:00 AM: Day 2 Keynote
- 10:30 AM: Breakout Sessions
- 12:00 PM: Lunch & Product Demos
- 2:00 PM: Innovation Showcase
- 3:30 PM: Future Trends Panel
- 5:00 PM: Networking Session

**Day 3 - March 17th**
- 9:00 AM: Community Presentations
- 10:30 AM: Awards Ceremony
- 12:00 PM: Closing Lunch
- 2:00 PM: Optional City Tour

## What's Included
- Access to all sessions and workshops
- Conference materials and swag bag
- Breakfast, lunch, and refreshments
- Networking events and receptions
- Digital access to presentation materials`,
        date: "2024-03-15T09:00:00Z",
        end_date: "2024-03-17T18:00:00Z",
        location: "Convention Center, San Francisco",
        venue_details: "Moscone Center, 747 Howard St, San Francisco, CA 94103",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop",
        category: "Conference",
        capacity: 500,
        registered: 324,
        ticket_price: "Free",
        agenda: "3-day conference with keynotes, workshops, and networking",
        requirements: "Laptop recommended for workshops",
        contact_email: "events@issaconnect.com",
        sponsors: ["TechCorp", "Innovation Labs", "Digital Solutions Inc."],
        external_link: "https://eventbrite.com/e/issa-connect-conference-2024"
    };

    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('access_token');
        return { 'Authorization': `Bearer ${token}` };
    }, []);

    const renderAvatar = useCallback((avatarUrl, name, initials, size = 'default') => (
        <div className={`avatar-wrapper ${size}`}>
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={name}
                    className="avatar-img"
                    onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
            ) : null}
            <div
                className="avatar-fallback"
                style={{ display: avatarUrl ? 'none' : 'flex' }}
            >
                {initials}
            </div>
        </div>
    ), []);

    const fetchUserProfile = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/auth/profile/`, {
                headers: getAuthHeaders()
            });

            const userData = response.data;
            setUser(userData);

            if (userData.avatar_url) {
                setUserAvatar(userData.avatar_url);
            } else if (userData.id) {
                await fetchUserAvatar(userData.id);
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            navigate('/login');
        }
    }, [getAuthHeaders, navigate]);

    const fetchUserAvatar = useCallback(async (userId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/content/admin/users/`, {
                headers: getAuthHeaders()
            });

            const userData = response.data.find(u => u.id === userId);
            if (userData?.avatar_url) {
                setUserAvatar(userData.avatar_url);
            }
        } catch (error) {
            console.debug('Could not fetch avatar:', error);
        }
    }, [getAuthHeaders]);

    const fetchEvent = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/content/events/${id}/`, {
                headers: getAuthHeaders()
            });

            const eventData = response.data;
            setEvent(eventData);
            setEditForm({
                title: eventData.title,
                description: eventData.description,
                date: eventData.date.slice(0, 16),
                location: eventData.location,
                category: eventData.category || 'Workshop',
                capacity: eventData.capacity || 50,
                ticket_price: eventData.ticket_price || 'Free',
                image: eventData.image || ''
            });
        } catch (error) {
            console.warn('API fetch failed, using mock data:', error);
            setEvent(MOCK_EVENT);
            setEditForm({
                title: MOCK_EVENT.title,
                description: MOCK_EVENT.description,
                date: MOCK_EVENT.date.slice(0, 16),
                location: MOCK_EVENT.location,
                category: MOCK_EVENT.category,
                capacity: MOCK_EVENT.capacity,
                ticket_price: MOCK_EVENT.ticket_price,
                image: MOCK_EVENT.image
            });
        }
    }, [id, getAuthHeaders]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchUserProfile(),
                    fetchEvent()
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [fetchUserProfile, fetchEvent]);

    const handleEdit = useCallback(() => {
        setEditing(true);
    }, []);

    const handleSave = useCallback(async () => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/api/content/events/${id}/`,
                editForm,
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json'
                    }
                }
            );

            setEvent(response.data);
            setEditing(false);
            window.dispatchEvent(new Event('contentUpdated'));
        } catch (error) {
            console.error('Error updating event:', error);
            alert('Failed to update event. Please try again.');
        }
    }, [id, editForm, getAuthHeaders]);

    const handleDelete = useCallback(async () => {
        const confirmed = window.confirm('Are you sure you want to delete this event?');
        if (!confirmed) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/content/events/${id}/`, {
                headers: getAuthHeaders()
            });

            window.dispatchEvent(new Event('contentUpdated'));
            navigate('/home');
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event. Please try again.');
        }
    }, [id, getAuthHeaders, navigate]);

    const handleLogout = useCallback(() => {
        localStorage.clear();
        navigate('/login');
    }, [navigate]);

    const handleFormChange = useCallback((field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    }, []);

    const canEdit = user?.is_staff || user?.can_create_content;
    const canCreateContent = user?.is_staff || user?.can_create_content;
    const isAdmin = user?.is_superuser || user?.is_staff;
    const userInitials = `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`;
    const userFullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'User';

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading event...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="error-container">
                <h2>Event not found</h2>
                <button onClick={() => navigate('/home')} className="back-btn">
                    Return to Home
                </button>
            </div>
        );
    }

    return (
        <div className="event-detail-page">
            {/* Navigation Header */}
            <nav className="main-navbar">
                <div className="nav-container">
                    <div className="nav-brand">
                        <div className="brand-logo" onClick={() => navigate('/home')}>
                            <div className="logo-icon">IC</div>
                            <div className="brand-text">
                                <h1 className="brand-title">Issa Connect</h1>
                                <span className="brand-tagline">Professional Collaboration Platform</span>
                            </div>
                        </div>
                    </div>

                    <div className="nav-center">
                        <div className="nav-links">
                            <button
                                className="nav-link"
                                onClick={() => navigate('/home')}
                            >
                                Home
                            </button>
                            <button
                                className="nav-link active"
                                onClick={() => navigate('/home#events')}
                            >
                                Events
                            </button>
                        </div>
                    </div>

                    <div className="nav-actions">
                        {canCreateContent && (
                            <button
                                className="nav-btn create-btn"
                                onClick={() => navigate('/create')}
                            >
                                <span className="btn-icon">✨</span>
                                Create Content
                            </button>
                        )}

                        {isAdmin && (
                            <button
                                className="nav-btn admin-btn"
                                onClick={() => navigate('/admin')}
                            >
                                <span className="btn-icon">⚡</span>
                                Admin
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Header */}
            <header className="detail-header">
                <div className="header-container">
                    <button onClick={() => navigate('/home#events')} className="back-btn">
                        ← Back to Events
                    </button>

                    <div className="header-actions">
                        {canEdit && (
                            <div className="admin-actions">
                                {!editing ? (
                                    <>
                                        <button onClick={handleEdit} className="edit-btn">
                                            Edit
                                        </button>
                                        <button onClick={handleDelete} className="delete-btn">
                                            Delete
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={handleSave} className="save-btn">
                                            Save
                                        </button>
                                        <button onClick={() => setEditing(false)} className="cancel-btn">
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Event Content */}
            <main className="event-main">
                <div className="event-container">
                    <div className="event-content-wrapper">
                        {/* Event Header */}
                        <div className="event-header">
                            <div className="event-meta">
                                <span className="event-category">{event.category}</span>
                                <span className="event-price">{event.ticket_price}</span>
                            </div>

                            {editing ? (
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => handleFormChange('title', e.target.value)}
                                    className="edit-title-input"
                                    placeholder="Event title"
                                />
                            ) : (
                                <h1 className="event-title">{event.title}</h1>
                            )}

                            <div className="event-quick-info">
                                <div className="info-item">
                                    <span className="info-icon">📅</span>
                                    <div className="info-content">
                                        <span className="info-label">Date</span>
                                        <span className="info-text">
                                            {new Date(event.date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                            {event.end_date && ` - ${new Date(event.end_date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                month: 'long',
                                                day: 'numeric'
                                            })}`}
                                        </span>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <span className="info-icon">🕐</span>
                                    <div className="info-content">
                                        <span className="info-label">Time</span>
                                        <span className="info-text">
                                            {new Date(event.date).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                            {event.end_date && ` - ${new Date(event.end_date).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}`}
                                        </span>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <span className="info-icon">📍</span>
                                    <div className="info-content">
                                        <span className="info-label">Location</span>
                                        <span className="info-text">{event.location}</span>
                                    </div>
                                </div>

                                <div className="info-item">
                                    <span className="info-icon">👥</span>
                                    <div className="info-content">
                                        <span className="info-label">Capacity</span>
                                        <span className="info-text">
                                            {event.registered || 0} / {event.capacity} registered
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Event Image */}
                        {(event.image || editForm.image) && (
                            <div className="event-image">
                                {editing ? (
                                    <div className="form-group">
                                        <label className="form-label">Image URL</label>
                                        <input
                                            type="url"
                                            value={editForm.image}
                                            onChange={(e) => handleFormChange('image', e.target.value)}
                                            className="form-input"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                    </div>
                                ) : (
                                    <img src={event.image} alt={event.title} />
                                )}
                            </div>
                        )}

                        {/* Event Content */}
                        <div className="event-content">
                            {editing ? (
                                <div className="edit-form">
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Category</label>
                                            <select
                                                value={editForm.category}
                                                onChange={(e) => handleFormChange('category', e.target.value)}
                                                className="form-input"
                                            >
                                                <option value="Conference">Conference</option>
                                                <option value="Workshop">Workshop</option>
                                                <option value="Training">Training</option>
                                                <option value="Meetup">Meetup</option>
                                                <option value="Webinar">Webinar</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Capacity</label>
                                            <input
                                                type="number"
                                                value={editForm.capacity}
                                                onChange={(e) => handleFormChange('capacity', e.target.value)}
                                                className="form-input"
                                                placeholder="50"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                value={editForm.date}
                                                onChange={(e) => handleFormChange('date', e.target.value)}
                                                className="form-input"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Ticket Price</label>
                                            <input
                                                type="text"
                                                value={editForm.ticket_price}
                                                onChange={(e) => handleFormChange('ticket_price', e.target.value)}
                                                className="form-input"
                                                placeholder="Free"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Location</label>
                                        <input
                                            type="text"
                                            value={editForm.location}
                                            onChange={(e) => handleFormChange('location', e.target.value)}
                                            className="form-input"
                                            placeholder="Event location"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            value={editForm.description}
                                            onChange={(e) => handleFormChange('description', e.target.value)}
                                            className="edit-content-textarea"
                                            rows="20"
                                            placeholder="Event description..."
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="content-body">
                                    {event.description.split('\n\n').map((paragraph, index) => {
                                        if (paragraph.startsWith('## ')) {
                                            return <h2 key={index} className="content-heading">{paragraph.replace('## ', '')}</h2>;
                                        } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                            return <h3 key={index} className="content-subheading">{paragraph.replace(/\*\*/g, '')}</h3>;
                                        } else if (paragraph.startsWith('- ')) {
                                            const listItems = paragraph.split('\n').filter(item => item.startsWith('- '));
                                            return (
                                                <ul key={index} className="content-list">
                                                    {listItems.map((item, i) => (
                                                        <li key={i}>{item.replace('- ', '')}</li>
                                                    ))}
                                                </ul>
                                            );
                                        } else {
                                            return <p key={index} className="content-paragraph">{paragraph}</p>;
                                        }
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Event Details Sidebar */}
                    <aside className="event-sidebar">
                        <div className="sidebar-section">
                            <h3>Event Details</h3>
                            <div className="detail-item">
                                <strong>Venue:</strong>
                                <span>{event.venue_details || event.location}</span>
                            </div>
                            {event.requirements && (
                                <div className="detail-item">
                                    <strong>Requirements:</strong>
                                    <span>{event.requirements}</span>
                                </div>
                            )}
                            {event.contact_email && (
                                <div className="detail-item">
                                    <strong>Contact:</strong>
                                    <span>{event.contact_email}</span>
                                </div>
                            )}
                        </div>




                    </aside>
                </div>
            </main>

            {/* Profile Widget */}
            <div className="profile-widget">
                <div
                    className="profile-trigger"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                    <div className="profile-avatar">
                        {renderAvatar(userAvatar, userFullName, userInitials, 'small')}
                    </div>
                    <div className="profile-info">
                        <span className="profile-name">{userFullName}</span>
                        <span className="profile-role">
                            {isAdmin ? 'Administrator' : canCreateContent ? 'Content Creator' : 'Member'}
                        </span>
                    </div>
                    <div className="profile-arrow">
                        <span className={`arrow ${showProfileMenu ? 'up' : 'down'}`}>›</span>
                    </div>
                </div>

                {showProfileMenu && (
                    <div className="profile-menu">
                        <div className="menu-header">
                            <div className="menu-avatar">
                                {renderAvatar(userAvatar, userFullName, userInitials, 'small')}
                            </div>
                            <div className="menu-info">
                                <span className="menu-name">{userFullName}</span>
                                <span className="menu-email">{user?.email}</span>
                            </div>
                        </div>
                        <div className="menu-divider"></div>
                        <button
                            className="menu-item"
                            onClick={() => {
                                navigate('/profile');
                                setShowProfileMenu(false);
                            }}
                        >
                            <span className="menu-icon">👤</span>
                            <span>My Profile</span>
                        </button>
                        <div className="menu-divider"></div>
                        <button
                            className="menu-item logout-item"
                            onClick={handleLogout}
                        >
                            <span className="menu-icon">🚪</span>
                            <span>Sign Out</span>
                        </button>
                    </div>
                )}
            </div>

            <style jsx>{`
                .event-detail-page {
                    min-height: 100vh;
                    background: #f8fafc;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
                }

                .main-navbar {
                    background: white;
                    border-bottom: 1px solid #e5e7eb;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }

                .nav-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    height: 64px;
                }

                .nav-brand {
                    display: flex;
                    align-items: center;
                }

                .brand-logo {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: opacity 0.2s ease;
                }

                .brand-logo:hover {
                    opacity: 0.8;
                }

                .logo-icon {
                    width: 40px;
                    height: 40px;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 700;
                    font-size: 16px;
                }

                .brand-text {
                    display: flex;
                    flex-direction: column;
                }

                .brand-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #111827;
                    margin: 0;
                    line-height: 1.2;
                }

                .brand-tagline {
                    font-size: 12px;
                    color: #6b7280;
                    line-height: 1.2;
                }

                .nav-center {
                    display: flex;
                    align-items: center;
                }

                .nav-links {
                    display: flex;
                    gap: 8px;
                }

                .nav-link {
                    padding: 8px 16px;
                    background: none;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #6b7280;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .nav-link:hover {
                    background: #f3f4f6;
                    color: #374151;
                }

                .nav-link.active {
                    background: #dbeafe;
                    color: #1d4ed8;
                }

                .nav-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .nav-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                }

                .nav-btn:hover {
                    background: #2563eb;
                }

                .nav-btn.admin-btn {
                    background: #059669;
                }

                .nav-btn.admin-btn:hover {
                    background: #047857;
                }

                .detail-header {
                    background: white;
                    border-bottom: 1px solid #e5e7eb;
                    padding: 20px 0;
                }

                .header-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 0 24px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .back-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: #f3f4f6;
                    color: #374151;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .back-btn:hover {
                    background: #e5e7eb;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .admin-actions {
                    display: flex;
                    gap: 8px;
                }

                .edit-btn, .delete-btn, .save-btn, .cancel-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .edit-btn {
                    background: #3b82f6;
                    color: white;
                }

                .edit-btn:hover {
                    background: #2563eb;
                }

                .delete-btn {
                    background: #dc2626;
                    color: white;
                }

                .delete-btn:hover {
                    background: #b91c1c;
                }

                .save-btn {
                    background: #059669;
                    color: white;
                }

                .save-btn:hover {
                    background: #047857;
                }

                .cancel-btn {
                    background: #6b7280;
                    color: white;
                }

                .cancel-btn:hover {
                    background: #4b5563;
                }

                .event-main {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 40px 24px;
                    display: grid;
                    grid-template-columns: 1fr 300px;
                    gap: 40px;
                }

                .event-content-wrapper {
                    background: white;
                    border-radius: 12px;
                    padding: 32px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .event-header {
                    margin-bottom: 32px;
                }

                .event-meta {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .event-category {
                    background: #dbeafe;
                    color: #1d4ed8;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .event-price {
                    background: #d1fae5;
                    color: #047857;
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    font-weight: 600;
                }

                .event-title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #111827;
                    line-height: 1.3;
                    margin: 0 0 24px 0;
                }

                .edit-title-input {
                    width: 100%;
                    font-size: 28px;
                    font-weight: 700;
                    color: #111827;
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin: 0 0 24px 0;
                    font-family: inherit;
                }

                .edit-title-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .event-quick-info {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 24px;
                    border: 1px solid #e2e8f0;
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                }

                .info-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }

                .info-icon {
                    font-size: 20px;
                    line-height: 1;
                    margin-top: 2px;
                }

                .info-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .info-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .info-text {
                    font-size: 14px;
                    font-weight: 500;
                    color: #111827;
                    line-height: 1.4;
                }

                .event-image {
                    margin: 32px 0;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }

                .event-image img {
                    width: 100%;
                    height: 300px;
                    object-fit: cover;
                }

                .event-content {
                    line-height: 1.7;
                }

                .content-body {
                    color: #374151;
                }

                .content-heading {
                    font-size: 24px;
                    font-weight: 700;
                    color: #111827;
                    margin: 32px 0 16px 0;
                    line-height: 1.3;
                }

                .content-subheading {
                    font-size: 18px;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 24px 0 12px 0;
                    line-height: 1.4;
                }

                .content-paragraph {
                    margin-bottom: 16px;
                    font-size: 16px;
                    line-height: 1.7;
                }

                .content-list {
                    margin: 16px 0;
                    padding-left: 20px;
                }

                .content-list li {
                    margin-bottom: 8px;
                    font-size: 16px;
                    line-height: 1.6;
                }

                .edit-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-label {
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                }

                .form-input {
                    padding: 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-size: 14px;
                    transition: border-color 0.2s ease;
                }

                .form-input:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .edit-content-textarea {
                    width: 100%;
                    padding: 16px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    font-family: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
                    line-height: 1.5;
                    resize: vertical;
                    min-height: 400px;
                }

                .edit-content-textarea:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .event-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .sidebar-section {
                    background: white;
                    border-radius: 12px;
                    padding: 24px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e5e7eb;
                }

                .sidebar-section h3 {
                    font-size: 18px;
                    font-weight: 700;
                    color: #111827;
                    margin: 0 0 16px 0;
                }

                .detail-item {
                    margin-bottom: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .detail-item strong {
                    font-size: 12px;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .detail-item span {
                    font-size: 14px;
                    color: #111827;
                    line-height: 1.5;
                }

                .sponsors-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .sponsor-item {
                    padding: 8px 12px;
                    background: #f8fafc;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #374151;
                    text-align: center;
                }

                .registration-progress {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .progress-stats {
                    display: flex;
                    justify-content: space-between;
                    font-size: 14px;
                }

                .stats-registered {
                    font-weight: 600;
                    color: #059669;
                }

                .stats-total {
                    color: #6b7280;
                }

                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #10b981, #059669);
                    transition: width 0.3s ease;
                    border-radius: 4px;
                }

                .progress-percentage {
                    font-size: 12px;
                    color: #6b7280;
                    text-align: center;
                }

                .avatar-wrapper {
                    position: relative;
                    border-radius: 50%;
                    overflow: hidden;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border: 2px solid #e5e7eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .avatar-wrapper.small {
                    width: 36px;
                    height: 36px;
                }

                .avatar-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                }

                .avatar-fallback {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    color: white;
                    font-size: 12px;
                }

                .profile-widget {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    z-index: 1000;
                }

                .profile-trigger {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(229, 231, 235, 0.5);
                    border-radius: 16px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    max-width: 250px;
                }

                .profile-trigger:hover {
                    background: rgba(255, 255, 255, 0.98);
                    transform: translateY(-2px);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
                }

                .profile-info {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .profile-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #111827;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .profile-role {
                    font-size: 12px;
                    color: #6b7280;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .profile-arrow {
                    flex-shrink: 0;
                }

                .arrow {
                    display: inline-block;
                    transition: transform 0.3s ease;
                    font-size: 14px;
                    color: #9ca3af;
                }

                .arrow.up {
                    transform: rotate(-90deg);
                }

                .arrow.down {
                    transform: rotate(90deg);
                }

                .profile-menu {
                    position: absolute;
                    bottom: 100%;
                    right: 0;
                    margin-bottom: 12px;
                    background: rgba(255, 255, 255, 0.98);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(229, 231, 235, 0.5);
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
                    min-width: 240px;
                    overflow: hidden;
                    animation: slideUp 0.2s ease;
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .menu-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 20px;
                    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
                }

                .menu-info {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .menu-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: #111827;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .menu-email {
                    font-size: 13px;
                    color: #6b7280;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .menu-divider {
                    height: 1px;
                    background: linear-gradient(90deg, transparent, rgba(229, 231, 235, 0.8), transparent);
                    margin: 0 8px;
                }

                .menu-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    padding: 14px 20px;
                    background: none;
                    border: none;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 14px;
                    color: #374151;
                    font-weight: 500;
                }

                .menu-item:hover {
                    background: rgba(59, 130, 246, 0.08);
                    color: #1f2937;
                }

                .menu-item.logout-item {
                    color: #dc2626;
                }

                .menu-item.logout-item:hover {
                    background: rgba(220, 38, 38, 0.08);
                    color: #b91c1c;
                }

                .menu-icon {
                    font-size: 16px;
                    width: 20px;
                    text-align: center;
                }

                .loading-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    gap: 16px;
                }

                .loading-spinner {
                    width: 48px;
                    height: 48px;
                    border: 3px solid #f3f4f6;
                    border-top: 3px solid #3b82f6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .error-container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 50vh;
                    gap: 16px;
                    text-align: center;
                }

                .error-container h2 {
                    font-size: 24px;
                    color: #374151;
                    margin: 0;
                }

                @media (max-width: 1024px) {
                    .event-main {
                        grid-template-columns: 1fr;
                        gap: 32px;
                        padding: 32px 20px;
                    }

                    .event-content-wrapper {
                        padding: 32px;
                    }

                    .event-sidebar {
                        position: static;
                        max-height: none;
                        overflow-y: visible;
                    }

                    .event-quick-info {
                        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
                        gap: 20px;
                        padding: 24px;
                    }

                    .info-item {
                        padding: 12px;
                    }

                    .info-icon {
                        width: 36px;
                        height: 36px;
                        font-size: 20px;
                    }
                }

                @media (max-width: 768px) {
                    .event-main {
                        grid-template-columns: 1fr;
                        gap: 24px;
                        padding: 24px 16px;
                    }

                    .event-content-wrapper {
                        padding: 24px;
                    }

                    .event-title {
                        font-size: 24px;
                    }

                    .event-quick-info {
                        grid-template-columns: 1fr;
                        gap: 16px;
                        padding: 20px;
                    }

                    .form-row {
                        grid-template-columns: 1fr;
                    }

                    .header-container {
                        padding: 0 16px;
                        flex-direction: column;
                        gap: 16px;
                        align-items: flex-start;
                    }

                    .header-actions {
                        width: 100%;
                        justify-content: space-between;
                    }

                    .nav-container {
                        padding: 0 16px;
                    }

                    .brand-text {
                        display: none;
                    }

                    .nav-center {
                        flex: 1;
                        justify-content: center;
                    }

                    .profile-widget {
                        bottom: 16px;
                        right: 16px;
                    }

                    .profile-trigger {
                        max-width: 200px;
                        padding: 10px 12px;
                    }

                    .sidebar-section {
                        padding: 24px;
                    }
                }

                @media (max-width: 480px) {
                    .event-content-wrapper {
                        padding: 20px;
                    }

                    .event-title {
                        font-size: 20px;
                    }

                    .content-heading {
                        font-size: 20px;
                    }

                    .content-subheading {
                        font-size: 16px;
                    }

                    .nav-actions {
                        gap: 8px;
                    }

                    .nav-btn {
                        padding: 6px 12px;
                        font-size: 12px;
                    }

                    .btn-icon {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default EventDetail;