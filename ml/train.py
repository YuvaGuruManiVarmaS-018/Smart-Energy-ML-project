import os
import json
from datetime import datetime, timezone
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "dataset", "smart_home_energy_consumption_large.csv")
MODEL_DIR = os.path.join(BASE_DIR, "ml", "saved_models")
OUTPUT_DIR = os.path.join(BASE_DIR, "ml", "outputs")

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

CATEGORICAL_FEATURES = ["Appliance Type", "Season"]
NUMERICAL_FEATURES = ["Outdoor Temperature (°C)", "Household Size", "hour", "month", "is_weekend"]
ALL_FEATURES = CATEGORICAL_FEATURES + NUMERICAL_FEATURES
TARGET = "Energy Consumption (kWh)"

ALL_APPLIANCES = [
    "Air Conditioning",
    "Heater",
    "Fridge",
    "Oven",
    "Dishwasher",
    "Washing Machine",
    "Microwave",
    "Computer",
    "TV",
    "Lights",
]

def load_and_preprocess_data(csv_path: str) -> pd.DataFrame:
    print(f"[*] Reading Kaggle dataset from: {csv_path}")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found at {csv_path}")

    df = pd.read_csv(csv_path)
    print(f"[*] Dataset shape: {df.shape} (Total rows: {len(df):,})")

    # Feature Engineering
    df["hour"] = pd.to_datetime(df["Time"], format="%H:%M").dt.hour
    date_series = pd.to_datetime(df["Date"])
    df["month"] = date_series.dt.month
    df["is_weekend"] = (date_series.dt.dayofweek >= 5).astype(int)

    return df

def train():
    df = load_and_preprocess_data(DATA_PATH)

    # Compute appliance benchmark statistics
    appliance_stats = {}
    for app in ALL_APPLIANCES:
        app_df = df[df["Appliance Type"] == app]
        if not app_df.empty:
            appliance_stats[app] = {
                "mean_kwh": round(float(app_df[TARGET].mean()), 3),
                "std_kwh": round(float(app_df[TARGET].std()), 3),
                "min_kwh": round(float(app_df[TARGET].min()), 3),
                "max_kwh": round(float(app_df[TARGET].max()), 3),
                "sample_count": int(len(app_df)),
            }

    X = df[ALL_FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print(f"[*] Training on {len(X_train):,} samples, testing on {len(X_test):,} samples...")

    # Build Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(drop=None, sparse_output=False, handle_unknown="ignore"), CATEGORICAL_FEATURES),
            ("num", "passthrough", NUMERICAL_FEATURES),
        ]
    )

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("regressor", HistGradientBoostingRegressor(max_iter=150, learning_rate=0.1, random_state=42)),
    ])

    pipeline.fit(X_train, y_train)

    # Evaluate
    predictions = pipeline.predict(X_test)
    mae = float(mean_absolute_error(y_test, predictions))
    rmse = float(np.sqrt(mean_squared_error(y_test, predictions)))
    r2 = float(r2_score(y_test, predictions))

    metrics = {
        "dataset_source": "Kaggle: mexwell/smart-home-energy-consumption",
        "total_dataset_rows": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "model_type": "HistGradientBoostingRegressor (Pipeline)",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "r2_score": round(r2, 4),
        "features": ALL_FEATURES,
        "appliances": ALL_APPLIANCES,
        "appliance_stats": appliance_stats,
    }

    print("\n[+] Model Evaluation Results on Kaggle Dataset:")
    print(f"    - Dataset:  Kaggle mexwell/smart-home-energy-consumption (100,000 records)")
    print(f"    - R² Score: {r2:.4f}")
    print(f"    - MAE:      {mae:.4f} kWh")
    print(f"    - RMSE:     {rmse:.4f} kWh")

    # Save artifacts
    model_path = os.path.join(MODEL_DIR, "energy_model.joblib")
    model_payload = {
        "pipeline": pipeline,
        "features": ALL_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "numerical_features": NUMERICAL_FEATURES,
        "appliances": ALL_APPLIANCES,
        "appliance_stats": appliance_stats,
        "metrics": metrics,
    }
    joblib.dump(model_payload, model_path)
    print(f"[+] Serialized model saved to: {model_path}")

    metrics_path = os.path.join(OUTPUT_DIR, "evaluation_metrics.json")
    with open(metrics_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"[+] Metrics saved to: {metrics_path}")

if __name__ == "__main__":
    train()
