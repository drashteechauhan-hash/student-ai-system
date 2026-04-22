#!/bin/bash
# ================================================================
# EduSense AI - Master Setup Script
# AI-Based Student Performance & Risk Prediction System
# ================================================================

set -e

echo ""
echo "🧠 ══════════════════════════════════════════════"
echo "   EduSense AI — Setup & Launch"
echo "══════════════════════════════════════════════════"
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Install Python 3.9+"
    exit 1
fi

# Check Node
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Install Node 18+"
    exit 1
fi

echo "✅ Python: $(python3 --version)"
echo "✅ Node:   $(node --version)"
echo ""

# ── Step 1: Backend Setup ──────────────────────────────────────
echo "📦 [1/4] Setting up Python backend..."
cd backend

if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "   ✅ Virtual environment created"
fi

source venv/bin/activate
pip install -q --upgrade pip
pip install -q -r requirements.txt
echo "   ✅ Dependencies installed"

# ── Step 2: Train Models ───────────────────────────────────────
echo ""
echo "🤖 [2/4] Training ML models on your dataset..."
python3 ml_pipeline.py
echo "   ✅ Models trained and saved"

deactivate
cd ..

# ── Step 3: Frontend Setup ─────────────────────────────────────
echo ""
echo "⚛️  [3/4] Setting up React frontend..."
cd frontend
npm install --silent
echo "   ✅ Node packages installed"
cd ..

# ── Step 4: Launch ────────────────────────────────────────────
echo ""
echo "🚀 [4/4] Launching EduSense AI..."
echo ""
echo "══════════════════════════════════════════════════"
echo "  🌐 Frontend:  http://localhost:3000"
echo "  🔌 Backend:   http://localhost:8000"
echo "  📖 API Docs:  http://localhost:8000/docs"
echo "══════════════════════════════════════════════════"
echo ""
echo "Starting servers... (Press Ctrl+C to stop)"
echo ""

# Start backend
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Start frontend
cd frontend
BROWSER=none npm start &
FRONTEND_PID=$!
cd ..

echo "✅ Both servers running!"
echo "🌐 Open: http://localhost:3000"
echo ""

# Cleanup on exit
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Done.'" EXIT

wait
