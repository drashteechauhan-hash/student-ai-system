import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import StudyPlanGenerator from '../components/StudyPlanGenerator';

const API = 'http://localhost:8000';

function SignOutBtn({ onLogout }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        localStorage.removeItem('edusense_token');
        localStorage.removeItem('edusense_user');
        delete axios.defaults.headers.common['Authorization'];
        if (onLogout) onLogout();
      }}
      style={{
        padding: '10px 20px', border: '1px solid var(--border2)',
        borderRadius: '10px', background: 'rgba(255,255,255,0.05)', cursor: 'pointer',
        fontSize: 14, color: 'var(--text2)', fontFamily: 'var(--font)', fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(8px)',
        transition: 'var(--transition)'
      }}>
      🚪 Sign Out
    </motion.button>
  );
}

export default function StudyPlanPage({ user, onLogout }) {
  const [status, setStatus]     = useState('loading');
  const [savedPlan, setSavedPlan] = useState(null);
  const [showNew, setShowNew]   = useState(false);
  const [resuming, setResuming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    axios.get(`${API}/my-plan`)
      .then(r => {
        if (r.data.has_plan) {
          setSavedPlan(r.data);
          setStatus('has_plan');
        } else {
          setStatus('no_plan');
        }
      })
      .catch(() => setStatus('no_plan'));
  }, [user]);

  const handleDeleteAndNew = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API}/delete-plan`);
    } catch (e) { console.log('delete error', e); }
    setSavedPlan(null);
    setStatus('no_plan');
    setShowNew(false);
    setResuming(false);
    setDeleting(false);
  };

  const handlePlanGenerated = (profile, planSummary) => {
    axios.post(`${API}/save-plan`, { profile, plan_summary: planSummary })
      .catch(e => console.log('save plan error', e));
    setSavedPlan({ profile, plan_summary: planSummary, created_at: new Date().toISOString() });
    setStatus('has_plan');
    setShowNew(false);
    setResuming(false);
  };

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

  if (status === 'loading') {
    return (
      <div className="fade-in">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">📅 AI Study Planner</h1>
            <p className="page-subtitle">Loading your saved plan...</p>
          </div>
          <SignOutBtn onLogout={onLogout} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 16, color: 'var(--text2)' }}>
          <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3, borderTopColor: 'var(--accent)' }} />
          <span style={{ fontSize: 16, fontWeight: 500 }}>Fetching your plan from database...</span>
        </div>
      </div>
    );
  }

  if (resuming && savedPlan) {
    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="fade-in">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">📅 AI Study Planner</h1>
            <p className="page-subtitle">Resuming your saved plan</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setResuming(false)}
              className="btn btn-outline"
              style={{ padding: '10px 20px' }}>
              ← Back to summary
            </button>
            <SignOutBtn onLogout={onLogout} />
          </div>
        </div>
        <StudyPlanGenerator initialProfile={savedPlan.profile} autoStart={true} onPlanGenerated={handlePlanGenerated} user={user} />
      </motion.div>
    );
  }

  if (status === 'has_plan' && savedPlan && !showNew) {
    const createdDate = savedPlan.created_at ? new Date(savedPlan.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Recently';
    const profile = savedPlan.profile || {};
    const summary = savedPlan.plan_summary || {};

    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="fade-in">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">📅 AI Study Planner</h1>
            <p className="page-subtitle">Hey {user?.name?.split(' ')[0] || 'there'} 👋 — your saved plan is ready!</p>
          </div>
          <SignOutBtn onLogout={onLogout} />
        </div>

        <motion.div variants={itemVariants} style={{ background: 'var(--bg-card)', backdropFilter: 'blur(20px)', border: '1px solid var(--border)', borderRadius: '24px', padding: '40px', boxShadow: 'var(--shadow)', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, boxShadow: '0 8px 24px var(--accent-glow)' }}>📅</div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Your Study Plan</div>
                <div style={{ fontSize: 13, color: 'var(--text3)' }}>Generated on {createdDate}</div>
              </div>
            </div>
            <span style={{ fontSize: 13, padding: '6px 16px', borderRadius: 999, background: 'rgba(16,185,129,0.15)', color: 'var(--green)', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 700 }}>✅ Active Plan</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32, position: 'relative', zIndex: 1 }}>
            {[
              { icon: '🎯', label: 'Target Score', value: summary.targetScore ? `${summary.targetScore}%` : `${profile.target_score || 80}%`, color: 'var(--accent)' },
              { icon: '📚', label: 'Study/Day', value: summary.recommended_hrs ? `${summary.recommended_hrs}h` : `${profile.study_hrs || 3}h`, color: 'var(--blue)' },
              { icon: '📅', label: 'Duration', value: summary.totalDays ? `${summary.totalDays} days` : '28 days', color: 'var(--green)' },
              { icon: '⚠️', label: 'Weak Areas', value: summary.weakAreasCount != null ? `${summary.weakAreasCount} found` : 'Identified', color: 'var(--yellow)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg-elevated)', borderRadius: '16px', padding: '20px 16px', border: '1px solid var(--border2)', textAlign: 'center', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{s.icon}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color, marginBottom: 4, textShadow: `0 0 20px ${s.color}40` }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'var(--text3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 32, padding: '20px', background: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid var(--border)', position: 'relative', zIndex: 1 }}>
            {[
              ['Stream', profile.stream || 'Engineering'],
              ['Previous Score', `${profile.prev_score || 65}%`],
              ['Attendance', `${profile.attendance || 75}%`],
              ['Study Time', profile.study_time || 'Night'],
              ['Exam in', `${profile.exam_days || 28} days`],
            ].map(([label, value], i, arr) => (
              <React.Fragment key={label}>
                <span style={{ fontSize: 14, color: 'var(--text2)' }}><b style={{color:'var(--text)'}}>{label}:</b> {value}</span>
                {i < arr.length - 1 && <span style={{ color: 'var(--border2)' }}>|</span>}
              </React.Fragment>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 16, position: 'relative', zIndex: 1 }}>
            <button onClick={() => setResuming(true)} className="btn btn-primary" style={{ flex: 1, padding: '16px', fontSize: 16, boxShadow: '0 8px 30px var(--accent-glow)' }}>
              🚀 Continue My Plan →
            </button>
            <button onClick={() => setShowNew('new')} className="btn btn-outline" style={{ padding: '16px 24px', fontSize: 15 }}>
              ✨ Make New Plan
            </button>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} style={{ padding: '16px 24px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '16px', fontSize: 14, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{fontSize: 20}}>💡</span>
          <span><b>Making a new plan</b> will delete your current plan and tasks. Your streak and XP will stay safe.</span>
        </motion.div>
      </motion.div>
    );
  }

  if (showNew === 'new') {
    return (
      <div className="fade-in">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">📅 AI Study Planner</h1>
            <p className="page-subtitle">Create a new plan?</p>
          </div>
          <SignOutBtn onLogout={onLogout} />
        </div>

        <motion.div initial={{scale:0.9,opacity:0}} animate={{scale:1,opacity:1}} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-glow)', borderRadius: '24px', padding: '48px', maxWidth: 540, margin: '40px auto', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: 'var(--red)' }} />
          <div style={{ fontSize: 64, marginBottom: 24, filter: 'drop-shadow(0 0 20px rgba(239,68,68,0.4))' }}>⚠️</div>
          <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, color: 'var(--text)' }}>Your current plan will be deleted</div>
          <div style={{ fontSize: 15, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 40 }}>
            Creating a new plan will permanently delete your <b>current plan and tasks</b>.<br />
            <span style={{ color: 'var(--green)', fontWeight: 600, display: 'inline-block', marginTop: 12, padding: '6px 12px', background: 'rgba(16,185,129,0.1)', borderRadius: 8 }}>✅ Your streak, XP and badges will stay safe.</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <button onClick={() => setShowNew(false)} className="btn btn-outline" style={{ flex: 1 }}>← Go back</button>
            <button onClick={handleDeleteAndNew} disabled={deleting} className="btn" style={{ flex: 1, background: deleting ? 'var(--text3)' : 'var(--red)', color: 'white' }}>
              {deleting ? 'Deleting...' : '🗑️ Yes, delete & create new'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="fade-in">
      <motion.div variants={itemVariants} className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">📅 AI Study Planner</h1>
          <p className="page-subtitle">Generate your personalized plan — tasks will be saved securely</p>
        </div>
        <SignOutBtn onLogout={onLogout} />
      </motion.div>
      <motion.div variants={itemVariants}>
        <StudyPlanGenerator initialProfile={null} autoStart={false} onPlanGenerated={handlePlanGenerated} user={user} />
      </motion.div>
    </motion.div>
  );
}