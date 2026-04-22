import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import SplashScreen from './components/SplashScreen';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import PredictPage from './pages/PredictPage';
import AnalyticsPage from './pages/AnalyticsPage';
import StudyPlanPage from './pages/StudyPlanPage';
import ComparePage from './pages/ComparePage';
import WhatIfPage from './pages/WhatIfPage';
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

  // ✅ Fixed: key name matches 'edusense_token', not 'token'
  // ✅ Fixed: removed floating <StudyPlanPage /> that was outside return
  const handleLogout = () => {
    localStorage.removeItem('edusense_token');
    localStorage.removeItem('edusense_user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (splash) return <SplashScreen />;

  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{ style: { fontFamily: 'Outfit,sans-serif', fontSize: 14 }, duration: 4000 }}
      />
      <div className="app-layout">
        <Sidebar user={user} onLogout={handleLogout} />
        <main className="main-content">
          <Routes>
            <Route path="/"          element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/predict"   element={<PredictPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/compare"   element={<ComparePage />} />
            <Route path="/whatif"    element={<WhatIfPage />} />

            {/* Study Planner — login required */}
            <Route path="/study-plan" element={
              user
                ? <StudyPlanPage user={user} onLogout={handleLogout} />
                : <LoginPage onLogin={handleLogin} redirectTo="/study-plan" />
            } />

            {/* Login route (direct URL access) */}
            <Route path="/login" element={
              user
                ? <Navigate to="/study-plan" />
                : <LoginPage onLogin={handleLogin} redirectTo="/study-plan" />
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}