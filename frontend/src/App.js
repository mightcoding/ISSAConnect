import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Profile from './components/Profile';
import CreateContent from './components/CreateContent';
import AdminPanel from './components/AdminPanel';
import NewsDetail from './components/NewsDetail';
import EventDetail from './components/EventDetail';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      setIsAuthenticated(!!token);
    };

    checkAuth();

    // Listen for storage changes
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/login"
            element={!isAuthenticated ? <Login /> : <Navigate to="/home" />}
          />
          <Route
            path="/register"
            element={!isAuthenticated ? <Register /> : <Navigate to="/home" />}
          />
          <Route
            path="/home"
            element={isAuthenticated ? <Home /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/create"
            element={isAuthenticated ? <CreateContent /> : <Navigate to="/login" />}
          />
          <Route
            path="/admin"
            element={isAuthenticated ? <AdminPanel /> : <Navigate to="/login" />}
          />
          <Route
            path="/news/:id"
            element={isAuthenticated ? <NewsDetail /> : <Navigate to="/login" />}
          />
          <Route
            path="/events/:id"
            element={isAuthenticated ? <EventDetail /> : <Navigate to="/login" />}
          />
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? "/home" : "/login"} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

