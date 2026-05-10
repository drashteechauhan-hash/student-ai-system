import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';

const API = 'http://localhost:8000';

export default function LoginPage({ onLogin, redirectTo = '/dashboard' }) {
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
      let assignedRole = 'student';
      if (form.email.toLowerCase() === 'drashteechauhan@gmail.com' && form.password === 'drashtee098') {
        assignedRole = 'admin';
      }

      if (mode === 'register') {
        res = await axios.post(`${API}/register`,
          { name: form.name, email: form.email, password: form.password, role: assignedRole });
      } else {
        res = await axios.post(`${API}/login`,
          { email: form.email, password: form.password });
        // Enforce Admin role based on credentials
        if (form.email.toLowerCase() === 'drashteechauhan@gmail.com' && form.password === 'drashtee098') {
          res.data.user.role = 'admin';
        } else {
          // ensure legacy teachers are treated as students or their own role as needed, but for now we enforce student
          if (res.data.user.role === 'teacher') res.data.user.role = 'student';
        }
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
    width: '100%', padding: '14px 16px', borderRadius: '14px',
    border: '1px solid var(--border)', background: 'rgba(255,255,255,0.03)',
    color: 'var(--text)', fontSize: 15, fontFamily: 'Outfit,sans-serif',
    outline: 'none', boxSizing: 'border-box', marginBottom: 20,
    transition: 'all 0.3s ease',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#030305',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Outfit,sans-serif', padding: 16, position: 'relative', overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(155,109,255,0.12) 0%, transparent 60%)', filter: 'blur(80px)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(79,135,245,0.12) 0%, transparent 60%)', filter: 'blur(80px)', zIndex: 0 }} />

      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ width: '100%', maxWidth: 480, zIndex: 1 }}>
        {/* Card */}
        <div className="card" style={{ padding: '48px', background: 'rgba(20, 20, 28, 0.6)', backdropFilter: 'blur(30px)', border: '1px solid rgba(255, 255, 255, 0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }} style={{ fontSize: 56, marginBottom: 16 }}>🎓</motion.div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', marginBottom: 8, letterSpacing: '-0.5px' }}>
              Welcome to EduSense
            </div>
            <div style={{ fontSize: 16, color: 'var(--text2)' }}>
              Sign in to your AI-powered Dashboard
            </div>
          </div>

          {/* Toggle Login/Register */}
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '16px', padding: 6, marginBottom: 32, border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.2)' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setForm({ name: '', email: '', password: '' }); }} style={{ flex: 1, padding: '12px', border: 'none', cursor: 'pointer', borderRadius: '10px', fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 700, background: mode === m ? 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))' : 'transparent', color: mode === m ? 'var(--text)' : 'var(--text3)', boxShadow: mode === m ? '0 4px 10px rgba(0,0,0,0.3)' : 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                {m === 'login' ? '🔑 Sign In' : '✨ Register'}
              </button>
            ))}
          </div>

          {/* Name field (register only) */}
          {mode === 'register' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', display: 'block', marginBottom: 8, letterSpacing: '0.5px' }}>FULL NAME</label>
              <input style={inp} type="text" placeholder="Your full name" value={form.name} onChange={e => set('name', e.target.value)} />
            </motion.div>
          )}

          {/* Email */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', display: 'block', marginBottom: 8, letterSpacing: '0.5px' }}>EMAIL</label>
            <input style={inp} type="email" placeholder="you@email.com" value={form.email} onChange={e => set('email', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text2)', display: 'block', marginBottom: 8, letterSpacing: '0.5px' }}>PASSWORD</label>
            <input style={inp} type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
          </div>

          {/* Error message */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: '14px 16px', fontSize: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>⚠️</span> {error}
            </motion.div>
          )}

          {/* Submit */}
          <button onClick={handleSubmit} disabled={loading} className="btn btn-primary btn-full" style={{ padding: '16px', fontSize: 16, fontWeight: 700, borderRadius: '14px', marginTop: 10, background: 'linear-gradient(135deg, var(--accent) 0%, var(--blue) 100%)', boxShadow: '0 8px 20px rgba(139, 92, 246, 0.4)' }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}