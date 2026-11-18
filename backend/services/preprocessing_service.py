import os
import uuid
import json
import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple, Optional, List
from backend.database.db import get_db, log_activity

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "dataset", "user_uploads")
CLEANED_DIR = os.path.join(BASE_DIR, "dataset", "cleaned_datasets")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CLEANED_DIR, exist_ok=True)


class PreprocessingService:
    @staticmethod
    def inspect_csv_schema(file_path: str) -> Dict[str, Any]:
        """
        Dynamically analyzes an uploaded CSV without assuming hardcoded column names.
        """
        df = pd.read_csv(file_path, nrows=50)
        columns = df.columns.tolist()
        dtypes = {col: str(df[col].dtype) for col in columns}

        # Heuristic column detection
        detected_mapping = {}
        for col in columns:
            col_lower = col.lower().replace("_", " ").replace("-", " ")
            if any(k in col_lower for k in ["energy", "kwh", "consumption", "power", "load", "usage"]):
                detected_mapping["energy_column"] = col
            elif any(k in col_lower for k in ["time", "date", "timestamp", "datetime", "hour"]):
                detected_mapping["timestamp_column"] = col
            elif any(k in col_lower for k in ["temp", "temperature", "outdoor"]):
                detected_mapping["temperature_column"] = col
            elif any(k in col_lower for k in ["appliance", "device", "equipment", "load type"]):
                detected_mapping["appliance_column"] = col

        return {
            "columns": columns,
            "dtypes": dtypes,
            "detected_mapping": detected_mapping,
            "sample_rows": df.head(5).to_dict(orient="records"),
        }

    @staticmethod
    def preprocess_dataset(
        property_id: str,
        file_path: str,
        filename: str,
        handle_missing: str = "impute_mean",
        remove_duplicates: bool = True,
        detect_anomalies: bool = True,
    ) -> Dict[str, Any]:
        """
        Executes full data cleaning, feature engineering, and statistical quality audit.
        """
        df = pd.read_csv(file_path)
        original_rows = len(df)
        missing_count_initial = int(df.isnull().sum().sum())

        # Inspect schema
        schema_info = PreprocessingService.inspect_csv_schema(file_path)
        mapping = schema_info["detected_mapping"]

        # 1. Deduplication
        duplicates_removed = 0
        if remove_duplicates:
            before_dedup = len(df)
            df = df.drop_duplicates()
            duplicates_removed = before_dedup - len(df)

        # 2. Missing value handling
        if handle_missing == "drop":
            df = df.dropna()
        else:
            # Impute numericals with mean, categoricals with mode
            for col in df.columns:
                if pd.api.types.is_numeric_dtype(df[col]):
                    df[col] = df[col].fillna(df[col].mean())
                else:
                    mode_val = df[col].mode()[0] if not df[col].mode().empty else "Unknown"
                    df[col] = df[col].fillna(mode_val)

        # 3. Timestamp parsing & Feature Engineering
        time_col = mapping.get("timestamp_column")
        if time_col and time_col in df.columns:
            try:
                dt_series = pd.to_datetime(df[time_col], errors="coerce")
                # Fill unparseable datetimes if any
                if dt_series.isnull().any():
                    dt_series = dt_series.fillna(pd.Timestamp.now())
                df["hour_of_day"] = dt_series.dt.hour
                df["day_of_week"] = dt_series.dt.dayofweek
                df["month"] = dt_series.dt.month
                df["is_weekend"] = (dt_series.dt.dayofweek >= 5).astype(int)
            except Exception as e:
                print(f"[PreprocessingService] Datetime extraction warning: {e}")

        # 4. Anomaly detection on energy readings
        energy_col = mapping.get("energy_column")
        anomalies_detected = 0
        if detect_anomalies and energy_col and energy_col in df.columns:
            series = pd.to_numeric(df[energy_col], errors="coerce").fillna(0)
            mean_val = series.mean()
            std_val = series.std()
            if std_val > 0:
                z_scores = np.abs((series - mean_val) / std_val)
                df["is_anomaly"] = (z_scores > 3.0).astype(int)
                anomalies_detected = int(df["is_anomaly"].sum())
            else:
                df["is_anomaly"] = 0
        else:
            df["is_anomaly"] = 0

        cleaned_rows = len(df)

        # 5. Calculate Data Quality Score (0-100)
        quality_score = 100.0
        if original_rows > 0:
            missing_penalty = min(20.0, (missing_count_initial / (original_rows * len(df.columns))) * 100)
            dup_penalty = min(15.0, (duplicates_removed / original_rows) * 100)
            anomaly_penalty = min(15.0, (anomalies_detected / original_rows) * 100)
            quality_score = round(max(50.0, 100.0 - (missing_penalty + dup_penalty + anomaly_penalty)), 1)

        # 6. Save cleaned CSV
        dataset_id = f"ds_{uuid.uuid4().hex[:10]}"
        cleaned_file_path = os.path.join(CLEANED_DIR, f"cleaned_{dataset_id}_{filename}")
        df.to_csv(cleaned_file_path, index=False)

        # 7. Persist to database
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO uploaded_datasets (
                    id, property_id, filename, total_rows, cleaned_rows, 
                    columns_json, quality_score, file_path, cleaned_file_path
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                dataset_id,
                property_id,
                filename,
                original_rows,
                cleaned_rows,
                json.dumps(df.columns.tolist()),
                quality_score,
                file_path,
                cleaned_file_path,
            ))

            # Optional: Ingest top 200 cleaned rows into energy_records for immediate charts
            if energy_col and energy_col in df.columns:
                # Get property tariff
                cursor.execute("SELECT tariff_inr FROM properties WHERE id = ?", (property_id,))
                p_row = cursor.fetchone()
                tariff = p_row[0] if p_row else 8.5

                subset = df.head(200)
                records_to_insert = []
                for idx, row in subset.iterrows():
                    val = float(row[energy_col]) if pd.notnull(row[energy_col]) else 1.0
                    cost = round(val * tariff, 2)
                    ts = str(row[time_col]) if time_col and time_col in row else f"2026-11-01 {idx % 24:02d}:00:00"
                    is_anom = int(row.get("is_anomaly", 0))
                    records_to_insert.append((
                        f"rec_up_{dataset_id}_{idx}",
                        property_id,
                        ts,
                        round(val, 2),
                        cost,
                        float(row.get(mapping.get("temperature_column", "temp"), 25.0)),
                        str(row.get(mapping.get("appliance_column", "appliance"), "Uploaded Feed")),
                        is_anom,
                        "uploaded_csv",
                    ))
                cursor.executemany("""
                    INSERT OR REPLACE INTO energy_records (id, property_id, timestamp, energy_kwh, cost_inr, temperature, appliance_name, is_anomaly, source)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, records_to_insert)

        log_activity(
            module="Module 1: Preprocessing Pipeline",
            action="Data Preprocessing Completed",
            status="SUCCESS",
            details=f"Cleaned {cleaned_rows}/{original_rows} rows from '{filename}'. Imputed {missing_count_initial} missing, removed {duplicates_removed} duplicates, flagged {anomalies_detected} anomalies. Quality: {quality_score}%.",
            property_id=property_id,
        )

        return {
            "dataset_id": dataset_id,
            "filename": filename,
            "original_rows": original_rows,
            "cleaned_rows": cleaned_rows,
            "duplicates_removed": duplicates_removed,
            "missing_imputed": missing_count_initial,
            "anomalies_detected": anomalies_detected,
            "quality_score": quality_score,
            "columns": df.columns.tolist(),
            "detected_mappings": mapping,
            "preview_rows": df.head(10).to_dict(orient="records"),
            "cleaned_file_path": cleaned_file_path,
        }
