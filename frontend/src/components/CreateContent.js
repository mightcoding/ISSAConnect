import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config.js';

const CreateContent = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('news');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [newsForm, setNewsForm] = useState({
        title: '',
        content: '',
        category: 'General',
        image: ''
    });
    const [eventForm, setEventForm] = useState({
        title: '',
        description: '',
        date: '',
        location: '',
        category: 'Workshop',
        capacity: 50,
        ticket_price: 'Free',
        image: ''
    });

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

                // Check if user has permission to create content
                if (!response.data.is_staff && !response.data.can_create_content) {
                    navigate('/home');
                    return;
                }
            } catch (error) {
                localStorage.clear();
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleNewsSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');

        try {
            const token = localStorage.getItem('access_token');

            // Submit to Django API
            await axios.post(`${API_BASE_URL}/api/content/news/`, newsForm, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Trigger content update event for home page
            window.dispatchEvent(new Event('contentUpdated'));

            setMessage('News article created successfully!');
            setNewsForm({ title: '', content: '', category: 'General', image: '' });

            // Redirect to home after 2 seconds
            setTimeout(() => {
                navigate('/home');
            }, 2000);
        } catch (error) {
            console.error('Error creating news:', error);
            setMessage('Failed to create news article. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEventSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage('');

        try {
            const token = localStorage.getItem('access_token');

            // Submit to Django API
            await axios.post(`${API_BASE_URL}/api/content/events/`, eventForm, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            // Trigger content update event for home page
            window.dispatchEvent(new Event('contentUpdated'));

            setMessage('Event created successfully!');
            setEventForm({
                title: '',
                description: '',
                date: '',
                location: '',
                category: 'Workshop',
                capacity: 50,
                ticket_price: 'Free',
                image: ''
            });

            // Redirect to home after 2 seconds
            setTimeout(() => {
                navigate('/home');
            }, 2000);
        } catch (error) {
            console.error('Error creating event:', error);
            setMessage('Failed to create event. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="create-page">
            {/* Header */}
            <header className="create-header">
                <div className="header-container">
                    <button className="back-btn" onClick={() => navigate('/home')}>
                        ← Back to Home
                    </button>
                    <div className="header-title">
                        <h1>Create Content</h1>
                        <p>Share news and create events for the Issa Connect community</p>
                    </div>
                    <div className="header-logo">
                        <span className="logo-text">IC</span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="create-main">
                <div className="create-container">
                    <div className="create-card">
                        {/* Tab Navigation */}
                        <div className="tab-navigation">
                            <button
                                className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`}
                                onClick={() => setActiveTab('news')}
                            >
                                <span className="tab-icon">📰</span>
                                <div className="tab-content">
                                    <span className="tab-title">Create News</span>
                                    <span className="tab-subtitle">Share announcements and updates</span>
                                </div>
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'event' ? 'active' : ''}`}
                                onClick={() => setActiveTab('event')}
                            >
                                <span className="tab-icon">🎉</span>
                                <div className="tab-content">
                                    <span className="tab-title">Create Event</span>
                                    <span className="tab-subtitle">Organize workshops and meetups</span>
                                </div>
                            </button>
                        </div>

                        {/* Message */}
                        {message && (
                            <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                                <span className="message-icon">
                                    {message.includes('success') ? '✅' : '❌'}
                                </span>
                                {message}
                            </div>
                        )}

                        {/* News Form */}
                        {activeTab === 'news' && (
                            <form onSubmit={handleNewsSubmit} className="content-form">
                                <div className="form-section">
                                    <h3 className="form-section-title">📰 News Article Details</h3>

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Article Title</label>
                                            <input
                                                type="text"
                                                value={newsForm.title}
                                                onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                                                className="form-input"
                                                placeholder="Enter a compelling article title..."
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Category</label>
                                            <select
                                                value={newsForm.category}
                                                onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                                                className="form-input"
                                            >
                                                <option value="General">General</option>
                                                <option value="School Life<">School Life</option>
                                                <option value="Security">Security</option>
                                                <option value="Analytics">Analytics</option>
                                                <option value="Breaking News">Breaking News</option>
                                                <option value="Technology">Technology</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Featured Image URL</label>
                                        <input
                                            type="url"
                                            value={newsForm.image}
                                            onChange={(e) => setNewsForm({ ...newsForm, image: e.target.value })}
                                            className="form-input"
                                            placeholder="https://example.com/image.jpg"
                                        />
                                        <p className="form-help">Add a high-quality image URL for your article</p>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Article Content</label>
                                        <textarea
                                            value={newsForm.content}
                                            onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                                            className="form-textarea"
                                            placeholder="Write your article content here...

You can use markdown formatting:
## Headings
**Bold text**
- Bullet points

Share your insights, announcements, or updates with the community."
                                            rows="12"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={submitting}
                                    >
                                        <span className="btn-icon">📰</span>
                                        {submitting ? 'Publishing...' : 'Publish News Article'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Event Form */}
                        {activeTab === 'event' && (
                            <form onSubmit={handleEventSubmit} className="content-form">
                                <div className="form-section">
                                    <h3 className="form-section-title">🎉 Event Details</h3>

                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label className="form-label">Event Title</label>
                                            <input
                                                type="text"
                                                value={eventForm.title}
                                                onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                                                className="form-input"
                                                placeholder="Enter an engaging event title..."
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Category</label>
                                            <select
                                                value={eventForm.category}
                                                onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
                                                className="form-input"
                                            >
                                                <option value="Workshop">Workshop</option>
                                                <option value="Conference">Conference</option>
                                                <option value="Training">Training</option>
                                                <option value="Meetup">Meetup</option>
                                                <option value="Webinar">Webinar</option>
                                                <option value="Networking">Networking</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Event Description</label>
                                        <textarea
                                            value={eventForm.description}
                                            onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                                            className="form-textarea"
                                            placeholder="Describe your event in detail...

Include:
- What attendees will learn or experience
- Who should attend
- What to bring or prepare
- Agenda highlights"
                                            rows="8"
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Event Date & Time</label>
                                            <input
                                                type="datetime-local"
                                                value={eventForm.date}
                                                onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                                                className="form-input"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Location</label>
                                            <input
                                                type="text"
                                                value={eventForm.location}
                                                onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                                                className="form-input"
                                                placeholder="Event venue or 'Virtual Event'"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label className="form-label">Capacity</label>
                                            <input
                                                type="number"
                                                value={eventForm.capacity}
                                                onChange={(e) => setEventForm({ ...eventForm, capacity: parseInt(e.target.value) })}
                                                className="form-input"
                                                min="1"
                                                max="1000"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Ticket Price</label>
                                            <input
                                                type="text"
                                                value={eventForm.ticket_price}
                                                onChange={(e) => setEventForm({ ...eventForm, ticket_price: e.target.value })}
                                                className="form-input"
                                                placeholder="Free, $25, etc."
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Event Image URL</label>
                                        <input
                                            type="url"
                                            value={eventForm.image}
                                            onChange={(e) => setEventForm({ ...eventForm, image: e.target.value })}
                                            className="form-input"
                                            placeholder="https://example.com/event-image.jpg"
                                        />
                                        <p className="form-help">Add a high-quality image URL for your event</p>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={submitting}
                                    >
                                        <span className="btn-icon">🎉</span>
                                        {submitting ? 'Creating...' : 'Create Event'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateContent;