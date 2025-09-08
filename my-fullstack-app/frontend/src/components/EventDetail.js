import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        date: '',
        location: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');

                // Get user data
                const userResponse = await axios.get('http://127.0.0.1:8000/api/auth/profile/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setUser(userResponse.data);

                // Fetch specific event from Django API
                try {
                    const eventResponse = await axios.get(`http://127.0.0.1:8000/api/content/events/${id}/`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    const eventData = eventResponse.data;
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
                    console.error('Error fetching event:', error);
                    // Fallback to mock data if API fails
                    const mockEvent = {
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
                        ticket_price: "Free",
                        agenda: "3-day conference with keynotes, workshops, and networking",
                        requirements: "Laptop recommended for workshops",
                        contact_email: "events@issaconnect.com",
                        sponsors: ["TechCorp", "Innovation Labs", "Digital Solutions Inc."],
                        external_link: "https://eventbrite.com/e/issa-connect-conference-2024"
                    };

                    setEvent(mockEvent);
                    setEditForm({
                        title: mockEvent.title,
                        description: mockEvent.description,
                        date: mockEvent.date.slice(0, 16),
                        location: mockEvent.location
                    });
                }
            } catch (error) {
                console.error('Error fetching event:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleEdit = () => {
        setEditing(true);
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('access_token');

            const response = await axios.put(`http://127.0.0.1:8000/api/content/events/${id}/`, editForm, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setEvent(response.data);
            setEditing(false);
            window.dispatchEvent(new Event('contentUpdated'));
        } catch (error) {
            console.error('Error updating event:', error);
            alert('Failed to update event. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                const token = localStorage.getItem('access_token');

                await axios.delete(`http://127.0.0.1:8000/api/content/events/${id}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                window.dispatchEvent(new Event('contentUpdated'));
                navigate('/home');
            } catch (error) {
                console.error('Error deleting event:', error);
                alert('Failed to delete event. Please try again.');
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const canEdit = user?.is_staff || user?.can_create_content;
    const canCreateContent = user?.is_staff || user?.can_create_content;
    const isAdmin = user?.is_superuser || user?.is_staff;

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
                        <a
                            href={event.external_link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="external-link-btn"
                        >
                            🔗 View Event Details
                        </a>

                        {canEdit && (
                            <div className="admin-actions">
                                {!editing ? (
                                    <>
                                        <button onClick={handleEdit} className="edit-btn">
                                            ✏️ Edit
                                        </button>
                                        <button onClick={handleDelete} className="delete-btn">
                                            🗑️ Delete
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={handleSave} className="save-btn">
                                            💾 Save
                                        </button>
                                        <button onClick={() => setEditing(false)} className="cancel-btn">
                                            ❌ Cancel
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
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="edit-title-input"
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
                                    <span className="info-icon">💰</span>
                                    <div className="info-content">
                                        <span className="info-label">Price</span>
                                        <span className="info-text">{event.ticket_price}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Event Image */}
                        <div className="event-image">
                            <img src={event.image} alt={event.title} />
                        </div>

                        {/* Event Content */}
                        <div className="event-content">
                            {editing ? (
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="edit-content-textarea"
                                    rows="20"
                                />
                            ) : (
                                <div className="content-body">
                                    {event.description.split('\n\n').map((paragraph, index) => {
                                        if (paragraph.startsWith('## ')) {
                                            return <h2 key={index} className="content-heading">{paragraph.replace('## ', '')}</h2>;
                                        } else if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                            return <h3 key={index} className="content-subheading">{paragraph.replace(/\*\*/g, '')}</h3>;
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
                                <span>{event.venue_details}</span>
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

                        {event.sponsors && event.sponsors.length > 0 && (
                            <div className="sidebar-section">
                                <h3>Sponsors</h3>
                                <div className="sponsors-list">
                                    {event.sponsors.map((sponsor, index) => (
                                        <div key={index} className="sponsor-item">{sponsor}</div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                        {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                    </div>
                    <div className="profile-info">
                        <span className="profile-name">
                            {user?.first_name} {user?.last_name}
                        </span>
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
                                {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                            </div>
                            <div className="menu-info">
                                <span className="menu-name">{user?.first_name} {user?.last_name}</span>
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
        </div>
    );
};

export default EventDetail;