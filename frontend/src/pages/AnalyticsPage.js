import React,{useEffect,useState} from 'react';
import axios from 'axios';
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
  const TT=({active,payload,label})=>active&&payload?.length?(<div style={{background:'var(--bg-card)',border:'1px solid var(--border2)',borderRadius:8,padding:'10px 14px',fontSize:13}}><p style={{color:'var(--text2)',marginBottom:4}}>{label}</p>{payload.map(p=><p key={p.name} style={{color:p.color}}>{p.name}: <b>{p.value}%</b></p>)}</div>):null;
  return(
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Model Analytics</h1>
        <p className="page-subtitle">Performance metrics for Random Forest and Gradient Boosting trained on 238 students</p>
      </div>
      {!metrics&&<div style={{padding:'10px 16px',background:'#fef9c3',border:'1px solid #fde047',borderRadius:8,marginBottom:20,fontSize:13,color:'#a16207'}}>Showing demo data — run python ml_pipeline.py to see real results</div>}
      <div style={{display:'flex',gap:8,marginBottom:20}}>
        {['performance','risk'].map(t=>(
          <button key={t} onClick={()=>setTask(t)} className={`btn ${task===t?'btn-primary':'btn-outline'}`} style={{textTransform:'capitalize'}}>
            {t==='performance'?'🎓 Performance Model':'⚠️ Risk Model'}
          </button>
        ))}
      </div>
      <div style={{background:'#1c1917',borderRadius:12,padding:'16px 20px',marginBottom:20,display:'flex',alignItems:'center',gap:16}}>
        <span style={{fontSize:28}}>🏆</span>
        <div>
          <div style={{fontSize:11,color:'#78716c',marginBottom:2}}>BEST MODEL</div>
          <div style={{fontSize:20,fontWeight:700,color:'white'}}>{taskData.best_model||'Gradient Boosting'}</div>
        </div>
        {taskData[taskData.best_model||'Gradient Boosting']&&['accuracy','f1_score','precision','recall'].map(m=>(
          <div key={m} style={{marginLeft:'auto',textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:700,color:'#dc6b2f'}}>{Math.round((taskData[taskData.best_model]?.[m]||0)*100)}%</div>
            <div style={{fontSize:10,color:'#78716c',textTransform:'capitalize'}}>{m.replace('_',' ')}</div>
          </div>
        ))}
      </div>
      <div className="grid-2" style={{marginBottom:20}}>
        <div className="card">
          <div className="section-label">Model Comparison</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{left:-20}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
              <XAxis dataKey="name" tick={{fontSize:12,fill:'#78716c'}}/>
              <YAxis tick={{fontSize:12,fill:'#78716c'}} domain={[70,100]}/>
              <Tooltip content={<TT/>}/>
              <Legend wrapperStyle={{fontSize:12}}/>
              <Bar dataKey="Accuracy" fill="#dc6b2f" radius={[3,3,0,0]}/>
              <Bar dataKey="F1" fill="#d97706" radius={[3,3,0,0]}/>
              <Bar dataKey="CV" fill="#2563eb" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="section-label">SHAP Feature Importance</div>
          {shapData.length>0?(
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={shapData} layout="vertical" margin={{left:120,right:10}}>
                <XAxis type="number" tick={{fontSize:10,fill:'#78716c'}}/>
                <YAxis type="category" dataKey="name" tick={{fontSize:10,fill:'#78716c'}} width={120}/>
                <Tooltip contentStyle={{fontSize:12,borderRadius:8}}/>
                <Bar dataKey="value" fill="#2563eb" radius={[0,4,4,0]}/>
              </BarChart>
            </ResponsiveContainer>
          ):<div style={{height:220,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text3)',fontSize:13}}>Train models to see SHAP</div>}
        </div>
      </div>
      <div className="card">
        <div className="section-label">Detailed Results</div>
        <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
          <thead>
            <tr style={{borderBottom:'1px solid var(--border)'}}>
              {['Model','Accuracy','Precision','Recall','F1 Score','5-Fold CV','Status'].map(h=>(
                <th key={h} style={{padding:'10px 14px',textAlign:'left',color:'var(--text3)',fontSize:11,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.5px'}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {modelKeys.map(name=>{
              const m=taskData[name]||{};
              const best=name===taskData.best_model;
              return(
                <tr key={name} style={{borderBottom:'1px solid var(--border)',background:best?'rgba(108,93,255,0.08)':'transparent'}}>
                  <td style={{padding:'12px 14px',fontWeight:600,display:'flex',alignItems:'center',gap:6}}>{best&&<span>🏆</span>}{name}</td>
                  {['accuracy','precision','recall','f1_score','cv_mean'].map(k=>(
                    <td key={k} style={{padding:'12px 14px'}}>
                      <span style={{fontWeight:600,color:(m[k]||0)>=0.85?'var(--green)':(m[k]||0)>=0.75?'var(--yellow)':'var(--red)'}}>{Math.round((m[k]||0)*100)}%</span>
                    </td>
                  ))}
                  <td style={{padding:'12px 14px'}}>
                    <span className={`badge ${best?'badge-orange':'badge-blue'}`}>{best?'Selected':'Evaluated'}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
