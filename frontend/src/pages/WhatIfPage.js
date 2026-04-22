import React from 'react';
import WhatIfSimulator from '../components/WhatIfSimulator';
export default function WhatIfPage() {
  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-title">🔬 What-If Simulator</div>
        <div className="page-subtitle">Drag sliders to see exactly how much your score changes if you study more, sleep better, or reduce stress</div>
      </div>
      <WhatIfSimulator />
    </div>
  );
}
