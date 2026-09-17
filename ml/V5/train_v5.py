import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import ExtraTreesClassifier
import joblib

# 1. Load Original Base Dataset
df = pd.read_csv('final_crop_dataset_improved.csv')

# 2. Add Calibrated Sugarcane Data (150 Samples)
np.random.seed(42)
sugarcane_df = pd.DataFrame({
    'N': np.random.randint(150, 240, 150),
    'P': np.random.randint(40, 85, 150),
    'K': np.random.randint(60, 140, 150),
    'temperature': np.random.uniform(22.0, 35.0, 150),
    'humidity': np.random.uniform(60.0, 85.0, 150),
    'ph': np.random.uniform(6.0, 7.8, 150),
    'rainfall': np.random.uniform(1000.0, 2200.0, 150),
    'label': ['sugarcane'] * 150
})
full_df = pd.concat([df, sugarcane_df], ignore_index=True)

# 3. Purge Contradictory Rows (Dataset-Level Filtering)
clean_mask = ~(
    ((full_df['label'] == 'coffee') & (full_df['ph'] > 7.0)) |
    ((full_df['label'] == 'cauliflower') & (full_df['temperature'] > 25.0)) |
    ((full_df['label'] == 'cabbage') & (full_df['temperature'] > 26.0)) |
    ((full_df['label'] == 'watermelon') & (full_df['rainfall'] > 600.0)) |
    ((full_df['label'] == 'chickpea') & (full_df['rainfall'] > 500.0)) |
    ((full_df['label'] == 'wheat') & (full_df['temperature'] > 26.0))
)
df_cleaned = full_df[clean_mask].copy()

# Save Cleaned Dataset v5
df_cleaned.to_csv('final_crop_dataset_v5.csv', index=False)
print("Saved final_crop_dataset_v5.csv")

# 4. Train ExtraTrees Ensemble Model
X = df_cleaned[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
y = df_cleaned['label']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)

# Advanced ExtraTrees Model instead of Standard Random Forest
model = ExtraTreesClassifier(
    n_estimators=350,
    criterion='entropy',
    max_features='sqrt',
    class_weight='balanced_subsample',
    random_state=42,
    n_jobs=-1
)
model.fit(X_train_scaled, y_train)

# Save Trained Model Artifacts
joblib.dump(model, 'crop_model_v5.joblib')
joblib.dump(scaler, 'scaler_v5.joblib')
print("Successfully trained ExtraTrees ensemble model and saved artifacts!")
