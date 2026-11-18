from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, Depends
from backend.auth.dependencies import get_current_user
from backend.database.db import get_db

router = APIRouter(prefix="/dashboard", tags=["Multi-Property Family Dashboard"])


@router.get("/summary", summary="Family Multi-Property Overview Metrics")
def get_dashboard_summary(user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Fetch permitted properties
        if user["role"] == "family_admin":
            cursor.execute("SELECT * FROM properties WHERE family_id = ?", (user["family_id"],))
        else:
            cursor.execute("""
                SELECT DISTINCT p.* FROM properties p
                LEFT JOIN property_members pm ON p.id = pm.property_id
                WHERE p.family_id = ? AND (pm.user_id = ? OR p.family_id = ?)
            """, (user["family_id"], user["id"], user["family_id"]))

        properties = [dict(p) for p in cursor.fetchall()]
        if not properties:
            return {"properties": [], "total_kwh": 0, "total_cost_inr": 0}

        property_metrics = []
        total_family_kwh = 0.0
        total_family_cost_inr = 0.0
        highest_prop_name = ""
        highest_prop_kwh = -1.0

        for prop in properties:
            p_id = prop["id"]
            tariff = prop.get("tariff_inr", 8.5)

            # Sum energy from records in the last 30 days
            cursor.execute("""
                SELECT SUM(energy_kwh), COUNT(*) 
                FROM energy_records 
                WHERE property_id = ?
            """, (p_id,))
            row = cursor.fetchone()
            p_kwh = round(float(row[0]), 2) if row and row[0] is not None else 0.0
            p_cost = round(p_kwh * tariff, 2)

            # Appliances count
            cursor.execute("SELECT COUNT(*) FROM appliances WHERE property_id = ?", (p_id,))
            app_count = cursor.fetchone()[0]

            # Pending savings
            cursor.execute("""
                SELECT SUM(potential_savings_inr) 
                FROM recommendations 
                WHERE property_id = ? AND status != 'COMPLETED'
            """, (p_id,))
            sav_row = cursor.fetchone()
            pending_savings = round(float(sav_row[0]), 2) if sav_row and sav_row[0] else 0.0

            total_family_kwh += p_kwh
            total_family_cost_inr += p_cost

            if p_kwh > highest_prop_kwh:
                highest_prop_kwh = p_kwh
                highest_prop_name = prop["name"]

            property_metrics.append({
                "id": p_id,
                "name": prop["name"],
                "property_type": prop["property_type"],
                "tariff_inr": tariff,
                "square_feet": prop["square_feet"],
                "total_kwh": p_kwh,
                "total_cost_inr": p_cost,
                "appliances_count": app_count,
                "potential_savings_inr": pending_savings,
            })

        # Calculate percentage distribution
        for pm in property_metrics:
            pm["share_percentage"] = (
                round((pm["total_kwh"] / total_family_kwh) * 100, 1) if total_family_kwh > 0 else 0.0
            )

        # Recent family activities/notifications
        cursor.execute("""
            SELECT * FROM notifications 
            WHERE family_id = ? 
            ORDER BY created_at DESC LIMIT 5
        """, (user["family_id"],))
        recent_notifs = [dict(n) for n in cursor.fetchall()]

        return {
            "family_id": user["family_id"],
            "family_name": user.get("family_name", "Family Estate"),
            "total_properties": len(properties),
            "total_consumption_kwh": round(total_family_kwh, 2),
            "total_estimated_cost_inr": round(total_family_cost_inr, 2),
            "total_potential_savings_inr": round(sum(p["potential_savings_inr"] for p in property_metrics), 2),
            "highest_consuming_property": {
                "name": highest_prop_name,
                "kwh": highest_prop_kwh,
            },
            "properties": property_metrics,
            "recent_activity": recent_notifs,
        }


@router.get("/notifications", summary="Get Family System Alerts")
def get_notifications(user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM notifications 
            WHERE family_id = ? 
            ORDER BY created_at DESC LIMIT 20
        """, (user["family_id"],))
        return [dict(n) for n in cursor.fetchall()]


@router.post("/notifications/{notif_id}/read", summary="Mark Notification as Read")
def mark_notification_read(notif_id: str, user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE notifications SET is_read = 1 WHERE id = ? AND family_id = ?", (notif_id, user["family_id"]))
        return {"status": "ok"}
