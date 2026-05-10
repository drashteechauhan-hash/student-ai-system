import React, { useState } from 'react';

export default function WhatIfSimulator() {
  const [base, setBase] = useState({
    prev: 62, att: 70, study: 2,
    sleep: 6, stress: 4, motiv: 2,
    consist: 2, rev: 1,
  });
  const [scen, setScen] = useState({ ...base, prev: 62 });
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('bars');

  const REV_LABELS = ['Rarely', 'Before exams only', 'Weekly', 'Daily'];

  const calcScore = (s) => {
    let score = s.prev;

    // Study hours: nonlinear — big gains 0→4h, diminishing beyond
    const studyDiff = s.study - 2;
    if (studyDiff > 0) score += studyDiff > 4 ? 18 + (studyDiff - 4) * 1.5 : studyDiff * 4.5;
    else score += studyDiff * 3.5;

    // Attendance: threshold effect
    if (s.att < 60) score += (s.att - 70) * 0.35;
    else if (s.att < 75) score += (s.att - 70) * 0.18;
    else score += (s.att - 70) * 0.12;

    // Sleep: sweet spot 7–7.5h, both too little AND too much hurt
    const sleepDiff = s.sleep - 7.5;
    if (sleepDiff < 0) score += sleepDiff * 2.2;
    else if (sleepDiff <= 1) score += sleepDiff * 1.5;
    else score += 1.5 - (sleepDiff - 1) * 2;

    // Stress: nonlinear exponential penalty
    const stressMap = { 1: 7, 2: 4, 3: 0, 4: -5, 5: -11 };
    score += (stressMap[s.stress] || 0);

    // Motivation
    const motivMap = { 1: -6, 2: 0, 3: 4, 4: 8, 5: 13 };
    score += (motivMap[s.motiv] || 0);

    // Consistency compounds with study hours
    score += (s.consist - 2) * (2 + s.study * 0.4);

    // Revision: nonlinear jumps
    const revMap = { 0: -6, 1: 0, 2: 5, 3: 11 };
    score += (revMap[s.rev] || 0);

    return Math.round(Math.min(100, Math.max(0, score)));
  };

  const bScore = calcScore(base);
  const sScore = calcScore({ ...scen, prev: base.prev });
  const diff = sScore - bScore;

  const IMPACTS = [
    { label: 'Study +1h/day',   mod: (b) => ({ ...b, study: Math.min(12, b.study + 1) }) },
    { label: 'Attendance +10%', mod: (b) => ({ ...b, att: Math.min(100, b.att + 10) }) },
    { label: 'Sleep +1h',       mod: (b) => ({ ...b, sleep: Math.min(10, b.sleep + 1) }) },
    { label: 'Stress −1 level', mod: (b) => ({ ...b, stress: Math.max(1, b.stress - 1) }) },
    { label: 'Motivation +1',   mod: (b) => ({ ...b, motiv: Math.min(5, b.motiv + 1) }) },
    { label: 'Daily revision',  mod: (b) => ({ ...b, rev: 3 }) },
    { label: 'Consistency +1',  mod: (b) => ({ ...b, consist: Math.min(5, b.consist + 1) }) },
  ];

  const impacts = IMPACTS.map(it => ({
    label: it.label,
    val: calcScore(it.mod(base)) - bScore,
  })).sort((a, b) => Math.abs(b.val) - Math.abs(a.val));

  const maxAbs = Math.max(...impacts.map(i => Math.abs(i.val)), 1);

  const getInsights = () => {
    const list = [];
    if (base.stress >= 4) list.push({ type: 'danger', text: `High stress (${base.stress}/5) is your biggest blocker — reducing it by 1 level saves more points than an extra hour of study.` });
    if (base.sleep < 6) list.push({ type: 'warning', text: `${base.sleep}h sleep is below the memory-consolidation threshold. Your brain retains far less below 6h even with perfect notes.` });
    if (base.att < 65) list.push({ type: 'danger', text: `Attendance at ${base.att}% is critically low. Below 65%, you risk being barred from exams — no self-study compensates.` });
    if (base.rev <= 1) list.push({ type: 'info', text: `Switching to daily revision adds ~${calcScore({ ...base, rev: 3 }) - bScore} points. Spaced repetition beats pre-exam cramming every time.` });
    if (base.study >= 8) list.push({ type: 'warning', text: `${base.study}h/day shows diminishing returns beyond 6–7h. Fewer focused Pomodoro sessions beat marathon studying.` });
    if (base.consist <= 2) list.push({ type: 'info', text: `Low consistency (${base.consist}/5) weakens every other habit. Even 30 min daily beats 5h once a week.` });
    if (list.length === 0) list.push({ type: 'success', text: 'Your baseline is solid. Use the scenario panel to push further and find where diminishing returns kick in.' });
    return list;
  };

  const saveScenario = () => {
    const changes = [];
    if (scen.study !== base.study) changes.push(`Study ${scen.study}h`);
    if (scen.att !== base.att) changes.push(`Attend ${scen.att}%`);
    if (scen.sleep !== base.sleep) changes.push(`Sleep ${scen.sleep}h`);
    if (scen.stress !== base.stress) changes.push(`Stress ${scen.stress}/5`);
    if (scen.motiv !== base.motiv) changes.push(`Motiv ${scen.motiv}/5`);
    if (scen.rev !== base.rev) changes.push(REV_LABELS[scen.rev]);
    setHistory(h => [
      { label: `Scenario ${h.length + 1}`, score: sScore, base: bScore, changes: changes.slice(0, 3).join(' · ') || 'No changes' },
      ...h.slice(0, 4),
    ]);
  };

  const upBase = (k, v) => setBase(b => ({ ...b, [k]: v }));
  const upScen = (k, v) => setScen(s => ({ ...s, [k]: v }));

  const INSIGHT_COLORS = {
    danger:  { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   text: '#ef4444' },
    warning: { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  text: '#f59e0b' },
    info:    { bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.3)',  text: '#60a5fa' },
    success: { bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.3)',  text: '#34d399' },
  };

  const Slider = ({ label, k, min, max, step = 1, val, onChange, accentColor, suffix }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
        <span style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
        <span style={{ color: accentColor, fontWeight: 600 }}>{val}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => onChange(k, +e.target.value)}
        style={{ width: '100%', accentColor }} />
    </div>
  );

  const scoreColor = (d) => d > 0 ? '#34d399' : d < 0 ? '#ef4444' : 'var(--color-text-primary)';

  return (
    <div style={{ fontFamily: 'inherit', color: 'var(--color-text-primary)' }}>

      {/* Top two panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Base panel */}
        <div style={{ background: 'var(--color-background-secondary)', borderRadius: 16, padding: '20px', border: '1px solid var(--color-border-tertiary)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.8px' }}>Current situation</div>
          <Slider label="Previous score" k="prev" min={0} max={100} val={base.prev} onChange={upBase} accentColor="var(--color-text-secondary)" suffix="%" />
          <Slider label="Attendance" k="att" min={0} max={100} step={5} val={base.att} onChange={upBase} accentColor="var(--color-text-secondary)" suffix="%" />
          <Slider label="Study hours/day" k="study" min={0} max={12} step={0.5} val={base.study} onChange={upBase} accentColor="var(--color-text-secondary)" suffix="h" />
          <Slider label="Sleep hours" k="sleep" min={3} max={10} step={0.5} val={base.sleep} onChange={upBase} accentColor="var(--color-text-secondary)" suffix="h" />
          <Slider label="Stress level" k="stress" min={1} max={5} val={base.stress} onChange={upBase} accentColor="#ef4444" suffix="/5" />
          <Slider label="Motivation" k="motiv" min={1} max={5} val={base.motiv} onChange={upBase} accentColor="var(--color-text-secondary)" suffix="/5" />
          <Slider label="Consistency" k="consist" min={1} max={5} val={base.consist} onChange={upBase} accentColor="var(--color-text-secondary)" suffix="/5" />
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 5 }}>Revision habit</div>
            <select value={base.rev} onChange={e => upBase('rev', +e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--color-border-secondary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: 13 }}>
              {REV_LABELS.map((r, i) => <option key={r} value={i}>{r}</option>)}
            </select>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>Predicted score</div>
            <div style={{ fontSize: 42, fontWeight: 700, color: 'var(--color-text-primary)' }}>{bScore}%</div>
          </div>
        </div>

        {/* Scenario panel */}
        <div style={{ background: 'var(--color-background-secondary)', borderRadius: 16, padding: '20px', border: `1px solid ${diff > 0 ? 'rgba(52,211,153,0.4)' : diff < 0 ? 'rgba(239,68,68,0.4)' : 'var(--color-border-tertiary)'}` }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#a78bfa', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.8px' }}>What if I change these?</div>
          <Slider label="Study hours/day" k="study" min={0} max={12} step={0.5} val={scen.study} onChange={upScen} accentColor="#a78bfa" suffix="h" />
          <Slider label="Attendance" k="att" min={0} max={100} step={5} val={scen.att} onChange={upScen} accentColor="#a78bfa" suffix="%" />
          <Slider label="Sleep hours" k="sleep" min={3} max={10} step={0.5} val={scen.sleep} onChange={upScen} accentColor="#a78bfa" suffix="h" />
          <Slider label="Stress level" k="stress" min={1} max={5} val={scen.stress} onChange={upScen} accentColor="#ef4444" suffix="/5" />
          <Slider label="Motivation" k="motiv" min={1} max={5} val={scen.motiv} onChange={upScen} accentColor="#a78bfa" suffix="/5" />
          <Slider label="Consistency" k="consist" min={1} max={5} val={scen.consist} onChange={upScen} accentColor="#a78bfa" suffix="/5" />
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 5 }}>Revision habit</div>
            <select value={scen.rev} onChange={e => upScen('rev', +e.target.value)}
              style={{ width: '100%', padding: '7px 10px', borderRadius: 8, border: '1px solid var(--color-border-secondary)', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)', fontSize: 13 }}>
              {REV_LABELS.map((r, i) => <option key={r} value={i}>{r}</option>)}
            </select>
          </div>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>New predicted score</div>
            <div style={{ fontSize: 42, fontWeight: 700, color: scoreColor(diff) }}>{sScore}%</div>
            {diff !== 0 && (
              <div style={{ fontSize: 14, fontWeight: 600, color: scoreColor(diff), marginTop: 4 }}>
                {diff > 0 ? '+' : ''}{diff} points {diff > 0 ? '↑' : '↓'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Impact section */}
      <div style={{ background: 'var(--color-background-secondary)', borderRadius: 16, padding: '20px', marginBottom: 16, border: '1px solid var(--color-border-tertiary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Impact per change — from your baseline</span>
          <button onClick={saveScenario}
            style={{ fontSize: 12, padding: '6px 16px', borderRadius: 999, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.35)', color: '#a78bfa', cursor: 'pointer', fontWeight: 600 }}>
            Save scenario
          </button>
        </div>

        {/* Tab toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['bars', 'cards'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ fontSize: 12, padding: '5px 14px', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontWeight: 500,
                background: activeTab === tab ? 'rgba(167,139,250,0.15)' : 'transparent',
                color: activeTab === tab ? '#a78bfa' : 'var(--color-text-secondary)',
                borderColor: activeTab === tab ? 'rgba(167,139,250,0.4)' : 'var(--color-border-secondary)',
              }}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'bars' ? (
          <div>
            {impacts.map(i => {
              const pct = Math.round(Math.abs(i.val) / maxAbs * 100);
              const col = i.val > 0 ? '#34d399' : '#ef4444';
              return (
                <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', width: 130, flexShrink: 0 }}>{i.label}</div>
                  <div style={{ flex: 1, height: 6, background: 'var(--color-border-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 3, background: col, width: `${pct}%`, transition: 'width 0.3s ease' }} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: col, width: 36, textAlign: 'right' }}>{i.val > 0 ? '+' : ''}{i.val}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {impacts.map(i => {
              const pos = i.val > 0;
              return (
                <div key={i.label} style={{ background: pos ? 'rgba(52,211,153,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${pos ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: 10, padding: '10px 14px', minWidth: 100, flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginBottom: 4 }}>{i.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: pos ? '#34d399' : '#ef4444' }}>{i.val > 0 ? '+' : ''}{i.val}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Insights */}
      <div style={{ background: 'var(--color-background-secondary)', borderRadius: 16, padding: '20px', marginBottom: 16, border: '1px solid var(--color-border-tertiary)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Smart insights</div>
        {getInsights().map((ins, i) => {
          const c = INSIGHT_COLORS[ins.type];
          return (
            <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: '12px 14px', marginBottom: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 15, color: c.text, flexShrink: 0, marginTop: 1 }}>
                {ins.type === 'danger' ? '⚠️' : ins.type === 'warning' ? '💤' : ins.type === 'success' ? '✅' : '💡'}
              </span>
              <span style={{ fontSize: 13, color: c.text, lineHeight: 1.6 }}>{ins.text}</span>
            </div>
          );
        })}
      </div>

      {/* Saved scenarios */}
      {history.length > 0 && (
        <div style={{ background: 'var(--color-background-secondary)', borderRadius: 16, padding: '20px', border: '1px solid var(--color-border-tertiary)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Saved scenarios</div>
          {history.map((h, i) => {
            const d = h.score - h.base;
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < history.length - 1 ? '1px solid var(--color-border-tertiary)' : 'none' }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{h.label}</span>
                  <span style={{ fontSize: 11, color: 'var(--color-text-tertiary)', marginLeft: 8 }}>{h.changes}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: scoreColor(d), fontWeight: 500 }}>{d > 0 ? '+' : ''}{d} pts</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: scoreColor(d) }}>{h.score}%</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}