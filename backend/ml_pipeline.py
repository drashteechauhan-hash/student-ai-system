import pandas as pd
import numpy as np
import joblib, os, json, re, math, warnings
warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.impute import SimpleImputer

DATA_PATH = os.path.join(os.path.dirname(__file__), "data", "student_performance.xlsx")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

def clean_col(name):
    name = str(name).strip()
    name = re.sub(r'^\d+\.\s*', '', name)
    return name.strip()

def load_data():
    df = pd.read_excel(DATA_PATH)
    df.columns = [clean_col(c) for c in df.columns]
    if 'Timestamp' in df.columns:
        df.drop(columns=['Timestamp'], inplace=True)
    return df

def get_metrics(model, X_test, y_test, X, y):
    pred = model.predict(X_test)
    cv = cross_val_score(model, X, y, cv=5).mean()
    return {
        "accuracy": round(accuracy_score(y_test, pred), 4),
        "precision": round(precision_score(y_test, pred, average='weighted', zero_division=0), 4),
        "recall": round(recall_score(y_test, pred, average='weighted', zero_division=0), 4),
        "f1_score": round(f1_score(y_test, pred, average='weighted', zero_division=0), 4),
        "cv_mean": round(cv, 4),
    }

def train_models():
    df = load_data()

    # ── PERFORMANCE MODEL ──
    target_col = [c for c in df.columns if "expected" in c.lower()][0]

    def cat_perf(x):
        try:
            v = float(x)
            return "High" if v >= 80 else ("Medium" if v >= 60 else "Low")
        except:
            return "Medium"

    df["Performance"] = df[target_col].apply(cat_perf)

    num_cols = list(df.select_dtypes(include=[np.number]).columns)
    X_num = df[num_cols].copy()
    y_perf = df["Performance"]

    imputer = SimpleImputer(strategy="median")
    X_imp = imputer.fit_transform(X_num)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X_imp)

    le_perf = LabelEncoder()
    y_enc = le_perf.fit_transform(y_perf)

    X_tr, X_te, y_tr, y_te = train_test_split(X_scaled, y_enc, test_size=0.2, random_state=42)

    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_tr, y_tr)

    gb = GradientBoostingClassifier(n_estimators=100, random_state=42)
    gb.fit(X_tr, y_tr)

    rf_metrics = get_metrics(rf, X_te, y_te, X_scaled, y_enc)
    gb_metrics = get_metrics(gb, X_te, y_te, X_scaled, y_enc)

    best_perf = gb if gb_metrics['accuracy'] >= rf_metrics['accuracy'] else rf
    best_perf_name = "Gradient Boosting" if gb_metrics['accuracy'] >= rf_metrics['accuracy'] else "Random Forest"

    joblib.dump(best_perf, os.path.join(MODEL_DIR, "performance_model.pkl"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "performance_scaler.pkl"))
    joblib.dump(le_perf, os.path.join(MODEL_DIR, "performance_encoder.pkl"))
    joblib.dump(imputer, os.path.join(MODEL_DIR, "imputer.pkl"))
    joblib.dump(num_cols, os.path.join(MODEL_DIR, "feature_names.pkl"))

    # ── RISK MODEL ──
    def cat_risk(row):
        score = 0
        try:
            if float(row.get(target_col, 70)) < 60: score += 2
            if float(row.get('Average Attendance (%)', 75)) < 70: score += 2
            stress = float(row.get('Stress Level', 3))
            if stress >= 4: score += 1
            motivation = float(row.get('Motivation Level', 3))
            if motivation <= 2: score += 1
        except:
            pass
        return "High Risk" if score >= 4 else ("Moderate Risk" if score >= 2 else "Low Risk")

    df["Risk"] = df.apply(cat_risk, axis=1)
    y_risk = df["Risk"]

    le_risk = LabelEncoder()
    y_risk_enc = le_risk.fit_transform(y_risk)

    X_tr2, X_te2, y_tr2, y_te2 = train_test_split(X_scaled, y_risk_enc, test_size=0.2, random_state=42)

    rf_risk = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_risk.fit(X_tr2, y_tr2)

    gb_risk = GradientBoostingClassifier(n_estimators=100, random_state=42)
    gb_risk.fit(X_tr2, y_tr2)

    rf_risk_m = get_metrics(rf_risk, X_te2, y_te2, X_scaled, y_risk_enc)
    gb_risk_m = get_metrics(gb_risk, X_te2, y_te2, X_scaled, y_risk_enc)

    best_risk = gb_risk if gb_risk_m['accuracy'] >= rf_risk_m['accuracy'] else rf_risk
    best_risk_name = "Gradient Boosting" if gb_risk_m['accuracy'] >= rf_risk_m['accuracy'] else "Random Forest"

    joblib.dump(best_risk, os.path.join(MODEL_DIR, "risk_model.pkl"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "risk_scaler.pkl"))
    joblib.dump(le_risk, os.path.join(MODEL_DIR, "risk_encoder.pkl"))

    # ── SAVE METRICS ──
    metrics = {
        "performance": {
            "Random Forest": rf_metrics,
            "Gradient Boosting": gb_metrics,
            "best_model": best_perf_name,
            "classes": list(le_perf.classes_),
        },
        "risk": {
            "Random Forest": rf_risk_m,
            "Gradient Boosting": gb_risk_m,
            "best_model": best_risk_name,
            "classes": list(le_risk.classes_),
        }
    }

    with open(os.path.join(MODEL_DIR, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"✅ Performance model: {best_perf_name} — Accuracy: {max(rf_metrics['accuracy'], gb_metrics['accuracy']):.2%}")
    print(f"✅ Risk model: {best_risk_name} — Accuracy: {max(rf_risk_m['accuracy'], gb_risk_m['accuracy']):.2%}")
    print("✅ All models saved!")

if __name__ == "__main__":
    train_models()