import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function SplashScreen() {
  const [step, setStep] = useState(0);
  const steps = ['Loading student data...','Preparing models...','Initializing visualizer...','Welcome to EduSense!'];
  
  useEffect(() => {
    const t = setInterval(() => setStep(s => s < steps.length-1 ? s+1 : s), 700);
    return () => clearInterval(t);
  }, []);
  
  const pct = Math.round((step/(steps.length-1))*100);

  return (
    <div style={{
      position:'fixed', inset:0, background:'var(--bg-base)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:9999,
      overflow: 'hidden'
    }}>
      {/* Animated glowing orbs in background */}
      <motion.div 
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute', top: '20%', left: '30%', width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none'
        }} 
      />
      <motion.div 
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        style={{
          position: 'absolute', bottom: '10%', right: '20%', width: '500px', height: '500px',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
          borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none'
        }} 
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ textAlign:'center', maxWidth:400, position:'relative', zIndex: 10 }}
      >
        <motion.div 
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
          style={{ fontSize:64, marginBottom:24 }}
        >
          🎓
        </motion.div>
        
        <div style={{
          fontFamily:"var(--font-display)",
          fontSize:48, fontWeight:700,
          background:'linear-gradient(135deg, #d8b4fe, #93c5fd, #a78bfa)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
          letterSpacing:'-1.5px', marginBottom:8, textShadow: '0 0 40px rgba(139, 92, 246, 0.3)'
        }}>EduSense AI</div>
        
        <div style={{fontSize:13, color:'var(--text3)', marginBottom:48, letterSpacing:'4px', textTransform:'uppercase', fontWeight:600}}>
          Student Performance Engine
        </div>
        
        <div style={{width:300, height:4, background:'rgba(255,255,255,0.05)', borderRadius:999, overflow:'hidden', margin:'0 auto 16px', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)'}}>
          <div style={{
            height:'100%', width:`${pct}%`, 
            background:'linear-gradient(90deg, var(--accent), var(--accent2))', 
            borderRadius:999, transition:'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 0 15px var(--accent-glow)'
          }}/>
        </div>
        
        <motion.div 
          key={step}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          style={{fontSize:14, color:'var(--text2)', fontWeight:500}}
        >
          {steps[step]}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          style={{display:'flex', gap:10, justifyContent:'center', marginTop:40, flexWrap:'wrap'}}
        >
          {['Neural Analytics', 'Gradient Boosting', 'Real-time Processing'].map((t, i) => (
            <motion.span 
              key={t} 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + (i * 0.1) }}
              style={{
                fontSize:11, padding:'4px 12px', 
                background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', 
                color:'var(--text3)', borderRadius:8, backdropFilter: 'blur(4px)'
              }}
            >
              {t}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
