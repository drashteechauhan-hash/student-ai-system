import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const API = 'http://localhost:8000';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    axios.get(`${API}/dataset-stats`).then(r => setStats(r.data)).catch(() => {});
    axios.get(`${API}/metrics`).then(r => setMetrics(r.data)).catch(() => {});
  }, []);

  const shap = metrics?.performance?.shap_importance
    ? Object.entries(metrics.performance.shap_importance).slice(0,8).map(([k,v]) => ({
        name: k.length > 22 ? k.slice(0,20)+'…' : k,
        value: Math.round(v*1000)/1000
      }))
    : [];

  const modelData = metrics?.performance
    ? Object.entries(metrics.performance)
        .filter(([k]) => !['shap_importance','best_model','classes'].includes(k))
        .map(([k,v]) => ({ name: k.split(' ')[0], Accuracy: Math.round((v.accuracy||0)*100), F1: Math.round((v.f1_score||0)*100) }))
    : [];

  const riskPie = [
    {name:'Low Risk',value:48,color:'#16a34a'},
    {name:'Moderate',value:33,color:'#d97706'},
    {name:'High Risk',value:19,color:'#dc2626'},
  ];

  const trend = [
    {m:'Jan',avg:66},{m:'Feb',avg:69},{m:'Mar',avg:68},{m:'Apr',avg:73},{m:'May',avg:77},{m:'Jun',avg:75},
  ];

  const TT = ({active,payload,label}) => active&&payload?.length ? (
    <div style={{background:'var(--bg-card)',border:'1px solid var(--border2)',borderRadius:8,padding:'10px 14px',fontSize:13}}>
      <p style={{color:'var(--text2)',marginBottom:4}}>{label}</p>
      {payload.map(p=><p key={p.name} style={{color:p.color}}>{p.name}: <b>{p.value}%</b></p>)}
    </div>
  ) : null;

  return (
    <div className="fade-in">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28}}>
        <div>
          <div style={{fontSize:12,color:'var(--text3)',marginBottom:4,letterSpacing:'0.5px'}}>
            {time.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
          </div>
          <h1 className="page-title" style={{margin:0}}>Good {time.getHours()<12?'morning':time.getHours()<17?'afternoon':'evening'} 👋</h1>
          <p className="page-subtitle">Here's how your students are doing today</p>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <div style={{position:'relative'}}>
            <button className="notif-btn" onClick={()=>setNotifOpen(o=>!o)}>🔔
              <span className="notif-count">3</span>
            </button>
            {notifOpen && (
              <div className="notif-dropdown">
                <div style={{fontWeight:600,fontSize:13,marginBottom:10,color:'var(--text)'}}>Notifications</div>
                {[
                  {icon:'🚨',msg:'5 students identified as high risk',time:'Just now'},
                  {icon:'✅',msg:'Model accuracy updated to 91.2%',time:'1h ago'},
                  {icon:'📤',msg:'New dataset: 238 rows loaded',time:'Today'},
                ].map((n,i)=>(
                  <div key={i} className="notif-item">
                    <span style={{fontSize:16}}>{n.icon}</span>
                    <div><div style={{fontSize:13}}>{n.msg}</div><div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>{n.time}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Link to="/predict" className="btn btn-primary">Make a Prediction →</Link>
        </div>
      </div>

      <div className="grid-4" style={{marginBottom:20}}>
        {[
          {icon:'👨‍🎓',label:'Total Students',value:stats?.total_students||238,change:'+200 augmented',color:'#dc6b2f'},
          {icon:'📊',label:'Avg Previous Score',value:`${stats?.avg_previous_score||68}%`,change:'+2.1% this batch',color:'#2563eb'},
          {icon:'🎯',label:'Avg Expected Score',value:`${stats?.avg_expected_score||77}%`,change:'+3.8% predicted',color:'#16a34a'},
          {icon:'⚠️',label:'High Risk Students',value:'45',change:'Need attention',color:'#dc2626'},
        ].map((s,i)=>(
          <div key={i} className="stat-card">
            <div style={{fontSize:22}}>{s.icon}</div>
            <div className="stat-value" style={{color:s.color}}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-change" style={{color:'var(--text3)'}}>{s.change}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{marginBottom:20}}>
        <div className="card">
          <div className="section-label">Model Performance (RF + Gradient Boosting)</div>
          {modelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={modelData} margin={{left:-20}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
                <XAxis dataKey="name" tick={{fontSize:12,fill:'#78716c'}}/>
                <YAxis tick={{fontSize:12,fill:'#78716c'}} domain={[0,100]}/>
                <Tooltip content={<TT/>}/>
                <Legend wrapperStyle={{fontSize:12}}/>
                <Bar dataKey="Accuracy" fill="#dc6b2f" radius={[4,4,0,0]}/>
                <Bar dataKey="F1" fill="#d97706" radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{height:200,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text3)',fontSize:13,flexDirection:'column',gap:8}}>
              <span style={{fontSize:32}}>🤖</span>
              <span>Run ml_pipeline.py to see results</span>
            </div>
          )}
        </div>

        <div className="card">
          <div className="section-label">Risk Distribution</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={riskPie} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {riskPie.map((e,i)=><Cell key={i} fill={e.color}/>)}
              </Pie>
              <Tooltip formatter={(v)=>`${v}%`} contentStyle={{fontSize:12,borderRadius:8}}/>
            </PieChart>
          </ResponsiveContainer>
          <div style={{display:'flex',justifyContent:'center',gap:16,marginTop:4}}>
            {riskPie.map(d=>(
              <div key={d.name} style={{display:'flex',alignItems:'center',gap:5,fontSize:12,color:'var(--text2)'}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:d.color}}/>
                {d.name}: {d.value}%
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{marginBottom:20}}>
        <div className="card">
          <div className="section-label">Score Trend (6 months)</div>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={trend} margin={{left:-20}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
              <XAxis dataKey="m" tick={{fontSize:12,fill:'#78716c'}}/>
              <YAxis tick={{fontSize:12,fill:'#78716c'}} domain={[50,100]}/>
              <Tooltip content={<TT/>}/>
              <Line type="monotone" dataKey="avg" stroke="#dc6b2f" strokeWidth={2} dot={{r:4,fill:'#dc6b2f'}}/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-label">SHAP Feature Importance</div>
          {shap.length > 0 ? (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={shap} layout="vertical" margin={{left:80,right:10}}>
                <XAxis type="number" tick={{fontSize:10,fill:'#78716c'}}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:'#78716c'}} width={80}/>
                <Tooltip contentStyle={{fontSize:12,borderRadius:8}}/>
                <Bar dataKey="value" fill="#2563eb" radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{height:160,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text3)',fontSize:13}}>Train models to see feature importance</div>
          )}
        </div>
      </div>

      <div style={{background:'#1c1917',borderRadius:12,padding:'24px 28px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:600,color:'white',marginBottom:6}}>Ready to analyse a student?</div>
          <div style={{fontSize:14,color:'#78716c'}}>Enter their details and get predictions with personalised study advice</div>
        </div>
        <Link to="/predict" className="btn btn-primary">Start Prediction →</Link>
      </div>
    </div>
  );
}
