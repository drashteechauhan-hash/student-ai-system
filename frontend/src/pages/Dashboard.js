import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';

const API = process.env.REACT_APP_API_URL || 'https://student-ai-system-kgq0.onrender.com';

function ProgressRing({ pct, color, size = 64, stroke = 6 }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }} strokeLinecap="round"
      />
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] } }),
};

// ─── STUDENT DASHBOARD ────────────────────────────────────────────────────────
function StudentDashboard({ user }) {
  const [progress, setProgress] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = () => {
      Promise.all([
        axios.get(`${API}/my-progress`).catch(() => ({ data: null })),
        axios.get(`${API}/my-plan`).catch(() => ({ data: null })),
      ]).then(([progRes, planRes]) => {
        if (progRes.data) setProgress(progRes.data);
        if (planRes.data?.has_plan) setPlanData(planRes.data);
        setLoading(false);
      });
    };

    fetchAll();
    const interval = setInterval(fetchAll, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 60, textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: 36, height: 36, border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <div style={{ marginTop: 16, color: '#8b92a0', fontSize: 14 }}>Loading your dashboard...</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const xp        = progress?.total_xp || 0;
  const streak    = progress?.streak_count || 0;
  const level     = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;
  const firstName = user?.name?.split(' ')[0] || 'Student';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const achievements = [
    { icon: '🔥', title: `${streak}-Day Streak!`, desc: `You've studied ${streak} days in a row.`, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', show: streak >= 1 },
    { icon: '🧠', title: 'Fast Learner', desc: 'Earned 50+ XP so far.', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)', show: xp >= 50 },
    { icon: '⭐', title: `Level ${level}`, desc: `Earned ${xp} XP so far.`, color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', show: xp >= 10 },
  ].filter(a => a.show).slice(0, 3);

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', fontFamily: 'inherit' }}>

      {/* ── Header ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show" style={{ marginBottom: 36 }}>
        <div style={{
          fontSize: 13,
          color: '#a78bfa',
          fontWeight: 700,
          marginBottom: 4,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
        <h1 style={{
          fontSize: 34,
          fontWeight: 800,
          color: '#ffffff',
          margin: 0,
          letterSpacing: '-0.5px',
        }}>
          {greeting}, {firstName}! 🎓
        </h1>
        <p style={{ color: '#c4c9d4', fontSize: 16, marginTop: 6 }}>
          {streak > 0
            ? `You're on a ${streak}-day streak — keep it going!`
            : planData
            ? 'Complete your daily tasks to build your streak!'
            : 'Ready to set up your AI study plan?'}
        </p>
      </motion.div>

      {/* ── XP Level bar ── */}
      <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show"
        style={{
          background: 'rgba(22,22,32,0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(20px)',
        }}>
        <div style={{ fontSize: 36 }}>⭐</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>Level {level}</span>
            <span style={{ fontSize: 13, color: '#8b92a0' }}>{xpInLevel}/100 XP to next level</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 999, height: 10, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpInLevel}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #6366f1)', borderRadius: 999 }}
            />
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#a78bfa' }}>{xp}</div>
          <div style={{ fontSize: 12, color: '#8b92a0', fontWeight: 600 }}>TOTAL XP</div>
        </div>
      </motion.div>

      {/* ── Stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          {
            icon: '🔥', label: 'Study Streak', value: `${streak} Day${streak !== 1 ? 's' : ''}`,
            sub: streak > 0 ? (streak >= 7 ? '🏆 Week champion!' : 'Keep it going!') : 'Start today!',
            color: streak > 0 ? '#f59e0b' : '#8b92a0',
            bg: streak > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.03)',
            border: streak > 0 ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.07)',
          },
          {
            icon: '📅', label: 'Active Plan', value: planData ? 'Active' : 'None',
            sub: planData ? `Target: ${planData?.plan_summary?.targetScore || 80}%` : 'Generate one!',
            color: planData ? '#10b981' : '#8b92a0',
            bg: planData ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
            border: planData ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.07)',
          },
          {
            icon: '🎯', label: 'Level', value: `Level ${level}`,
            sub: `${xp} Total XP`,
            color: '#8b5cf6',
            bg: 'rgba(139,92,246,0.1)',
            border: 'rgba(139,92,246,0.25)',
          },
        ].map((s, i) => (
          <motion.div key={i} custom={i + 2} variants={fadeUp} initial="hidden" animate="show"
            style={{
              background: s.bg,
              border: `1.5px solid ${s.border}`,
              borderRadius: 16,
              padding: '20px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              backdropFilter: 'blur(16px)',
            }}>
            <div style={{ fontSize: 32 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 12, color: '#8b92a0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color, marginTop: 2 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#c4c9d4', marginTop: 2 }}>{s.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Study Plan Card ── */}
      <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show"
        style={{
          background: 'rgba(22,22,32,0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20,
          padding: '28px',
          marginBottom: 24,
          backdropFilter: 'blur(20px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
          📅 Your Study Plan
        </h2>

        {planData ? (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              <span style={{ padding: '6px 14px', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', borderRadius: 999, fontSize: 13, fontWeight: 700, border: '1px solid rgba(59,130,246,0.3)' }}>
                {planData.profile?.branch || planData.profile?.stream || 'Engineering'}
              </span>
              <span style={{ padding: '6px 14px', background: 'rgba(16,185,129,0.15)', color: '#34d399', borderRadius: 999, fontSize: 13, fontWeight: 700, border: '1px solid rgba(16,185,129,0.3)' }}>
                Target: {planData.plan_summary?.targetScore || planData.profile?.target_score || 80}%
              </span>
              {planData.plan_summary?.weakAreasCount > 0 && (
                <span style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.15)', color: '#f87171', borderRadius: 999, fontSize: 13, fontWeight: 700, border: '1px solid rgba(239,68,68,0.3)' }}>
                  ⚠️ {planData.plan_summary.weakAreasCount} weak subject{planData.plan_summary.weakAreasCount > 1 ? 's' : ''} to fix
                </span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
              {[
                { icon: '📚', label: 'Study/Day', value: `${planData.plan_summary?.recommended_hrs || planData.profile?.study_hrs || 3}h` },
                { icon: '📅', label: 'Duration', value: `${planData.plan_summary?.totalDays || 28} days` },
                { icon: '⚠️', label: 'Weak Areas', value: `${planData.plan_summary?.weakAreasCount ?? '—'} found` },
                { icon: '🔥', label: 'Streak', value: `${streak} day${streak !== 1 ? 's' : ''}` },
              ].map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 12,
                  padding: '14px 12px',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: '#8b92a0', fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <p style={{ color: '#c4c9d4', fontSize: 13, lineHeight: 1.6, marginBottom: 20 }}>
              Your AI plan is focused on your weak subjects. Complete daily tasks to earn XP and maintain your streak!
              {xp > 0 && ` You've earned ${xp} XP so far.`}
            </p>

            <button
              onClick={() => navigate('/study-plan')}
              style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 20px rgba(139,92,246,0.4)', transition: 'all 0.2s' }}
              onMouseEnter={e => e.target.style.opacity = '0.9'}
              onMouseLeave={e => e.target.style.opacity = '1'}>
              Open Study Planner →
            </button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
            <p style={{ color: '#c4c9d4', fontSize: 14, lineHeight: 1.7, marginBottom: 24, maxWidth: 380, margin: '0 auto 20px' }}>
              You don't have an active study plan yet. Let our AI build a personalized plan based on your actual subject marks.
            </p>
            <button
              onClick={() => navigate('/study-plan')}
              style={{ padding: '13px 28px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 20px rgba(139,92,246,0.4)' }}>
              Generate AI Plan ✨
            </button>
          </div>
        )}
      </motion.div>

      {/* ── Achievements + Tips ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <motion.div custom={6} variants={fadeUp} initial="hidden" animate="show"
          style={{ background: 'rgba(22,22,32,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px', backdropFilter: 'blur(20px)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 16 }}>🏆 Recent Achievements</h3>
          {achievements.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {achievements.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: a.bg, borderRadius: 12, border: `1px solid ${a.border}` }}>
                  <div style={{ fontSize: 22, background: `${a.color}20`, padding: 8, borderRadius: 10 }}>{a.icon}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: '#c4c9d4' }}>{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#8b92a0', fontSize: 14 }}>
              Complete tasks in your study plan to earn achievements! 🎯
            </div>
          )}
        </motion.div>

        <motion.div custom={7} variants={fadeUp} initial="hidden" animate="show"
          style={{ background: 'rgba(22,22,32,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '24px', backdropFilter: 'blur(20px)' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 16 }}>🧠 Study Tips</h3>
          {[
            { title: 'Attack your lowest score first', tip: 'Improving a weak subject gives more aggregate gain. Even +15 marks on a failing subject changes everything.', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
            { title: 'Sleep is non-negotiable', tip: 'Memory consolidation happens during deep sleep. Aim for 7–8 hours — cutting sleep to study more is counterproductive.', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
            { title: 'Pomodoro Technique', tip: '25 minutes of focused work, then a 5-minute break. Prevents mental fatigue across long sessions.', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          ].map((t, i) => (
            <div key={i} style={{ padding: '14px', background: t.bg, borderRadius: 12, border: `1px solid ${t.color}25`, marginBottom: i < 2 ? 10 : 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.color, marginBottom: 4 }}>{t.title}</div>
              <div style={{ fontSize: 12, color: '#c4c9d4', lineHeight: 1.6 }}>{t.tip}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── CTA banner ── */}
      <motion.div custom={8} variants={fadeUp} initial="hidden" animate="show"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #3b82f6 100%)', borderRadius: 20, padding: '28px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Want to see how you'd score?</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', maxWidth: 420, lineHeight: 1.6 }}>
            Enter your details and get an AI-powered prediction of your exam score with personalised improvement tips.
          </div>
        </div>
        <Link to="/predict" style={{ padding: '14px 28px', background: '#fff', color: '#6366f1', borderRadius: 12, fontWeight: 800, fontSize: 15, textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          Predict My Score →
        </Link>
      </motion.div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
export default function Dashboard({ user }) {
  const [stats, setStats]         = useState(null);
  const [metrics, setMetrics]     = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [time, setTime]           = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const isAdmin = user?.email?.toLowerCase() === 'drashteechauhan@gmail.com';

  useEffect(() => {
    if (!isAdmin) return;
    axios.get(`${API}/dataset-stats`).then(r => setStats(r.data)).catch(() => {});
    axios.get(`${API}/metrics`).then(r => setMetrics(r.data)).catch(() => {});
  }, [user, isAdmin]);

  if (!isAdmin) return <StudentDashboard user={user} />;

  const shap = metrics?.performance?.shap_importance
    ? Object.entries(metrics.performance.shap_importance).slice(0, 8).map(([k, v]) => ({
        name: k.length > 22 ? k.slice(0, 20) + '…' : k,
        value: Math.round(v * 1000) / 1000,
      }))
    : [];

  const modelData = metrics?.performance
    ? Object.entries(metrics.performance)
        .filter(([k]) => !['shap_importance', 'best_model', 'classes'].includes(k))
        .map(([k, v]) => ({
          name: k.split(' ')[0],
          Accuracy: Math.round((v.accuracy || 0) * 100),
          F1: Math.round((v.f1_score || 0) * 100),
        }))
    : [];

  const riskPie = [
    { name: 'Low Risk', value: 48, color: '#10b981' },
    { name: 'Moderate', value: 33, color: '#f59e0b' },
    { name: 'High Risk', value: 19, color: '#ef4444' },
  ];

  const trend = [
    { m: 'Jan', avg: 66 }, { m: 'Feb', avg: 69 }, { m: 'Mar', avg: 68 },
    { m: 'Apr', avg: 73 }, { m: 'May', avg: 77 }, { m: 'Jun', avg: 75 },
  ];

  const TT = ({ active, payload, label }) =>
    active && payload?.length ? (
      <div style={{ background: 'rgba(12,12,20,0.97)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 16px', fontSize: 13, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        <p style={{ color: '#8b92a0', marginBottom: 6, fontWeight: 600 }}>{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color, margin: '4px 0' }}>
            {p.name}: <b style={{ color: '#ffffff' }}>{p.value}%</b>
          </p>
        ))}
      </div>
    ) : null;

  const cardStyle = {
    background: 'rgba(22,22,32,0.6)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: '24px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  };

  return (
    <div>
      {/* ── Admin Header ── */}
      <motion.div variants={fadeUp} initial="hidden" animate="show"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 36 }}>
        <div>
          <div style={{ fontSize: 13, color: '#a78bfa', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', margin: 0, letterSpacing: '-0.5px' }}>
            Good {time.getHours() < 12 ? 'morning' : time.getHours() < 17 ? 'afternoon' : 'evening'}, Drashtee 👋
          </h1>
          <p style={{ color: '#c4c9d4', fontSize: 15, marginTop: 6 }}>Here's how your students are performing today.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setNotifOpen(o => !o)}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 14px', cursor: 'pointer', position: 'relative', fontSize: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              🔔
              <span style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: '#fff', width: 18, height: 18, borderRadius: '50%', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
            </button>
            {notifOpen && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                style={{ position: 'absolute', top: '52px', right: 0, width: 320, background: 'rgba(14,14,22,0.97)', borderRadius: 16, padding: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)', zIndex: 100 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.07)', color: '#ffffff' }}>Notifications</div>
                {[
                  { icon: '🚨', msg: '5 students identified as high risk', time: 'Just now' },
                  { icon: '✅', msg: 'Model accuracy updated to 91.2%', time: '1h ago' },
                  { icon: '📤', msg: 'New dataset: 238 rows loaded', time: 'Today' },
                ].map((n, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <span style={{ fontSize: 18 }}>{n.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{n.msg}</div>
                      <div style={{ fontSize: 11, color: '#8b92a0', marginTop: 2 }}>{n.time}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
          <Link to="/predict" style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 14, textDecoration: 'none', boxShadow: '0 4px 16px rgba(139,92,246,0.4)' }}>Make a Prediction →</Link>
        </div>
      </motion.div>

      {/* ── Admin Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: '👨‍🎓', label: 'Total Students', value: stats?.total_students || 238, sub: '+200 augmented', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.2)' },
          { icon: '📊', label: 'Avg Previous Score', value: `${stats?.avg_previous_score || 68}%`, sub: '+2.1% this batch', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
          { icon: '🎯', label: 'Avg Expected Score', value: `${stats?.avg_expected_score || 77}%`, sub: '+3.8% predicted', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
          { icon: '⚠️', label: 'High Risk Students', value: '45', sub: 'Need attention', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
        ].map((s, i) => (
          <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" animate="show"
            style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 16, padding: '20px', backdropFilter: 'blur(16px)' }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#ffffff', fontWeight: 600, marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: '#8b92a0', marginTop: 3 }}>{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Charts Row 1 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <motion.div variants={fadeUp} custom={4} initial="hidden" animate="show" style={cardStyle}>
          <div style={{ fontSize: 11, color: '#8b92a0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Model Performance (RF + GB)</div>
          {modelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={modelData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#8b92a0' }} />
                <YAxis tick={{ fontSize: 12, fill: '#8b92a0' }} domain={[0, 100]} />
                <Tooltip content={<TT />} />
                <Legend wrapperStyle={{ fontSize: 13, color: '#c4c9d4' }} />
                <Bar dataKey="Accuracy" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="F1" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 10, color: '#8b92a0' }}>
              <span style={{ fontSize: 36, opacity: 0.4 }}>🤖</span>
              <span style={{ fontSize: 13 }}>Run ml_pipeline.py to see results</span>
            </div>
          )}
        </motion.div>

        <motion.div variants={fadeUp} custom={5} initial="hidden" animate="show" style={cardStyle}>
          <div style={{ fontSize: 11, color: '#8b92a0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Risk Distribution</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={riskPie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                {riskPie.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v => `${v}%`} contentStyle={{ fontSize: 13, borderRadius: 12, background: 'rgba(12,12,20,0.97)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12 }}>
            {riskPie.map(d => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                <span style={{ color: '#c4c9d4' }}>{d.name}: {d.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <motion.div variants={fadeUp} custom={6} initial="hidden" animate="show" style={cardStyle}>
          <div style={{ fontSize: 11, color: '#8b92a0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Score Trend (6 months)</div>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={trend} margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="m" tick={{ fontSize: 12, fill: '#8b92a0' }} />
              <YAxis tick={{ fontSize: 12, fill: '#8b92a0' }} domain={[50, 100]} />
              <Tooltip content={<TT />} />
              <Line type="monotone" dataKey="avg" stroke="#8b5cf6" strokeWidth={3}
                dot={{ r: 5, fill: '#8b5cf6', strokeWidth: 2, stroke: '#030305' }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={fadeUp} custom={7} initial="hidden" animate="show" style={cardStyle}>
          <div style={{ fontSize: 11, color: '#8b92a0', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>SHAP Feature Importance</div>
          {shap.length > 0 ? (
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={shap} layout="vertical" margin={{ left: 80, right: 10 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#8b92a0' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#c4c9d4' }} width={80} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ fontSize: 13, borderRadius: 12, background: 'rgba(12,12,20,0.97)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <Bar dataKey="value" fill="#a78bfa" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 170, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b92a0', fontSize: 13 }}>
              Train models to see feature importance
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Admin CTA ── */}
      <motion.div variants={fadeUp} custom={8} initial="hidden" animate="show"
        style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', borderRadius: 20, padding: '28px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 6 }}>Ready to analyse a student?</div>
          <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', maxWidth: 480, lineHeight: 1.6 }}>
            Enter their details and get predictions with personalised study advice powered by Gradient Boosting ML.
          </div>
        </div>
        <Link to="/predict" style={{ padding: '14px 32px', background: '#fff', color: '#6366f1', borderRadius: 12, fontWeight: 800, fontSize: 15, textDecoration: 'none', whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
          Start Prediction →
        </Link>
      </motion.div>
    </div>
  );
}
