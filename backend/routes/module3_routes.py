from fastapi import APIRouter, HTTPException, Depends, Query
from backend.models.schemas import RecommendationStatusUpdate
from backend.auth.dependencies import get_current_user, verify_property_access
from backend.services.optimization_service import OptimizationService
from backend.database.db import get_db

router = APIRouter(prefix="/optimize", tags=["Module 3: Optimization & Recommendations"])


@router.get("/audit", summary="Get Property Energy Audit & Peak-Demand Analysis")
def get_energy_audit(property_id: str = Query(...), user: dict = Depends(get_current_user)):
    verify_property_access(property_id, user)
    try:
        audit = OptimizationService.analyze_property_energy_audit(property_id)
        return audit
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audit generation failed: {str(e)}")


@router.get("/recommendations", summary="Get Energy-Saving Recommendations")
def get_recommendations(property_id: str = Query(...), user: dict = Depends(get_current_user)):
    verify_property_access(property_id, user)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM recommendations 
            WHERE property_id = ?
            ORDER BY CASE priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END, created_at DESC
        """, (property_id,))
        return [dict(r) for r in cursor.fetchall()]


@router.post("/recommendations/{rec_id}/status", summary="Update Recommendation Status")
def update_recommendation_status(
    rec_id: str,
    payload: RecommendationStatusUpdate,
    user: dict = Depends(get_current_user),
):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT property_id FROM recommendations WHERE id = ?", (rec_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Recommendation not found.")

        verify_property_access(row[0], user)

    try:
        updated = OptimizationService.toggle_recommendation_status(rec_id, payload.status.upper())
        return updated
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Status update failed: {str(e)}")


@router.get("/deployment-status", summary="System Health & Capstone Architecture Diagnostics")
def get_deployment_status():
    return OptimizationService.get_system_deployment_status()
