import pandas as pd
import numpy as np
import joblib, os, json, re, math, warnings
warnings.filterwarnings('ignore')

from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression          # ← NEW
from sklearn.ensemble import RandomForestClassifier          # ← KEPT
from sklearn.svm import SVC                                  # ← NEW (replaces GradientBoosting)
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

    # ── PERFORMANCE MODEL ──────────────────────────────────────────────────
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

    # ── Train all 3 algorithms ──
    lr = LogisticRegression(max_iter=1000, random_state=42)
    lr.fit(X_tr, y_tr)

    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_tr, y_tr)

    svm = SVC(kernel='rbf', probability=True, random_state=42)
    svm.fit(X_tr, y_tr)

    lr_metrics  = get_metrics(lr,  X_te, y_te, X_scaled, y_enc)
    rf_metrics  = get_metrics(rf,  X_te, y_te, X_scaled, y_enc)
    svm_metrics = get_metrics(svm, X_te, y_te, X_scaled, y_enc)

    # ── Pick best model ──
    perf_candidates = {
        "Logistic Regression": (lr,  lr_metrics),
        "Random Forest":       (rf,  rf_metrics),
        "SVM":                 (svm, svm_metrics),
    }
    best_perf_name = max(perf_candidates, key=lambda k: perf_candidates[k][1]['accuracy'])
    best_perf = perf_candidates[best_perf_name][0]

    joblib.dump(best_perf, os.path.join(MODEL_DIR, "performance_model.pkl"))
    joblib.dump(scaler,    os.path.join(MODEL_DIR, "performance_scaler.pkl"))
    joblib.dump(le_perf,   os.path.join(MODEL_DIR, "performance_encoder.pkl"))
    joblib.dump(imputer,   os.path.join(MODEL_DIR, "imputer.pkl"))
    joblib.dump(num_cols,  os.path.join(MODEL_DIR, "feature_names.pkl"))

    # ── RISK MODEL ─────────────────────────────────────────────────────────
    def cat_risk(row):
        score = 0
        try:
            if float(row.get(target_col, 70)) < 60: score += 2
            if float(row.get('Average Attendance (%)', 75)) < 70: score += 2
            if float(row.get('Stress Level', 3)) >= 4: score += 1
            if float(row.get('Motivation Level', 3)) <= 2: score += 1
        except:
            pass
        return "High Risk" if score >= 4 else ("Moderate Risk" if score >= 2 else "Low Risk")

    df["Risk"] = df.apply(cat_risk, axis=1)
    y_risk = df["Risk"]

    le_risk = LabelEncoder()
    y_risk_enc = le_risk.fit_transform(y_risk)

    X_tr2, X_te2, y_tr2, y_te2 = train_test_split(X_scaled, y_risk_enc, test_size=0.2, random_state=42)

    lr_risk  = LogisticRegression(max_iter=1000, random_state=42)
    lr_risk.fit(X_tr2, y_tr2)

    rf_risk  = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_risk.fit(X_tr2, y_tr2)

    svm_risk = SVC(kernel='rbf', probability=True, random_state=42)
    svm_risk.fit(X_tr2, y_tr2)

    lr_risk_m  = get_metrics(lr_risk,  X_te2, y_te2, X_scaled, y_risk_enc)
    rf_risk_m  = get_metrics(rf_risk,  X_te2, y_te2, X_scaled, y_risk_enc)
    svm_risk_m = get_metrics(svm_risk, X_te2, y_te2, X_scaled, y_risk_enc)

    risk_candidates = {
        "Logistic Regression": (lr_risk,  lr_risk_m),
        "Random Forest":       (rf_risk,  rf_risk_m),
        "SVM":                 (svm_risk, svm_risk_m),
    }
    best_risk_name = max(risk_candidates, key=lambda k: risk_candidates[k][1]['accuracy'])
    best_risk = risk_candidates[best_risk_name][0]

    joblib.dump(best_risk, os.path.join(MODEL_DIR, "risk_model.pkl"))
    joblib.dump(scaler,    os.path.join(MODEL_DIR, "risk_scaler.pkl"))
    joblib.dump(le_risk,   os.path.join(MODEL_DIR, "risk_encoder.pkl"))

    # ── SAVE METRICS ───────────────────────────────────────────────────────
    metrics = {
        "performance": {
            "Logistic Regression": lr_metrics,
            "Random Forest":       rf_metrics,
            "SVM":                 svm_metrics,
            "best_model":          best_perf_name,
            "classes":             list(le_perf.classes_),
        },
        "risk": {
            "Logistic Regression": lr_risk_m,
            "Random Forest":       rf_risk_m,
            "SVM":                 svm_risk_m,
            "best_model":          best_risk_name,
            "classes":             list(le_risk.classes_),
        }
    }

    with open(os.path.join(MODEL_DIR, "metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\n📊 Performance Model Results:")
    print(f"   Logistic Regression → Accuracy: {lr_metrics['accuracy']:.2%}")
    print(f"   Random Forest       → Accuracy: {rf_metrics['accuracy']:.2%}")
    print(f"   SVM                 → Accuracy: {svm_metrics['accuracy']:.2%}")
    print(f"   ✅ Best: {best_perf_name}")

    print(f"\n📊 Risk Model Results:")
    print(f"   Logistic Regression → Accuracy: {lr_risk_m['accuracy']:.2%}")
    print(f"   Random Forest       → Accuracy: {rf_risk_m['accuracy']:.2%}")
    print(f"   SVM                 → Accuracy: {svm_risk_m['accuracy']:.2%}")
    print(f"   ✅ Best: {best_risk_name}")

    print("\n✅ All models saved!")

if __name__ == "__main__":
    train_models()