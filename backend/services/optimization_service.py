import os
import uuid
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from backend.database.db import get_db


class OptimizationService:
    @staticmethod
    def analyze_property_energy_audit(property_id: str) -> Dict[str, Any]:
        """
        Scans telemetry records to detect peak-load windows, anomalies, and appliance distribution.
        """
        with get_db() as conn:
            cursor = conn.cursor()

            # Property details & tariff
            cursor.execute("SELECT * FROM properties WHERE id = ?", (property_id,))
            prop = cursor.fetchone()
            if not prop:
                raise ValueError(f"Property '{property_id}' not found.")
            prop_dict = dict(prop)
            tariff = prop_dict.get("tariff_inr", 8.5)

            # Analyze recent 720 hours telemetry
            cursor.execute("""
                SELECT timestamp, energy_kwh, cost_inr, temperature, is_anomaly
                FROM energy_records
                WHERE property_id = ?
                ORDER BY timestamp DESC LIMIT 720
            """, (property_id,))
            rows = cursor.fetchall()

            if not rows:
                return {
                    "property_id": property_id,
                    "property_name": prop_dict["name"],
                    "tariff_inr": tariff,
                    "has_data": False,
                    "recommendations": [],
                }

            records = [dict(r) for r in rows]
            kwh_values = [r["energy_kwh"] for r in records]
            anomalies = [r for r in records if r["is_anomaly"] == 1]

            total_consumption = round(sum(kwh_values), 2)
            avg_hourly_kwh = round(total_consumption / len(kwh_values), 2)
            peak_hourly_kwh = round(max(kwh_values), 2)

            # Peak tariff hours analysis (typically 18:00 - 22:00 in India)
            peak_tariff_records = [
                r for r in records 
                if any(f" {h:02d}:" in r["timestamp"] for h in range(18, 23))
            ]
            peak_window_kwh = round(sum(r["energy_kwh"] for r in peak_tariff_records), 2)

            # Connected appliances
            cursor.execute("SELECT * FROM appliances WHERE property_id = ?", (property_id,))
            appliances = [dict(a) for a in cursor.fetchall()]

            # Fetch active recommendations
            cursor.execute("""
                SELECT * FROM recommendations 
                WHERE property_id = ? 
                ORDER BY CASE priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END
            """, (property_id,))
            recs = [dict(rec) for rec in cursor.fetchall()]

            # Calculate total possible monthly savings in ₹
            potential_savings_kwh = sum(r["potential_savings_kwh"] for r in recs if r["status"] != "COMPLETED")
            potential_savings_inr = sum(r["potential_savings_inr"] for r in recs if r["status"] != "COMPLETED")
            achieved_savings_inr = sum(r["potential_savings_inr"] for r in recs if r["status"] == "COMPLETED")

            return {
                "property_id": property_id,
                "property_name": prop_dict["name"],
                "property_type": prop_dict["property_type"],
                "tariff_inr": tariff,
                "has_data": True,
                "total_consumption_kwh": total_consumption,
                "avg_hourly_kwh": avg_hourly_kwh,
                "peak_hourly_kwh": peak_hourly_kwh,
                "total_cost_inr": round(total_consumption * tariff, 2),
                "peak_tariff_window": {
                    "hours": "18:00 - 22:00",
                    "consumption_kwh": peak_window_kwh,
                    "cost_inr": round(peak_window_kwh * (tariff * 1.25), 2),
                },
                "anomalies_detected": len(anomalies),
                "appliances_count": len(appliances),
                "savings_summary": {
                    "potential_monthly_savings_kwh": round(potential_savings_kwh, 2),
                    "potential_monthly_savings_inr": round(potential_savings_inr, 2),
                    "achieved_savings_inr": round(achieved_savings_inr, 2),
                },
                "recommendations": recs,
            }

    @staticmethod
    def toggle_recommendation_status(rec_id: str, new_status: str) -> Dict[str, Any]:
        """
        Marks an energy-saving recommendation as PENDING, IN_PROGRESS, or COMPLETED.
        """
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE recommendations 
                SET status = ? 
                WHERE id = ?
            """, (new_status, rec_id))

            cursor.execute("SELECT * FROM recommendations WHERE id = ?", (rec_id,))
            row = cursor.fetchone()
            if not row:
                raise ValueError(f"Recommendation '{rec_id}' not found.")

            rec = dict(row)

            # If marked COMPLETED, log notification for family
            if new_status == "COMPLETED":
                cursor.execute("SELECT family_id FROM properties WHERE id = ?", (rec["property_id"],))
                p_row = cursor.fetchone()
                if p_row:
                    fam_id = p_row[0]
                    notif_id = f"notif_{uuid.uuid4().hex[:8]}"
                    cursor.execute("""
                        INSERT INTO notifications (id, family_id, property_id, title, message, type)
                        VALUES (?, ?, ?, ?, ?, ?)
                    """, (
                        notif_id,
                        fam_id,
                        rec["property_id"],
                        "Optimization Task Completed!",
                        f"'{rec['title']}' was completed. Monthly savings unlocked: ₹{rec['potential_savings_inr']}.",
                        "success",
                    ))

            return rec

    @staticmethod
    def get_system_deployment_status() -> Dict[str, Any]:
        """
        Provides comprehensive system diagnostics for capstone presentation.
        """
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM properties")
            props_count = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM energy_records")
            records_count = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM model_training_history WHERE is_active = 1")
            active_models = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM uploaded_datasets")
            datasets_count = cursor.fetchone()[0]

        return {
            "status": "OPERATIONAL",
            "backend_version": "v2.5.0-MultiProperty",
            "database": {
                "engine": "SQLite Relational (PostgreSQL Compatible)",
                "status": "CONNECTED",
                "total_properties": props_count,
                "telemetry_records": records_count,
            },
            "ml_engine": {
                "algorithms_supported": ["Linear Regression", "Decision Tree Regressor", "Random Forest Regressor"],
                "active_trained_models": active_models,
                "evaluation_metrics": ["MAE", "MSE", "RMSE", "R² Score"],
            },
            "dataset_subsystem": {
                "uploaded_datasets": datasets_count,
                "schema_detection": "Dynamic Column Mapping",
            },
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
