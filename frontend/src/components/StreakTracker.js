import React, { useState, useEffect } from 'react';

const HABITS = [
  { id: 'study', label: 'Studied today', icon: '📚', points: 20 },
  { id: 'sleep', label: 'Slept 7+ hours', icon: '😴', points: 15 },
  { id: 'revision', label: 'Did revision', icon: '🔄', points: 20 },
  { id: 'exercise', label: 'Exercised', icon: '🏃', points: 10 },
  { id: 'goals', label: 'Met study goal', icon: '🎯', points: 25 },
  { id: 'noscreen', label: 'Less than 2h screen time', icon: '📵', points: 10 },
];

const LEVELS = [
  { min: 0,   label: 'Beginner',    color: '#94a3b8', icon: '🌱' },
  { min: 100, label: 'Learner',     color: '#3b82f6', icon: '📖' },
  { min: 300, label: 'Focused',     color: '#7c3aed', icon: '🎯' },
  { min: 600, label: 'Scholar',     color: '#f59e0b', icon: '⭐' },
  { min: 1000,label: 'Champion',    color: '#10b981', icon: '🏆' },
];

export default function StreakTracker() {
  const today = new Date().toISOString().slice(0,10);
  const [data, setData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('edusense_streak') || '{}'); } catch { return {}; }
  });
  const [todayChecked, setTodayChecked] = useState(data[today] || {});

  const save = (newToday) => {
    const newData = { ...data, [today]: newToday };
    setData(newData);
    setTodayChecked(newToday);
    try { localStorage.setItem('edusense_streak', JSON.stringify(newData)); } catch {}
  };

  const toggle = (id) => {
    save({ ...todayChecked, [id]: !todayChecked[id] });
  };

  const streak = (() => {
    let count = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().slice(0,10);
      const day = data[key];
      if (!day || Object.keys(day).filter(k => day[k]).length === 0) break;
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  const totalPoints = Object.values(data).reduce((sum, day) => {
    return sum + HABITS.filter(h => day[h.id]).reduce((s, h) => s + h.points, 0);
  }, 0);

  const level = [...LEVELS].reverse().find(l => totalPoints >= l.min) || LEVELS[0];
  const nextLevel = LEVELS[LEVELS.indexOf(level) + 1];
  const progress = nextLevel ? Math.round(((totalPoints - level.min) / (nextLevel.min - level.min)) * 100) : 100;

  const todayPoints = HABITS.filter(h => todayChecked[h.id]).reduce((s, h) => s + h.points, 0);

  const last7 = Array.from({length:7}, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6-i));
    const key = d.toISOString().slice(0,10);
    const day = data[key] || {};
    const pts = HABITS.filter(h => day[h.id]).reduce((s, h) => s + h.points, 0);
    return { day: d.toLocaleDateString('en',{weekday:'short'}), pts, completed: HABITS.filter(h => day[h.id]).length };
  });

  return (
    <div style={{ fontFamily: 'Inter,sans-serif', color: 'var(--color-text-primary)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Day Streak', value: streak, icon: '🔥', color: '#f59e0b' },
          { label: 'Total Points', value: totalPoints, icon: '⭐', color: '#7c3aed' },
          { label: "Today's Points", value: todayPoints, icon: '🎯', color: '#10b981' },
        ].map(card => (
          <div key={card.label} style={{ background: 'var(--color-background-secondary)', borderRadius: 12, padding: 16, textAlign: 'center', border: '1px solid var(--color-border-tertiary)' }}>
            <div style={{ fontSize: 20 }}>{card.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--color-background-secondary)', borderRadius: 12, padding: 20, marginBottom: 16, border: '1px solid var(--color-border-tertiary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <span style={{ fontSize: 16 }}>{level.icon}</span>
            <span style={{ fontWeight: 700, fontSize: 14, marginLeft: 8, color: level.color }}>{level.label}</span>
          </div>
          {nextLevel && <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>{nextLevel.min - totalPoints} pts to {nextLevel.label}</span>}
        </div>
        <div style={{ background: 'var(--color-border-tertiary)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: level.color, borderRadius: 999, transition: 'width 0.5s' }} />
        </div>
      </div>

      <div style={{ background: 'var(--color-background-secondary)', borderRadius: 12, padding: 20, marginBottom: 16, border: '1px solid var(--color-border-tertiary)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16 }}>Today's Habits</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {HABITS.map(h => (
            <div key={h.id} onClick={() => toggle(h.id)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
              background: todayChecked[h.id] ? 'rgba(16,185,129,0.1)' : 'var(--color-background-primary)',
              border: `1px solid ${todayChecked[h.id] ? '#10b98140' : 'var(--color-border-tertiary)'}`,
              transition: 'all 0.2s',
            }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${todayChecked[h.id] ? '#10b981' : 'var(--color-border-secondary)'}`, background: todayChecked[h.id] ? '#10b981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                {todayChecked[h.id] && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
              </div>
              <span style={{ fontSize: 16 }}>{h.icon}</span>
              <span style={{ fontSize: 14, flex: 1 }}>{h.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>+{h.points}pts</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--color-background-secondary)', borderRadius: 12, padding: 20, border: '1px solid var(--color-border-tertiary)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Last 7 Days</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 80 }}>
          {last7.map(d => (
            <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{ width: '100%', background: d.pts > 0 ? '#7c3aed' : 'var(--color-border-tertiary)', borderRadius: '4px 4px 0 0', height: Math.max(4, (d.pts / 100) * 60), transition: 'height 0.3s', opacity: d.day === new Date().toLocaleDateString('en',{weekday:'short'}) ? 1 : 0.6 }} />
              <span style={{ fontSize: 10, color: 'var(--color-text-tertiary)' }}>{d.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
