import React from 'react';
import { motion } from 'framer-motion';
import StudentComparePage from '../components/StudentComparePage';

export default function ComparePage() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="fade-in">
      <div className="page-header">
        <h1 className="page-title">⚔️ Compare Students</h1>
        <p className="page-subtitle">Add up to 4 students and compare their profiles with radar charts and AI scores side by side</p>
      </div>
      <StudentComparePage />
    </motion.div>
  );
}
