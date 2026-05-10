import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import SplashScreen from './components/SplashScreen';
import Navbar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PredictPage from './pages/PredictPage';
import AnalyticsPage from './pages/AnalyticsPage';
import StudyPlanPage from './pages/StudyPlanPage';
import ComparePage from './pages/ComparePage';
import WhatIfPage from './pages/WhatIfPage';
import { AboutPage, ContactPage, SuggestionPage, HelpPage } from './pages/MiscPages';
import './App.css';

export default function App() {
  const [splash, setSplash] = useState(true);
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('edusense_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  useEffect(() => {
    const token = localStorage.getItem('edusense_token');
    if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSplash(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem('edusense_user', JSON.stringify(u));
  };

  const handleLogout = () => {
    localStorage.removeItem('edusense_token');
    localStorage.removeItem('edusense_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (splash) return <SplashScreen />;

  // Route Guards
  const isAdmin = user?.email?.toLowerCase() === 'drashteechauhan@gmail.com';
  const isStudent = user && !isAdmin;

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{ style: { fontFamily: 'Outfit,sans-serif', fontSize: 14, background: 'var(--bg-elevated)', color: 'var(--text)', border: '1px solid var(--border)' }, duration: 4000 }}
      />
      <div className="app-layout">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            {/* Common Route */}
            <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/login" />} />
            
            {/* Admin Only Route */}
            <Route path="/analytics" element={isAdmin ? <AnalyticsPage /> : <Navigate to="/dashboard" />} />
            
            {/* Student Routes */}
            <Route path="/predict" element={!isAdmin ? <PredictPage /> : <Navigate to="/dashboard" />} />
            <Route path="/compare" element={!isAdmin ? <ComparePage /> : <Navigate to="/dashboard" />} />
            <Route path="/whatif" element={!isAdmin ? <WhatIfPage /> : <Navigate to="/dashboard" />} />
            <Route path="/about" element={!isAdmin ? <AboutPage /> : <Navigate to="/dashboard" />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/suggestion" element={<SuggestionPage />} />
            <Route path="/help" element={<HelpPage />} />

            <Route path="/study-plan" element={
              user && !isAdmin
                ? <StudyPlanPage user={user} onLogout={handleLogout} />
                : !user ? <LoginPage onLogin={handleLogin} redirectTo="/study-plan" /> : <Navigate to="/dashboard" />
            } />

            {/* Login Route */}
            <Route path="/login" element={
              user
                ? <Navigate to="/dashboard" />
                : <LoginPage onLogin={handleLogin} redirectTo="/dashboard" />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}