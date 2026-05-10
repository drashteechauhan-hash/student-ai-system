from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from typing import Optional
import pandas as pd, numpy as np, joblib, json, os, io, re, math, traceback
import warnings; warnings.filterwarnings('ignore')
import mysql.connector
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta

app = FastAPI(title="EduSense AI", version="3.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True,
                   allow_methods=["*"], allow_headers=["*"])

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
artifacts = {}

# ── Auth config ──────────────────────────────────────────────────────────────
SECRET_KEY  = "edusense_super_secret_2024"
ALGORITHM   = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login", auto_error=False)

# ── DB helper ────────────────────────────────────────────────────────────────
def get_db():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "drashtee098"),
        database=os.getenv("DB_NAME", "student_performance"),
        port=int(os.getenv("DB_PORT", "3306"))
    )

# ── Auth helpers ─────────────────────────────────────────────────────────────
def hash_pw(password: str):
    password = password[:72]  # bcrypt fix
    return pwd_context.hash(password)

def verify_pw(password: str, hashed: str):
    password = password[:72]  # bcrypt fix
    return pwd_context.verify(password, hashed)

def make_token(user_id: int, email: str):
    exp = datetime.utcnow() + timedelta(days=30)
    return jwt.encode({"sub": str(user_id), "email": email, "exp": exp},
                      SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    if not token:
        raise HTTPException(401, "Not logged in")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"id": int(payload["sub"]), "email": payload["email"]}
    except JWTError:
        raise HTTPException(401, "Invalid or expired token")

def safe_float(v):
    try:
        f = float(v)
        return 0.0 if (math.isnan(f) or math.isinf(f)) else round(f, 4)
    except: return 0.0

# ── Load ML models ───────────────────────────────────────────────────────────
def load_artifacts():
    a = {}
    try:
        for k, fname in [
            ("perf_model",    "performance_model.pkl"),
            ("risk_model",    "risk_model.pkl"),
            ("perf_scaler",   "performance_scaler.pkl"),
            ("risk_scaler",   "risk_scaler.pkl"),
            ("perf_encoder",  "performance_encoder.pkl"),
            ("risk_encoder",  "risk_encoder.pkl"),
            ("imputer",       "imputer.pkl"),
            ("feature_names", "feature_names.pkl")
        ]:
            a[k] = joblib.load(os.path.join(MODEL_DIR, fname))
        with open(os.path.join(MODEL_DIR, "metrics.json")) as f:
            a["metrics"] = json.load(f)
        print("✅ All models loaded. Features:", a["feature_names"])
    except Exception as e:
        print(f"⚠️ Model load error: {e}")
    return a

@app.on_event("startup")
async def startup():
    global artifacts
    artifacts = load_artifacts()

# ════════════════════════════════════════════════════════════════════════════
# AUTH ROUTES
# ════════════════════════════════════════════════════════════════════════════

class RegisterInput(BaseModel):
    name: str
    email: str
    password: str
    role: str = "student"

class LoginInput(BaseModel):
    email: str
    password: str

@app.post("/register")
def register(data: RegisterInput):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id FROM users WHERE email = %s", (data.email,))
        if cursor.fetchone():
            raise HTTPException(400, "Email already registered")
        hashed = hash_pw(data.password)
        cursor.execute(
            "INSERT INTO users (name, email, password_hash, role) VALUES (%s, %s, %s, %s)",
            (data.name.strip(), data.email.strip().lower(), hashed, data.role.strip().lower())
        )
        conn.commit()
        user_id = cursor.lastrowid
        cursor.close(); conn.close()
        token = make_token(user_id, data.email)
        return {
            "token": token,
            "user": {"id": user_id, "name": data.name, "email": data.email, "role": data.role.strip().lower()}
        }
    except HTTPException: raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))

@app.post("/login")
def login(data: LoginInput):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM users WHERE email = %s",
                       (data.email.strip().lower(),))
        user = cursor.fetchone()
        cursor.close(); conn.close()
        if not user or not verify_pw(data.password, user["password_hash"]):
            raise HTTPException(401, "Wrong email or password")
        token = make_token(user["id"], user["email"])
        return {
            "token": token,
            "user": {"id": user["id"], "name": user["name"], "email": user["email"], "role": user.get("role", "student")}
        }
    except HTTPException: raise
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))

@app.get("/me")
def get_me(current_user=Depends(get_current_user)):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT id, name, email, role, created_at FROM users WHERE id = %s",
                       (current_user["id"],))
        user = cursor.fetchone()
        cursor.close(); conn.close()
        if not user: raise HTTPException(404, "User not found")
        return user
    except HTTPException: raise
    except Exception as e: raise HTTPException(500, str(e))

# ════════════════════════════════════════════════════════════════════════════
# STUDY PLANNER — PROGRESS & STREAK
# ════════════════════════════════════════════════════════════════════════════

class TaskToggle(BaseModel):
    week_idx: int
    task_idx: int
    is_done: bool
    xp: int

class StreakSave(BaseModel):
    date_key: str
    streak_count: int
    xp: int

class ProgressUpdate(BaseModel):
    xp: int
    streak_count: int

@app.post("/save-task")
def save_task(data: TaskToggle, current_user=Depends(get_current_user)):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO study_progress (user_id, week_idx, task_idx, is_done, xp_earned)
            VALUES (%s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE is_done=%s, xp_earned=%s
        """, (current_user["id"], data.week_idx, data.task_idx,
              data.is_done, data.xp, data.is_done, data.xp))
        conn.commit(); cursor.close(); conn.close()
        return {"saved": True}
    except Exception as e: raise HTTPException(500, str(e))

@app.post("/update-progress")
def update_progress(data: ProgressUpdate, current_user=Depends(get_current_user)):
    """
    Called by StudyPlanGenerator whenever XP or streak changes.
    Upserts into user_progress so Dashboard /my-progress always shows live data.
    """
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_progress (
                user_id INT PRIMARY KEY,
                total_xp INT DEFAULT 0,
                streak_count INT DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        cursor.execute("""
            INSERT INTO user_progress (user_id, total_xp, streak_count)
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE
                total_xp = %s,
                streak_count = %s,
                updated_at = CURRENT_TIMESTAMP
        """, (current_user["id"], data.xp, data.streak_count,
              data.xp, data.streak_count))
        conn.commit(); cursor.close(); conn.close()
        return {"status": "ok", "xp": data.xp, "streak_count": data.streak_count}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))

@app.get("/my-progress")
def get_progress(current_user=Depends(get_current_user)):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)

        # Ensure table exists
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_progress (
                user_id INT PRIMARY KEY,
                total_xp INT DEFAULT 0,
                streak_count INT DEFAULT 0,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)

        # Get live XP + streak from user_progress (written by /update-progress)
        cursor.execute(
            "SELECT total_xp, streak_count FROM user_progress WHERE user_id = %s",
            (current_user["id"],)
        )
        progress_row = cursor.fetchone()

        # Also fetch task-level data (kept for backward compatibility)
        cursor.execute(
            "SELECT week_idx, task_idx, is_done, xp_earned FROM study_progress WHERE user_id = %s",
            (current_user["id"],)
        )
        rows = cursor.fetchall()

        # Streak days from streaks table (kept for backward compatibility)
        cursor.execute(
            "SELECT date_key FROM streaks WHERE user_id = %s ORDER BY date_key DESC LIMIT 30",
            (current_user["id"],)
        )
        streak_days = [r["date_key"] for r in cursor.fetchall()]

        cursor.close(); conn.close()

        task_done = {f"{r['week_idx']}-{r['task_idx']}": bool(r['is_done']) for r in rows}

        # Prefer user_progress values (synced in real-time) over computed totals
        total_xp     = progress_row["total_xp"]     if progress_row else sum(r['xp_earned'] for r in rows if r['is_done'])
        streak_count = progress_row["streak_count"]  if progress_row else 0

        return {
            "task_done": task_done,
            "total_xp": total_xp,
            "streak_count": streak_count,
            "streak_days": streak_days,
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))

@app.post("/save-streak")
def save_streak(data: StreakSave, current_user=Depends(get_current_user)):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO streaks (user_id, date_key, streak_count, total_xp)
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE streak_count=%s, total_xp=%s
        """, (current_user["id"], data.date_key, data.streak_count, data.xp,
              data.streak_count, data.xp))
        conn.commit(); cursor.close(); conn.close()
        return {"saved": True}
    except Exception as e: raise HTTPException(500, str(e))

# ════════════════════════════════════════════════════════════════════════════
# PREDICT
# ════════════════════════════════════════════════════════════════════════════

class PredictInput(BaseModel):
    age: float = 19
    gender: str = "Female"
    education_level: str = "Undergraduate"
    stream: str = "Engineering"
    previous_score: float = 65
    attendance: float = 75
    coaching: str = "No"
    study_hours: float = 2
    study_consistency: float = 3
    preferred_study_time: str = "Night"
    makes_notes: str = "Sometimes"
    revision_frequency: str = "Before exams only"
    sleep_hours: float = 7
    screen_time: str = "3-5 hours"
    physical_activity: str = "Occasionally"
    stress_level: float = 3
    motivation_level: float = 3
    exam_anxiety: float = 3
    self_confidence: float = 3
    focus_ability: float = 3
    study_environment: str = "Sometimes distracting"
    internet_quality: str = "Good"
    family_support: float = 3
    gets_distracted: str = "Sometimes"
    biggest_challenge: str = "Lack of focus"
    sets_goals: str = "Yes"

def build_vector(data: PredictInput):
    SCREEN = {"Less than 1 hour":0.5,"1–3 hours":2,"3–5 hours":4,"3-5 hours":4,"More than 5 hours":6}
    ENV    = {"Quiet":3,"Sometimes distracting":2,"Very distracting":1,"Noisy":1}
    TIME   = {"Morning":1,"Afternoon":2,"Evening":3,"Night":4}
    NOTES  = {"Never":1,"Sometimes":2,"Always":3}
    REV    = {"Rarely":1,"Before exams only":2,"Weekly":3,"Daily":4}
    ACT    = {"Rarely":1,"Occasionally":2,"Regular":3}
    DIST   = {"No":0,"Sometimes":1,"Yes":2}
    YESNO  = {"No":0,"Yes":1}
    EDU    = {"School":0,"Undergraduate":1,"Postgraduate":2}
    NET    = {"Poor":1,"Average":2,"Good":3,"Excellent":4}
    STR    = {"Arts":0,"Commerce":1,"Engineering":2,"Medical":3,"Science":4,"Other":5}
    CHALLENGES = ["Lack of focus","Stress","Distractions","Lack of time","Difficult concepts","Other"]
    ch = data.biggest_challenge.lower()
    study_sleep = data.study_hours / (data.sleep_hours + 0.1)
    wellness    = (data.motivation_level + data.self_confidence + data.focus_ability +
                   (5-data.stress_level) + (5-data.exam_anxiety)) / 5
    engagement  = data.study_hours*0.4 + data.study_consistency*0.3 + data.attendance/20*0.3
    lookup = {
        "Age": data.age,
        "Previous Exam Percentage (%)": data.previous_score,
        "Average Attendance (%)": data.attendance,
        "Do you take coaching/tuition?": YESNO.get(data.coaching, 0),
        "Daily Study Hours": data.study_hours,
        "Weekly Study Consistency": data.study_consistency,
        "Do you make notes while studying?": NOTES.get(data.makes_notes, 2),
        "Revision Frequency": REV.get(data.revision_frequency, 2),
        "Average Sleep Hours per Day": data.sleep_hours,
        "Physical Activity": ACT.get(data.physical_activity, 2),
        "Stress Level": data.stress_level,
        "Motivation Level": data.motivation_level,
        "Exam Anxiety Level": data.exam_anxiety,
        "Self-Confidence in Studies": data.self_confidence,
        "Ability to Focus While Studying": data.focus_ability,
        "Family Support for Studies": data.family_support,
        "Do you get easily distracted while studying?": DIST.get(data.gets_distracted, 1),
        "Do you set daily study goals?": YESNO.get(data.sets_goals, 1),
        "Do you want personalized study recommendations?": 1,
        "Screen_Time_Hours": SCREEN.get(data.screen_time, 4),
        "Study_Env_Score": ENV.get(data.study_environment, 2),
        "Study_Time_Code": TIME.get(data.preferred_study_time, 4),
        "Gender_Code": 1 if data.gender.lower() == "female" else 0,
        "Education_Code": EDU.get(data.education_level, 1),
        "Stream_Code": STR.get(data.stream, 2),
        "Internet_Score": NET.get(data.internet_quality, 3),
        **{f"Challenge_{c.replace(' ','_')}": (1 if c.lower() in ch else 0) for c in CHALLENGES},
        "Study_Sleep_Ratio": study_sleep,
        "Wellness_Score": wellness,
        "Academic_Engagement": engagement,
    }
    feature_names = artifacts.get("feature_names", list(lookup.keys()))
    row = [float(lookup.get(f, 0)) for f in feature_names]
    X = np.array([row])
    return np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)

@app.post("/predict")
def predict(data: PredictInput, current_user=Depends(get_current_user)):
    try:
        perf_cat = "Medium"
        risk_lvl = "Moderate Risk"

        if artifacts.get("perf_model") and artifacts.get("feature_names"):
            X = build_vector(data)
            Xp = artifacts["perf_scaler"].transform(X)
            perf_cat = artifacts["perf_encoder"].inverse_transform(
                artifacts["perf_model"].predict(Xp))[0]
            Xr = artifacts["risk_scaler"].transform(X)
            risk_lvl = artifacts["risk_encoder"].inverse_transform(
                artifacts["risk_model"].predict(Xr))[0]

        predicted = min(100, data.previous_score +
                        data.motivation_level*2 + data.study_hours*1.5 - data.stress_level*1.5)
        predicted = max(0, predicted)

        recs = []
        if data.study_hours < 3:
            recs.append({"category":"Study Time","priority":"High","icon":"📚","message":"Increase daily study to at least 3-4 hours."})
        if data.attendance < 75:
            recs.append({"category":"Attendance","priority":"Critical","icon":"🎯","message":f"Attendance {data.attendance}% — below 75% minimum."})
        if data.stress_level >= 4:
            recs.append({"category":"Mental Health","priority":"High","icon":"🧘","message":"High stress detected. Try breathing exercises and short breaks."})
        if data.sleep_hours < 6:
            recs.append({"category":"Sleep","priority":"High","icon":"😴","message":f"Only {data.sleep_hours}h sleep. Memory needs 7-8 hours."})
        if data.motivation_level <= 2:
            recs.append({"category":"Motivation","priority":"Medium","icon":"💪","message":"Set small daily goals to rebuild momentum."})
        if data.revision_frequency in ["Rarely","Before exams only"]:
            recs.append({"category":"Revision","priority":"Medium","icon":"🔄","message":"Revise within 24h of learning for 5x better retention."})
        if not recs:
            recs.append({"category":"Keep Going","priority":"Low","icon":"🌟","message":"Great habits! Stay consistent."})

        weak_areas = [
            {"area":"Study Hours","score":min(100,data.study_hours/5*100),"weak":data.study_hours<2,"label":f"{data.study_hours}h/day"},
            {"area":"Attendance","score":data.attendance,"weak":data.attendance<75,"label":f"{data.attendance}%"},
            {"area":"Stress Mgmt","score":(5-data.stress_level)/5*100,"weak":data.stress_level>3,"label":f"Level {data.stress_level}/5"},
            {"area":"Motivation","score":data.motivation_level/5*100,"weak":data.motivation_level<3,"label":f"Level {data.motivation_level}/5"},
            {"area":"Focus","score":data.focus_ability/5*100,"weak":data.focus_ability<3,"label":f"Level {data.focus_ability}/5"},
            {"area":"Sleep","score":min(100,data.sleep_hours/9*100),"weak":data.sleep_hours<6,"label":f"{data.sleep_hours}h"},
        ]
        wellness   = round((5-data.stress_level+data.motivation_level+5-data.exam_anxiety+data.self_confidence+data.focus_ability)/5, 1)
        engagement = round(data.study_hours*0.4+data.study_consistency*0.3+data.attendance/20*0.3, 1)

        # Save prediction to DB
        try:
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO predictions
                (age, gender, education_level, stream, previous_score, attendance,
                 coaching, study_hours, study_consistency, sleep_hours,
                 stress_level, motivation_level, exam_anxiety, self_confidence,
                 focus_ability, family_support, performance_category, risk_level, predicted_score)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (data.age,data.gender,data.education_level,data.stream,data.previous_score,
                  data.attendance,data.coaching,data.study_hours,data.study_consistency,
                  data.sleep_hours,data.stress_level,data.motivation_level,data.exam_anxiety,
                  data.self_confidence,data.focus_ability,data.family_support,
                  perf_cat,risk_lvl,round(predicted,1)))
            conn.commit(); cursor.close(); conn.close()
        except Exception as db_err:
            print("DB save error:", db_err)

        return {
            "performance_category": perf_cat,
            "risk_level": risk_lvl,
            "estimated_score_range": {
                "predicted": round(predicted,1),
                "min": round(max(0,predicted-8),1),
                "max": round(min(100,predicted+10),1),
            },
            "wellness_score": wellness,
            "engagement_score": engagement,
            "recommendations": recs,
            "weak_areas": weak_areas,
            "performance_probabilities": {},
            "risk_probabilities": {},
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))

# ════════════════════════════════════════════════════════════════════════════
# OTHER ROUTES
# ════════════════════════════════════════════════════════════════════════════

@app.get("/")
def root(): return {"message": "EduSense AI v3 running ✅"}

@app.get("/health")
def health(): return {"status": "ok", "models_loaded": "perf_model" in artifacts}

@app.get("/metrics")
def get_metrics():
    if "metrics" in artifacts: return artifacts["metrics"]
    raise HTTPException(404, "Train models first — run ml_pipeline.py")

@app.get("/feature-importance")
def feature_importance():
    try:
        result = {}
        for task, key in [("performance", "perf_model"), ("risk", "risk_model")]:
            model = artifacts.get(key)
            names = artifacts.get("feature_names", [])
            if not model:
                continue
            if hasattr(model, "feature_importances_"):
                imp = model.feature_importances_
                result[task] = dict(sorted(zip(names, imp.tolist()), key=lambda x: -x[1]))
            elif hasattr(model, "coef_"):
                imp = np.mean(np.abs(model.coef_), axis=0)
                result[task] = dict(sorted(zip(names, imp.tolist()), key=lambda x: -x[1]))
            else:
                imp = [1.0 / len(names)] * len(names)
                result[task] = dict(zip(names, imp))
        return result
    except Exception as e:
        raise HTTPException(500, str(e))

@app.get("/dataset-stats")
def dataset_stats():
    try:
        path = os.path.join(os.path.dirname(__file__), "data", "student_performance.xlsx")
        df = pd.read_excel(path)
        df.columns = [re.sub(r'^\d+\.\s*','',str(c)).strip() for c in df.columns]
        prev = next((c for c in df.columns if 'previous' in c.lower() and 'percentage' in c.lower()), None)
        exp  = next((c for c in df.columns if 'expected' in c.lower() and 'percentage' in c.lower()), None)
        return {
            "total_students": len(df),
            "features": len(df.columns),
            "avg_previous_score": round(float(df[prev].dropna().mean()),2) if prev else 0,
            "avg_expected_score": round(float(df[exp].dropna().mean()),2) if exp else 0,
        }
    except Exception as e: raise HTTPException(500, str(e))

@app.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content)) if file.filename.endswith(".csv") \
             else pd.read_excel(io.BytesIO(content))
        path = os.path.join(os.path.dirname(__file__), "data", "student_performance.xlsx")
        df.to_excel(path, index=False)
        return {"message": f"Uploaded: {len(df)} rows", "rows": len(df)}
    except Exception as e: raise HTTPException(400, str(e))

@app.get("/debug-features")
def debug_features():
    return {"feature_names": artifacts.get("feature_names", []),
            "count": len(artifacts.get("feature_names", []))}

# ════════════════════════════════════════════════════════════════════════════
# STUDY PLAN — SAVE & LOAD (per user)
# ════════════════════════════════════════════════════════════════════════════

class SavePlanInput(BaseModel):
    profile: dict
    plan_summary: dict

@app.post("/save-plan")
def save_plan(data: SavePlanInput, current_user=Depends(get_current_user)):
    try:
        import json as json_mod
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS study_plans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                profile_json TEXT NOT NULL,
                plan_summary_json TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        cursor.execute("""
            INSERT INTO study_plans (user_id, profile_json, plan_summary_json)
            VALUES (%s, %s, %s)
        """, (current_user["id"],
              json_mod.dumps(data.profile),
              json_mod.dumps(data.plan_summary)))
        conn.commit(); cursor.close(); conn.close()
        return {"saved": True}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))

@app.get("/my-plan")
def get_my_plan(current_user=Depends(get_current_user)):
    try:
        import json as json_mod
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS study_plans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                profile_json TEXT NOT NULL,
                plan_summary_json TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        cursor.execute("""
            SELECT profile_json, plan_summary_json, created_at
            FROM study_plans WHERE user_id = %s
            ORDER BY created_at DESC LIMIT 1
        """, (current_user["id"],))
        row = cursor.fetchone()
        cursor.close(); conn.close()
        if not row:
            return {"has_plan": False}
        return {
            "has_plan": True,
            "profile": json_mod.loads(row["profile_json"]),
            "plan_summary": json_mod.loads(row["plan_summary_json"]),
            "created_at": str(row["created_at"])
        }
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(500, str(e))

@app.delete("/delete-plan")
def delete_plan(current_user=Depends(get_current_user)):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM study_plans WHERE user_id = %s", (current_user["id"],))
        cursor.execute("DELETE FROM study_progress WHERE user_id = %s", (current_user["id"],))
        # Also reset user_progress so XP and streak go back to 0 on dashboard
        cursor.execute("""
            INSERT INTO user_progress (user_id, total_xp, streak_count)
            VALUES (%s, 0, 0)
            ON DUPLICATE KEY UPDATE total_xp = 0, streak_count = 0, updated_at = CURRENT_TIMESTAMP
        """, (current_user["id"],))
        conn.commit(); cursor.close(); conn.close()
        return {"deleted": True}
    except Exception as e:
        raise HTTPException(500, str(e))