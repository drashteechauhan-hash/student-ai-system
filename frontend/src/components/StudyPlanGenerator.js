import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const API = process.env.REACT_APP_API_URL || 'https://student-ai-system-kgq0.onrender.com'

;

const MRU_BRANCHES = {
  'CSE (Core)': {
    label: 'Computer Science & Engineering',
    semesters: {
      1: [
        { code: 'MA101', name: 'Engineering Mathematics I', credits: 4 },
        { code: 'PH101', name: 'Engineering Physics', credits: 3 },
        { code: 'CS101', name: 'Programming in C', credits: 3 },
        { code: 'ME101', name: 'Engineering Drawing & Graphics', credits: 2 },
        { code: 'HU101', name: 'Communication Skills', credits: 2 },
        { code: 'CS191', name: 'Programming Lab (C)', credits: 1 },
        { code: 'PH191', name: 'Physics Lab', credits: 1 },
      ],
      2: [
        { code: 'MA201', name: 'Engineering Mathematics II', credits: 4 },
        { code: 'CS201', name: 'Data Structures', credits: 4 },
        { code: 'CS202', name: 'Object Oriented Programming (C++)', credits: 3 },
        { code: 'EC201', name: 'Digital Electronics', credits: 3 },
        { code: 'CS291', name: 'Data Structures Lab', credits: 1 },
        { code: 'CS292', name: 'OOP Lab (C++)', credits: 1 },
        { code: 'EC291', name: 'Digital Electronics Lab', credits: 1 },
      ],
      3: [
        { code: 'MA301', name: 'Discrete Mathematics', credits: 4 },
        { code: 'CS301', name: 'Computer Organisation & Architecture', credits: 4 },
        { code: 'CS302', name: 'Database Management Systems', credits: 3 },
        { code: 'CS303', name: 'Java Programming', credits: 3 },
        { code: 'CS304', name: 'Operating Systems', credits: 3 },
        { code: 'CS391', name: 'DBMS Lab', credits: 1 },
        { code: 'CS392', name: 'Java Lab', credits: 1 },
      ],
      4: [
        { code: 'MA401', name: 'Probability & Statistics', credits: 4 },
        { code: 'CS401', name: 'Design & Analysis of Algorithms', credits: 4 },
        { code: 'CS402', name: 'Computer Networks', credits: 3 },
        { code: 'CS403', name: 'Software Engineering', credits: 3 },
        { code: 'CS404', name: 'Theory of Computation', credits: 3 },
        { code: 'CS491', name: 'Algorithms Lab', credits: 1 },
        { code: 'CS492', name: 'Networks Lab', credits: 1 },
      ],
      5: [
        { code: 'CS501', name: 'Artificial Intelligence', credits: 4 },
        { code: 'CS502', name: 'Compiler Design', credits: 3 },
        { code: 'CS503', name: 'Web Technologies', credits: 3 },
        { code: 'CS504', name: 'Cloud Computing', credits: 3 },
        { code: 'CS505', name: 'Elective I (IoT / Cyber Security / Big Data)', credits: 3 },
        { code: 'CS591', name: 'AI Lab', credits: 1 },
        { code: 'CS592', name: 'Web Tech Lab', credits: 1 },
      ],
      6: [
        { code: 'CS601', name: 'Machine Learning', credits: 4 },
        { code: 'CS602', name: 'Information Security & Cryptography', credits: 3 },
        { code: 'CS603', name: 'Mobile Application Development', credits: 3 },
        { code: 'CS604', name: 'Elective II (NLP / Blockchain / DevOps)', credits: 3 },
        { code: 'CS605', name: 'Elective III (Data Mining / AR-VR / Robotics)', credits: 3 },
        { code: 'CS691', name: 'ML Lab', credits: 1 },
        { code: 'CS692', name: 'Mini Project', credits: 2 },
      ],
      7: [
        { code: 'CS701', name: 'Deep Learning', credits: 4 },
        { code: 'CS702', name: 'Distributed Systems', credits: 3 },
        { code: 'CS703', name: 'Elective IV (Computer Vision / FinTech / Cloud Native)', credits: 3 },
        { code: 'CS704', name: 'Elective V (Quantum Computing / Edge AI)', credits: 3 },
        { code: 'CS791', name: 'Major Project Phase I', credits: 4 },
        { code: 'HU701', name: 'Professional Ethics & IPR', credits: 2 },
      ],
      8: [
        { code: 'CS801', name: 'Major Project Phase II', credits: 8 },
        { code: 'CS802', name: 'Internship / Industry Training', credits: 6 },
        { code: 'CS803', name: 'Elective VI (Open Elective)', credits: 3 },
        { code: 'HU801', name: 'Entrepreneurship & Innovation', credits: 2 },
      ],
    },
  },
  'CSE (AIML)': {
    label: 'CSE — Artificial Intelligence & Machine Learning',
    semesters: {
      1: [
        { code: 'MA101', name: 'Engineering Mathematics I', credits: 4 },
        { code: 'PH101', name: 'Engineering Physics', credits: 3 },
        { code: 'CS101', name: 'Programming in Python', credits: 3 },
        { code: 'ME101', name: 'Engineering Drawing & Graphics', credits: 2 },
        { code: 'HU101', name: 'Communication Skills', credits: 2 },
        { code: 'CS191', name: 'Python Programming Lab', credits: 1 },
        { code: 'AI191', name: 'Introduction to AI Tools Lab', credits: 1 },
      ],
      2: [
        { code: 'MA201', name: 'Engineering Mathematics II (Linear Algebra & Calculus)', credits: 4 },
        { code: 'CS201', name: 'Data Structures', credits: 4 },
        { code: 'CS202', name: 'Object Oriented Programming (Python/Java)', credits: 3 },
        { code: 'AI201', name: 'Introduction to Machine Learning', credits: 3 },
        { code: 'CS291', name: 'Data Structures Lab', credits: 1 },
        { code: 'AI291', name: 'ML Fundamentals Lab', credits: 1 },
      ],
      3: [
        { code: 'MA301', name: 'Discrete Mathematics & Graph Theory', credits: 4 },
        { code: 'CS301', name: 'Computer Organisation & Architecture', credits: 3 },
        { code: 'CS302', name: 'Database Management Systems', credits: 3 },
        { code: 'AI301', name: 'Probability & Statistical Methods for AI', credits: 4 },
        { code: 'AI302', name: 'Supervised Learning Algorithms', credits: 3 },
        { code: 'AI391', name: 'ML Algorithms Lab', credits: 1 },
        { code: 'CS391', name: 'DBMS Lab', credits: 1 },
      ],
      4: [
        { code: 'CS401', name: 'Design & Analysis of Algorithms', credits: 4 },
        { code: 'CS402', name: 'Operating Systems', credits: 3 },
        { code: 'AI401', name: 'Neural Networks & Deep Learning', credits: 4 },
        { code: 'AI402', name: 'Computer Vision', credits: 3 },
        { code: 'AI403', name: 'Unsupervised Learning & Clustering', credits: 3 },
        { code: 'AI491', name: 'Deep Learning Lab', credits: 1 },
        { code: 'AI492', name: 'Computer Vision Lab', credits: 1 },
      ],
      5: [
        { code: 'AI501', name: 'Natural Language Processing', credits: 4 },
        { code: 'AI502', name: 'Reinforcement Learning', credits: 3 },
        { code: 'AI503', name: 'Big Data Analytics', credits: 3 },
        { code: 'CS501', name: 'Cloud Computing & AWS', credits: 3 },
        { code: 'AI504', name: 'Elective I (IoT & AI / Edge Computing)', credits: 3 },
        { code: 'AI591', name: 'NLP Lab', credits: 1 },
        { code: 'AI592', name: 'Big Data Lab (Hadoop/Spark)', credits: 1 },
      ],
      6: [
        { code: 'AI601', name: 'Generative AI & Large Language Models', credits: 4 },
        { code: 'AI602', name: 'AI Ethics, Fairness & Explainability', credits: 3 },
        { code: 'AI603', name: 'MLOps & Model Deployment', credits: 3 },
        { code: 'AI604', name: 'Elective II (Robotics AI / Healthcare AI)', credits: 3 },
        { code: 'AI605', name: 'Elective III (FinTech AI / AutoML)', credits: 3 },
        { code: 'AI691', name: 'GenAI Lab (LangChain/HuggingFace)', credits: 1 },
        { code: 'AI692', name: 'Mini Project (AI Application)', credits: 2 },
      ],
      7: [
        { code: 'AI701', name: 'Advanced Deep Learning (Transformers, GANs)', credits: 4 },
        { code: 'AI702', name: 'Multimodal AI Systems', credits: 3 },
        { code: 'AI703', name: 'Elective IV (Quantum ML / Federated Learning)', credits: 3 },
        { code: 'AI704', name: 'Research Methods in AI', credits: 2 },
        { code: 'AI791', name: 'Major Project Phase I (AI Product)', credits: 4 },
        { code: 'HU701', name: 'Professional Ethics & IPR', credits: 2 },
      ],
      8: [
        { code: 'AI801', name: 'Major Project Phase II (Industry/Research)', credits: 8 },
        { code: 'AI802', name: 'Internship / Industry Training (Microsoft/Xebia)', credits: 6 },
        { code: 'AI803', name: 'Elective V (Open Elective)', credits: 3 },
        { code: 'HU801', name: 'Innovation & Start-up Ecosystem', credits: 2 },
      ],
    },
  },
  'ECE': {
    label: 'Electronics & Communication Engineering',
    semesters: {
      1: [{ code: 'MA101', name: 'Engineering Mathematics I', credits: 4 }, { code: 'PH101', name: 'Engineering Physics', credits: 3 }, { code: 'CS101', name: 'Programming in C', credits: 3 }, { code: 'ME101', name: 'Engineering Drawing & Graphics', credits: 2 }, { code: 'HU101', name: 'Communication Skills', credits: 2 }, { code: 'PH191', name: 'Physics Lab', credits: 1 }, { code: 'CS191', name: 'Programming Lab', credits: 1 }],
      2: [{ code: 'MA201', name: 'Engineering Mathematics II', credits: 4 }, { code: 'EC201', name: 'Electronic Devices & Circuits', credits: 4 }, { code: 'EC202', name: 'Digital Electronics', credits: 3 }, { code: 'EC203', name: 'Network Analysis', credits: 3 }, { code: 'EC291', name: 'Electronics Lab', credits: 1 }, { code: 'EC292', name: 'Digital Electronics Lab', credits: 1 }],
      3: [{ code: 'MA301', name: 'Signals & Systems', credits: 4 }, { code: 'EC301', name: 'Analog Circuits', credits: 4 }, { code: 'EC302', name: 'Electromagnetic Theory', credits: 3 }, { code: 'EC303', name: 'Microprocessors & Microcontrollers', credits: 3 }, { code: 'EC304', name: 'Communication Engineering I', credits: 3 }, { code: 'EC391', name: 'Analog Circuits Lab', credits: 1 }, { code: 'EC392', name: 'Microprocessor Lab', credits: 1 }],
      4: [{ code: 'MA401', name: 'Probability & Random Processes', credits: 4 }, { code: 'EC401', name: 'Digital Signal Processing', credits: 4 }, { code: 'EC402', name: 'Communication Engineering II', credits: 3 }, { code: 'EC403', name: 'VLSI Design', credits: 3 }, { code: 'EC404', name: 'Control Systems', credits: 3 }, { code: 'EC491', name: 'DSP Lab', credits: 1 }, { code: 'EC492', name: 'VLSI Lab', credits: 1 }],
      5: [{ code: 'EC501', name: 'Wireless & Mobile Communication', credits: 4 }, { code: 'EC502', name: 'Embedded Systems', credits: 3 }, { code: 'EC503', name: 'Antenna & Wave Propagation', credits: 3 }, { code: 'EC504', name: 'Elective I (IoT / Image Processing)', credits: 3 }, { code: 'CS501', name: 'Introduction to AI & ML for ECE', credits: 3 }, { code: 'EC591', name: 'Embedded Systems Lab', credits: 1 }, { code: 'EC592', name: 'Communication Lab', credits: 1 }],
      6: [{ code: 'EC601', name: 'Optical Fiber Communication', credits: 3 }, { code: 'EC602', name: '5G & Next Gen Networks', credits: 3 }, { code: 'EC603', name: 'Elective II (Radar / Satellite Communication)', credits: 3 }, { code: 'EC604', name: 'Elective III (MEMS / Nanoelectronics)', credits: 3 }, { code: 'EC605', name: 'Digital Image Processing', credits: 3 }, { code: 'EC691', name: 'Advanced Communication Lab', credits: 1 }, { code: 'EC692', name: 'Mini Project', credits: 2 }],
      7: [{ code: 'EC701', name: 'VLSI Signal Processing', credits: 3 }, { code: 'EC702', name: 'Elective IV (Biomedical Electronics / RF Design)', credits: 3 }, { code: 'EC703', name: 'Elective V (Cognitive Radio / SDR)', credits: 3 }, { code: 'HU701', name: 'Professional Ethics & IPR', credits: 2 }, { code: 'EC791', name: 'Major Project Phase I', credits: 4 }],
      8: [{ code: 'EC801', name: 'Major Project Phase II', credits: 8 }, { code: 'EC802', name: 'Internship / Industry Training', credits: 6 }, { code: 'EC803', name: 'Elective VI (Open Elective)', credits: 3 }, { code: 'HU801', name: 'Entrepreneurship & Innovation', credits: 2 }],
    },
  },
};

const WEEK_COLORS = ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24'];

const BADGES = [
  { id: 'first_task', icon: '⭐', label: 'First Step',   desc: 'Completed first task',  need: 1 },
  { id: 'five_tasks', icon: '🔥', label: 'On Fire',      desc: '5 tasks completed',     need: 5 },
  { id: 'ten_tasks',  icon: '💪', label: 'Warrior',      desc: '10 tasks completed',    need: 10 },
  { id: 'streak3',    icon: '🎯', label: '3-Day Streak', desc: '3 days in a row',       streak: 3 },
  { id: 'streak7',    icon: '🏆', label: 'Week Champ',   desc: '7-day streak',          streak: 7 },
];

const todayKey = () => new Date().toISOString().split('T')[0];

function classifySubject(score) {
  if (score === null || score === undefined || isNaN(score)) return null;
  if (score < 50) return 'critical';
  if (score < 65) return 'weak';
  if (score < 80) return 'average';
  return 'strong';
}

function subjectLabel(score) {
  const cls = classifySubject(score);
  if (cls === 'critical') return { text: 'Critical', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)' };
  if (cls === 'weak')     return { text: 'Weak',     color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)' };
  if (cls === 'average')  return { text: 'Average',  color: '#60a5fa', bg: 'rgba(96,165,250,0.15)', border: 'rgba(96,165,250,0.4)' };
  if (cls === 'strong')   return { text: 'Strong',   color: '#34d399', bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.4)' };
  return null;
}

// ─── CORE FIX: Generate tasks dynamically based on ACTUAL subject scores ─────
function buildWeekTasks(phase, subjectData) {
  const scoredSubs = subjectData.filter(s => s.score !== null && s.score !== undefined && !isNaN(s.score));
  const unscoredSubs = subjectData.filter(s => s.score === null || s.score === undefined || isNaN(s.score));

  const critical = [...scoredSubs.filter(s => s.score < 50)].sort((a, b) => a.score - b.score);
  const weak     = [...scoredSubs.filter(s => s.score >= 50 && s.score < 65)].sort((a, b) => a.score - b.score);
  const average  = [...scoredSubs.filter(s => s.score >= 65 && s.score < 80)];
  const strong   = [...scoredSubs.filter(s => s.score >= 80)];

  // Priority queue: worst subject first
  const priorityQueue = [...critical, ...weak, ...average, ...unscoredSubs, ...strong];

  // Helper to get subject display string
  const subStr = (s) => s.score !== null && !isNaN(s.score)
    ? `${s.name} (${s.score}/100)`
    : s.name;

  const tasks = [];

  if (phase === 'Foundation') {
    // Task 1: Most critical subject
    if (critical[0]) {
      tasks.push(`🔴 ${subStr(critical[0])}: Start from Chapter 1 — make a concept map of full syllabus`);
    } else if (weak[0]) {
      tasks.push(`🟡 ${subStr(weak[0])}: Reread all theory notes, list every formula & theorem`);
    } else if (priorityQueue[0]) {
      tasks.push(`📖 ${subStr(priorityQueue[0])}: Full syllabus scan, identify high-weightage chapters`);
    }

    // Task 2: Second weakest
    if (critical[1]) {
      tasks.push(`🔴 ${subStr(critical[1])}: Identify exactly which topics cost you marks — make a hit-list`);
    } else if (critical[0] && weak[0]) {
      tasks.push(`🟡 ${subStr(weak[0])}: Redo notes from scratch, chapter by chapter`);
    } else if (weak[1]) {
      tasks.push(`🟡 ${subStr(weak[1])}: Cover theory from lectures, highlight key definitions`);
    } else if (priorityQueue[1]) {
      tasks.push(`📖 ${subStr(priorityQueue[1])}: Make a topic-wise study checklist`);
    }

    // Task 3: Third priority or average subject
    const t3 = average[0] || priorityQueue[2];
    if (t3) {
      tasks.push(`📘 ${subStr(t3)}: Cover theory portions, summarize each chapter in 1 page`);
    }

    // Task 4: Strong subject maintenance or recovery
    if (strong[0]) {
      tasks.push(`✅ ${strong[0].name} (${strong[0].score}/100 — Strong): 30-min light revision only — maintain your lead`);
    } else if (priorityQueue[3]) {
      tasks.push(`📖 ${subStr(priorityQueue[3])}: Read through the syllabus outline, note pending topics`);
    }

    // Task 5: All subjects consolidation
    tasks.push(`📌 All subjects: Create flashcards for key formulas, theorems & definitions`);
  }

  else if (phase === 'Practice') {
    // Task 1: Worst subject — timed PYQ practice
    const p1 = critical[0] || weak[0] || priorityQueue[0];
    if (p1) tasks.push(`🔴 ${subStr(p1)}: Solve 20 previous year questions — timed 45 mins`);

    // Task 2: Second worst — problem sets
    const p2 = critical[1] || (critical[0] && weak[0] ? weak[0] : null) || weak[1] || priorityQueue[1];
    if (p2) tasks.push(`🟡 ${subStr(p2)}: Complete tutorial sheet + solve 15 textbook problems`);

    // Task 3: Average subject — unit test simulation
    const p3 = average[0] || priorityQueue[2];
    if (p3) tasks.push(`📘 ${subStr(p3)}: Attempt 1 full unit test under exam conditions (50 marks, 1 hour)`);

    // Task 4: Lab/practical subjects
    const labSubs = subjectData.filter(s => s.code.includes('9') || s.name.toLowerCase().includes('lab') || s.name.toLowerCase().includes('project'));
    if (labSubs.length > 0) {
      tasks.push(`🧪 ${labSubs.map(s => s.name).join(' + ')}: Write pending practical files, prepare viva Q&A`);
    } else if (priorityQueue[3]) {
      tasks.push(`📖 ${subStr(priorityQueue[3])}: 15 problem-solving questions from previous papers`);
    }

    // Task 5: Error log review
    tasks.push(`📋 Error log: Review all mistakes from this week, categorize as concept gap / silly error / time issue`);
  }

  else if (phase === 'Revision') {
    // Task 1: Worst — rapid full revision
    const r1 = critical[0] || weak[0] || priorityQueue[0];
    if (r1) tasks.push(`🔴 ${subStr(r1)}: Full syllabus rapid revision — mind maps + solve last 5 years' papers`);

    // Task 2: Second worst — PYQ focus
    const r2 = critical[1] || (critical[0] && weak[0] ? weak[0] : null) || weak[1] || priorityQueue[1];
    if (r2) tasks.push(`🟡 ${subStr(r2)}: Solve last 3 years' question papers, mark repeating questions`);

    // Task 3: Average → push to strong
    if (average[0]) {
      tasks.push(`📘 ${subStr(average[0])}: Push average → strong — condense notes + solve 10 extra problems`);
    } else if (priorityQueue[2]) {
      tasks.push(`📖 ${subStr(priorityQueue[2])}: Identify high-frequency exam topics`);
    }

    // Task 4: Strong subject — quick maintenance
    if (strong[0]) {
      tasks.push(`✅ ${strong[0].name} (${strong[0].score}/100 — Strong): 30-min maintenance only — condense to 1-page cheat sheet`);
    } else if (priorityQueue[3]) {
      tasks.push(`📌 All subjects: Condense each subject into a 1-page cheat sheet`);
    }

    // Task 5: Feynman method / recovery
    tasks.push(`🧠 All subjects: Explain 3 key concepts out loud (Feynman method) — if you can't explain it, you don't know it`);
  }

  else { // Exam Sprint
    const e1 = critical[0] || weak[0] || priorityQueue[0];
    const e2 = critical[1] || weak[0] || priorityQueue[1];

    tasks.push(`🎯 Full mock test: 3-hour simulation for ${e1 ? e1.name : 'your weakest subject'} — exam conditions, no breaks`);
    tasks.push(`🔍 Mock test review: Categorize every mistake — concept gap / silly mistake / time pressure`);

    if (e1) tasks.push(`⚡ ${subStr(e1)}: Last-mile practice — only high-probability questions from last 5 years`);
    if (e2 && e2 !== e1) tasks.push(`⚡ ${subStr(e2)}: Quick targeted revision of your most-missed topics`);

    tasks.push(`📌 Read all 1-page cheat sheets for every subject — no new material, only review`);
    tasks.push(`🌙 Night before exam: Pack your bag, read cheat sheets once slowly, sleep 8h — NO late cramming`);
  }

  return tasks.filter(Boolean);
}

function generateFallbackPlan(profile, subjectData) {
  const scoredSubs = subjectData.filter(s => s.score !== null && !isNaN(s.score));

  const critical = [...scoredSubs.filter(s => s.score < 50)].sort((a, b) => a.score - b.score);
  const weak     = [...scoredSubs.filter(s => s.score >= 50 && s.score < 65)].sort((a, b) => a.score - b.score);
  const average  = [...scoredSubs.filter(s => s.score >= 65 && s.score < 80)];
  const strong   = [...scoredSubs.filter(s => s.score >= 80)];

  const priorityQueue = [...critical, ...weak, ...average, ...subjectData.filter(s => s.score === null || isNaN(s.score)), ...strong];
  const p1 = priorityQueue[0];
  const p2 = priorityQueue[1];

  const avgScore = scoredSubs.length
    ? Math.round(scoredSubs.reduce((a, s) => a + s.score, 0) / scoredSubs.length)
    : 60;

  // ── Coach message based on actual scores ──
  let coachMessage = '';
  if (critical.length > 0) {
    coachMessage = `Your score in ${critical.map(s => `${s.name} (${s.score}/100)`).join(', ')} is critically low. We're prioritizing these first — every day starts with these subjects. `;
  } else if (weak.length > 0) {
    coachMessage = `${weak.map(s => `${s.name} (${s.score}/100)`).join(' and ')} need the most attention. With focused effort, you can gain 15–20 marks in each. `;
  } else if (scoredSubs.length === 0) {
    coachMessage = `No scores entered — your plan covers all subjects equally. Add marks later to get a personalized priority order. `;
  } else {
    coachMessage = `Your scores look solid overall. Let's push every subject above 80% and convert average ones to strong. `;
  }

  if (profile.stress >= 4) coachMessage += `I see your stress is high (${profile.stress}/5). Recovery sessions are built in — don't skip them.`;
  else if (profile.sleep < 6) coachMessage += `You're sleeping only ${profile.sleep}h. Memory consolidation happens during sleep, so I've scheduled lighter evenings.`;
  else if (profile.challenge === 'Lack of focus') coachMessage += `For focus issues, every session uses 25-min Pomodoro blocks. Set a timer for each task.`;
  else coachMessage += `${profile.exam_days} days is enough time. Consistency beats cramming — every single day.`;

  // ── Daily schedule based on study time preference ──
  const scheduleByTime = {
    Morning: [
      { time: '6:00–7:00 AM',  task: `Wake up, review yesterday's notes (${p1 ? p1.name : 'your top subject'})` },
      { time: '7:00–9:30 AM',  task: `Deep Focus: ${p1 ? `${p1.name}${p1.score !== null ? ` (${p1.score}/100)` : ''}` : 'Priority Subject 1'} — highest priority block` },
      { time: '9:45–11:30 AM', task: `Secondary: ${p2 ? `${p2.name}${p2.score !== null ? ` (${p2.score}/100)` : ''}` : 'Priority Subject 2'}` },
      { time: '4:00–6:00 PM',  task: `Practice problems${average[0] ? ` — ${average[0].name}` : ' — any average subject'}` },
      { time: '8:00–8:30 PM',  task: 'Daily review: what did I actually learn? Set tomorrow\'s goal' },
    ],
    Afternoon: [
      { time: '8:00–9:00 AM',  task: 'Morning warmup: review last session\'s notes' },
      { time: '12:00–2:30 PM', task: `Deep Focus: ${p1 ? `${p1.name}${p1.score !== null ? ` (${p1.score}/100)` : ''}` : 'Priority Subject 1'} — highest priority block` },
      { time: '3:30–5:30 PM',  task: `Secondary: ${p2 ? `${p2.name}${p2.score !== null ? ` (${p2.score}/100)` : ''}` : 'Priority Subject 2'}` },
      { time: '7:00–9:00 PM',  task: `Practice problems${average[0] ? ` — ${average[0].name}` : ''}` },
      { time: '9:30–10:00 PM', task: 'Error log: note every mistake made today' },
    ],
    Night: [
      { time: '6:00–7:00 PM',  task: `Warmup: re-read today's class notes` },
      { time: '8:00–10:00 PM', task: `Deep Focus: ${p1 ? `${p1.name}${p1.score !== null ? ` (${p1.score}/100)` : ''}` : 'Priority Subject 1'} — highest priority block` },
      { time: '10:30–12:00 AM',task: `Secondary: ${p2 ? `${p2.name}${p2.score !== null ? ` (${p2.score}/100)` : ''}` : 'Priority Subject 2'}` },
      { time: '12:00–1:00 AM', task: `Light review: ${strong[0] ? `${strong[0].name} maintenance` : 'flashcard practice'}` },
      { time: '1:00 AM',       task: 'Sleep (7–8 hours minimum — memory consolidation happens now)' },
    ],
  };

  // ── Smart tips ──
  const smartTips = [
    {
      icon: '📌',
      title: critical.length > 0 ? `${critical[0].name} is your biggest risk` : weak.length > 0 ? `${weak[0].name} needs urgent focus` : 'Convert average to strong',
      body: critical.length > 0
        ? `At ${critical[0].score}/100, even improving to 65 will lift your aggregate significantly. Start every study session with this.`
        : weak.length > 0
        ? `${weak[0].score}/100 — You need 15–20 more marks. Focus on highest-weightage chapters first.`
        : 'Solving 20 extra PYQs per average subject can push each one to 75+.',
    },
    {
      icon: '🧠',
      title: 'Active recall beats re-reading',
      body: 'Close your notes and write down everything you remember. Then check. This triples retention compared to passive re-reading.',
    },
  ];

  if (profile.stress >= 4) smartTips.push({ icon: '🧘', title: 'High stress blocks memory', body: 'Take 5 deep breaths before each session. High cortisol literally prevents memory formation.' });
  if (profile.sleep < 6) smartTips.push({ icon: '💤', title: `${profile.sleep}h sleep isn't enough`, body: 'REM sleep moves knowledge to long-term memory. Cut late-night scrolling, not sleep.' });
  if (critical.length > 1) smartTips.push({ icon: '⚡', title: 'Multiple critical subjects: interleave', body: `Don't spend all day on one. Alternate between ${critical.slice(0,2).map(s=>s.name).join(' and ')} — interleaved practice improves both faster.` });

  // ── Weak areas display ──
  const weakAreasForDisplay = [
    ...critical.map(s => ({ subject: s.name, code: s.code, score: s.score, priority: 'Critical', tip: `At ${s.score}/100, this needs daily attention. Break the syllabus into 3, 5 and 10 mark question banks and solve each category.` })),
    ...weak.map(s => ({ subject: s.name, code: s.code, score: s.score, priority: 'Weak', tip: `${s.score}/100 — 15–20 more marks needed. Focus on highest-weightage chapters first.` })),
    ...average.map(s => ({ subject: s.name, code: s.code, score: s.score, priority: 'Average', tip: `${s.score}/100 — Solving 20 extra PYQs can push this to 75+.` })),
  ].slice(0, 5);

  const phases = ['Foundation', 'Practice', 'Revision', 'Exam Sprint'];

  return {
    coachMessage,
    targetScore: Math.min(92, avgScore + 18),
    recommended_hrs: profile.study_hrs,
    weekPlans: phases.map((phase, i) => ({
      week: i + 1,
      phase,
      // Focus label: show actual weakest subjects
      focus: critical.length > 0
        ? critical.slice(0, 2).map(s => s.name).join(' + ')
        : weak.length > 0
        ? weak.slice(0, 2).map(s => s.name).join(' + ')
        : 'All subjects',
      target: ['Build strong base in weak subjects', 'Solve 60+ problems per weak subject', 'Full revision of all subjects', 'Exam ready — mock tests only'][i],
      color: WEEK_COLORS[i],
      days: `Day ${i * 7 + 1}–${Math.min((i + 1) * 7, profile.exam_days)}`,
      // KEY FIX: generate tasks fresh for each phase using actual subject data
      tasks: buildWeekTasks(phase, subjectData),
    })),
    dailySchedule: scheduleByTime[profile.study_time] || scheduleByTime['Night'],
    smartTips,
    weakAreas: weakAreasForDisplay,
    aiGenerated: false,
  };
}

async function generateAIPlan(profile, subjectData) {
  try {
    const subjectSummary = subjectData.map(s =>
      `${s.name} (${s.code}): ${s.score !== null ? s.score + '/100' : 'no score entered'}, Credits: ${s.credits}`
    ).join('\n');
    const criticalNames = subjectData.filter(s => s.score !== null && s.score < 50).map(s => s.name);
    const weakNames     = subjectData.filter(s => s.score !== null && s.score >= 50 && s.score < 65).map(s => s.name);

    const prompt = `You are a senior academic mentor. Generate a precise 4-week study plan.
Student Profile: ${JSON.stringify(profile)}
All subjects with scores:
${subjectSummary}
Critical subjects (below 50/100): ${criticalNames.join(', ') || 'none'}
Weak subjects (50-65/100): ${weakNames.join(', ') || 'none'}

RULES:
1. Every single task MUST name a specific subject from the list above
2. Critical subjects get the MOST time — at least 2 tasks per week each
3. Strong subjects (80+) get MAINTENANCE ONLY — max 1 task per week
4. Tasks must be different and specific for each week phase

Reply ONLY with valid JSON (no markdown):
{
  "coachMessage": "...",
  "targetScore": 85,
  "recommended_hrs": 4,
  "weekPlans": [
    {
      "week": 1,
      "phase": "Foundation",
      "focus": "SubjectA + SubjectB",
      "target": "...",
      "tasks": ["task1 mentioning specific subject", "task2", "task3", "task4", "task5"]
    }
  ],
  "dailySchedule": [{"time": "8:00 PM", "task": "..."}],
  "smartTips": [{"icon": "📌", "title": "...", "body": "..."}],
  "weakAreas": [{"subject": "...", "code": "...", "score": 45, "priority": "Critical", "tip": "..."}]
}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    const text = data.content.map(c => c.text || '').join('');
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    parsed.aiGenerated = true;
    return parsed;
  } catch (e) {
    console.warn('AI plan failed, using smart fallback:', e.message);
    return generateFallbackPlan(profile, subjectData);
  }
}

// ── UI helpers ───────────────────────────────────────────────────────────────
function ProgressRing({ pct, color, size = 64, stroke = 6 }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: 'easeOut' }} strokeLinecap="round" />
    </svg>
  );
}

function ScorePill({ score, size = 'sm' }) {
  const lbl = subjectLabel(score);
  if (!lbl) return null;
  const pad = size === 'sm' ? '3px 10px' : '5px 14px';
  const fs = size === 'sm' ? 11 : 13;
  return (
    <span style={{ fontSize: fs, fontWeight: 700, padding: pad, borderRadius: 999, background: lbl.bg, color: lbl.color, border: `1px solid ${lbl.border}`, whiteSpace: 'nowrap' }}>
      {lbl.text}
    </span>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function StudyPlanGenerator({ initialProfile = null, autoStart = false, onPlanGenerated = null, user = null }) {
  const [step, setStep]                 = useState('branch');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSem, setSelectedSem]   = useState(null);
  const [subjectData, setSubjectData]   = useState([]);
  const [profile, setProfile]           = useState({ study_hrs: 3, exam_days: 28, attendance: 75, stress: 3, sleep: 7, challenge: 'Lack of focus', study_time: 'Night' });
  const [plan, setPlan]                 = useState(null);
  const [activeWeek, setActiveWeek]     = useState(0);
  const [taskDone, setTaskDone]         = useState({});
  const [xp, setXp]                     = useState(0);
  const [streak, setStreak]             = useState({ days: [], count: 0 });
  const [showXP, setShowXP]             = useState(false);
  const { width, height }               = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  const uid = user ? user.id : 'guest';

  useEffect(() => {
    try {
      setTaskDone(JSON.parse(localStorage.getItem(`mru_tasks_${uid}`) || '{}'));
      setXp(parseInt(localStorage.getItem(`mru_xp_${uid}`) || '0'));
      setStreak(JSON.parse(localStorage.getItem(`mru_streak_${uid}`) || '{"days":[],"count":0}'));
    } catch {}
  }, [uid]);

  useEffect(() => {
    if (!user) return;
    axios.post(`${API}/update-progress`, { xp, streak_count: streak.count }).catch(() => {});
  }, [xp, streak.count, user]);

  useEffect(() => {
    if (autoStart && initialProfile) {
      const branch = initialProfile.branch || 'CSE (Core)';
      const sem = initialProfile.semester || 1;
      setSelectedBranch(branch);
      setSelectedSem(sem);

      // Use stored subject scores if available (saved from previous plan generation)
      const baseSubs = MRU_BRANCHES[branch]?.semesters[sem] || [];
      const storedScores = initialProfile.subjectScores || {}; // key: subject code → score
      const subs = baseSubs.map(s => ({
        ...s,
        score: storedScores[s.code] !== undefined ? storedScores[s.code] : null,
        selected: storedScores[s.code] !== undefined ? true : (initialProfile.selectedSubjects ? initialProfile.selectedSubjects.includes(s.code) : true),
      }));

      setSubjectData(subs);
      setProfile(p => ({ ...p, ...initialProfile, branch, semester: sem }));

      // Now generate with actual scores — not all-null
      const gen = generateFallbackPlan({ ...initialProfile, branch, semester: sem }, subs);
      setPlan(gen);
      setStep('plan');
    }
  }, [autoStart, initialProfile]);

  const selectBranch = (branch) => { setSelectedBranch(branch); setSelectedSem(null); setSubjectData([]); setStep('semester'); };
  const selectSemester = (sem) => {
    setSelectedSem(sem);
    setSubjectData((MRU_BRANCHES[selectedBranch]?.semesters[sem] || []).map(s => ({ ...s, score: '', selected: true })));
    setStep('subjects');
  };
  const toggleSubject = (idx) => setSubjectData(prev => prev.map((s, i) => i === idx ? { ...s, selected: !s.selected } : s));
  const updateScore   = (idx, val) => {
    const clamped = val === '' ? '' : Math.min(100, Math.max(0, parseInt(val) || 0));
    setSubjectData(prev => prev.map((s, i) => i === idx ? { ...s, score: val === '' ? '' : clamped } : s));
  };
  const up = (k, v) => setProfile(p => ({ ...p, [k]: v }));

  const handleGenerate = async () => {
    const selected = subjectData
      .filter(s => s.selected)
      .map(s => ({ ...s, score: s.score === '' ? null : parseInt(s.score) }));

    // Save subject scores so "Continue My Plan" resume rebuilds correctly
    const subjectScores = {};
    const selectedSubjects = [];
    selected.forEach(s => {
      if (s.score !== null && !isNaN(s.score)) subjectScores[s.code] = s.score;
      selectedSubjects.push(s.code);
    });

    const fullProfile = {
      ...profile,
      branch: selectedBranch,
      semester: selectedSem,
      subjectScores,
      selectedSubjects,
    };

    setStep('generating');
    const generated = await generateAIPlan(fullProfile, selected);
    setPlan(generated);
    setStep('plan');
    setActiveWeek(0);

    setTaskDone({});
    setXp(0);
    setStreak({ days: [], count: 0 });
    localStorage.removeItem(`mru_tasks_${uid}`);
    localStorage.removeItem(`mru_xp_${uid}`);
    localStorage.removeItem(`mru_streak_${uid}`);

    if (onPlanGenerated) {
      onPlanGenerated(fullProfile, {
        targetScore: generated.targetScore,
        recommended_hrs: generated.recommended_hrs,
        totalDays: profile.exam_days,
        weakAreasCount: generated.weakAreas.length,
      });
    }
    if (user) {
      axios.post(`${API}/save-plan`, { profile: fullProfile, plan_summary: { targetScore: generated.targetScore } }).catch(() => {});
      axios.post(`${API}/update-progress`, { xp: 0, streak_count: 0 }).catch(() => {});
    }
  };

  const toggleTask = (wIdx, tIdx) => {
    const key = `${wIdx}-${tIdx}`;
    const isDone = !taskDone[key];
    const newXp = Math.max(0, xp + (isDone ? 20 : -20));
    const newDone = { ...taskDone, [key]: isDone };
    setTaskDone(newDone);
    setXp(newXp);

    if (isDone) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setShowXP(true);
      setTimeout(() => setShowXP(false), 1500);
    }

    const today = todayKey();
    setStreak(prev => {
      if (!isDone || prev.days.includes(today)) return prev;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yKey = yesterday.toISOString().split('T')[0];
      const days = [...prev.days, today].slice(-30);
      const count = prev.days.includes(yKey) ? prev.count + 1 : 1;
      const updated = { days, count };
      localStorage.setItem(`mru_streak_${uid}`, JSON.stringify(updated));
      return updated;
    });

    localStorage.setItem(`mru_tasks_${uid}`, JSON.stringify(newDone));
    localStorage.setItem(`mru_xp_${uid}`, String(newXp));
  };

  const doneTasks  = Object.values(taskDone).filter(Boolean).length;
  const totalTasks = plan ? plan.weekPlans.reduce((a, w) => a + w.tasks.length, 0) : 0;
  const overallPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const level      = Math.floor(xp / 100) + 1;
  const earnedBadges = BADGES.reduce((acc, b) => {
    if (b.need   && doneTasks    >= b.need)   acc[b.id] = true;
    if (b.streak && streak.count >= b.streak) acc[b.id] = true;
    return acc;
  }, {});

  const cv = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const iv = { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } } };

  // ── BRANCH ───────────────────────────────────────────────────────────────
  if (step === 'branch') {
    return (
      <motion.div variants={cv} initial="hidden" animate="show" style={{ maxWidth: 900, margin: '0 auto' }}>
        <motion.div variants={iv} style={{ marginBottom: 36, padding: '32px', background: 'linear-gradient(135deg, rgba(167,139,250,0.12), rgba(96,165,250,0.12))', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '20px' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, color: 'var(--text)' }}>📚 Select Your Branch</h2>
          <p style={{ color: 'var(--text2)', fontSize: 15 }}>AI-powered plan built around your actual marks — not a generic schedule.</p>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          {Object.entries(MRU_BRANCHES).map(([key, val]) => (
            <motion.button key={key} variants={iv} onClick={() => selectBranch(key)}
              whileHover={{ scale: 1.02, borderColor: '#a78bfa', boxShadow: '0 0 30px rgba(167,139,250,0.2)' }}
              whileTap={{ scale: 0.98 }}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '18px', padding: '28px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>{key}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8, lineHeight: 1.3 }}>{val.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text3)' }}>8 semesters · {Object.values(val.semesters).flat().length} subjects</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  // ── SEMESTER ─────────────────────────────────────────────────────────────
  if (step === 'semester') {
    const branch = MRU_BRANCHES[selectedBranch];
    return (
      <motion.div variants={cv} initial="hidden" animate="show" style={{ maxWidth: 800, margin: '0 auto' }}>
        <motion.button variants={iv} onClick={() => setStep('branch')} className="btn btn-outline" style={{ marginBottom: 24 }}>← Change Branch</motion.button>
        <motion.div variants={iv} className="card" style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', marginBottom: 8 }}>{selectedBranch}</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4, color: 'var(--text)' }}>Which semester are you in?</h2>
        </motion.div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {[1,2,3,4,5,6,7,8].map(sem => (
            <motion.button key={sem} variants={iv} onClick={() => selectSemester(sem)}
              whileHover={{ scale: 1.05, borderColor: '#60a5fa', boxShadow: '0 0 24px rgba(96,165,250,0.25)' }}
              whileTap={{ scale: 0.95 }}
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px 16px', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#60a5fa', marginBottom: 6 }}>Sem {sem}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)' }}>{branch.semesters[sem]?.length || 0} subjects</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    );
  }

  // ── SUBJECTS ─────────────────────────────────────────────────────────────
  if (step === 'subjects') {
    const selected = subjectData.filter(s => s.selected);
    const scoredCount = selected.filter(s => s.score !== '').length;

    return (
      <motion.div variants={cv} initial="hidden" animate="show" style={{ maxWidth: 900, margin: '0 auto' }}>
        <motion.div variants={iv} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <button onClick={() => setStep('semester')} className="btn btn-outline">← Back</button>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase' }}>{selectedBranch} · Semester {selectedSem}</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Enter your marks for each subject</div>
          </div>
        </motion.div>

        <motion.div variants={iv} style={{ marginBottom: 20, padding: '14px 20px', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)', borderRadius: '12px', fontSize: 14, color: '#60a5fa', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <span>Enter your previous exam marks. The lower your score, the more time your plan dedicates to that subject. Leave blank if you don't have marks yet.</span>
        </motion.div>

        {/* Legend */}
        <motion.div variants={iv} style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { text: '🔴 Critical  (<50)', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' },
            { text: '🟡 Weak  (50–64)', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
            { text: '🔵 Average  (65–79)', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.3)' },
            { text: '🟢 Strong  (80+)', color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)' },
          ].map(l => (
            <span key={l.text} style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 999, background: l.bg, color: l.color, border: `1px solid ${l.border}` }}>{l.text}</span>
          ))}
        </motion.div>

        <motion.div variants={iv} style={{ display: 'grid', gap: 10, marginBottom: 28 }}>
          {subjectData.map((sub, idx) => {
            const scoreNum = sub.score === '' ? null : parseInt(sub.score);
            const lbl = (scoreNum !== null && !isNaN(scoreNum)) ? subjectLabel(scoreNum) : null;
            return (
              <motion.div key={idx}
                animate={{ borderColor: sub.selected ? (lbl ? lbl.border : 'var(--border-glow)') : 'var(--border)', background: sub.selected ? 'var(--bg-elevated)' : 'rgba(255,255,255,0.02)' }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', border: '1px solid', borderRadius: '14px', transition: 'all 0.2s' }}>
                <div onClick={() => toggleSubject(idx)} style={{ width: 22, height: 22, borderRadius: 6, cursor: 'pointer', border: `2px solid ${sub.selected ? '#a78bfa' : 'var(--border)'}`, background: sub.selected ? '#a78bfa' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s' }}>
                  {sub.selected && <span style={{ color: '#fff', fontSize: 13, fontWeight: 800 }}>✓</span>}
                </div>
                <div style={{ flex: 1, opacity: sub.selected ? 1 : 0.4 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', marginBottom: 3 }}>{sub.code} · {sub.credits} credits</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{sub.name}</div>
                </div>
                {lbl && <ScorePill score={scoreNum} />}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: sub.selected ? 1 : 0.4 }}>
                  <input
                    type="number"
                    placeholder="—"
                    value={sub.score}
                    disabled={!sub.selected}
                    onChange={e => updateScore(idx, e.target.value)}
                    className="form-input"
                    style={{ width: 76, textAlign: 'center', padding: '9px', borderColor: lbl ? lbl.border : undefined }}
                    min={0} max={100}
                  />
                  <span style={{ fontSize: 13, color: 'var(--text3)' }}>/100</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {scoredCount > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 16, padding: '12px 18px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '10px', fontSize: 13, color: '#34d399', display: 'flex', gap: 8 }}>
            <span>✅</span>
            <span>Scores entered for {scoredCount} subject{scoredCount > 1 ? 's' : ''}. Your plan will prioritize your lowest-scoring subjects automatically.</span>
          </motion.div>
        )}

        <motion.button variants={iv} onClick={() => selected.length > 0 && setStep('profile')} disabled={selected.length === 0} className="btn btn-primary btn-full" style={{ padding: '16px', fontSize: 16 }}>
          Continue to Profile Setup →
        </motion.button>
      </motion.div>
    );
  }

  // ── PROFILE ───────────────────────────────────────────────────────────────
  if (step === 'profile') {
    return (
      <motion.div variants={cv} initial="hidden" animate="show" style={{ maxWidth: 900, margin: '0 auto' }}>
        <motion.div variants={iv} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <button onClick={() => setStep('subjects')} className="btn btn-outline">← Back</button>
          <div><div style={{ fontSize: 20, fontWeight: 700 }}>Study Habits & Wellbeing</div></div>
        </motion.div>
        <div className="grid-2">
          <motion.div variants={iv} className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>⏱️ Schedule</h3>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Daily study hours ({profile.study_hrs}h)</label>
              <input type="range" min="1" max="12" step="0.5" value={profile.study_hrs} onChange={e => up('study_hrs', +e.target.value)} className="range-input" />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Days until exam ({profile.exam_days}d)</label>
              <input type="range" min="7" max="90" value={profile.exam_days} onChange={e => up('exam_days', +e.target.value)} className="range-input" style={{ accentColor: '#60a5fa' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Preferred Study Time</label>
              <select value={profile.study_time} onChange={e => up('study_time', e.target.value)} className="form-select">
                <option>Morning</option><option>Afternoon</option><option>Night</option>
              </select>
            </div>
          </motion.div>
          <motion.div variants={iv} className="card">
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>🧠 Wellbeing</h3>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Stress Level ({profile.stress}/5)</label>
              <input type="range" min="1" max="5" value={profile.stress} onChange={e => up('stress', +e.target.value)} className="range-input" style={{ accentColor: '#ef4444' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label">Sleep hours ({profile.sleep}h)</label>
              <input type="range" min="3" max="10" value={profile.sleep} onChange={e => up('sleep', +e.target.value)} className="range-input" style={{ accentColor: '#34d399' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 32 }}>
              <label className="form-label">Biggest Challenge</label>
              <select value={profile.challenge} onChange={e => up('challenge', e.target.value)} className="form-select">
                <option>Lack of focus</option>
                <option>Too much stress</option>
                <option>Not enough time</option>
                <option>Concepts not clear</option>
                <option>No proper revision</option>
                <option>Lab practicals difficult</option>
              </select>
            </div>
            <button onClick={handleGenerate} className="btn btn-primary btn-full" style={{ padding: '16px', fontSize: 16 }}>🚀 Generate My Plan</button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // ── GENERATING ────────────────────────────────────────────────────────────
  if (step === 'generating') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: 24 }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ width: 60, height: 60, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#a78bfa' }} />
        <h2 style={{ fontSize: 24, fontWeight: 800 }}>Analysing your marks...</h2>
        <p style={{ color: 'var(--text2)' }}>Building a subject-by-subject priority plan.</p>
      </div>
    );
  }

  // ── PLAN VIEW ─────────────────────────────────────────────────────────────
  if (step === 'plan' && plan) {
    const currentWeek = plan.weekPlans[activeWeek];
    const weekDone    = currentWeek?.tasks.filter((_, ti) => taskDone[`${activeWeek}-${ti}`]).length || 0;
    const weekTotal   = currentWeek?.tasks.length || 0;
    const weekPct     = weekTotal > 0 ? Math.round((weekDone / weekTotal) * 100) : 0;

    const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

    return (
      <motion.div variants={cv} initial="hidden" animate="show" style={{ maxWidth: 1200, margin: '0 auto', position: 'relative' }}>
        {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={280} gravity={0.18} />}

        <AnimatePresence>
          {showXP && (
            <motion.div
              initial={{ opacity: 0, y: 60, scale: 0.6, x: '-50%' }}
              animate={{ opacity: 1, y: 0, scale: 1.1, x: '-50%' }}
              exit={{ opacity: 0, y: -40, scale: 0.8, x: '-50%' }}
              style={{ position: 'fixed', top: '18%', left: '50%', background: 'linear-gradient(135deg, #a78bfa, #60a5fa)', color: 'white', padding: '12px 32px', borderRadius: '999px', fontSize: 22, fontWeight: 800, boxShadow: '0 12px 40px rgba(167,139,250,0.5)', zIndex: 1000, pointerEvents: 'none' }}>
              +20 XP! 🔥
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div variants={iv} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>{selectedBranch} · Semester {selectedSem}</div>
            <div style={{ fontSize: 26, fontWeight: 800 }}>{profile.exam_days}-Day Study Plan</div>
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20 }}>⭐</span>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 700 }}>LEVEL {level}</div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>{xp} XP</div>
              </div>
            </div>
            {streak.count > 0 && (
              <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '14px', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>🔥</span>
                <div>
                  <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 700 }}>STREAK</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#fbbf24' }}>{streak.count} Days</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Coach message */}
        {plan.coachMessage && (
          <motion.div variants={iv} style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(167,139,250,0.1), rgba(96,165,250,0.1))', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '16px', marginBottom: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 32 }}>🧑‍🏫</div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1.5px' }}>AI Coach</div>
              <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.65 }}>{plan.coachMessage}</div>
            </div>
          </motion.div>
        )}

        {/* Focus subjects bar */}
        {plan.weakAreas.length > 0 && (
          <motion.div variants={iv} style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22, padding: '14px 18px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '14px', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginRight: 4, textTransform: 'uppercase', letterSpacing: '1px' }}>Focus:</span>
            {plan.weakAreas.map((w, i) => {
              const lbl = subjectLabel(w.score);
              return (
                <span key={i} style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 999, background: lbl ? lbl.bg : 'rgba(96,165,250,0.12)', color: lbl ? lbl.color : '#60a5fa', border: `1px solid ${lbl ? lbl.border : 'rgba(96,165,250,0.3)'}` }}>
                  {w.subject}{w.score !== null ? ` · ${w.score}/100` : ''} — {w.priority}
                </span>
              );
            })}
          </motion.div>
        )}

        {/* Stat cards */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {[
            { ring: true, pct: overallPct, color: '#60a5fa', label: 'Overall Progress', value: `${doneTasks}/${totalTasks}` },
            { ring: true, pct: weekPct, color: '#a78bfa', label: 'This Week', value: `${weekDone}/${weekTotal}` },
            { label: 'Target Score', value: `${plan.targetScore}%`, color: '#34d399', sub: 'Aim high! 🚀' },
            { label: 'Daily Study', value: `${plan.recommended_hrs}h`, color: '#fbbf24', sub: 'Recommended' },
          ].map((s, i) => (
            <motion.div key={i} variants={iv} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: s.ring ? 20 : 0 }}>
              {s.ring && <ProgressRing pct={s.pct} color={s.color} size={68} stroke={5} />}
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value" style={{ fontSize: 26, color: s.color }}>{s.value}</div>
                {s.sub && <div className="stat-change">{s.sub}</div>}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid-2-1">
          {/* Week tasks */}
          <motion.div variants={iv} className="card">
            {/* Week tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
              {plan.weekPlans.map((w, i) => (
                <button key={i} onClick={() => setActiveWeek(i)}
                  style={{ padding: '9px 18px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: 13, border: '1px solid', transition: 'all 0.2s',
                    background: activeWeek === i ? w.color : 'transparent',
                    color: activeWeek === i ? '#111' : 'var(--text2)',
                    borderColor: activeWeek === i ? w.color : 'var(--border)',
                    boxShadow: activeWeek === i ? `0 0 20px ${w.color}55` : 'none',
                  }}>
                  W{w.week}: {w.phase}
                </button>
              ))}
            </div>

            {currentWeek && (
              <motion.div key={activeWeek} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 22 }}>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: currentWeek.color, marginBottom: 4 }}>{currentWeek.phase} Phase</h3>
                    <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 4 }}>{currentWeek.target}</p>
                    <p style={{ color: 'var(--text3)', fontSize: 12 }}>Priority: {currentWeek.focus}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <span style={{ fontSize: 12, padding: '5px 14px', borderRadius: 999, background: `${currentWeek.color}22`, color: currentWeek.color, border: `1px solid ${currentWeek.color}55`, fontWeight: 700 }}>{currentWeek.days}</span>
                    <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 600 }}>{weekDone}/{weekTotal} done</span>
                  </div>
                </div>

                {/* Progress bar for week */}
                <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 999, marginBottom: 20, overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${weekPct}%` }} style={{ height: '100%', background: currentWeek.color, borderRadius: 999 }} transition={{ duration: 0.8, ease: 'easeOut' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {currentWeek.tasks.map((task, ti) => {
                    const key = `${activeWeek}-${ti}`;
                    const done = taskDone[key];
                    const dayLabel = DAY_LABELS[ti] || `D${ti + 1}`;
                    return (
                      <motion.div key={ti} onClick={() => toggleTask(activeWeek, ti)}
                        whileHover={{ scale: 1.008, x: 2 }}
                        whileTap={{ scale: 0.99 }}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 18px', borderRadius: '14px', cursor: 'pointer',
                          background: done ? 'rgba(52,211,153,0.08)' : 'var(--bg-elevated)',
                          border: `1px solid ${done ? 'rgba(52,211,153,0.3)' : 'var(--border)'}`,
                          transition: 'all 0.18s'
                        }}>
                        <div style={{ width: 26, height: 26, borderRadius: '8px', border: `2px solid ${done ? '#34d399' : 'var(--border)'}`, background: done ? '#34d399' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, transition: 'all 0.18s' }}>
                          {done && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ color: '#111', fontWeight: 900, fontSize: 13 }}>✓</motion.span>}
                        </div>
                        <div style={{ width: 36, fontSize: 11, fontWeight: 800, color: done ? '#34d399' : currentWeek.color, textTransform: 'uppercase', flexShrink: 0, marginTop: 4, letterSpacing: '0.5px' }}>{dayLabel}</div>
                        <div style={{ flex: 1, fontSize: 13, color: done ? 'var(--text3)' : 'var(--text)', textDecoration: done ? 'line-through' : 'none', lineHeight: 1.55 }}>{task}</div>
                        <div style={{ fontSize: 12, fontWeight: 800, color: done ? '#34d399' : '#a78bfa', flexShrink: 0, opacity: done ? 0.7 : 1 }}>+20 XP</div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Right sidebar */}
          <motion.div variants={iv} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Badges */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🏆 Badges</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {BADGES.map(b => (
                  <div key={b.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 8px', borderRadius: '12px', background: earnedBadges[b.id] ? 'rgba(167,139,250,0.12)' : 'var(--bg-elevated)', border: `1px solid ${earnedBadges[b.id] ? '#a78bfa' : 'var(--border)'}`, opacity: earnedBadges[b.id] ? 1 : 0.35, transition: 'all 0.3s' }}>
                    <span style={{ fontSize: 22, filter: earnedBadges[b.id] ? 'drop-shadow(0 0 8px rgba(167,139,250,0.6))' : 'grayscale(1)' }}>{b.icon}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, marginTop: 8, textAlign: 'center', color: earnedBadges[b.id] ? 'var(--text)' : 'var(--text3)' }}>{b.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart tips */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🧠 Smart Tips</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.smartTips.map((tip, i) => (
                  <div key={i} style={{ padding: '14px 16px', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.25)', borderRadius: '12px' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#60a5fa', marginBottom: 6 }}>{tip.icon} {tip.title}</div>
                    <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.55 }}>{tip.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily schedule */}
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>🕐 Daily Schedule ({profile.study_time})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.dailySchedule.map((slot, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, paddingBottom: 10, borderBottom: i < plan.dailySchedule.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#a78bfa', minWidth: 105, paddingTop: 1 }}>{slot.time}</div>
                    <div style={{ fontSize: 12, color: 'var(--text)', lineHeight: 1.5 }}>{slot.task}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weak areas */}
            {plan.weakAreas.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>⚠️ Weak Areas — Action Plan</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {plan.weakAreas.map((w, i) => {
                    const lbl = subjectLabel(w.score);
                    return (
                      <div key={i} style={{ padding: '14px', background: lbl ? lbl.bg : 'rgba(239,68,68,0.08)', border: `1px solid ${lbl ? lbl.border : 'rgba(239,68,68,0.3)'}`, borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <strong style={{ color: lbl ? lbl.color : '#ef4444', fontSize: 13 }}>{w.subject}</strong>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {w.score !== null && <ScorePill score={w.score} />}
                          </div>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{w.tip}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return null;
}