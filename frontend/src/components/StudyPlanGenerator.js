import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:8000';

const STREAM_SUBJECTS = {
  Engineering: ["Mathematics", "Physics", "Chemistry", "Programming", "Electronics", "English"],
  Science:     ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Computer Science"],
  Commerce:    ["Accountancy", "Economics", "Business Studies", "Mathematics", "English"],
  Arts:        ["History", "Geography", "Political Science", "English Literature", "Psychology"],
  Other:       ["Core Subject 1", "Core Subject 2", "Core Subject 3", "English", "Mathematics"],
};

const PRIORITY_CONFIG = {
  Critical: { color: "#f87171", bg: "rgba(248,113,113,0.10)", border: "rgba(248,113,113,0.25)", icon: "🚨" },
  High:     { color: "#fb923c", bg: "rgba(251,146,60,0.10)",  border: "rgba(251,146,60,0.25)",  icon: "🔥" },
  Medium:   { color: "#fbbf24", bg: "rgba(251,191,36,0.10)",  border: "rgba(251,191,36,0.25)",  icon: "⚡" },
  Low:      { color: "#34d399", bg: "rgba(52,211,153,0.10)",  border: "rgba(52,211,153,0.25)",  icon: "✅" },
};

const WEEK_COLORS = ["#818cf8", "#f472b6", "#34d399", "#fbbf24"];

const BADGES = [
  { id: "first_task",  icon: "⭐", label: "First Step",    desc: "Completed first task",    need: 1   },
  { id: "five_tasks",  icon: "🔥", label: "On Fire",       desc: "5 tasks completed",        need: 5   },
  { id: "ten_tasks",   icon: "💪", label: "Warrior",       desc: "10 tasks completed",       need: 10  },
  { id: "streak3",     icon: "🎯", label: "3-Day Streak",  desc: "3 days in a row",          streak: 3 },
  { id: "streak7",     icon: "🏆", label: "Week Champ",    desc: "7-day streak",             streak: 7 },
  { id: "all_week",    icon: "✨", label: "Week Complete", desc: "All tasks in a week done", week: true},
];

const todayKey = () => new Date().toISOString().split("T")[0];

function generatePlan(profile) {
  const { stream, prev_score, attendance, study_hrs, consistency,
          stress, motivation, sleep, focus, revision, challenge,
          study_time, exam_days } = profile;
  const gap = Math.max(0, 75.2 - prev_score);
  const targetScore = Math.min(100, prev_score + gap * 1.3 + (motivation - 3) * 3);
  const recommended_hrs = Math.min(8, Math.max(2, study_hrs + (gap > 20 ? 2 : gap > 10 ? 1 : 0.5)));
  const totalDays = Math.min(exam_days, 28);
  const weeks = Math.ceil(totalDays / 7);
  const subjectList = STREAM_SUBJECTS[stream] || STREAM_SUBJECTS.Other;
  const weakAreas = [];
  if (study_hrs < 3)     weakAreas.push({ area:"Study Time",  severity:"Critical", current:`${study_hrs}h/day`, target:`${recommended_hrs}h/day`, tip:"Students averaging 4+hrs score 12 points higher in our dataset." });
  if (attendance < 75)   weakAreas.push({ area:"Attendance",  severity:"Critical", current:`${attendance}%`,    target:"≥75%",                    tip:"61% of high-scorers had attendance above 80%." });
  if (revision==="Before exams only"||revision==="Rarely")
                         weakAreas.push({ area:"Revision",    severity:"High",     current:revision,           target:"Daily/Weekly",             tip:"Daily revisers score 82% avg vs 68% for exam-only." });
  if (stress >= 4)       weakAreas.push({ area:"Stress",      severity:"High",     current:`Level ${stress}/5`,target:"Level ≤3",                 tip:"High stress correlates with 9pt lower score in our data." });
  if (sleep < 6)         weakAreas.push({ area:"Sleep",       severity:"High",     current:`${sleep}h`,        target:"7-8h",                     tip:"Top scorers sleep 7.8h avg. Sleep before 12 AM." });
  if (focus <= 2)        weakAreas.push({ area:"Focus",       severity:"Medium",   current:`Level ${focus}/5`, target:"Level ≥4",                 tip:"Try Pomodoro: 25min study + 5min break cycles." });
  if (motivation <= 2)   weakAreas.push({ area:"Motivation",  severity:"Medium",   current:`Level ${motivation}/5`, target:"Level ≥4",            tip:"Set micro-goals. Each small win builds momentum." });
  const weekTaskBank = {
    Foundation:       [`Cover all basic concepts in ${subjectList[0]}`,`Make short notes for each topic studied today`,`Solve 10 basic questions per subject`,`Attend all classes — target 80%+ attendance`,`List your 3 weakest topics this week`],
    Practice:         [`Solve 20 past-year questions (timed)`,`Cover ${subjectList[1]||subjectList[0]} completely`,`Weekly self-test — no cheating`,`Review mistakes — write an error log`,`Attempt 1 full mock paper`],
    Revision:         [`Revise ALL topics at least once`,`Focus on weak areas from Week 1–2`,`Make formula sheets + quick reference cards`,`Mock test every alternate day`,`Reduce screen time to under 1h`],
    "Mock & Polish":  [`Full mock test under exam conditions`,`Review only weak spots — no new topics`,`Sleep 8h — memory consolidation`,`Light exercise + healthy eating today`,`Review your best work — build confidence`],
  };
  const phases = ["Foundation","Practice","Revision","Mock & Polish"];
  const weekPlans = Array.from({ length: Math.min(weeks, 4) }, (_, w) => {
    const phase = phases[w] || phases[3];
    return { week: w+1, phase, color: WEEK_COLORS[w], days: `Day ${w*7+1}–${Math.min((w+1)*7, totalDays)}`, tasks: weekTaskBank[phase], target: `Complete ${Math.round(100/Math.min(weeks,4)*(w+1))}% syllabus`, study_hrs_day: recommended_hrs+(w===3?1:0) };
  });
  const scheduleTemplate = {
    Morning:   [{time:"6:00–7:00 AM",task:"Light revision — previous day notes"},{time:"7:00–9:00 AM",task:"Deep study — hardest subject first"},{time:"4:00–6:00 PM",task:"Practice problems + MCQs"},{time:"9:00–9:30 PM",task:"Quick recap + plan tomorrow"}],
    Afternoon: [{time:"8:00–9:00 AM",task:"Light revision + goal setting"},{time:"12:00–2:00 PM",task:"Deep study — hardest subject"},{time:"3:00–5:00 PM",task:"Practice problems + MCQs"},{time:"9:00–9:30 PM",task:"Quick recap + notes review"}],
    Night:     [{time:"6:00–7:00 PM",task:"Warm-up — previous day revision"},{time:"8:00–10:00 PM",task:"Deep study — hardest subject"},{time:"10:00–11:30 PM",task:"Practice problems + MCQs"},{time:"11:30 PM",task:"Notes summary — sleep by 12 AM"}],
  };
  const smartTips = [];
  if (challenge==="Lack of focus") smartTips.push({ icon:"🎯", title:"Focus Hack",       body:`53% of our 238 students struggle with focus. Use Pomodoro: 25min work, 5min break.` });
  if (challenge==="Stress")        smartTips.push({ icon:"🧘", title:"Stress Protocol",  body:"Box breathing (4-4-4-4) before study. 20min walk = better sleep quality." });
  if (challenge==="Lack of time")  smartTips.push({ icon:"⏰", title:"Time Audit",       body:"Track your day for 3 days — you'll find 2-3h hidden. Cut screen time first." });
  smartTips.push({ icon:"📊", title:"Dataset Insight",   body:`Students who study ${recommended_hrs}+hrs/day with daily revision score avg 82.3%. You're targeting ${Math.round(targetScore)}%.` });
  if (sleep < 7) smartTips.push({ icon:"😴", title:"Sleep Science",   body:`You sleep ${sleep}h. Top scorers (≥85%) sleep 7.8h avg. Sleep before 12 AM for REM memory.` });
  smartTips.push({ icon:"🔄", title:"Spaced Repetition", body:"Revise after 1 day, 3 days, 7 days. Daily revisers score 82% avg vs 68% for exam-only revisers." });
  return { targetScore: Math.round(targetScore), recommended_hrs, weakAreas, weekPlans, dailySchedule: scheduleTemplate[study_time]||scheduleTemplate.Night, smartTips, totalDays, subjectList };
}

const S = {
  card: (ex={}) => ({ background:"var(--color-background-secondary)", border:"1px solid var(--color-border-tertiary)", borderRadius:12, padding:20, marginBottom:16, ...ex }),
  lbl:  { fontSize:11, fontWeight:600, color:"var(--color-text-tertiary)", textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:5, display:"block" },
  inp:  { width:"100%", background:"var(--color-background-primary)", border:"1px solid var(--color-border-secondary)", borderRadius:7, padding:"8px 11px", color:"var(--color-text-primary)", fontSize:13, fontFamily:"inherit", outline:"none" },
  rv:   (c) => ({ background:`${c}20`, color:c, border:`1px solid ${c}40`, borderRadius:6, padding:"3px 10px", fontSize:12, fontWeight:700, minWidth:40, textAlign:"center" }),
  btnP: { background:"linear-gradient(135deg,#6366f1,#818cf8)", color:"#fff", border:"none", borderRadius:8, padding:"11px 24px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", width:"100%" },
};

function ProgressRing({ pct, color, size=64, stroke=5 }) {
  const r = (size-stroke*2)/2, circ = 2*Math.PI*r, offset = circ-(pct/100)*circ;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{transition:"stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)"}}/>
    </svg>
  );
}

function BadgeChip({ badge, earned }) {
  return (
    <div title={badge.desc} style={{
      display:"flex", flexDirection:"column", alignItems:"center", gap:4,
      padding:"10px 8px", borderRadius:10, width:72, cursor:"default",
      background: earned ? "rgba(129,140,248,0.12)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${earned ? "rgba(129,140,248,0.3)" : "rgba(255,255,255,0.06)"}`,
      opacity: earned ? 1 : 0.4, transition:"all .2s",
    }}>
      <span style={{fontSize:22, filter: earned?"none":"grayscale(1)"}}>{badge.icon}</span>
      <span style={{fontSize:10, fontWeight:600, color: earned?"#818cf8":"var(--color-text-tertiary)", textAlign:"center", lineHeight:1.3}}>{badge.label}</span>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────────────────
export default function StudyPlanGenerator({ initialProfile = null, autoStart = false, onPlanGenerated = null, user = null }) {
  const [step, setStep] = useState(autoStart && initialProfile ? "auto" : "form");
  const [plan, setPlan]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeWeek, setActiveWeek] = useState(0);

  // Load from DB on mount
  const [taskDone, setTaskDone]   = useState({});
  const [streakData, setStreakData] = useState({ days:[], count:0 });
  const [xp, setXp]               = useState(0);
  const [dbLoaded, setDbLoaded]   = useState(false);

  // Load progress from DB when user is available
  useEffect(() => {
    if (user) {
      axios.get(`${API}/my-progress`)
        .then(r => {
          setTaskDone(r.data.task_done || {});
          setXp(r.data.total_xp || 0);
          setStreakData({ days: r.data.streak_days || [], count: r.data.streak_count || 0 });
        })
        .catch(() => {
          // Fallback to localStorage
          try {
            setTaskDone(JSON.parse(localStorage.getItem("esp_tasks") || "{}"));
            setXp(parseInt(localStorage.getItem("esp_xp") || "0"));
            setStreakData(JSON.parse(localStorage.getItem("esp_streak") || '{"days":[],"count":0}'));
          } catch {}
        })
        .finally(() => setDbLoaded(true));
    } else {
      // No user — use localStorage
      try {
        setTaskDone(JSON.parse(localStorage.getItem("esp_tasks") || "{}"));
        setXp(parseInt(localStorage.getItem("esp_xp") || "0"));
        setStreakData(JSON.parse(localStorage.getItem("esp_streak") || '{"days":[],"count":0}'));
      } catch {}
      setDbLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    if (!profile) {
      setProfile(initialProfile || {
        stream:"Engineering", prev_score:65, attendance:75, study_hrs:3,
        consistency:3, stress:3, motivation:3, sleep:7, focus:3,
        revision:"Before exams only", challenge:"Lack of focus",
        study_time:"Night", exam_days:28, target_score:80,
      });
    }
  }, []);


  // autoStart: when resuming saved plan, skip form and go straight to plan view
  useEffect(() => {
    if (step === "auto" && profile) {
      const generated = generatePlan(profile);
      setPlan(generated);
      setStep("plan");
      setActiveWeek(0);
    }
  }, [step, profile]);

  const doneTasks  = Object.values(taskDone).filter(Boolean).length;
  const totalTasks = plan ? plan.weekPlans.reduce((a,w)=>a+w.tasks.length,0) : 0;
  const overallPct = totalTasks > 0 ? Math.round((doneTasks/totalTasks)*100) : 0;
  const streak     = streakData.count;
  const level      = Math.floor(xp/50)+1;
  const xpInLevel  = xp%50;
  const todayDone  = plan ? plan.weekPlans[activeWeek]?.tasks.filter((_,ti)=>taskDone[`${activeWeek}-${ti}`]).length||0 : 0;
  const todayTotal = plan?.weekPlans[activeWeek]?.tasks.length||0;

  const earnedBadges = BADGES.reduce((acc,b) => {
    if (b.need   && doneTasks>=b.need)   acc[b.id]=true;
    if (b.streak && streak>=b.streak)    acc[b.id]=true;
    if (b.week && plan) {
      const anyFull = plan.weekPlans.some((_,wi)=>plan.weekPlans[wi].tasks.every((_,ti)=>taskDone[`${wi}-${ti}`]));
      if (anyFull) acc[b.id]=true;
    }
    return acc;
  }, {});

  const toggleTask = (weekIdx, taskIdx) => {
    const key = `${weekIdx}-${taskIdx}`;
    const wasDone = taskDone[key];
    const newDone = !wasDone;
    const newXp   = Math.max(0, xp+(newDone?10:-10));
    const today   = todayKey();

    setTaskDone(p => ({...p, [key]: newDone}));
    setXp(newXp);

    let newStreak = streakData;
    if (newDone) {
      setStreakData(prev => {
        const days = prev.days||[];
        if (days.includes(today)) return prev;
        const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
        const yKey = yesterday.toISOString().split("T")[0];
        const newDays = [...days, today].slice(-30);
        const newCount = days.includes(yKey) ? prev.count+1 : 1;
        newStreak = {days:newDays, count:newCount};
        return newStreak;
      });
    }

    // Save to DB
    if (user) {
      axios.post(`${API}/save-task`, { week_idx:weekIdx, task_idx:taskIdx, is_done:newDone, xp:newDone?10:0 })
        .catch(e => console.log('task save error', e));
      if (newDone) {
        axios.post(`${API}/save-streak`, { date_key:today, streak_count:streakData.count, xp:newXp })
          .catch(e => console.log('streak save error', e));
      }
    } else {
      localStorage.setItem("esp_tasks", JSON.stringify({...taskDone, [key]:newDone}));
      localStorage.setItem("esp_xp", String(newXp));
    }
  };

  const up = (k,v) => setProfile(p=>({...p,[k]:v}));

  const handleGenerate = () => {
    const generated = generatePlan(profile);
    setPlan(generated);
    setStep("plan");
    setActiveWeek(0);
    // Notify parent to save plan
    if (onPlanGenerated) {
      onPlanGenerated(profile, {
        targetScore: generated.targetScore,
        recommended_hrs: generated.recommended_hrs,
        totalDays: generated.totalDays,
        weakAreasCount: generated.weakAreas.length,
      });
    }
  };

  if (!profile) return null;

  // ✅ Guard: autoStart is still generating the plan (useEffect hasn't fired yet)
  if (step === "auto" || (step === "plan" && !plan)) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, gap: 12, color: "var(--color-text-secondary)" }}>
      <div style={{ width: 24, height: 24, border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#818cf8", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <span style={{ fontSize: 14 }}>Loading your plan...</span>
    </div>
  );

  // ── FORM ──────────────────────────────────────────────────────────────────
  if (step === "form") return (
    <div style={{fontFamily:"Inter,sans-serif", color:"var(--color-text-primary)", maxWidth:860, margin:"0 auto"}}>
      <div style={{background:"linear-gradient(135deg,rgba(99,102,241,0.12),rgba(34,211,238,0.06))", border:"1px solid rgba(129,140,248,0.18)", borderRadius:14, padding:"22px 26px", marginBottom:22}}>
        <div style={{fontSize:21, fontWeight:700, background:"linear-gradient(135deg,#e2e8f0,#818cf8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:5}}>
          📅 Personalised Study Plan Generator
        </div>
        <div style={{fontSize:13, color:"var(--color-text-secondary)", lineHeight:1.6}}>
          Plan generated from <strong style={{color:"#818cf8"}}>238 real student responses</strong>. Earn XP, build streaks, unlock badges as you complete tasks.
          {user && <span style={{color:"#34d399", marginLeft:8}}>✅ Your data will be saved to the database</span>}
        </div>
      </div>

      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
        <div>
          <div style={S.card()}>
            <div style={{fontSize:13, fontWeight:600, marginBottom:14}}>Academic Profile</div>
            <div style={{marginBottom:12}}>
              <label style={S.lbl}>Stream</label>
              <select value={profile.stream} onChange={e=>up("stream",e.target.value)} style={S.inp}>
                {Object.keys(STREAM_SUBJECTS).map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            {[
              {k:"prev_score",  lbl:"Previous Score (%)", max:100, color:"#818cf8", unit:"%"},
              {k:"attendance",  lbl:"Attendance (%)",     max:100, color:"#60a5fa", unit:"%"},
              {k:"study_hrs",   lbl:"Daily Study Hours",  max:12,  color:"#f472b6", unit:"h", step:0.5},
              {k:"target_score",lbl:"Target Score (%)",   max:100, color:"#34d399", unit:"%"},
            ].map(f=>(
              <div key={f.k} style={{marginBottom:12}}>
                <label style={S.lbl}>{f.lbl}</label>
                <div style={{display:"flex", gap:8, alignItems:"center"}}>
                  <input type="range" min={0} max={f.max} step={f.step||1} value={profile[f.k]}
                    onChange={e=>up(f.k,+e.target.value)} style={{flex:1, accentColor:f.color}}/>
                  <span style={S.rv(f.color)}>{profile[f.k]}{f.unit}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={S.card()}>
            <div style={{fontSize:13, fontWeight:600, marginBottom:14}}>Exam Timeline</div>
            <div style={{marginBottom:12}}>
              <label style={S.lbl}>Days Until Exam</label>
              <div style={{display:"flex", gap:8, alignItems:"center"}}>
                <input type="range" min={7} max={90} value={profile.exam_days} onChange={e=>up("exam_days",+e.target.value)} style={{flex:1, accentColor:"#f472b6"}}/>
                <span style={S.rv("#f472b6")}>{profile.exam_days}d</span>
              </div>
              <div style={{fontSize:11, color:"var(--color-text-tertiary)", marginTop:5}}>
                {profile.exam_days<=14?"⚠️ Very short — intensive plan":profile.exam_days<=28?"📅 4-week plan":"📅 Extended plan — steady pace"}
              </div>
            </div>
            <div style={{marginBottom:12}}>
              <label style={S.lbl}>Preferred Study Time</label>
              <select value={profile.study_time} onChange={e=>up("study_time",e.target.value)} style={S.inp}>
                <option>Morning</option><option>Afternoon</option><option>Night</option>
              </select>
            </div>
            <div>
              <label style={S.lbl}>Current Revision Habit</label>
              <select value={profile.revision} onChange={e=>up("revision",e.target.value)} style={S.inp}>
                <option>Daily</option><option>Weekly</option><option>Before exams only</option><option>Rarely</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <div style={S.card()}>
            <div style={{fontSize:13, fontWeight:600, marginBottom:14}}>Wellbeing & Habits</div>
            {[
              {k:"stress",      lbl:"Stress Level",  max:5, color:"#f87171", unit:"/5"},
              {k:"motivation",  lbl:"Motivation",    max:5, color:"#34d399", unit:"/5"},
              {k:"sleep",       lbl:"Sleep Hours",   max:10, color:"#60a5fa", unit:"h", min:3},
              {k:"focus",       lbl:"Focus Ability", max:5, color:"#fbbf24", unit:"/5"},
              {k:"consistency", lbl:"Consistency",   max:5, color:"#c084fc", unit:"/5"},
            ].map(f=>(
              <div key={f.k} style={{marginBottom:12}}>
                <label style={S.lbl}>{f.lbl}</label>
                <div style={{display:"flex", gap:8, alignItems:"center"}}>
                  <input type="range" min={f.min||1} max={f.max} value={profile[f.k]}
                    onChange={e=>up(f.k,+e.target.value)} style={{flex:1, accentColor:f.color}}/>
                  <span style={S.rv(f.color)}>{profile[f.k]}{f.unit}</span>
                </div>
              </div>
            ))}
            <div>
              <label style={S.lbl}>Biggest Challenge</label>
              <select value={profile.challenge} onChange={e=>up("challenge",e.target.value)} style={S.inp}>
                <option>Lack of focus</option><option>Stress</option><option>Lack of time</option><option>Poor teaching</option><option>Other</option>
              </select>
            </div>
          </div>

          <div style={S.card()}>
            <div style={{fontSize:13, fontWeight:600, marginBottom:12}}>Quick Summary</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:16}}>
              {[
                {lbl:"Score Gap", val:`${Math.max(0,75-profile.prev_score).toFixed(0)}pts`, color:profile.prev_score<60?"#f87171":"#fbbf24"},
                {lbl:"Need",      val:`${Math.min(8,profile.study_hrs+(75-profile.prev_score>20?2:1)).toFixed(1)}h/day`, color:"#818cf8"},
                {lbl:"Risk",      val:profile.prev_score<60?"High":profile.prev_score<75?"Medium":"Low", color:profile.prev_score<60?"#f87171":profile.prev_score<75?"#fbbf24":"#34d399"},
              ].map(s=>(
                <div key={s.lbl} style={{background:`${s.color}10`, border:`1px solid ${s.color}25`, borderRadius:8, padding:"10px 8px", textAlign:"center"}}>
                  <div style={{fontSize:17, fontWeight:700, color:s.color}}>{s.val}</div>
                  <div style={{fontSize:10, color:"var(--color-text-tertiary)", marginTop:2}}>{s.lbl}</div>
                </div>
              ))}
            </div>
            <button onClick={handleGenerate} style={S.btnP}>🚀 Generate My Study Plan</button>
            <div style={{fontSize:11, color:"var(--color-text-tertiary)", textAlign:"center", marginTop:8}}>
              {user ? "✅ Tasks & streak will be auto-saved to the database" : "Earn XP + badges as you complete tasks"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ── PLAN VIEW ─────────────────────────────────────────────────────────────
  const currentWeek = plan.weekPlans[activeWeek];
  return (
    <div style={{fontFamily:"Inter,sans-serif", color:"var(--color-text-primary)"}}>
      {/* Top bar */}
      <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:18, flexWrap:"wrap"}}>
        <button onClick={()=>setStep("form")} style={{background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, padding:"6px 14px", color:"var(--color-text-secondary)", cursor:"pointer", fontSize:13, fontFamily:"inherit"}}>
          ← Edit Profile
        </button>
        <div style={{fontSize:15, fontWeight:700}}>Your {plan.totalDays}-Day Study Plan</div>
        <div style={{marginLeft:"auto", display:"flex", alignItems:"center", gap:10}}>
          <div style={{display:"flex", alignItems:"center", gap:8, background:"rgba(129,140,248,0.1)", border:"1px solid rgba(129,140,248,0.2)", borderRadius:999, padding:"5px 12px"}}>
            <span style={{fontSize:12, color:"#818cf8", fontWeight:700}}>Lv.{level}</span>
            <div style={{width:70, height:5, background:"rgba(255,255,255,0.08)", borderRadius:3, overflow:"hidden"}}>
              <div style={{height:"100%", width:`${(xpInLevel/50)*100}%`, background:"linear-gradient(90deg,#6366f1,#818cf8)", borderRadius:3, transition:"width .4s"}}/>
            </div>
            <span style={{fontSize:11, color:"var(--color-text-tertiary)"}}>{xp} XP</span>
          </div>
          {streak>0 && (
            <div style={{display:"flex", alignItems:"center", gap:5, background:"rgba(251,191,36,0.1)", border:"1px solid rgba(251,191,36,0.25)", borderRadius:999, padding:"5px 12px"}}>
              <span style={{fontSize:13}}>🔥</span>
              <span style={{fontSize:12, fontWeight:700, color:"#fbbf24"}}>{streak} day streak</span>
            </div>
          )}
          {user && <span style={{fontSize:11, color:"#34d399", background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.2)", borderRadius:999, padding:"5px 10px"}}>✅ Auto-saving</span>}
        </div>
      </div>

      {/* Stats row */}
      <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:18}}>
        <div style={{...S.card({marginBottom:0,padding:16}), display:"flex", alignItems:"center", gap:12}}>
          <div style={{position:"relative", width:64, height:64, flexShrink:0}}>
            <ProgressRing pct={overallPct} color="#818cf8"/>
            <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
              <span style={{fontSize:14, fontWeight:800, color:"#818cf8"}}>{overallPct}%</span>
            </div>
          </div>
          <div>
            <div style={{fontSize:11, color:"var(--color-text-tertiary)", marginBottom:3}}>Overall</div>
            <div style={{fontSize:13, fontWeight:600}}>{doneTasks}/{totalTasks}</div>
            <div style={{fontSize:11, color:"var(--color-text-tertiary)"}}>tasks done</div>
          </div>
        </div>
        <div style={{...S.card({marginBottom:0,padding:16}), display:"flex", alignItems:"center", gap:12}}>
          <div style={{position:"relative", width:64, height:64, flexShrink:0}}>
            <ProgressRing pct={todayTotal>0?Math.round((todayDone/todayTotal)*100):0} color="#34d399"/>
            <div style={{position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center"}}>
              <span style={{fontSize:14, fontWeight:800, color:"#34d399"}}>{todayTotal>0?Math.round((todayDone/todayTotal)*100):0}%</span>
            </div>
          </div>
          <div>
            <div style={{fontSize:11, color:"var(--color-text-tertiary)", marginBottom:3}}>This Week</div>
            <div style={{fontSize:13, fontWeight:600}}>{todayDone}/{todayTotal}</div>
            <div style={{fontSize:11, color:"var(--color-text-tertiary)"}}>tasks done</div>
          </div>
        </div>
        <div style={{...S.card({marginBottom:0,padding:16}), textAlign:"center"}}>
          <div style={{fontSize:11, color:"var(--color-text-tertiary)", marginBottom:4}}>Target Score</div>
          <div style={{fontSize:32, fontWeight:800, color:"#f472b6", lineHeight:1}}>{plan.targetScore}%</div>
          <div style={{fontSize:11, color:"var(--color-text-tertiary)", marginTop:4}}>from {profile.prev_score}%</div>
        </div>
        <div style={{...S.card({marginBottom:0,padding:16}), textAlign:"center"}}>
          <div style={{fontSize:11, color:"var(--color-text-tertiary)", marginBottom:4}}>Study Streak</div>
          <div style={{fontSize:32, fontWeight:800, color:"#fbbf24", lineHeight:1}}>{streak}</div>
          <div style={{fontSize:11, color:"var(--color-text-tertiary)", marginTop:4}}>days 🔥</div>
        </div>
      </div>

      {/* Badges */}
      <div style={S.card({marginBottom:18})}>
        <div style={{fontSize:13, fontWeight:600, marginBottom:12}}>🏅 Badges</div>
        <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
          {BADGES.map(b=><BadgeChip key={b.id} badge={b} earned={!!earnedBadges[b.id]}/>)}
        </div>
        <div style={{fontSize:11, color:"var(--color-text-tertiary)", marginTop:10}}>
          Complete tasks to earn XP and unlock badges. Each task = +10 XP.
          {user && " · All data is being saved to the database ✅"}
        </div>
      </div>

      {/* Weak areas */}
      {plan.weakAreas.length>0 && (
        <div style={S.card()}>
          <div style={{fontSize:13, fontWeight:600, marginBottom:12}}>⚠️ Weak Areas — based on your profile</div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:10}}>
            {plan.weakAreas.map((w,i)=>{
              const cfg=PRIORITY_CONFIG[w.severity];
              return (
                <div key={i} style={{background:cfg.bg, border:`1px solid ${cfg.border}`, borderRadius:9, padding:"11px 13px"}}>
                  <div style={{display:"flex", alignItems:"center", gap:7, marginBottom:4}}>
                    <span>{cfg.icon}</span>
                    <span style={{fontWeight:600, fontSize:12.5, color:cfg.color}}>{w.area}</span>
                    <span style={{marginLeft:"auto", fontSize:10, padding:"2px 7px", borderRadius:999, background:`${cfg.color}20`, color:cfg.color, fontWeight:600}}>{w.severity}</span>
                  </div>
                  <div style={{fontSize:11.5, color:"var(--color-text-secondary)", marginBottom:4}}>
                    Now: <strong>{w.current}</strong> → Target: <strong style={{color:cfg.color}}>{w.target}</strong>
                  </div>
                  <div style={{fontSize:11, color:"var(--color-text-tertiary)", lineHeight:1.5}}>{w.tip}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week tabs + checklist */}
      <div style={S.card()}>
        <div style={{display:"flex", gap:8, marginBottom:18, flexWrap:"wrap"}}>
          {plan.weekPlans.map((w,i)=>{
            const wDone=w.tasks.filter((_,ti)=>taskDone[`${i}-${ti}`]).length;
            const wPct=Math.round((wDone/w.tasks.length)*100);
            return (
              <button key={i} onClick={()=>setActiveWeek(i)} style={{
                padding:"7px 16px", borderRadius:999, fontSize:13, cursor:"pointer",
                fontWeight:600, fontFamily:"inherit", display:"flex", alignItems:"center", gap:7,
                background: activeWeek===i ? w.color : "transparent",
                color: activeWeek===i ? "#fff" : "var(--color-text-secondary)",
                border: `1px solid ${activeWeek===i ? w.color : "var(--color-border-secondary)"}`,
                transition:"all .15s",
              }}>
                Week {w.week} · {w.phase}
                <span style={{fontSize:10, padding:"1px 7px", borderRadius:999, fontWeight:700,
                  background: activeWeek===i?"rgba(255,255,255,0.2)":`${w.color}20`,
                  color: activeWeek===i?"#fff":w.color}}>{wPct}%</span>
              </button>
            );
          })}
        </div>

        {currentWeek && (
          <>
            <div style={{display:"flex", alignItems:"center", gap:10, marginBottom:12}}>
              <div style={{width:10, height:10, borderRadius:"50%", background:currentWeek.color}}/>
              <div style={{fontSize:14, fontWeight:700}}>{currentWeek.phase} Phase</div>
              <span style={{fontSize:12, color:"var(--color-text-tertiary)"}}>{currentWeek.days}</span>
              <span style={{fontSize:12, fontWeight:600, color:currentWeek.color, marginLeft:"auto"}}>{currentWeek.target}</span>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{display:"flex", justifyContent:"space-between", fontSize:11, color:"var(--color-text-tertiary)", marginBottom:4}}>
                <span>Week progress</span>
                <span>{currentWeek.tasks.filter((_,ti)=>taskDone[`${activeWeek}-${ti}`]).length}/{currentWeek.tasks.length} tasks</span>
              </div>
              <div style={{height:5, background:"rgba(255,255,255,0.07)", borderRadius:3, overflow:"hidden"}}>
                <div style={{height:"100%", width:`${Math.round((currentWeek.tasks.filter((_,ti)=>taskDone[`${activeWeek}-${ti}`]).length/currentWeek.tasks.length)*100)}%`, background:currentWeek.color, borderRadius:3, transition:"width .4s"}}/>
              </div>
            </div>
            <div style={{display:"grid", gap:8}}>
              {currentWeek.tasks.map((task,ti)=>{
                const key=`${activeWeek}-${ti}`;
                const done=taskDone[key];
                const day=["Mon","Tue","Wed","Thu","Fri"][ti]||`Day ${ti+1}`;
                return (
                  <div key={ti} onClick={()=>toggleTask(activeWeek,ti)} style={{
                    display:"flex", alignItems:"center", gap:12, padding:"12px 14px",
                    borderRadius:9, cursor:"pointer",
                    background: done?`${currentWeek.color}0d`:"rgba(255,255,255,0.025)",
                    border: `1px solid ${done?currentWeek.color+"40":"rgba(255,255,255,0.06)"}`,
                    transition:"all .18s",
                  }}>
                    <div style={{width:20, height:20, borderRadius:5, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", border:`2px solid ${done?currentWeek.color:"rgba(255,255,255,0.2)"}`, background:done?currentWeek.color:"transparent", transition:"all .18s"}}>
                      {done && <span style={{color:"#fff", fontSize:11, fontWeight:800}}>✓</span>}
                    </div>
                    <span style={{fontSize:11, fontWeight:700, color:done?currentWeek.color:"var(--color-text-tertiary)", minWidth:28}}>{day}</span>
                    <span style={{fontSize:13, flex:1, color:done?"var(--color-text-tertiary)":"var(--color-text-primary)", textDecoration:done?"line-through":"none", lineHeight:1.5}}>{task}</span>
                    {done
                      ? <span style={{fontSize:10.5, color:currentWeek.color, fontWeight:700, flexShrink:0}}>+10 XP ✓</span>
                      : <span style={{fontSize:10.5, color:"var(--color-text-tertiary)", flexShrink:0}}>+10 XP</span>}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Daily schedule + tips */}
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:16}}>
        <div style={S.card({marginBottom:0})}>
          <div style={{fontSize:13, fontWeight:600, marginBottom:12}}>🕐 Daily Schedule <span style={{fontSize:11, fontWeight:400, color:"var(--color-text-tertiary)"}}>for {profile.study_time}</span></div>
          {plan.dailySchedule.map((slot,i)=>(
            <div key={i} style={{display:"flex", gap:12, padding:"9px 0", borderBottom:i<plan.dailySchedule.length-1?"1px solid rgba(255,255,255,0.05)":"none"}}>
              <div style={{fontSize:11.5, fontWeight:600, color:"#818cf8", minWidth:110, flexShrink:0}}>{slot.time}</div>
              <div style={{fontSize:12.5, color:"var(--color-text-secondary)", lineHeight:1.5}}>{slot.task}</div>
            </div>
          ))}
        </div>
        <div style={S.card({marginBottom:0})}>
          <div style={{fontSize:13, fontWeight:600, marginBottom:12}}>🧠 Dataset-Backed Tips <span style={{fontSize:11, fontWeight:400, color:"var(--color-text-tertiary)"}}>238 students</span></div>
          {plan.smartTips.map((tip,i)=>(
            <div key={i} style={{padding:"10px 12px", borderRadius:8, marginBottom:8, background:"rgba(129,140,248,0.06)", border:"1px solid rgba(129,140,248,0.12)"}}>
              <div style={{fontSize:13, fontWeight:600, marginBottom:3}}>{tip.icon} {tip.title}</div>
              <div style={{fontSize:12, color:"var(--color-text-secondary)", lineHeight:1.55}}>{tip.body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}