# 🧠 EduSense AI — Student Performance Prediction System
### Bake-Off Competition | Course: CSH217C
**Team:** Neha Gupta (2K24CSUN01044) · Drashtee Singh Chauhan (2K24CSUN01019)

---

## 🚀 Quick Start

```bash
# Clone / open project folder
cd student_ai_system

# One command setup (Linux/macOS)
chmod +x setup_and_run.sh && ./setup_and_run.sh

# Windows — run manually (see below)
```

**App URLs after launch:**
| Service | URL |
|---|---|
| 🌐 Frontend Dashboard | http://localhost:3000 |
| 🔌 FastAPI Backend | http://localhost:8000 |
| 📖 Auto API Docs | http://localhost:8000/docs |

---

## 🖥️ Manual Setup (Windows / macOS / Linux)

### Backend (Terminal 1)
```bash
cd student_ai_system/backend

# Create virtual environment
python -m venv venv

# Activate
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Train all ML models (REQUIRED first time)
python ml_pipeline.py

# Start API server
uvicorn main:app --reload --port 8000
```

### Frontend (Terminal 2)
```bash
cd student_ai_system/frontend

npm install
npm start
```

Open http://localhost:3000 — enjoy 🎉

---

## 📁 Project Structure

```
student_ai_system/
├── backend/
│   ├── main.py                  ← FastAPI REST API
│   ├── ml_pipeline.py           ← ML training pipeline
│   ├── requirements.txt         ← Python packages
│   ├── models/                  ← Saved trained models (auto-created)
│   │   ├── performance_model.pkl
│   │   ├── risk_model.pkl
│   │   ├── metrics.json
│   │   └── ...
│   └── data/
│       └── student_performance.xlsx  ← Your dataset
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── src/
│       ├── App.js               ← Router + global state
│       ├── App.css              ← Full design system
│       ├── index.js             ← React entry point
│       ├── components/
│       │   ├── SplashScreen.js  ← Animated launch screen
│       │   └── Sidebar.js       ← Navigation sidebar
│       └── pages/
│           ├── Dashboard.js     ← Overview + charts
│           ├── PredictPage.js   ← Student input + results
│           └── AnalyticsPage.js ← Model metrics + SHAP
├── setup_and_run.sh             ← One-command launcher
└── README.md                    ← This file
```

---

## 🤖 ML Models Used

| Model | Role | Why |
|---|---|---|
| Logistic Regression | Baseline | Simple, interpretable |
| Random Forest | Ensemble | High accuracy, feature importance |
| SVM (RBF kernel) | Boundary | Handles non-linear patterns |
| XGBoost | Boosting | Best performer, gradient boosting |
| Gradient Boosting | Boosting | Robust to outliers |

**Auto-selection:** Best model (by weighted F1) is saved and used for predictions.

---

## 📊 Features Predicted

1. **Performance Category** → High / Medium / Low
2. **Risk Level** → High Risk / Moderate Risk / Low Risk
3. **Estimated Score Range** → min / predicted / max %
4. **Wellness Score** → Composite psychometric score
5. **Engagement Score** → Study + attendance + consistency
6. **Personalized Recommendations** → Priority-ranked action items
7. **Weak Areas** → Color-coded progress bars per factor

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/health` | API status |
| POST | `/predict` | Predict student performance |
| GET | `/metrics` | All model evaluation metrics |
| GET | `/feature-importance` | SHAP feature importance |
| GET | `/dataset-stats` | Dataset statistics |
| POST | `/upload-dataset` | Upload new dataset for retraining |

---

## 🌟 Unique Features

- 🧠 **Animated splash screen** with neural nodes and progress bar
- 🔮 **Dual prediction** — performance + risk in one click
- 🔬 **SHAP explainability** — shows which features drove the prediction
- ⚠️ **Smart recommendations** — personalized, prioritized (Critical / High / Medium / Low)
- 📡 **Radar chart** — student profile visualization
- 🔔 **Notification system** — bell with real-time alerts
- 📤 **Dataset upload** — retrain with new data via API
- 🎨 **Dark glassmorphism UI** — purple gradient, glow effects, animations
- 🌍 **SDG alignment** — UN Sustainable Development Goals displayed
- ⚗️ **SMOTE** — handles class imbalance automatically
- 🔁 **Cross-validation** — 3-fold CV on all models
- 📊 **5-model comparison** — bar charts with accuracy/F1/precision/recall

---

## 🛠️ Tech Stack

**Backend:** Python · FastAPI · Scikit-learn · XGBoost · SHAP · Pandas · SMOTE
**Frontend:** React 18 · Recharts · Framer Motion · React Router · Axios
**ML:** Logistic Regression · Random Forest · SVM · XGBoost · Gradient Boosting

---

## 📋 Dataset Columns Used

Age, Gender, Education Level, Stream, Previous Exam %, Attendance %,
Coaching, Study Hours, Study Consistency, Study Time, Notes, Revision,
Sleep Hours, Screen Time, Physical Activity, Stress, Motivation,
Exam Anxiety, Self-Confidence, Focus, Study Environment, Internet,
Family Support, Distraction, Challenges, Goals, Expected Score

---

## ⚠️ Troubleshooting

| Issue | Fix |
|---|---|
| `Models not loaded` | Run `python ml_pipeline.py` first |
| `CORS error` | Ensure backend runs on port 8000 |
| `npm not found` | Install Node.js from nodejs.org |
| `pip install fails` | Use `pip3` or activate venv first |
| Frontend blank | Check browser console, ensure `npm start` ran |
| Port 3000 busy | `PORT=3001 npm start` |
| Port 8000 busy | `uvicorn main:app --port 8001` |

---

*Built with ❤️ for the ML Bake-Off Competition*
