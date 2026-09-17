import pandas as pd
import joblib
import sklearn

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score


# =========================
# LOAD DATASET
# =========================

df = pd.read_csv("final_crop_dataset_improved.csv")

print("Dataset shape:", df.shape)
print("Scikit-learn version:", sklearn.__version__)


# =========================
# FEATURES AND LABEL
# =========================

X = df[[
    'N',
    'P',
    'K',
    'temperature',
    'humidity',
    'ph',
    'rainfall'
]]

y = df['label']


# =========================
# TRAIN / TEST SPLIT
# =========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)


# =========================
# SCALE FEATURES
# =========================

scaler = StandardScaler()

X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)


# =========================
# TRAIN MODEL
# =========================

model = RandomForestClassifier(
    n_estimators=300,
    random_state=42,
    n_jobs=-1,
    class_weight="balanced"
)

model.fit(X_train_scaled, y_train)


# =========================
# TEST MODEL
# =========================

predictions = model.predict(X_test_scaled)

accuracy = accuracy_score(y_test, predictions)

print("\n==========================")
print(f"Test Accuracy: {accuracy * 100:.2f}%")
print("==========================\n")


# =========================
# SAVE V2 MODEL
# =========================

joblib.dump(model, "crop_model_v2.joblib")
joblib.dump(scaler, "scaler_v2.joblib")

print("✅ V2 Model saved: crop_model_v2.joblib")
print("✅ V2 Scaler saved: scaler_v2.joblib")

print("\n🎉 Training completed successfully!")
