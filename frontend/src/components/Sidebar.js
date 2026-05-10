import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const adminNav = [
  { to: '/dashboard',  icon: '📊', label: 'Overview' },
  { to: '/analytics',  icon: '📈', label: 'Analytics' },
  { to: '/predict',    icon: '🔮', label: 'Predict', badge: 'AI' },
  { to: '/study-plan', icon: '📅', label: 'Study Planner' },
  { to: '/whatif',     icon: '🔬', label: 'Simulator' },
  { to: '/compare',    icon: '⚔️',  label: 'Compare' },
  { to: '/about',      icon: 'ℹ️',  label: 'About' },
];

const studentNav = [
  { to: '/dashboard',  icon: '🎓', label: 'My Dashboard' },
  { to: '/study-plan', icon: '📅', label: 'Study Planner' },
  { to: '/whatif',     icon: '🔬', label: 'Simulator' },
  { to: '/compare',    icon: '⚔️',  label: 'Compare' },
  { to: '/predict',    icon: '🔮', label: 'Predict', badge: 'AI' },
  { to: '/about',      icon: 'ℹ️',  label: 'About' },
];

const guestNav = [
  { to: '/dashboard', icon: '📊', label: 'Home' },
  { to: '/about',     icon: 'ℹ️', label: 'About' },
];

const moreLinks = [
  { to: '/contact',    icon: '📞', label: 'Contact Us' },
  { to: '/suggestion', icon: '💡', label: 'Suggestions' },
  { to: '/help',       icon: '❓', label: 'Help & Support' },
];

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const avatarRef = useRef(null);

  const isAdmin = user?.email?.toLowerCase() === 'drashteechauhan@gmail.com';
  const currentNav = !user ? guestNav : isAdmin ? adminNav : studentNav;

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setShowLogout(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doLogout = () => {
    setShowLogout(false);
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="navbar-brand">
        <div className="navbar-brand-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <span className="navbar-brand-name">EduSense</span>
      </NavLink>

      <div className="navbar-links">
        {currentNav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && <span className="navbar-badge">{item.badge}</span>}
          </NavLink>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div ref={avatarRef} style={{ position: 'relative' }}>
          {user ? (
            <>
              <button className="navbar-user" onClick={() => setShowLogout(o => !o)}>
                <div className="navbar-user-avatar" style={{ background: isAdmin ? 'linear-gradient(135deg, #6366f1, #ec4899)' : 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}>
                  {user.name ? user.name[0].toUpperCase() : '?'}
                </div>
                <span className="navbar-user-name">{user.name?.split(' ')[0]}</span>
                {isAdmin && <span className="admin-chip">ADMIN</span>}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: 'var(--text3)', flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <AnimatePresence>
                {showLogout && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className="dropdown-panel"
                    style={{ right: 0, top: 'calc(100% + 12px)', width: 260 }}
                  >
                    <div style={{ padding: '4px 0 14px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 600 }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{user.email}</div>
                      <div style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600, marginTop: 6 }}>✅ Your progress is saved</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, paddingTop: 14 }}>
                      <button onClick={doLogout} className="logout-btn">Sign out</button>
                      <button onClick={() => setShowLogout(false)} className="cancel-btn">Cancel</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
              🔒 Login
            </button>
          )}
        </div>

        <div ref={menuRef} style={{ position: 'relative' }}>
          <button onClick={() => setMenuOpen(o => !o)} className="hamburger-btn" aria-label="More options">
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
            <span className={`ham-line ${menuOpen ? 'open' : ''}`} />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="dropdown-panel"
                style={{ right: 0, top: 'calc(100% + 12px)', minWidth: 200 }}
              >
                <div className="dropdown-header">More pages</div>
                {moreLinks.map(item => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) => `dropdown-item ${isActive ? 'active' : ''}`}
                  >
                    <span className="dropdown-item-icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}