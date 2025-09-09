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

    const renderAvatar = useCallback((avatarUrl, name, initials) => (
        <div className="avatar-container">
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt={name}
                    className="avatar-image"
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

    const fetchUserAvatar = useCallback(async (userId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/content/admin/users/`, {
                headers: getAuthHeaders()
            });

            const userData = response.data.find(u => u.id === userId);
            setUserAvatar(userData?.avatar_url || null);
        } catch (error) {
            console.warn('Could not fetch avatar:', error);
            setUserAvatar(null);
        }
    }, [getAuthHeaders]);

    const fetchUserData = useCallback(async () => {
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

            const userData = response.data;
            setUser(userData);

            // Fetch user avatar if we have user ID
            if (userData.id) {
                await fetchUserAvatar(userData.id);
            }

            // Fetch content
            await fetchContent();
        } catch (error) {
            console.error('Profile fetch error:', error);
            localStorage.clear();
            navigate('/login');
        } finally {
            setLoading(false);
        }
    }, [navigate, fetchUserAvatar, fetchContent]);

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
        // Listen for content updates
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
    const userFullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();

    // Loading state
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading Issa Connect...</p>
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
                                <h1 className="brand-title">Issa Connect</h1>
                                <span className="brand-tagline">Professional Collaboration Platform</span>
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
                            Welcome to Issa Connect, {user?.first_name || user?.username}
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
                                            <div className="progress-bar">
                                                <div
                                                    className="progress-fill"
                                                    style={{
                                                        width: `${((event.registered || 0) / (event.capacity || 50)) * 100}%`
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* Team Section */}
                    <section id="team" className="content-section">
                        <div className="section-header">
                            <div className="section-title-group">
                                <h3 className="section-title">Meet Our Team</h3>
                                <p className="section-subtitle">The talented individuals behind Issa Connect's success</p>
                            </div>
                            <div className="section-actions">
                                <span className="section-count">{TEAM_MEMBERS.length} members</span>
                            </div>
                        </div>

                        <div className="team-grid-simple">
                            {TEAM_MEMBERS.map((member) => (
                                <div key={member.id} className="team-card-simple">
                                    <div className="team-photo-container">
                                        <div className="team-avatar-placeholder">
                                            {member.avatar}
                                        </div>
                                        <div className="photo-overlay"></div>
                                    </div>
                                    <div className="team-info-simple">
                                        <h4 className="team-name-simple">{member.name}</h4>
                                        <p className="team-role-simple">{member.role}</p>
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
                        {renderAvatar(userAvatar, userFullName, userInitials)}
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
                                {renderAvatar(userAvatar, userFullName, userInitials)}
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
        </div>
    );
};

export default Home;