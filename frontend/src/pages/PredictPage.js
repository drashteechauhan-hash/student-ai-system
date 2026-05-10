import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const API = 'http://localhost:8000';

const F = ({label,name,value,options,onChange}) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <select className="form-select" value={value} onChange={e=>onChange(name,e.target.value)}>
      {options.map(o=><option key={o}>{o}</option>)}
    </select>
  </div>
);

const R = ({label,name,value,min,max,onChange}) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <div className="range-wrapper" style={{display:'flex', gap:'12px', alignItems:'center', background: 'var(--bg-elevated)', padding: '6px 12px', borderRadius: '12px', border: '1px solid var(--border2)'}}>
      <input type="range" className="range-input" min={min} max={max} value={value}
        onChange={e=>onChange(name,Number(e.target.value))}/>
      <span className="range-val">{value}</span>
    </div>
  </div>
);

const init = {
  student_name: '',
  age: 19,
  gender: 'Female',
  education_level:'Undergraduate',stream:'Engineering',
  previous_score:65,attendance:75,coaching:'No',study_hours:2,study_consistency:3,
  preferred_study_time:'Night',makes_notes:'Sometimes',revision_frequency:'Before exams only',
  sleep_hours:7,screen_time:'3–5 hours',physical_activity:'Occasionally',stress_level:3,
  motivation_level:3,exam_anxiety:3,self_confidence:3,focus_ability:3,
  study_environment:'Sometimes distracting',internet_quality:'Good',family_support:3,
  gets_distracted:'Sometimes',biggest_challenge:'Lack of focus',sets_goals:'Yes',
};

export default function PredictPage() {
  const [form,setForm] = useState(init);
  const [result,setResult] = useState(null);
  const [loading,setLoading] = useState(false);
  const [tab,setTab] = useState('recs');

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const predict = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API}/predict`,{
        ...form, previous_score:form.previous_score, attendance:form.attendance,
        study_hours:form.study_hours, sleep_hours:form.sleep_hours,
      });
      setResult(res.data);
      toast.success('Prediction complete!');
    } catch(e) {
      toast.error('API error — check backend is running');
      const sc = form.previous_score;
      setResult({
        performance_category: sc>=75?'High':sc>=55?'Medium':'Low',
        risk_level: sc<55?'High Risk':form.attendance<70?'Moderate Risk':'Low Risk',
        estimated_score_range:{predicted:Math.min(100,sc+(form.motivation_level*2)+(form.study_hours*1.5)),min:sc-8,max:sc+10},
        wellness_score:((5-form.stress_level+form.motivation_level+5-form.exam_anxiety+form.self_confidence+form.focus_ability)/5).toFixed(1),
        engagement_score:(form.study_hours*0.4+form.study_consistency*0.3+form.attendance/20*0.3).toFixed(1),
        recommendations:[
          {category:'Study',priority:'High',icon:'📚',message:'Increase daily study hours to 3-4 for meaningful progress.'},
          {category:'Revision',priority:'Medium',icon:'🔄',message:'Revise within 24h of learning for 5x better retention.'},
        ],
        weak_areas:[
          {area:'Study Hours',score:Math.min(100,form.study_hours/5*100),weak:form.study_hours<2,label:`${form.study_hours}h/day`},
          {area:'Attendance',score:form.attendance,weak:form.attendance<75,label:`${form.attendance}%`},
          {area:'Stress Mgmt',score:(5-form.stress_level)/5*100,weak:form.stress_level>3,label:`Level ${form.stress_level}/5`},
          {area:'Motivation',score:form.motivation_level/5*100,weak:form.motivation_level<3,label:`Level ${form.motivation_level}/5`},
          {area:'Focus',score:form.focus_ability/5*100,weak:form.focus_ability<3,label:`Level ${form.focus_ability}/5`},
          {area:'Sleep',score:Math.min(100,form.sleep_hours/9*100),weak:form.sleep_hours<6,label:`${form.sleep_hours}h`},
        ],
        performance_probabilities:{},risk_probabilities:{},
      });
    }
    setLoading(false);
  };

  const radarData = result ? [
    {s:'Study',v:Math.min(100,form.study_hours/5*100)},
    {s:'Attend',v:form.attendance},
    {s:'Wellness',v:parseFloat(result.wellness_score)*20},
    {s:'Motivation',v:form.motivation_level*20},
    {s:'Focus',v:form.focus_ability*20},
    {s:'Confidence',v:form.self_confidence*20},
  ] : [];

  const badgeClass = result?.performance_category==='High'?'badge-green':result?.performance_category==='Medium'?'badge-yellow':'badge-red';
  const riskBadge = result?.risk_level?.includes('High')?'badge-red':result?.risk_level?.includes('Moderate')?'badge-yellow':'badge-green';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="fade-in">
      <motion.div variants={itemVariants} className="page-header">
        <h1 className="page-title">Predict Performance</h1>
        <p className="page-subtitle">Fill in the student's details below — the AI will predict their performance and suggest improvements</p>
      </motion.div>

      <div className="grid-2-1">
        <motion.div variants={itemVariants}>
          <div className="card" style={{marginBottom:24}}>
            <div className="form-section">
              <div className="form-section-title">🎓 Academic Background</div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Student Name</label>
                  <input type="text" className="form-input" value={form.student_name} placeholder="Enter student name" onChange={e => set('student_name', e.target.value)} />
                </div>
                <F label="Gender" name="gender" value={form.gender} options={['Female','Male','Other']} onChange={set}/>
                <F label="Education Level" name="education_level" value={form.education_level} options={['School','Undergraduate','Postgraduate']} onChange={set}/>
                <F label="Stream" name="stream" value={form.stream} options={['Engineering','Medical','Science','Commerce','Arts','Other']} onChange={set}/>
                <F label="Coaching / Tuition" name="coaching" value={form.coaching} options={['No','Yes']} onChange={set}/>
                <F label="Internet Quality" name="internet_quality" value={form.internet_quality} options={['Poor','Average','Good','Excellent']} onChange={set}/>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">📊 Scores & Attendance</div>
              <div className="form-grid">
                <R label="Previous Exam Score (%)" name="previous_score" value={form.previous_score} min={0} max={100} onChange={set}/>
                <R label="Average Attendance (%)" name="attendance" value={form.attendance} min={0} max={100} onChange={set}/>
                <R label="Daily Study Hours" name="study_hours" value={form.study_hours} min={0} max={12} onChange={set}/>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">📚 Study Habits</div>
              <div className="form-grid">
                <R label="Study Consistency (1–5)" name="study_consistency" value={form.study_consistency} min={1} max={5} onChange={set}/>
                <F label="Preferred Study Time" name="preferred_study_time" value={form.preferred_study_time} options={['Morning','Afternoon','Evening','Night']} onChange={set}/>
                <F label="Makes Notes" name="makes_notes" value={form.makes_notes} options={['Never','Sometimes','Always']} onChange={set}/>
                <F label="Revision Frequency" name="revision_frequency" value={form.revision_frequency} options={['Rarely','Before exams only','Weekly','Daily']} onChange={set}/>
                <F label="Sets Daily Goals" name="sets_goals" value={form.sets_goals} options={['No','Yes']} onChange={set}/>
                <F label="Gets Distracted" name="gets_distracted" value={form.gets_distracted} options={['No','Sometimes','Yes']} onChange={set}/>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">🏃 Lifestyle</div>
              <div className="form-grid">
                <R label="Sleep Hours / Day" name="sleep_hours" value={form.sleep_hours} min={3} max={12} onChange={set}/>
                <F label="Screen Time" name="screen_time" value={form.screen_time} options={['Less than 1 hour','1–3 hours','3–5 hours','More than 5 hours']} onChange={set}/>
                <F label="Physical Activity" name="physical_activity" value={form.physical_activity} options={['Rarely','Occasionally','Regular']} onChange={set}/>
                <F label="Study Environment" name="study_environment" value={form.study_environment} options={['Quiet','Sometimes distracting','Very distracting','Noisy']} onChange={set}/>
              </div>
            </div>

            <div className="form-section">
              <div className="form-section-title">🧠 Psychometric Factors</div>
              <div className="form-grid">
                <R label="Stress Level (1-5)" name="stress_level" value={form.stress_level} min={1} max={5} onChange={set}/>
                <R label="Motivation Level (1-5)" name="motivation_level" value={form.motivation_level} min={1} max={5} onChange={set}/>
                <R label="Exam Anxiety (1-5)" name="exam_anxiety" value={form.exam_anxiety} min={1} max={5} onChange={set}/>
                <R label="Self Confidence (1-5)" name="self_confidence" value={form.self_confidence} min={1} max={5} onChange={set}/>
                <R label="Focus Ability (1-5)" name="focus_ability" value={form.focus_ability} min={1} max={5} onChange={set}/>
                <R label="Family Support (1-5)" name="family_support" value={form.family_support} min={1} max={5} onChange={set}/>
              </div>
            </div>

            <div className="form-section" style={{marginBottom:0}}>
              <div className="form-section-title">⚠️ Challenges</div>
              <div className="form-grid-2">
                <F label="Biggest Challenge" name="biggest_challenge" value={form.biggest_challenge}
                  options={['Lack of focus','Stress','Distractions','Lack of time','Difficult concepts','Other']} onChange={set}/>
              </div>
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="btn btn-primary btn-full" onClick={predict} disabled={loading} style={{padding: '16px', fontSize: 16, boxShadow: '0 8px 30px rgba(139, 92, 246, 0.5)'}}>
            {loading?<><div className="spinner" style={{borderColor:'white', borderTopColor:'transparent', width: 24, height: 24}}/>Analysing with AI...</>:'Predict Performance →'}
          </motion.button>
        </motion.div>

        <motion.div variants={itemVariants} style={{position:'sticky',top:24}}>
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div key="empty" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="card result-empty">
                <div className="result-empty-icon" style={{filter:'drop-shadow(0 0 20px rgba(139,92,246,0.3))'}}>🔮</div>
                <div style={{fontSize:16,fontWeight:600,marginBottom:8,color:'var(--text)'}}>No prediction yet</div>
                <div style={{fontSize:14,color:'var(--text3)'}}>Fill in the form and click Predict</div>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} transition={{type:'spring'}} className="card">
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                  <span style={{fontWeight:700,fontSize:16}}>Result</span>
                  <span style={{fontSize:11,color:'var(--green)',background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.3)',padding:'4px 10px',borderRadius:8,fontWeight:700}}>AI Analysed</span>
                </div>

                <div style={{textAlign:'center',padding:'24px 0',borderBottom:'1px solid var(--border)',marginBottom:20}}>
                  <div style={{fontSize:13,color:'var(--text3)',marginBottom:8,fontWeight:600,textTransform:'uppercase',letterSpacing:'1px'}}>Predicted Score</div>
                  <div className="score-big">{Math.round(result.estimated_score_range.predicted)}%</div>
                  <div className="score-range">{result.estimated_score_range.min}% – {result.estimated_score_range.max}%</div>
                </div>

                <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:24}}>
                  <span className={`badge ${badgeClass}`}>🎓 {result.performance_category}</span>
                  <span className={`badge ${riskBadge}`}>⚠️ {result.risk_level}</span>
                </div>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:24}}>
                  {[{l:'Wellness Score',v:result.wellness_score},{l:'Engagement',v:result.engagement_score}].map(s=>(
                    <div key={s.l} style={{background:'var(--bg-elevated)',borderRadius:12,padding:'16px',textAlign:'center',border:'1px solid var(--border2)',boxShadow:'inset 0 2px 10px rgba(0,0,0,0.2)'}}>
                      <div style={{fontSize:24,fontWeight:700,color:'var(--accent)',textShadow:'0 0 15px var(--accent-glow)'}}>{s.v}</div>
                      <div style={{fontSize:12,color:'var(--text3)',fontWeight:500,marginTop:4}}>{s.l}</div>
                    </div>
                  ))}
                </div>

                <div className="tab-bar">
                  {[['recs','Tips'],['areas','Weak Areas'],['radar','Radar']].map(([k,l])=>(
                    <button key={k} className={`tab-btn${tab===k?' active':''}`} onClick={()=>setTab(k)}>{l}</button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={tab} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.2}}>
                    {tab==='recs' && (
                      <div style={{maxHeight:340,overflowY:'auto',paddingRight:4}}>
                        {result.recommendations.map((r,i)=>(
                          <div key={i} className="rec-item">
                            <span className="rec-icon">{r.icon}</span>
                            <div>
                              <div className={`rec-category priority-${r.priority}`}>{r.category} · {r.priority}</div>
                              <div className="rec-message">{r.message}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {tab==='areas' && (
                      <div style={{maxHeight:340,overflowY:'auto',paddingRight:4}}>
                        {result.weak_areas.map((a,i)=>(
                          <div key={i} className="progress-wrap">
                            <div className="progress-header">
                              <span style={{fontSize:13,fontWeight:600,color:a.weak?'var(--red)':'var(--text)'}}>{a.weak?'⚠️ ':''}{a.area}</span>
                              <span style={{fontSize:12,color:'var(--text3)'}}>{a.label}</span>
                            </div>
                            <div className="progress-track">
                              <div className="progress-fill" style={{
                                width:`${Math.round(a.score)}%`,
                                background:a.score>=70?'var(--green)':a.score>=40?'var(--yellow)':'var(--red)',
                                boxShadow: `0 0 10px ${a.score>=70?'var(--green)':a.score>=40?'var(--yellow)':'var(--red)'}`
                              }}/>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {tab==='radar' && (
                      <ResponsiveContainer width="100%" height={240}>
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="var(--border)"/>
                          <PolarAngleAxis dataKey="s" tick={{fontSize:12,fill:'var(--text2)'}}/>
                          <PolarRadiusAxis angle={30} domain={[0,100]} tick={false}/>
                          <Radar name="Student" dataKey="v" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.3}/>
                          <Tooltip contentStyle={{fontSize:13,borderRadius:12,background:'var(--bg-elevated)',border:'1px solid var(--border2)'}}/>
                        </RadarChart>
                      </ResponsiveContainer>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}
