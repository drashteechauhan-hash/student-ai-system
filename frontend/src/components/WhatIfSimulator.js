import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function WhatIfSimulator() {
  const [base, setBase] = useState({
    previous_score: 62, attendance: 70, study_hours: 2,
    sleep_hours: 6, stress_level: 4, motivation_level: 2,
    study_consistency: 2, revision: 'Before exams only',
  });
  const [scenario, setScenario] = useState({ ...base });
  const [history, setHistory] = useState([]);

  const calcPredicted = (s) => {
    let score = s.previous_score;
    score += (s.study_hours - 2) * 3.5;
    score += (s.attendance - 70) * 0.15;
    score += (8 - s.sleep_hours < 0 ? 0 : (8 - s.sleep_hours)) * -1.5;
    score += (s.sleep_hours - 6) * 1.2;
    score += (s.motivation_level - 2) * 2.5;
    score += (3 - s.stress_level) * 1.8;
    score += (s.study_consistency - 2) * 2;
    if (s.revision === 'Daily') score += 8;
    else if (s.revision === 'Weekly') score += 4;
    return Math.round(Math.min(100, Math.max(0, score)));
  };

  const basePred = calcPredicted(base);
  const scenPred = calcPredicted(scenario);
  const diff = scenPred - basePred;

  const saveScenario = () => {
    const name = `Scenario ${history.length + 1}`;
    setHistory(h => [...h.slice(-4), { name, score: scenPred, changes: getChanges() }]);
  };

  const getChanges = () => {
    const changes = [];
    if (scenario.study_hours !== base.study_hours) changes.push(`Study ${scenario.study_hours}h/day`);
    if (scenario.attendance !== base.attendance) changes.push(`Attendance ${scenario.attendance}%`);
    if (scenario.sleep_hours !== base.sleep_hours) changes.push(`Sleep ${scenario.sleep_hours}h`);
    if (scenario.stress_level !== base.stress_level) changes.push(`Stress ${scenario.stress_level}/5`);
    if (scenario.motivation_level !== base.motivation_level) changes.push(`Motivation ${scenario.motivation_level}/5`);
    return changes.slice(0, 3).join(', ') || 'No changes';
  };

  const impactData = [
    { name: 'Study +1h', impact: Math.round(calcPredicted({...base, study_hours: base.study_hours+1}) - basePred) },
    { name: 'Attend +10%', impact: Math.round(calcPredicted({...base, attendance: Math.min(100, base.attendance+10)}) - basePred) },
    { name: 'Sleep +1h', impact: Math.round(calcPredicted({...base, sleep_hours: Math.min(9, base.sleep_hours+1)}) - basePred) },
    { name: 'Stress -1', impact: Math.round(calcPredicted({...base, stress_level: Math.max(1, base.stress_level-1)}) - basePred) },
    { name: 'Motivation +1', impact: Math.round(calcPredicted({...base, motivation_level: Math.min(5, base.motivation_level+1)}) - basePred) },
    { name: 'Daily revision', impact: Math.round(calcPredicted({...base, revision: 'Daily'}) - basePred) },
  ];

  const slider = (label, key, min, max, step = 1, obj, setter, color) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
        <span style={{ color: color || '#7c3aed', fontWeight: 700 }}>{obj[key]}{key.includes('score') || key === 'attendance' ? '%' : key.includes('hour') ? 'h' : '/5'}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={obj[key]}
        onChange={e => setter(s => ({...s, [key]: +e.target.value}))} style={{ width: '100%' }} />
    </div>
  );

  return (
    <div style={{ fontFamily: 'Inter,sans-serif', color: 'var(--color-text-primary)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <div style={{ background: 'var(--color-background-secondary)', borderRadius: 12, padding: 20, border: '1px solid var(--color-border-tertiary)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: 'var(--color-text-secondary)' }}>Current Situation</div>
          {slider('Previous Score', 'previous_score', 0, 100, 1, base, setBase, '#94a3b8')}
          {slider('Attendance', 'attendance', 0, 100, 5, base, setBase, '#94a3b8')}
          {slider('Study Hours/day', 'study_hours', 0, 10, 0.5, base, setBase, '#94a3b8')}
          {slider('Sleep Hours', 'sleep_hours', 3, 10, 0.5, base, setBase, '#94a3b8')}
          {slider('Stress Level', 'stress_level', 1, 5, 1, base, setBase, '#94a3b8')}
          {slider('Motivation', 'motivation_level', 1, 5, 1, base, setBase, '#94a3b8')}
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Predicted Score</div>
            <div style={{ fontSize: 40, fontWeight: 800, color: '#94a3b8' }}>{basePred}%</div>
          </div>
        </div>

        <div style={{ background: 'var(--color-background-secondary)', borderRadius: 12, padding: 20, border: `1px solid ${diff >= 0 ? '#10b98140' : '#ef444440'}` }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: '#7c3aed' }}>What If I Change These?</div>
          {slider('Study Hours/day', 'study_hours', 0, 10, 0.5, scenario, setScenario, '#7c3aed')}
          {slider('Attendance', 'attendance', 0, 100, 5, scenario, setScenario, '#7c3aed')}
          {slider('Sleep Hours', 'sleep_hours', 3, 10, 0.5, scenario, setScenario, '#7c3aed')}
          {slider('Stress Level', 'stress_level', 1, 5, 1, scenario, setScenario, '#7c3aed')}
          {slider('Motivation', 'motivation_level', 1, 5, 1, scenario, setScenario, '#7c3aed')}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Revision Frequency</label>
            <select value={scenario.revision} onChange={e => setScenario(s => ({...s, revision: e.target.value}))}
              style={{ width: '100%', marginTop: 4, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--color-border-secondary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: 13 }}>
              {['Rarely','Before exams only','Weekly','Daily'].map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>New Predicted Score</div>
            <div style={{ fontSize: 40, fontWeight: 800, color: diff >= 0 ? '#10b981' : '#ef4444' }}>{scenPred}%</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: diff >= 0 ? '#10b981' : '#ef4444', marginTop: 4 }}>
              {diff >= 0 ? '+' : ''}{diff} points {diff >= 0 ? '↑' : '↓'}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--color-background-secondary)', borderRadius: 12, padding: 20, marginBottom: 16, border: '1px solid var(--color-border-tertiary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Impact of Each Change</div>
          <button onClick={saveScenario} style={{ fontSize: 12, padding: '6px 14px', borderRadius: 999, background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#7c3aed', cursor: 'pointer', fontWeight: 600 }}>Save Scenario</button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {impactData.map(d => (
            <div key={d.name} style={{ background: d.impact > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${d.impact > 0 ? '#10b98130' : '#ef444430'}`, borderRadius: 8, padding: '8px 12px', minWidth: 100 }}>
              <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{d.name}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: d.impact > 0 ? '#10b981' : '#ef4444' }}>{d.impact > 0 ? '+' : ''}{d.impact}</div>
            </div>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <div style={{ background: 'var(--color-background-secondary)', borderRadius: 12, padding: 20, border: '1px solid var(--color-border-tertiary)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Saved Scenarios</div>
          {history.map((h, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--color-border-tertiary)' }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{h.name}</span>
                <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginLeft: 8 }}>{h.changes}</span>
              </div>
              <span style={{ fontWeight: 700, color: h.score >= basePred ? '#10b981' : '#ef4444', fontSize: 18 }}>{h.score}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
