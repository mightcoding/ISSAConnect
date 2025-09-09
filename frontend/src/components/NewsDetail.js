import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config.js';

const NewsDetail = () => {
    // Route parameters and navigation
    const { id } = useParams();
    const navigate = useNavigate();

    // State management
    const [article, setArticle] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [editForm, setEditForm] = useState({
        title: '',
        content: '',
        category: '',
        image: ''
    });

    // Mock data - moved to top level for better organization
    const MOCK_NEWS = [
        {
            id: 1,
            title: "Issa Connect Platform Launch: Revolutionizing Digital Collaboration",
            content: `We're thrilled to announce the official launch of Issa Connect, a cutting-edge platform designed to streamline communication and enhance productivity across organizations. Our platform integrates advanced features including real-time messaging, project management tools, and comprehensive analytics to help teams work more efficiently than ever before.

## Key Features

**Real-time Collaboration**
Our platform enables seamless real-time collaboration with instant messaging, video conferencing, and shared workspaces. Teams can communicate effortlessly regardless of their geographical location.

**Advanced Analytics**
Get insights into team productivity, project progress, and communication patterns with our comprehensive analytics dashboard. Make data-driven decisions to optimize your workflow.

**Security First**
We've implemented enterprise-grade security measures including end-to-end encryption, multi-factor authentication, and regular security audits to ensure your data remains protected.

## What's Next?

Over the coming months, we'll be rolling out additional features including:
- AI-powered task automation
- Advanced integrations with popular tools
- Mobile applications for iOS and Android
- Enhanced customization options

We're excited to embark on this journey with you and look forward to transforming how teams collaborate in the digital age.`,
            author_name: "Sarah Johnson",
            author_role: "Product Manager",
            author_avatar: null,
            image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=600&fit=crop",
            category: "Product Launch",
            read_time: "5 min read",
            created_at: "2024-01-20T10:00:00Z",
            views: 1247,
            tags: ["Platform", "Launch", "Collaboration", "Technology"],
            excerpt: "Announcing the launch of our revolutionary digital collaboration platform with advanced features for modern teams.",
            featured: true
        },
        {
            id: 2,
            title: "Advanced Security Features: Protecting Your Data in the Digital Age",
            content: `Security is at the heart of everything we do at Issa Connect. Today, we're introducing enhanced security protocols including end-to-end encryption, multi-factor authentication, and advanced threat detection systems. These features ensure that your sensitive data remains protected while maintaining seamless user experience.

## Enhanced Security Measures

**End-to-End Encryption**
All communications within Issa Connect are now protected by military-grade end-to-end encryption. Your messages, files, and video calls remain completely private and secure.

**Multi-Factor Authentication**
We've implemented robust multi-factor authentication options including SMS verification, authenticator apps, and hardware security keys to ensure only authorized users can access your account.

**Advanced Threat Detection**
Our AI-powered security system continuously monitors for suspicious activities and potential threats, providing real-time protection against cyber attacks.

## Compliance & Standards

We maintain compliance with industry standards including:
- SOC 2 Type II certification
- GDPR compliance for European users
- HIPAA compliance for healthcare organizations
- ISO 27001 security management standards

## What This Means for You

With these enhanced security features, you can:
- Share sensitive information with confidence
- Collaborate on confidential projects securely
- Meet your organization's compliance requirements
- Focus on productivity without security concerns

Your trust is our priority, and these security enhancements demonstrate our commitment to protecting your valuable data.`,
            author_name: "Michael Chen",
            author_role: "Security Engineer",
            author_avatar: null,
            image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=600&fit=crop",
            category: "Security",
            read_time: "7 min read",
            created_at: "2024-01-18T14:30:00Z",
            views: 892,
            tags: ["Security", "Privacy", "Encryption", "Compliance"],
            excerpt: "Introducing comprehensive security enhancements to protect your valuable data and communications with enterprise-grade protection.",
            featured: false
        },
        {
            id: 3,
            title: "Q1 Performance Analytics: Record Growth and User Engagement",
            content: `We're excited to share our Q1 performance metrics, which show unprecedented growth in user engagement and platform adoption. With over 50,000 active users and a 300% increase in daily interactions, Issa Connect is rapidly becoming the preferred choice for modern organizations seeking efficient collaboration solutions.

## Key Metrics

**User Growth**
- 50,000+ active monthly users (up 250% from Q4)
- 15,000 new user registrations in Q1
- 89% user retention rate
- 4.8/5 average user satisfaction score

**Platform Usage**
- 1.2M+ messages sent daily
- 45,000+ video meetings conducted
- 300% increase in file sharing
- 92% uptime across all services

**Feature Adoption**
- 78% of users actively use collaboration tools
- 65% adoption rate for new analytics dashboard
- 156% increase in automation workflows
- 234% growth in third-party integrations

## What's Driving This Growth?

Several factors have contributed to our exceptional Q1 performance:

**Enhanced User Experience**
Our focus on intuitive design and seamless workflows has resulted in higher user satisfaction and increased daily engagement.

**Powerful Integrations**
New integrations with popular productivity tools have made Issa Connect the central hub for team collaboration.

**Reliable Performance**
Our infrastructure investments have delivered 99.2% uptime and faster response times across all features.

## Looking Ahead

Based on these positive trends, we're projecting:
- 100,000 active users by end of Q2
- Launch of mobile applications
- Expansion into international markets
- Introduction of AI-powered features

Thank you for being part of our growing community!`,
            author_name: "Emma Davis",
            author_role: "Analytics Director",
            author_avatar: null,
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=600&fit=crop",
            category: "Analytics",
            read_time: "4 min read",
            created_at: "2024-01-15T09:15:00Z",
            views: 634,
            tags: ["Analytics", "Growth", "Performance", "Metrics"],
            excerpt: "Sharing our impressive Q1 metrics showing record growth and exceptional user engagement across all platforms.",
            featured: false
        }
    ];

    // Helper function to get auth headers
    const getAuthHeaders = useCallback(() => {
        const token = localStorage.getItem('access_token');
        return { 'Authorization': `Bearer ${token}` };
    }, []);

    // Fetch article from API or fallback to mock data
    const fetchArticle = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/content/news/${id}/`, {
                headers: getAuthHeaders()
            });

            const articleData = response.data;
            setArticle(articleData);
            setEditForm({
                title: articleData.title,
                content: articleData.content,
                category: articleData.category || 'General',
                image: articleData.image || ''
            });
        } catch (error) {
            console.warn('API fetch failed, using mock data:', error);

            // Fallback to mock data
            const foundArticle = MOCK_NEWS.find(article => article.id === parseInt(id));

            if (foundArticle) {
                setArticle(foundArticle);
                setEditForm({
                    title: foundArticle.title,
                    content: foundArticle.content,
                    category: foundArticle.category,
                    image: foundArticle.image
                });
            } else {
                setArticle(null);
            }
        }
    }, [id, getAuthHeaders]);

    // Fetch user profile
    const fetchUserProfile = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/auth/profile/`, {
                headers: getAuthHeaders()
            });

            const userData = response.data;
            setUser(userData);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            navigate('/login');
        }
    }, [getAuthHeaders, navigate]);

    // Main data fetching effect
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);

            try {
                await Promise.all([
                    fetchUserProfile(),
                    fetchArticle()
                ]);
            } catch (error) {
                console.error('Error fetching data:', error);
                navigate('/home');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [fetchUserProfile, fetchArticle, navigate]);

    // Event handlers
    const handleEdit = useCallback(() => {
        setEditing(true);
    }, []);

    const handleSave = useCallback(async () => {
        try {
            const response = await axios.put(
                `${API_BASE_URL}/api/content/news/${id}/`,
                editForm,
                {
                    headers: {
                        ...getAuthHeaders(),
                        'Content-Type': 'application/json'
                    }
                }
            );

            setArticle(response.data);
            setEditing(false);
            window.dispatchEvent(new Event('contentUpdated'));
        } catch (error) {
            console.error('Error updating article:', error);
            alert('Failed to update article. Please try again.');
        }
    }, [id, editForm, getAuthHeaders]);

    const handleDelete = useCallback(async () => {
        const confirmed = window.confirm('Are you sure you want to delete this article?');
        if (!confirmed) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/content/news/${id}/`, {
                headers: getAuthHeaders()
            });

            window.dispatchEvent(new Event('contentUpdated'));
            navigate('/home');
        } catch (error) {
            console.error('Error deleting article:', error);
            alert('Failed to delete article. Please try again.');
        }
    }, [id, getAuthHeaders, navigate]);

    const handleLogout = useCallback(() => {
        localStorage.clear();
        navigate('/login');
    }, [navigate]);

    const handleFormChange = useCallback((field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    }, []);

    // Utility functions
    const formatPublishDate = useCallback((dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }, []);

    const getInitials = useCallback((name) => {
        if (!name || typeof name !== 'string') return 'AU';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }, []);

    const renderAvatar = useCallback((avatarUrl, name, fallbackInitials, size = 'default') => (
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
                className="avatar-initials"
                style={{ display: avatarUrl ? 'none' : 'flex' }}
            >
                {fallbackInitials}
            </div>
        </div>
    ), []);

    const renderContentParagraph = useCallback((paragraph, index) => {
        if (paragraph.startsWith('## ')) {
            return <h2 key={index} className="content-heading">{paragraph.replace('## ', '')}</h2>;
        }
        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
            return <h3 key={index} className="content-subheading">{paragraph.replace(/\*\*/g, '')}</h3>;
        }
        return <p key={index} className="content-paragraph">{paragraph}</p>;
    }, []);

    // Permission checks
    const canEdit = user?.is_staff || user?.can_create_content;
    const canCreateContent = user?.is_staff || user?.can_create_content;
    const isAdmin = user?.is_superuser || user?.is_staff;

    // Loading state
    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading article...</p>
            </div>
        );
    }

    // Article not found state
    if (!article) {
        return (
            <div className="error-container">
                <h2>Article not found</h2>
                <button onClick={() => navigate('/home')} className="back-btn">
                    Return to Home
                </button>
            </div>
        );
    }

    return (
        <div className="news-detail-page">
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
                                onClick={() => navigate('/home#news')}
                            >
                                News
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
                    <button onClick={() => navigate('/home#news')} className="back-btn">
                        ← Back to News
                    </button>

                    {canEdit && (
                        <div className="header-actions">
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
            </header>

            {/* Article Content */}
            <main className="article-main">
                <div className="article-container">
                    <div className="article-content-wrapper">
                        {/* Article Header */}
                        <div className="article-header">
                            <div className="article-meta">
                                <div className="meta-left">
                                    <span className="article-category">{article.category}</span>
                                    {article.featured && <span className="featured-badge">Featured</span>}
                                </div>
                                <div className="meta-right">
                                    <span className="article-views">{article.views?.toLocaleString() || 0} views</span>
                                </div>
                            </div>

                            {editing ? (
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => handleFormChange('title', e.target.value)}
                                    className="edit-title-input"
                                    placeholder="Article title"
                                />
                            ) : (
                                <h1 className="article-title">{article.title}</h1>
                            )}

                            {/* Article Summary */}
                            {article.excerpt && !editing && (
                                <div className="article-summary">
                                    <p className="summary-text">{article.excerpt}</p>
                                </div>
                            )}

                            {/* Article Stats */}
                            <div className="article-stats">
                                <div className="stat-item">
                                    <span className="stat-icon">📅</span>
                                    <span className="stat-text">Published {formatPublishDate(article.created_at)}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-icon">⏱️</span>
                                    <span className="stat-text">{article.read_time}</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-icon">👀</span>
                                    <span className="stat-text">{article.views?.toLocaleString() || 0} views</span>
                                </div>
                            </div>

                            {/* Author Section */}
                            <div className="article-author">
                                {renderAvatar(
                                    article.author_avatar,
                                    article.author_name || 'Unknown Author',
                                    getInitials(article.author_name),
                                    'medium'
                                )}
                                <div className="author-info">
                                    <div className="author-details">
                                        <span className="author-name">{article.author_name || 'Unknown Author'}</span>
                                        <span className="author-role">{article.author_role || 'Member'}</span>
                                    </div>
                                    <div className="author-meta">
                                        <span className="publish-date">
                                            Published on {new Date(article.created_at).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Article Image */}
                        {(article.image || editForm.image) && (
                            <div className="article-image">
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
                                    <img src={article.image} alt={article.title} />
                                )}
                            </div>
                        )}

                        {/* Article Content */}
                        <div className="article-content">
                            {editing ? (
                                <div className="edit-form">
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <select
                                            value={editForm.category}
                                            onChange={(e) => handleFormChange('category', e.target.value)}
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
                                    <div className="form-group">
                                        <label className="form-label">Content</label>
                                        <textarea
                                            value={editForm.content}
                                            onChange={(e) => handleFormChange('content', e.target.value)}
                                            className="edit-content-textarea"
                                            rows="20"
                                            placeholder="Article content..."
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="content-body">
                                    {article.content.split('\n\n').map(renderContentParagraph)}
                                </div>
                            )}
                        </div>

                        {/* Article Tags */}
                        {article.tags && article.tags.length > 0 && (
                            <div className="article-tags">
                                <h4>Related Topics</h4>
                                <div className="tags-list">
                                    {article.tags.map((tag, index) => (
                                        <span key={index} className="tag">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Profile Widget */}
            <div className="profile-widget">
                <div
                    className="profile-trigger"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                    {renderAvatar(
                        user?.avatar_url,
                        `${user?.first_name} ${user?.last_name}`,
                        `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`,
                        'small'
                    )}
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
                            {renderAvatar(
                                user?.avatar_url,
                                `${user?.first_name} ${user?.last_name}`,
                                `${user?.first_name?.charAt(0) || ''}${user?.last_name?.charAt(0) || ''}`,
                                'small'
                            )}
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

            <style jsx>{`
                /* Avatar Styles */

                .article-author .avatar-wrapper {
    transform: translateX(30px);
}
                .avatar-wrapper {
                    position: relative;
                    border-radius: 50%;
                    overflow: hidden;
                    background: #f3f4f6;
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

                .avatar-wrapper.medium {
                    width: 48px;
                    height: 48px;
                }

                .avatar-wrapper.default {
                    width: 56px;
                    height: 56px;
                }

                .avatar-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                }

                .avatar-initials {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 600;
                    color: #6b7280;
                    background: #f9fafb;
                }

                .avatar-wrapper.small .avatar-initials {
                    font-size: 14px;
                }

                .avatar-wrapper.medium .avatar-initials {
                    font-size: 16px;
                }

                .avatar-wrapper.default .avatar-initials {
                    font-size: 18px;
                }

                /* Article Author Section */
                .article-author {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 24px 0;
                    border-top: 1px solid #e5e7eb;
                    border-bottom: 1px solid #e5e7eb;
                    margin: 32px 0;
                }

                .author-info {
                    flex: 1;
                    min-width: 0;
                }

                .author-details {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .author-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: #111827;
                    line-height: 1.4;
                }

                .author-role {
                    font-size: 14px;
                    color: #6b7280;
                    line-height: 1.4;
                }

                .author-meta {
                    margin-top: 8px;
                }

                .publish-date {
                    font-size: 13px;
                    color: #9ca3af;
                    line-height: 1.4;
                }

                /* Profile Widget Styles */
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
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    transition: all 0.2s ease;
                    max-width: 250px;
                }

                .profile-trigger:hover {
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    transform: translateY(-1px);
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
                    line-height: 1.2;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .profile-role {
                    font-size: 12px;
                    color: #6b7280;
                    line-height: 1.2;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .profile-arrow {
                    flex-shrink: 0;
                }

                .arrow {
                    display: inline-block;
                    transition: transform 0.2s ease;
                    font-size: 16px;
                    color: #9ca3af;
                }

                .arrow.up {
                    transform: rotate(-90deg);
                }

                .arrow.down {
                    transform: rotate(90deg);
                }

                /* Profile Menu */
                .profile-menu {
                    position: absolute;
                    bottom: 100%;
                    right: 0;
                    margin-bottom: 8px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    min-width: 200px;
                    overflow: hidden;
                }

                .menu-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: #f9fafb;
                }

                .menu-info {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .menu-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #111827;
                    line-height: 1.2;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .menu-email {
                    font-size: 12px;
                    color: #6b7280;
                    line-height: 1.2;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .menu-divider {
                    height: 1px;
                    background: #e5e7eb;
                }

                .menu-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    padding: 12px 16px;
                    background: none;
                    border: none;
                    text-align: left;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    font-size: 14px;
                    color: #374151;
                }

                .menu-item:hover {
                    background: #f9fafb;
                }

                .menu-item.logout-item {
                    color: #dc2626;
                }

                .menu-item.logout-item:hover {
                    background: #fef2f2;
                }

                .menu-icon {
                    font-size: 16px;
                    width: 20px;
                    text-align: center;
                }

                /* Responsive adjustments */
                @media (max-width: 768px) {
                    .profile-widget {
                        bottom: 16px;
                        right: 16px;
                    }

                    .profile-trigger {
                        padding: 10px 12px;
                        max-width: 200px;
                    }

                    .profile-name {
                        font-size: 13px;
                    }

                    .profile-role {
                        font-size: 11px;
                    }

                    .article-author {
                        gap: 12px;
                        padding: 20px 0;
                        margin: 24px 0;
                    }

                    .author-name {
                        font-size: 15px;
                    }

                    .author-role {
                        font-size: 13px;
                    }

                    .publish-date {
                        font-size: 12px;
                    }
                }

                /* Z-index management */
                .profile-widget {
                    z-index: 1000;
                }

                .profile-menu {
                    z-index: 1001;
                }
            `}</style>
        </div>
    );
};

export default NewsDetail;