import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const nav = [
  { to: '/dashboard',  icon: '📊', label: 'Overview' },
  { to: '/predict',    icon: '🔮', label: 'Predict Performance', badge: 'AI' },
  { to: '/analytics',  icon: '📈', label: 'Model Analytics' },
  { to: '/study-plan', icon: '📅', label: 'Study Planner', badge: 'NEW', needsLogin: true },
  { to: '/compare',    icon: '⚔️',  label: 'Compare Students', badge: 'NEW' },
  { to: '/whatif',     icon: '🔬', label: 'What-If Simulator', badge: 'NEW' },
];

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const doLogout = () => {
    setShowConfirm(false);
    if (onLogout) onLogout();
    navigate('/dashboard');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-name">EduSense</div>
        <div className="sidebar-brand-sub">Student Performance AI</div>
      </div>

      <div className="sidebar-section">Pages</div>
      {nav.map(item => (
        <NavLink key={item.to} to={item.to}
          className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}>
          <span className="sidebar-link-dot" />
          <span className="sidebar-link-icon">{item.icon}</span>
          <span style={{ flex: 1 }}>{item.label}</span>
          {item.needsLogin && !user
            ? <span style={{ fontSize: 10, color: '#78716c' }}>🔒</span>
            : item.badge
              ? <span className="sidebar-badge">{item.badge}</span>
              : null}
        </NavLink>
      ))}

      <div className="sidebar-section" style={{ marginTop: 24 }}>Project</div>
      {['Bake-Off Competition', 'Neha & Drashtee', 'CSH217C · ML'].map(i => (
        <div key={i} style={{ padding: '5px 10px', fontSize: 12, color: '#57534e' }}>{i}</div>
      ))}

      <div className="sidebar-footer">
        {user ? (
          <>
            {/* ✅ Confirm popup rendered ABOVE user card — never gets cut off */}
            {showConfirm && (
              <div style={{
                background: '#292524', borderRadius: 8,
                padding: '12px', marginBottom: 8,
                border: '1px solid #44403c',
              }}>
                <div style={{ fontSize: 12, color: '#d6d3d1', marginBottom: 10, lineHeight: 1.5 }}>
                  Are you sure you want to sign out?<br />
                  <span style={{ color: '#34d399' }}>✅ Your streak and data will stay saved.</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={doLogout}
                    style={{
                      flex: 1, padding: '7px 0', border: 'none',
                      borderRadius: 6, background: '#dc2626', color: 'white',
                      fontSize: 12, fontFamily: 'Outfit,sans-serif',
                      fontWeight: 700, cursor: 'pointer',
                    }}>
                    Yes, sign out
                  </button>
                  <button
                    onClick={() => setShowConfirm(false)}
                    style={{
                      flex: 1, padding: '7px 0',
                      border: '1px solid #44403c', borderRadius: 6,
                      background: 'transparent', color: '#a8a29e',
                      fontSize: 12, fontFamily: 'Outfit,sans-serif',
                      cursor: 'pointer',
                    }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* User info */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', marginBottom: 8,
              background: '#292524', borderRadius: 8,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: '#dc6b2f', color: 'white', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
              }}>
                {user.name ? user.name[0].toUpperCase() : '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13, color: '#e7e5e4', fontWeight: 600,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {user.name}
                </div>
                <div style={{
                  fontSize: 11, color: '#78716c',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {user.email}
                </div>
              </div>
            </div>

            <div className="sidebar-status">
              <div className="status-dot" />
              <span>Logged in · Data saved</span>
            </div>

            {/* Sign out button — only when confirm not open */}
            {!showConfirm && (
              <button
                onClick={() => setShowConfirm(true)}
                style={{
                  width: '100%', marginTop: 8, padding: '8px 12px',
                  background: 'transparent',
                  border: '1px solid #44403c',
                  borderRadius: 8, color: '#78716c',
                  fontSize: 12, fontFamily: 'Outfit,sans-serif',
                  cursor: 'pointer', textAlign: 'left',
                }}>
                🚪 Sign Out
              </button>
            )}
          </>
        ) : (
          <>
            <div className="sidebar-status">
              <div className="status-dot" />
              <span>Backend connected</span>
            </div>
            <button
              onClick={() => navigate('/study-plan')}
              style={{
                width: '100%', marginTop: 8, padding: '9px 12px',
                background: '#292524', border: 'none',
                borderRadius: 8, color: '#e7e5e4',
                fontSize: 12, fontFamily: 'Outfit,sans-serif',
                cursor: 'pointer', textAlign: 'left',
              }}>
              🔒 Login for Study Planner
            </button>
          </>
        )}

        <div style={{ padding: '6px 10px', fontSize: 11, color: '#57534e' }}>
          RF + XGBoost · 238 students
        </div>
      </div>
    </aside>
  );
}