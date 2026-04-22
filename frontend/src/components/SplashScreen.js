import React, { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [step, setStep] = useState(0);
  const steps = ['Loading student data...','Preparing models...','Almost ready...','Welcome!'];
  useEffect(() => {
    const t = setInterval(() => setStep(s => s < steps.length-1 ? s+1 : s), 750);
    return () => clearInterval(t);
  }, []);
  const pct = Math.round((step/(steps.length-1))*100);

  return (
    <div style={{position:'fixed',inset:0,background:'#0d0e14',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:9999}}>
      <div style={{
        position:'absolute',inset:0,
        backgroundImage:'linear-gradient(rgba(108,93,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(108,93,255,0.04) 1px,transparent 1px)',
        backgroundSize:'40px 40px',pointerEvents:'none'
      }}/>
      <div style={{textAlign:'center',maxWidth:360,position:'relative'}}>
        <div style={{fontSize:52,marginBottom:20}}>🎓</div>
        <div style={{
          fontFamily:"'Syne','Plus Jakarta Sans',sans-serif",
          fontSize:38,fontWeight:800,
          background:'linear-gradient(135deg,#a78bfa,#60a5fa)',
          WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',
          letterSpacing:'-1px',marginBottom:6
        }}>EduSense</div>
        <div style={{fontSize:12,color:'#5a6080',marginBottom:40,letterSpacing:'3px',textTransform:'uppercase'}}>
          Student Performance AI
        </div>
        <div style={{width:280,height:3,background:'rgba(255,255,255,0.07)',borderRadius:999,overflow:'hidden',margin:'0 auto 16px'}}>
          <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#6c5dff,#3b82f6)',borderRadius:999,transition:'width 0.6s ease'}}/>
        </div>
        <div style={{fontSize:13,color:'#5a6080'}}>{steps[step]}</div>
        <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:32,flexWrap:'wrap'}}>
          {['Random Forest','Gradient Boosting','238 students','SHAP'].map(t => (
            <span key={t} style={{fontSize:11,padding:'3px 10px',background:'rgba(108,93,255,0.1)',border:'1px solid rgba(108,93,255,0.2)',color:'#9ba3c0',borderRadius:5}}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
