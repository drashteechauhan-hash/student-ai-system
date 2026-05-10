import React,{useEffect,useState} from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer,CartesianGrid,Legend} from 'recharts';

const API='http://localhost:8000';

export default function AnalyticsPage(){
  const [metrics,setMetrics]=useState(null);
  const [shap,setShap]=useState(null);
  const [task,setTask]=useState('performance');

  useEffect(()=>{
    axios.get(`${API}/metrics`).then(r=>setMetrics(r.data)).catch(()=>{});
    axios.get(`${API}/feature-importance`).then(r=>setShap(r.data)).catch(()=>{});
  },[]);

  const demo={performance:{'Random Forest':{accuracy:0.88,precision:0.87,recall:0.88,f1_score:0.87,cv_mean:0.86},'Gradient Boosting':{accuracy:0.91,precision:0.91,recall:0.91,f1_score:0.90,cv_mean:0.89},best_model:'Gradient Boosting',classes:['High','Low','Medium']},risk:{'Random Forest':{accuracy:0.90,precision:0.89,recall:0.90,f1_score:0.89,cv_mean:0.88},'Gradient Boosting':{accuracy:0.93,precision:0.93,recall:0.93,f1_score:0.92,cv_mean:0.91},best_model:'Gradient Boosting',classes:['High Risk','Low Risk','Moderate Risk']}};
  const data=metrics||demo;
  const taskData=data[task]||{};
  const modelKeys=Object.keys(taskData).filter(k=>!['best_model','classes','shap_importance'].includes(k));
  const barData=modelKeys.map(n=>({name:n.split(' ')[0],Accuracy:Math.round((taskData[n]?.accuracy||0)*100),F1:Math.round((taskData[n]?.f1_score||0)*100),Precision:Math.round((taskData[n]?.precision||0)*100),CV:Math.round((taskData[n]?.cv_mean||0)*100)}));
  const shapData=Object.entries(shap?.[task]||taskData.shap_importance||{}).slice(0,8).map(([k,v])=>({name:k.length>22?k.slice(0,20)+'…':k,value:Math.round(v*1000)/1000}));
  
  const TT=({active,payload,label})=>active&&payload?.length?(<div style={{background:'var(--bg-elevated)',border:'1px solid var(--border2)',borderRadius:'12px',padding:'12px 16px',fontSize:13,boxShadow:'var(--shadow-md)',backdropFilter:'blur(12px)'}}><p style={{color:'var(--text2)',marginBottom:6,fontWeight:600}}>{label}</p>{payload.map(p=><p key={p.name} style={{color:p.color,margin:'4px 0'}}>{p.name}: <b style={{color:'var(--text)'}}>{p.value}%</b></p>)}</div>):null;

  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } } };

  return(
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="fade-in">
      <motion.div variants={itemVariants} className="page-header">
        <h1 className="page-title">Model Analytics</h1>
        <p className="page-subtitle">Performance metrics for Random Forest and Gradient Boosting trained on 238 students</p>
      </motion.div>

      {!metrics&&<motion.div variants={itemVariants} style={{padding:'12px 16px',background:'rgba(245, 158, 11, 0.1)',border:'1px solid rgba(245, 158, 11, 0.3)',borderRadius:'12px',marginBottom:24,fontSize:14,color:'var(--yellow)',fontWeight:500,backdropFilter:'blur(4px)'}}>⚠️ Showing demo data — run python ml_pipeline.py to see real results</motion.div>}

      <motion.div variants={itemVariants} style={{display:'flex',gap:12,marginBottom:32}}>
        {['performance','risk'].map(t=>(
          <button key={t} onClick={()=>setTask(t)} className={`btn ${task===t?'btn-primary':'btn-outline'}`} style={{textTransform:'capitalize',padding:'12px 24px',fontSize:15}}>
            {t==='performance'?'🎓 Performance Model':'⚠️ Risk Model'}
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} style={{background:'linear-gradient(135deg, rgba(22, 22, 32, 0.8), rgba(35, 35, 50, 0.6))',backdropFilter:'blur(16px)',border:'1px solid var(--border)',borderRadius:'20px',padding:'24px 32px',marginBottom:32,display:'flex',alignItems:'center',gap:24,boxShadow:'var(--shadow)'}}>
        <div style={{fontSize:48, filter:'drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))'}}>🏆</div>
        <div>
          <div style={{fontSize:12,color:'var(--text3)',marginBottom:4,fontWeight:700,letterSpacing:'1px'}}>BEST MODEL</div>
          <div style={{fontSize:24,fontWeight:700,color:'var(--text)'}}>{taskData.best_model||'Gradient Boosting'}</div>
        </div>
        <div style={{display:'flex',gap:32,marginLeft:'auto'}}>
          {taskData[taskData.best_model||'Gradient Boosting']&&['accuracy','f1_score','precision','recall'].map(m=>(
            <div key={m} style={{textAlign:'center'}}>
              <div style={{fontSize:28,fontWeight:700,color:'var(--accent)',textShadow:'0 0 15px var(--accent-glow)'}}>{Math.round((taskData[taskData.best_model]?.[m]||0)*100)}%</div>
              <div style={{fontSize:12,color:'var(--text2)',textTransform:'capitalize',fontWeight:500}}>{m.replace('_',' ')}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid-2" style={{marginBottom:32}}>
        <motion.div variants={itemVariants} className="card">
          <div className="section-label">Model Comparison</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={barData} margin={{left:-20}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)"/>
              <XAxis dataKey="name" tick={{fontSize:12,fill:'var(--text3)'}}/>
              <YAxis tick={{fontSize:12,fill:'var(--text3)'}} domain={[70,100]}/>
              <Tooltip content={<TT/>}/>
              <Legend wrapperStyle={{fontSize:13,paddingTop:10}}/>
              <Bar dataKey="Accuracy" fill="var(--accent)" radius={[6,6,0,0]}/>
              <Bar dataKey="F1" fill="var(--blue)" radius={[6,6,0,0]}/>
              <Bar dataKey="CV" fill="var(--green)" radius={[6,6,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div variants={itemVariants} className="card">
          <div className="section-label">SHAP Feature Importance</div>
          {shapData.length>0?(
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={shapData} layout="vertical" margin={{left:120,right:10}}>
                <XAxis type="number" tick={{fontSize:11,fill:'var(--text3)'}}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:12,fill:'var(--text2)'}} width={120}/>
                <Tooltip contentStyle={{fontSize:13,borderRadius:12,background:'var(--bg-elevated)',border:'1px solid var(--border2)'}} cursor={{fill:'var(--border)'}}/>
                <Bar dataKey="value" fill="var(--accent2)" radius={[0,6,6,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ):<div style={{height:260,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text3)',fontSize:14}}>Train models to see SHAP</div>}
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="card">
        <div className="section-label">Detailed Results</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:14}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                {['Model','Accuracy','Precision','Recall','F1 Score','5-Fold CV','Status'].map(h=>(
                  <th key={h} style={{padding:'16px',textAlign:'left',color:'var(--text2)',fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:'1px'}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {modelKeys.map(name=>{
                const m=taskData[name]||{};
                const best=name===taskData.best_model;
                return(
                  <tr key={name} style={{borderBottom:'1px solid var(--border)',background:best?'rgba(139, 92, 246, 0.1)':'transparent',transition:'var(--transition)'}}>
                    <td style={{padding:'16px',fontWeight:600,display:'flex',alignItems:'center',gap:8,color:'var(--text)'}}>{best&&<span style={{filter:'drop-shadow(0 0 8px rgba(139,92,246,0.8))'}}>🏆</span>}{name}</td>
                    {['accuracy','precision','recall','f1_score','cv_mean'].map(k=>(
                      <td key={k} style={{padding:'16px'}}>
                        <span style={{fontWeight:700,color:(m[k]||0)>=0.85?'var(--green)':(m[k]||0)>=0.75?'var(--yellow)':'var(--red)'}}>{Math.round((m[k]||0)*100)}%</span>
                      </td>
                    ))}
                    <td style={{padding:'16px'}}>
                      <span className={`badge ${best?'badge-purple':'badge-blue'}`}>{best?'Selected':'Evaluated'}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
