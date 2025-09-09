import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config.js';

const Home = () => {
    // State management
    const [user, setUser] = useState(null);
    const [userAvatar, setUserAvatar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [news, setNews] = useState([]);
    const [events, setEvents] = useState([]);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [activeSection, setActiveSection] = useState('news');

    const navigate = useNavigate();

    // Constants
    const TEAM_MEMBERS = useMemo(() => [
        {
            id: 1,
            name: "Alisher Kuvanbakiyev",
            role: "Founder & Developer",
            avatar: "AK",
            photo: "/images/Alisher.jpeg", // Add this line
            bio: "Full-stack developer with 8+ years of experience building scalable web applications. Passionate about creating intuitive user experiences and robust backend systems.",
            skills: ["React", "Node.js", "Python", "AWS", "Docker", "GraphQL"],
            achievements: "Led development of 15+ enterprise applications",
            contact: "alex@issaconnect.com"
        },
        {
            id: 2,
            name: "Imangali Baimyrza",
            role: "Founder",
            avatar: "IB",
            photo: "/images/Imagali.jpeg",
            bio: "Creative designer passionate about crafting beautiful and functional user interfaces. With a background in psychology and design, Sarah focuses on user-centered design principles.",
            skills: ["Figma", "Adobe Creative Suite", "User Research", "Prototyping", "Design Systems", "Accessibility"],
            achievements: "Designed interfaces used by 50,000+ users daily",
            contact: "sarah@issaconnect.com"
        }
    ], []);

    const MOCK_NEWS = useMemo(() => [
        {
            id: 1,
            title: "Issa Connect Platform Launch: Revolutionizing Digital Collaboration",
            content: "We're thrilled to announce the official launch of Issa Connect, a cutting-edge platform designed to streamline communication and enhance productivity across organizations.",
            excerpt: "Announcing the launch of our revolutionary digital collaboration platform with advanced features for modern teams.",
            author: "Sarah Johnson",
            author_role: "Product Manager",
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
            category: "Product Launch",
            read_time: "5 min read",
            created_at: "2024-01-20T10:00:00Z",
            views: 1247,
            featured: true
        },
        {
            id: 2,
            title: "Advanced Security Features: Protecting Your Data",
            content: "Security is at the heart of everything we do at Issa Connect. Today, we're introducing enhanced security protocols including end-to-end encryption.",
            excerpt: "Introducing comprehensive security enhancements to protect your valuable data and communications with enterprise-grade protection.",
            author: "Michael Chen",
            author_role: "Security Engineer",
            image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop",
            category: "Security",
            read_time: "7 min read",
            created_at: "2024-01-18T14:30:00Z",
            views: 892,
            featured: false
        },
        {
            id: 3,
            title: "Q1 Performance Analytics: Record Growth",
            content: "We're excited to share our Q1 performance metrics, which show unprecedented growth in user engagement and platform adoption.",
            excerpt: "Sharing our impressive Q1 metrics showing record growth and exceptional user engagement across all platforms.",
            author: "Emma Davis",
            author_role: "Analytics Director",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop",
            category: "Analytics",
            read_time: "4 min read",
            created_at: "2024-01-15T09:15:00Z",
            views: 634,
            featured: false
        }
    ], []);

    const MOCK_EVENTS = useMemo(() => [
        {
            id: 1,
            title: "Issa Connect Annual Conference 2024: The Future of Digital Workplace",
            description: "Join us for our flagship annual conference featuring keynote speakers from leading tech companies, interactive workshops, and networking opportunities.",
            excerpt: "Our flagship conference featuring industry leaders and innovative workshops on digital collaboration.",
            date: "2024-03-15T09:00:00Z",
            end_date: "2024-03-17T18:00:00Z",
            location: "Convention Center, San Francisco",
            venue_details: "Moscone Center, 747 Howard St, San Francisco, CA 94103",
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
            category: "Conference",
            capacity: 500,
            registered: 324,
            author_name: "Event Team",
            ticket_price: "Free",
            agenda: "Day 1: Keynotes & Workshops, Day 2: Panel Discussions, Day 3: Networking & Awards"
        },
        {
            id: 2,
            title: "Advanced Features Training Workshop",
            description: "Deep dive into Issa Connect's advanced features with our expert trainers. This hands-on workshop covers automation tools and integrations.",
            excerpt: "Hands-on training workshop covering advanced platform features and productivity techniques.",
            date: "2024-02-28T14:00:00Z",
            end_date: "2024-02-28T17:00:00Z",
            location: "Virtual Event",
            venue_details: "Online via Issa Connect Platform",
            image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
            category: "Training",
            capacity: 100,
            registered: 67,
            author_name: "Training Team",
            ticket_price: "Free for Premium users",
            agenda: "Session 1: Automation Setup, Session 2: Integration Techniques, Session 3: Custom Workflows"
        },
        {
            id: 3,
            title: "Community Meetup: Building Better Digital Experiences",
            description: "Connect with fellow Issa Connect users in your area! Share experiences, exchange tips, and collaborate on innovative solutions.",
            excerpt: "Local community meetup for users to share experiences and network with fellow professionals.",
            date: "2024-02-10T18:00:00Z",
            end_date: "2024-02-10T21:00:00Z",
            location: "Tech Hub Downtown",
            venue_details: "Innovation District, 123 Tech Street, Austin, TX 78701",
            image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&h=400&fit=crop",
            category: "Meetup",
            capacity: 50,
            registered: 23,
            author_name: "Community Team",
            ticket_price: "Free",
            agenda: "6:00 PM: Welcome & Networking, 7:00 PM: User Presentations, 8:00 PM: Q&A & Social"
        }
    ], []);

    // Helper functions
    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('access_token');
        return { 'Authorization': `Bearer ${token}` };
    }, []);

    const formatDate = useCallback((dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }, []);

    const formatTime = useCallback((dateString) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }, []);

    const renderAvatar = useCallback((avatarUrl, name, initials, size = 'default') => (
        <div className={`avatar-wrapper ${size}`}>
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={name}
                    className="avatar-img"
                    onError={(e) => {
                        console.warn(`Failed to load avatar for ${name}:`, avatarUrl);
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

    // Data fetching functions
    const fetchContent = useCallback(async () => {
        try {
            const [newsResponse, eventsResponse] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/content/news/`, {
                    headers: getAuthHeaders()
                }),
                axios.get(`${API_BASE_URL}/api/content/events/`, {
                    headers: getAuthHeaders()
                })
            ]);

            setNews(newsResponse.data);
            setEvents(eventsResponse.data);
        } catch (error) {
            console.warn('API fetch failed, using mock data:', error);
            setNews(MOCK_NEWS);
            setEvents(MOCK_EVENTS);
        }
    }, [getAuthHeaders, MOCK_NEWS, MOCK_EVENTS]);

    const fetchUserProfile = useCallback(async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                navigate('/login');
                return null;
            }

            const response = await axios.get(`${API_BASE_URL}/api/auth/profile/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const userData = response.data;
            setUser(userData);

            // Try to get avatar directly from profile first
            if (userData.avatar_url) {
                setUserAvatar(userData.avatar_url);
            } else if (userData.id) {
                // If no direct avatar, try to fetch from users endpoint
                await fetchUserAvatar(userData.id);
            }

            return userData;
        } catch (error) {
            console.error('Profile fetch error:', error);
            localStorage.clear();
            navigate('/login');
            return null;
        }
    }, [navigate]);

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
            // Don't log error for non-admin users as they might not have access
            console.debug('Could not fetch from admin users endpoint:', error);

            // Try alternative user avatar endpoint if available
            try {
                const avatarResponse = await axios.get(`${API_BASE_URL}/api/auth/avatar/`, {
                    headers: getAuthHeaders()
                });
                if (avatarResponse.data?.avatar_url) {
                    setUserAvatar(avatarResponse.data.avatar_url);
                }
            } catch (avatarError) {
                console.debug('No avatar endpoint available:', avatarError);
            }
        }
    }, [getAuthHeaders]);

    const fetchUserData = useCallback(async () => {
        setLoading(true);

        try {
            const userData = await fetchUserProfile();
            if (userData) {
                await fetchContent();
            }
        } catch (error) {
            console.error('Error during data fetch:', error);
        } finally {
            setLoading(false);
        }
    }, [fetchUserProfile, fetchContent]);

    // Event handlers
    const handleLogout = useCallback(() => {
        localStorage.clear();
        navigate('/login');
    }, [navigate]);

    const scrollToSection = useCallback((sectionId) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }, []);

    const handleScroll = useCallback(() => {
        const sections = ['news', 'events', 'team'];
        const scrollPosition = window.scrollY + 200;

        for (const section of sections) {
            const element = document.getElementById(section);
            if (element) {
                const { offsetTop, offsetHeight } = element;
                if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                    setActiveSection(section);
                    break;
                }
            }
        }
    }, []);

    const handleContentUpdate = useCallback(() => {
        fetchContent();
    }, [fetchContent]);

    // Effects
    useEffect(() => {
        console.log('Home.js using API_BASE_URL:', API_BASE_URL);
        fetchUserData();
    }, [fetchUserData]);

    useEffect(() => {
        // Listen for content updates and scroll events
        window.addEventListener('contentUpdated', handleContentUpdate);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('contentUpdated', handleContentUpdate);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleContentUpdate, handleScroll]);

    // Computed values
    const canCreateContent = user?.is_staff || user?.can_create_content;
    const isAdmin = user?.is_superuser || user?.is_staff;
    const userInitials = `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`;
    const userFullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.username || 'User';

    // Loading state
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading ISSA Connect...</p>
            </div>
        );
    }

    return (
        <div className="home-page">
            {/* Enhanced Navigation Header */}
            <nav className="main-navbar enhanced-nav">
                <div className="nav-container">
                    <div className="nav-brand">
                        <div className="brand-logo enhanced-logo">
                            <div className="logo-icon">
                                <span className="logo-text">IC</span>
                                <div className="logo-glow"></div>
                            </div>
                            <div className="brand-text">
                                <h1 className="brand-title">ISSAConnect</h1>
                                <span className="brand-tagline">School Collaboration Platform</span>
                            </div>
                        </div>
                    </div>

                    <div className="nav-center">
                        <div className="nav-links enhanced-links">
                            <button
                                className={`nav-link ${activeSection === 'news' ? 'active' : ''}`}
                                onClick={() => scrollToSection('news')}
                            >
                                News
                            </button>
                            <button
                                className={`nav-link ${activeSection === 'events' ? 'active' : ''}`}
                                onClick={() => scrollToSection('events')}
                            >
                                Events
                            </button>
                            <button
                                className={`nav-link ${activeSection === 'team' ? 'active' : ''}`}
                                onClick={() => scrollToSection('team')}
                            >
                                Our Team
                            </button>
                        </div>
                    </div>

                    <div className="nav-actions">
                        {canCreateContent && (
                            <button
                                className="nav-btn create-btn enhanced-btn"
                                onClick={() => navigate('/create')}
                            >
                                <span className="btn-icon">✨</span>
                                Create Content
                            </button>
                        )}

                        {isAdmin && (
                            <button
                                className="nav-btn admin-btn enhanced-btn"
                                onClick={() => navigate('/admin')}
                            >
                                <span className="btn-icon">⚡</span>
                                Admin
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Enhanced Hero Section */}
            <section className="hero-section enhanced-hero">
                <div className="hero-background">
                    <div className="floating-shape shape-1"></div>
                    <div className="floating-shape shape-2"></div>
                    <div className="floating-shape shape-3"></div>
                    <div className="floating-shape shape-4"></div>
                </div>
                <div className="hero-container">
                    <div className="hero-content">
                        <h2 className="hero-title animated-title">
                            Welcome to Issa Connect, {user?.first_name || user?.username || 'User'}
                        </h2>
                        <p className="hero-subtitle animated-subtitle">
                            Stay connected with the latest updates, exciting events, and meet our amazing team
                        </p>
                        <div className="hero-stats animated-stats">
                            <div className="stat-item">
                                <span className="stat-number">500+</span>
                                <span className="stat-label">Active Users</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">1000+</span>
                                <span className="stat-label">Messages Sent</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-number">Student Council</span>
                                <span className="stat-label">Affiliated with</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Background Decorations */}
            <div className="page-decorations">
                <div className="decoration-1"></div>
                <div className="decoration-2"></div>
                <div className="decoration-3"></div>
            </div>

            {/* Main Content */}
            <main className="main-content">
                <div className="content-container">
                    {/* News Section */}
                    <section id="news" className="content-section">
                        <div className="section-header">
                            <div className="section-title-group">
                                <h3 className="section-title">Latest News & Updates</h3>
                                <p className="section-subtitle">Stay informed with our latest announcements, insights, and platform updates</p>
                            </div>
                            <div className="section-actions">
                                <span className="section-count">{news.length} articles</span>
                            </div>
                        </div>

                        <div className="news-grid enhanced">
                            {news.map((article, index) => (
                                <article
                                    key={article.id}
                                    className={`news-card ${article.featured ? 'featured' : ''} ${index === 0 ? 'large' : ''}`}
                                    onClick={() => navigate(`/news/${article.id}`)}
                                >
                                    <div className="card-image">
                                        <img src={article.image} alt={article.title} />
                                        <div className="card-category">{article.category}</div>
                                        {article.featured && <div className="featured-badge">Featured</div>}
                                    </div>
                                    <div className="card-content">
                                        <div className="card-meta">
                                            <span className="card-date">{formatDate(article.created_at)}</span>
                                            <span className="card-read-time">{article.read_time}</span>
                                            <span className="card-views">{article.views} views</span>
                                        </div>
                                        <h4 className="card-title">{article.title}</h4>
                                        <p className="card-excerpt">{article.excerpt}</p>
                                        <div className="card-footer">
                                            <div className="author-info"></div>
                                            <div className="read-more">
                                                <span>Read More →</span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* Events Section */}
                    <section id="events" className="content-section">
                        <div className="section-header">
                            <div className="section-title-group">
                                <h3 className="section-title">Upcoming Events</h3>
                                <p className="section-subtitle">Join us for exciting events, workshops, and networking opportunities</p>
                            </div>
                            <div className="section-actions">
                                <span className="section-count">{events.length} events</span>
                            </div>
                        </div>

                        <div className="events-grid">
                            {events.map((event) => (
                                <article
                                    key={event.id}
                                    className="event-card"
                                    onClick={() => navigate(`/events/${event.id}`)}
                                >
                                    <div className="card-image">
                                        <img src={event.image} alt={event.title} />
                                        <div className="event-date-badge">
                                            <span className="date-month">
                                                {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                                            </span>
                                            <span className="date-day">{new Date(event.date).getDate()}</span>
                                        </div>
                                    </div>
                                    <div className="card-content">
                                        <div className="event-header">
                                            <span className="event-category">{event.category}</span>
                                            <span className="event-price">{event.ticket_price}</span>
                                        </div>
                                        <h4 className="card-title">{event.title}</h4>
                                        <p className="card-excerpt">{event.excerpt}</p>
                                        <div className="event-details">
                                            <div className="event-info">
                                                <div className="info-item">
                                                    <span className="info-icon">📅</span>
                                                    <span>{formatDate(event.date)} at {formatTime(event.date)}</span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-icon">📍</span>
                                                    <span>{event.location}</span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-icon">👥</span>
                                                    <span>Event Capacity - {event.capacity} Students</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-footer">
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* Team Section */}
                    {/* Team Section */}
                    <section id="team" className="content-section">
                        <div className="section-header">
                            <div className="section-title-group">
                                <h3 className="section-title">Meet Our Team</h3>
                            </div>
                            <div className="section-actions">
                            </div>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                            gap: '20px', // Reduced further
                            marginTop: '40px',
                            justifyItems: 'center',
                            maxWidth: '800px', // Smaller container
                            margin: '40px auto 0'
                        }}>
                            {TEAM_MEMBERS.map((member) => (
                                <div
                                    key={member.id}
                                    style={{
                                        background: 'white',
                                        borderRadius: '20px', // Reduced from 28px
                                        padding: '50px', // Reduced from 68px
                                        textAlign: 'center',
                                        border: '1px solid #e5e7eb',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                        width: '100%',
                                        maxWidth: '380px', // Reduced from 480px
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-6px)';
                                        e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.15)';
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                    }}
                                >
                                    <div style={{
                                        position: 'relative',
                                        width: '200px', // Reduced from 255px
                                        height: '200px',
                                        margin: '0 auto 30px', // Reduced from 40px
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        border: '4px solid #e5e7eb', // Reduced from 6px
                                        transition: 'border-color 0.3s ease'
                                    }}>
                                        {member.photo ? (
                                            <img
                                                src={member.photo}
                                                alt={member.name}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    borderRadius: '50%',
                                                    transition: 'transform 0.3s ease'
                                                }}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.transform = 'scale(1.05)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.transform = 'scale(1)';
                                                }}
                                            />
                                        ) : null}
                                        <div
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                                display: member.photo ? 'none' : 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '60px', // Reduced from 82px
                                                fontWeight: '600',
                                                color: 'white',
                                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                                position: 'absolute',
                                                top: '0',
                                                left: '0',
                                                borderRadius: '50%'
                                            }}
                                        >
                                            {member.avatar}
                                        </div>
                                        <div style={{
                                            position: 'absolute',
                                            top: '0',
                                            left: '0',
                                            right: '0',
                                            bottom: '0',
                                            background: 'rgba(59, 130, 246, 0.1)',
                                            opacity: '0',
                                            transition: 'opacity 0.3s ease',
                                            borderRadius: '50%'
                                        }}></div>
                                    </div>
                                    <div>
                                        <h4 style={{
                                            fontSize: '28px', // Reduced from 41px
                                            fontWeight: '700',
                                            color: '#111827',
                                            margin: '0 0 16px 0', // Reduced from 20px
                                            lineHeight: '1.2'
                                        }}>
                                            {member.name}
                                        </h4>
                                        <p style={{
                                            fontSize: '18px', // Reduced from 27px
                                            color: '#6b7280',
                                            margin: '0',
                                            lineHeight: '1.4',
                                            fontWeight: '500'
                                        }}>
                                            {member.role}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
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
                /* Avatar System */
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
                    transition: all 0.2s ease;
                }

                .avatar-wrapper:hover {
                    transform: scale(1.05);
                    border-color: #3b82f6;
                }

                .avatar-wrapper.small {
                    width: 36px;
                    height: 36px;
                }

                .avatar-wrapper.default {
                    width: 48px;
                    height: 48px;
                }

                .avatar-wrapper.medium {
                    width: 56px;
                    height: 56px;
                }

                .avatar-wrapper.large {
                    width: 64px;
                    height: 64px;
                }

                .avatar-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                    transition: opacity 0.2s ease;
                }

                .avatar-fallback {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    color: white;
                    background: inherit;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                }

                .avatar-wrapper.small .avatar-fallback {
                    font-size: 12px;
                }

                .avatar-wrapper.default .avatar-fallback {
                    font-size: 16px;
                }

                .avatar-wrapper.medium .avatar-fallback {
                    font-size: 18px;
                }

                .avatar-wrapper.large .avatar-fallback {
                    font-size: 20px;
                }

                /* Profile Widget Enhanced */
                .profile-widget {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    z-index: 1000;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
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
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    max-width: 280px;
                    min-width: 200px;
                }

                .profile-trigger:hover {
                    background: rgba(255, 255, 255, 0.98);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
                    transform: translateY(-2px);
                    border-color: rgba(59, 130, 246, 0.3);
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
                    line-height: 1.3;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .profile-role {
                    font-size: 12px;
                    color: #6b7280;
                    line-height: 1.3;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .profile-arrow {
                    flex-shrink: 0;
                    margin-left: 8px;
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

                /* Profile Menu Enhanced */
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
                    border-bottom: 1px solid rgba(229, 231, 235, 0.5);
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
                    line-height: 1.3;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .menu-email {
                    font-size: 13px;
                    color: #6b7280;
                    line-height: 1.3;
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
                    opacity: 0.8;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .profile-widget {
                        bottom: 16px;
                        right: 16px;
                    }

                    .profile-trigger {
                        padding: 10px 14px;
                        max-width: 220px;
                        min-width: 180px;
                    }

                    .profile-name {
                        font-size: 13px;
                    }

                    .profile-role {
                        font-size: 11px;
                    }

                    .profile-menu {
                        min-width: 200px;
                        margin-bottom: 8px;
                    }

                    .menu-header {
                        padding: 16px;
                    }

                    .menu-name {
                        font-size: 15px;
                    }

                    .menu-email {
                        font-size: 12px;
                    }

                    .menu-item {
                        padding: 12px 16px;
                        font-size: 13px;
                    }
                }

                @media (max-width: 480px) {
                    .profile-widget {
                        bottom: 12px;
                        right: 12px;
                    }

                    .profile-trigger {
                        padding: 8px 12px;
                        max-width: 200px;
                        min-width: 160px;
                    }

                    .profile-info {
                        gap: 1px;
                    }

                    .profile-name {
                        font-size: 12px;
                    }

                    .profile-role {
                        font-size: 10px;
                    }
                }

                /* Loading Animation */
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

                /* High DPI Display Support */
                @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
                    .avatar-img {
                        image-rendering: -webkit-optimize-contrast;
                        image-rendering: crisp-edges;
                    }
                }

                /* Dark Mode Support (if needed) */
                @media (prefers-color-scheme: dark) {
                    .profile-trigger {
                        background: rgba(31, 41, 55, 0.95);
                        border-color: rgba(75, 85, 99, 0.5);
                    }

                    .profile-trigger:hover {
                        background: rgba(31, 41, 55, 0.98);
                        border-color: rgba(59, 130, 246, 0.5);
                    }

                    .profile-name {
                        color: #f9fafb;
                    }

                    .profile-role {
                        color: #d1d5db;
                    }

                    .profile-menu {
                        background: rgba(31, 41, 55, 0.98);
                        border-color: rgba(75, 85, 99, 0.5);
                    }

                    .menu-header {
                        background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
                    }

                    .menu-name {
                        color: #f9fafb;
                    }

                    .menu-email {
                        color: #d1d5db;
                    }

                    .menu-item {
                        color: #e5e7eb;
                    }

                    .menu-item:hover {
                        background: rgba(59, 130, 246, 0.15);
                        color: #f3f4f6;
                    }
                }

                /* Accessibility Enhancements */
                .profile-trigger:focus {
                    outline: 2px solid #3b82f6;
                    outline-offset: 2px;
                }

                .menu-item:focus {
                    outline: 2px solid #3b82f6;
                    outline-offset: -2px;
                }

                /* Animation Performance */
                .profile-trigger,
                .avatar-wrapper,
                .menu-item {
                    will-change: transform;
                }

                /* Z-index Management */
                .profile-widget {
                    z-index: 1000;
                }

                .profile-menu {
                    z-index: 1001;
                }

                /* Team Section Enhancements */
                .team-grid-simple {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 24px;
                    margin-top: 32px;
                }

                .team-card-simple {
                    background: white;
                    border-radius: 16px;
                    padding: 24px;
                    text-align: center;
                    border: 1px solid #e5e7eb;
                    transition: all 0.3s ease;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .team-card-simple:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    border-color: #3b82f6;
                }

                .team-photo-container {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    margin: 0 auto 16px;
                    border-radius: 50%;
                    overflow: hidden;
                }

                .team-avatar-placeholder {
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: 600;
                    color: white;
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
                }

                .photo-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(59, 130, 246, 0.1);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .team-card-simple:hover .photo-overlay {
                    opacity: 1;
                }

                .team-name-simple {
                    font-size: 18px;
                    font-weight: 600;
                    color: #111827;
                    margin: 0 0 8px 0;
                    line-height: 1.3;
                }

                .team-role-simple {
                    font-size: 14px;
                    color: #6b7280;
                    margin: 0;
                    line-height: 1.4;
                }

                /* Section Headers */
                .content-section {
                    margin-bottom: 80px;
                }

                .section-header {
                    display: flex;
                    justify-content: between;
                    align-items: flex-end;
                    margin-bottom: 32px;
                    gap: 24px;
                }

                .section-title-group {
                    flex: 1;
                }

                .section-title {
                    font-size: 32px;
                    font-weight: 700;
                    color: #111827;
                    margin: 0 0 8px 0;
                    line-height: 1.2;
                }

                .section-subtitle {
                    font-size: 16px;
                    color: #6b7280;
                    margin: 0;
                    line-height: 1.5;
                    max-width: 600px;
                }

                .section-actions {
                    flex-shrink: 0;
                }

                .section-count {
                    font-size: 14px;
                    color: #9ca3af;
                    font-weight: 500;
                    padding: 6px 12px;
                    background: #f3f4f6;
                    border-radius: 20px;
                }

                /* News Grid Enhancements */
                .news-grid.enhanced {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 24px;
                    margin-top: 32px;
                }

                .news-card {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid #e5e7eb;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .news-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    border-color: #3b82f6;
                }

                .news-card.large {
                    grid-column: span 2;
                }

                .news-card.featured {
                    border-color: #f59e0b;
                    box-shadow: 0 4px 6px rgba(245, 158, 11, 0.1);
                }

                .card-image {
                    position: relative;
                    height: 200px;
                    overflow: hidden;
                }

                .card-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.3s ease;
                }

                .news-card:hover .card-image img {
                    transform: scale(1.05);
                }

                .card-category {
                    position: absolute;
                    top: 12px;
                    left: 12px;
                    background: rgba(59, 130, 246, 0.9);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .featured-badge {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: rgba(245, 158, 11, 0.9);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .card-content {
                    padding: 20px;
                }

                .card-meta {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 12px;
                    font-size: 12px;
                    color: #9ca3af;
                }

                .card-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #111827;
                    margin: 0 0 12px 0;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .card-excerpt {
                    font-size: 14px;
                    color: #6b7280;
                    line-height: 1.5;
                    margin: 0 0 16px 0;
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .read-more {
                    color: #3b82f6;
                    font-size: 14px;
                    font-weight: 500;
                    transition: color 0.2s ease;
                }

                .news-card:hover .read-more {
                    color: #1d4ed8;
                }

                /* Events Grid */
                .events-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 24px;
                    margin-top: 32px;
                }

                .event-card {
                    background: white;
                    border-radius: 16px;
                    overflow: hidden;
                    border: 1px solid #e5e7eb;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                }

                .event-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
                    border-color: #10b981;
                }

                .event-date-badge {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    background: rgba(16, 185, 129, 0.9);
                    color: white;
                    padding: 8px;
                    border-radius: 8px;
                    text-align: center;
                    min-width: 50px;
                }

                .date-month {
                    display: block;
                    font-size: 10px;
                    font-weight: 500;
                    text-transform: uppercase;
                }

                .date-day {
                    display: block;
                    font-size: 16px;
                    font-weight: 700;
                    line-height: 1;
                }

                .event-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .event-category {
                    background: #f3f4f6;
                    color: #374151;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .event-price {
                    font-size: 12px;
                    color: #10b981;
                    font-weight: 600;
                }

                .event-info {
                    margin: 16px 0;
                }

                .info-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                    font-size: 14px;
                    color: #6b7280;
                }

                .info-icon {
                    font-size: 16px;
                    width: 20px;
                    text-align: center;
                }

                .progress-bar {
                    width: 100%;
                    height: 4px;
                    background: #e5e7eb;
                    border-radius: 2px;
                    overflow: hidden;
                    margin-top: 16px;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #10b981, #059669);
                    transition: width 0.3s ease;
                }

                /* Responsive adjustments for mobile */
                @media (max-width: 768px) {
                    .section-header {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 16px;
                    }

                    .section-title {
                        font-size: 28px;
                    }

                    .news-card.large {
                        grid-column: span 1;
                    }

                    .news-grid.enhanced,
                    .events-grid,
                    .team-grid-simple {
                        grid-template-columns: 1fr;
                        gap: 16px;
                    }

                    .team-photo-container {
                        width: 60px;
                        height: 60px;
                    }

                    .team-avatar-placeholder {
                        font-size: 20px;
                    }

                    .team-name-simple {
                        font-size: 16px;
                    }

                    .team-role-simple {
                        font-size: 13px;
                    }

                    .card-content {
                        padding: 16px;
                    }

                    .card-title {
                        font-size: 16px;
                    }

                    .card-excerpt {
                        font-size: 13px;
                    }
                }

                @media (max-width: 480px) {
                    .content-section {
                        margin-bottom: 60px;
                    }

                    .section-title {
                        font-size: 24px;
                    }

                    .section-subtitle {
                        font-size: 14px;
                    }

                    .card-image {
                        height: 160px;
                    }

                    .team-card-simple {
                        padding: 20px;
                    }
                }
            `}</style>
        </div>
    );
};

export default Home;
