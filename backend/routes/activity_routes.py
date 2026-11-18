from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from backend.auth.dependencies import get_current_user, verify_property_access
from backend.database.db import get_db, log_activity

router = APIRouter(prefix="/activity", tags=["System Activity & Live Process Monitor"])


@router.get("/logs", summary="Get Backend Activity Event Logs")
def get_activity_logs(
    property_id: Optional[str] = Query(None),
    module: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    user: dict = Depends(get_current_user),
):
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT sa.id, sa.family_id, sa.property_id, sa.module, sa.action, sa.status, sa.details, sa.created_at,
                   p.name as property_name
            FROM system_activities sa
            LEFT JOIN properties p ON sa.property_id = p.id
            WHERE sa.family_id = ?
        """
        params = [user["family_id"]]

        if property_id:
            verify_property_access(property_id, user)
            query += " AND sa.property_id = ?"
            params.append(property_id)

        if module and module != "ALL":
            query += " AND sa.module LIKE ?"
            params.append(f"%{module}%")

        query += " ORDER BY sa.created_at DESC LIMIT ?"
        params.append(limit)

        cursor.execute(query, tuple(params))
        rows = [dict(r) for r in cursor.fetchall()]
        return rows


@router.delete("/clear", summary="Clear Activity Logs for Family")
def clear_activity_logs(
    property_id: Optional[str] = Query(None),
    user: dict = Depends(get_current_user),
):
    with get_db() as conn:
        cursor = conn.cursor()
        if property_id:
            verify_property_access(property_id, user)
            cursor.execute("DELETE FROM system_activities WHERE property_id = ?", (property_id,))
        else:
            cursor.execute("DELETE FROM system_activities WHERE family_id = ?", (user["family_id"],))

    log_activity(
        module="System Activity Subsystem",
        action="Audit Trail Purged",
        status="COMPLETED",
        details="Activity logs cleared by authorized user.",
        property_id=property_id,
        family_id=user["family_id"],
    )
    return {"status": "cleared", "message": "System activity logs cleared successfully."}
