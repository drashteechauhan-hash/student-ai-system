import React from 'react';
import StudentComparePage from '../components/StudentComparePage';
export default function ComparePage() {
  return (
    <div className="animate-fade">
      <div className="page-header">
        <div className="page-title">⚔️ Compare Students</div>
        <div className="page-subtitle">Add up to 4 students and compare their profiles with radar charts and AI scores side by side</div>
      </div>
      <StudentComparePage />
    </div>
  );
}
