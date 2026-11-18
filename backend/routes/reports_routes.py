import os
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, Query, Response
from backend.auth.dependencies import get_current_user, verify_property_access
from backend.database.db import get_db

router = APIRouter(prefix="/reports", tags=["Reports & Audits"])


@router.get("", summary="List Reports for Property")
def list_reports(property_id: str, user: dict = Depends(get_current_user)):
    verify_property_access(property_id, user)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM reports WHERE property_id = ? ORDER BY created_at DESC", (property_id,))
        return [dict(r) for r in cursor.fetchall()]


@router.post("/generate", summary="Generate Energy Audit Summary Report")
def generate_report(property_id: str = Query(...), user: dict = Depends(get_current_user)):
    prop = verify_property_access(property_id, user)

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT SUM(energy_kwh), SUM(cost_inr) 
            FROM energy_records 
            WHERE property_id = ?
        """, (property_id,))
        totals = cursor.fetchone()
        kwh = round(totals[0] or 0.0, 2)
        cost = round(totals[1] or 0.0, 2)

        cursor.execute("""
            SELECT SUM(potential_savings_inr) 
            FROM recommendations 
            WHERE property_id = ? AND status = 'COMPLETED'
        """, (property_id,))
        savings = cursor.fetchone()[0] or 0.0

        rep_id = f"rep_{uuid.uuid4().hex[:8]}"
        title = f"Monthly Energy Audit — {prop['name']}"
        period = datetime.now(timezone.utc).strftime("%B %Y")

        cursor.execute("""
            INSERT INTO reports (id, property_id, title, period, total_kwh, total_cost_inr, savings_achieved_inr)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (rep_id, property_id, title, period, kwh, cost, round(savings, 2)))

        cursor.execute("SELECT * FROM reports WHERE id = ?", (rep_id,))
        return dict(cursor.fetchone())


@router.get("/download-telemetry-csv", summary="Download Property Telemetry Records as CSV")
def download_telemetry_csv(property_id: str, user: dict = Depends(get_current_user)):
    prop = verify_property_access(property_id, user)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT timestamp, energy_kwh, cost_inr, temperature, appliance_name, is_anomaly 
            FROM energy_records 
            WHERE property_id = ? 
            ORDER BY timestamp DESC
        """, (property_id,))
        rows = cursor.fetchall()

    headers = ["Timestamp", "Energy_kWh", "Cost_INR", "Temperature_C", "Appliance_Source", "Anomaly_Flag"]
    csv_lines = [",".join(headers)]
    for r in rows:
        csv_lines.append(f"{r['timestamp']},{r['energy_kwh']},{r['cost_inr']},{r['temperature']},{r['appliance_name']},{r['is_anomaly']}")

    csv_data = "\n".join(csv_lines)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=telemetry_{property_id}_{datetime.now().strftime('%Y%m%d')}.csv"},
    )
