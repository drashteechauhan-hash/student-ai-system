import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StudyPlanGenerator from '../components/StudyPlanGenerator';

const API = 'http://localhost:8000';

// ── Reusable Sign Out button ──────────────────────────────────────────────────
function SignOutBtn({ onLogout }) {
  return (
    <button
      onClick={() => {
        localStorage.removeItem('edusense_token');
        localStorage.removeItem('edusense_user');
        delete axios.defaults.headers.common['Authorization'];
        if (onLogout) onLogout();
      }}
      style={{
        padding: '8px 16px', border: '1px solid var(--border2)',
        borderRadius: 8, background: 'white', cursor: 'pointer',
        fontSize: 13, color: 'var(--text2)', fontFamily: 'Outfit,sans-serif',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
      🚪 Sign Out
    </button>
  );
}

export default function StudyPlanPage({ user, onLogout }) {
  const [status, setStatus]     = useState('loading'); // loading | has_plan | no_plan
  const [savedPlan, setSavedPlan] = useState(null);
  const [showNew, setShowNew]   = useState(false);
  // ✅ resuming=true → skip the form, go straight to plan view with streak/XP/tasks
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

  // ── LOADING ───────────────────────────────────────────────────────────────
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12, color: 'var(--text2)' }}>
          <div style={{ width: 24, height: 24, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ fontSize: 14 }}>Fetching your plan from database...</span>
        </div>
      </div>
    );
  }

  // ── RESUMING — full plan view with streak / XP / tasks ───────────────────
  // ✅ KEY FIX: "Continue My Plan" now renders StudyPlanGenerator with
  //    autoStart=true which skips the profile form and jumps to the plan view.
  if (resuming && savedPlan) {
    return (
      <div className="fade-in">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">📅 AI Study Planner</h1>
            <p className="page-subtitle">Resuming your saved plan</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setResuming(false)}
              style={{
                padding: '8px 16px', border: '1px solid var(--border2)',
                borderRadius: 8, background: 'transparent', cursor: 'pointer',
                fontSize: 13, color: 'var(--text2)', fontFamily: 'Outfit,sans-serif',
              }}>
              ← Back to plan summary
            </button>
            <SignOutBtn onLogout={onLogout} />
          </div>
        </div>
        <StudyPlanGenerator
          initialProfile={savedPlan.profile}
          autoStart={true}
          onPlanGenerated={handlePlanGenerated}
          user={user}
        />
      </div>
    );
  }

  // ── HAS SAVED PLAN — summary card ────────────────────────────────────────
  if (status === 'has_plan' && savedPlan && !showNew) {
    const createdDate = savedPlan.created_at
      ? new Date(savedPlan.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : 'Recently';
    const profile = savedPlan.profile || {};
    const summary = savedPlan.plan_summary || {};

    return (
      <div className="fade-in">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">📅 AI Study Planner</h1>
            <p className="page-subtitle">
              Hey {user?.name?.split(' ')[0] || 'there'} 👋 — your saved plan is ready!
            </p>
          </div>
          <SignOutBtn onLogout={onLogout} />
        </div>

        <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,#dc6b2f,#b45309)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📅</div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>Your Study Plan</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>Generated on {createdDate}</div>
              </div>
            </div>
            <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 999, background: '#dcfce7', color: '#15803d', fontWeight: 600 }}>
              ✅ Active Plan
            </span>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { icon: '🎯', label: 'Target Score',  value: summary.targetScore ? `${summary.targetScore}%` : `${profile.target_score || 80}%`, color: '#dc6b2f' },
              { icon: '📚', label: 'Study/Day',     value: summary.recommended_hrs ? `${summary.recommended_hrs}h` : `${profile.study_hrs || 3}h`, color: '#2563eb' },
              { icon: '📅', label: 'Plan Duration', value: summary.totalDays ? `${summary.totalDays} days` : '28 days', color: '#16a34a' },
              { icon: '⚠️', label: 'Weak Areas',    value: summary.weakAreasCount != null ? `${summary.weakAreasCount} found` : 'Identified', color: '#d97706' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--bg)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, marginBottom: 3 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Profile summary */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24, padding: '12px 16px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
            {[
              ['Stream', profile.stream || 'Engineering'],
              ['Previous Score', `${profile.prev_score || 65}%`],
              ['Attendance', `${profile.attendance || 75}%`],
              ['Study Time', profile.study_time || 'Night'],
              ['Exam in', `${profile.exam_days || 28} days`],
            ].map(([label, value], i, arr) => (
              <React.Fragment key={label}>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}><b>{label}:</b> {value}</span>
                {i < arr.length - 1 && <span style={{ color: 'var(--text3)' }}>·</span>}
              </React.Fragment>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 12 }}>
            {/* ✅ Sets resuming=true → full plan view with streak/XP/tasks */}
            <button
              onClick={() => setResuming(true)}
              style={{ flex: 1, padding: '13px', border: 'none', cursor: 'pointer', borderRadius: 10, background: 'linear-gradient(135deg,#dc6b2f,#b45309)', color: 'white', fontSize: 15, fontWeight: 700, fontFamily: 'Outfit,sans-serif' }}>
              🚀 Continue My Plan →
            </button>
            <button
              onClick={() => setShowNew('new')}
              style={{ padding: '13px 20px', border: '1px solid var(--border2)', borderRadius: 10, background: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text2)', fontFamily: 'Outfit,sans-serif' }}>
              ✨ Make New Plan
            </button>
          </div>
        </div>

        <div style={{ padding: '12px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, fontSize: 13, color: '#1d4ed8' }}>
          💡 <b>Making a new plan</b> will delete your current plan and tasks. Your streak and XP will stay safe.
        </div>
      </div>
    );
  }

  // ── CONFIRM NEW PLAN ──────────────────────────────────────────────────────
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

        <div style={{ background: 'white', border: '1px solid #fca5a5', borderRadius: 16, padding: '32px', maxWidth: 480, margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 10, color: 'var(--text)' }}>
            Your current plan will be deleted
          </div>
          <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 28 }}>
            Creating a new plan will delete your <b>current plan and tasks</b>.<br />
            <span style={{ color: '#16a34a' }}>✅ Your streak, XP and badges will stay safe.</span>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setShowNew(false)}
              style={{ flex: 1, padding: '12px', border: '1px solid var(--border2)', borderRadius: 10, background: 'white', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--text2)', fontFamily: 'Outfit,sans-serif' }}>
              ← Go back
            </button>
            <button
              onClick={handleDeleteAndNew}
              disabled={deleting}
              style={{ flex: 1, padding: '12px', border: 'none', borderRadius: 10, background: deleting ? '#a8a29e' : '#dc2626', color: 'white', cursor: deleting ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 700, fontFamily: 'Outfit,sans-serif' }}>
              {deleting ? 'Deleting...' : '🗑️ Yes, create new plan'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── NO PLAN — show generator form ────────────────────────────────────────
  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">📅 AI Study Planner</h1>
          <p className="page-subtitle">
            Generate your personalised plan — tasks will be saved to the database
          </p>
        </div>
        <SignOutBtn onLogout={onLogout} />
      </div>
      <StudyPlanGenerator
        initialProfile={null}
        autoStart={false}
        onPlanGenerated={handlePlanGenerated}
        user={user}
      />
    </div>
  );
}