import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8000';

export default function LoginPage({ onLogin, redirectTo = '/study-plan' }) {
  const [mode, setMode]       = useState('login');
  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const navigate              = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError('');
    if (!form.email || !form.password) { setError('Email and password are required.'); return; }
    if (mode === 'register' && !form.name) { setError('Please enter your name.'); return; }
    setLoading(true);
    try {
      let res;
      if (mode === 'register') {
        res = await axios.post(`${API}/register`,
          { name: form.name, email: form.email, password: form.password });
      } else {
        res = await axios.post(`${API}/login`,
          { email: form.email, password: form.password });
      }
      localStorage.setItem('edusense_token', res.data.token);
      localStorage.setItem('edusense_user', JSON.stringify(res.data.user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      if (onLogin) onLogin(res.data.user);
      navigate(redirectTo);
    } catch (e) {
      setError(e.response?.data?.detail || 'Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const inp = {
    width: '100%', padding: '11px 14px', borderRadius: 8,
    border: '1px solid #d6d3d1', background: 'white',
    color: '#1c1917', fontSize: 14, fontFamily: 'Outfit,sans-serif',
    outline: 'none', boxSizing: 'border-box', marginBottom: 14,
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f5f3ee',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Outfit,sans-serif', padding: 16,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Back link */}
        <button onClick={() => navigate('/dashboard')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#78716c', fontSize: 13, marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 6, padding: 0,
          fontFamily: 'inherit',
        }}>
          ← Back to Dashboard
        </button>

        {/* Card */}
        <div style={{
          background: 'white', borderRadius: 16,
          border: '1px solid #e7e5e4', padding: '36px 32px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📅</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1c1917', marginBottom: 4 }}>
              Study Planner
            </div>
            <div style={{ fontSize: 13, color: '#78716c', lineHeight: 1.5 }}>
              Sign in to keep your streak and tasks <br />
              <strong style={{ color: '#dc6b2f' }}>permanently saved</strong> — stored securely in the database
            </div>
          </div>

          {/* Benefits strip */}
          <div style={{
            background: '#fff9f5', border: '1px solid #fed7aa',
            borderRadius: 8, padding: '10px 14px', marginBottom: 24,
            fontSize: 12, color: '#c2410c',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                '🔥 Streak won\'t reset on page refresh',
                '⭐ XP and badges are always saved',
                '✅ Tasks permanently saved to the database',
                '📱 Access your plan from any device',
              ].map(b => <span key={b}>{b}</span>)}
            </div>
          </div>

          {/* Toggle */}
          <div style={{
            display: 'flex', background: '#f5f3ee',
            borderRadius: 8, padding: 4, marginBottom: 20,
          }}>
            {['login', 'register'].map(m => (
              <button key={m}
                onClick={() => { setMode(m); setError(''); setForm({ name: '', email: '', password: '' }); }}
                style={{
                  flex: 1, padding: '9px', border: 'none', cursor: 'pointer',
                  borderRadius: 6, fontFamily: 'Outfit,sans-serif', fontSize: 14, fontWeight: 600,
                  background: mode === m ? 'white' : 'transparent',
                  color: mode === m ? '#1c1917' : '#78716c',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s',
                }}>
                {m === 'login' ? '🔑 Sign In' : '✨ Register'}
              </button>
            ))}
          </div>

          {/* Name field (register only) */}
          {mode === 'register' && (
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#57534e', display: 'block', marginBottom: 5 }}>
                FULL NAME
              </label>
              <input style={inp} type="text" placeholder="Your full name"
                value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
          )}

          {/* Email */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#57534e', display: 'block', marginBottom: 5 }}>
              EMAIL
            </label>
            <input style={inp} type="email" placeholder="you@email.com"
              value={form.email} onChange={e => set('email', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#57534e', display: 'block', marginBottom: 5 }}>
              PASSWORD
            </label>
            <input style={inp} type="password" placeholder="••••••••"
              value={form.password} onChange={e => set('password', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          {/* Error message */}
          {error && (
            <div style={{
              background: '#fee2e2', color: '#b91c1c',
              border: '1px solid #fca5a5', borderRadius: 8,
              padding: '10px 14px', fontSize: 13, marginBottom: 14,
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} style={{
            width: '100%', padding: '13px', border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            borderRadius: 8,
            background: loading ? '#a8a29e' : 'linear-gradient(135deg,#dc6b2f,#b45309)',
            color: 'white', fontSize: 15, fontWeight: 700,
            fontFamily: 'Outfit,sans-serif', transition: 'opacity 0.2s',
          }}>
            {loading
              ? 'Please wait...'
              : mode === 'login'
                ? '🔑 Sign In → Study Planner'
                : '✨ Create Account → Study Planner'}
          </button>

          <div style={{ textAlign: 'center', marginTop: 14, fontSize: 12, color: '#a8a29e' }}>
            {mode === 'login'
              ? 'New here? Click Register above to create an account.'
              : 'Already have an account? Switch to Sign In above.'}
          </div>
        </div>

        {/* Guest note */}
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#a8a29e' }}>
          Other pages (Dashboard, Predict, Analytics) <br />
          are accessible without logging in.
        </div>
      </div>
    </div>
  );
}