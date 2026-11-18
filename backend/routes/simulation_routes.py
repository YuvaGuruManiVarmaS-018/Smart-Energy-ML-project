from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional
from backend.auth.dependencies import get_current_user, verify_property_access
from backend.services.simulation_service import SimulationService

router = APIRouter(prefix="/simulation", tags=["Mode B: Live Simulation Engine"])


class SimulationPropertyRequest(BaseModel):
    property_id: str


@router.get("/status", summary="Get Current Live Simulation State")
def get_simulation_status(property_id: str = Query(...), user: dict = Depends(get_current_user)):
    verify_property_access(property_id, user)
    return SimulationService.get_or_create_state(property_id)


@router.post("/start", summary="Start Live Energy Simulation")
def start_simulation(payload: SimulationPropertyRequest, user: dict = Depends(get_current_user)):
    verify_property_access(payload.property_id, user)
    try:
        return SimulationService.start_simulation(payload.property_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation startup failed: {str(e)}")


@router.post("/pause", summary="Pause Live Simulation Stream")
def pause_simulation(payload: SimulationPropertyRequest, user: dict = Depends(get_current_user)):
    verify_property_access(payload.property_id, user)
    return SimulationService.pause_simulation(payload.property_id)


@router.post("/resume", summary="Resume Live Simulation Stream")
def resume_simulation(payload: SimulationPropertyRequest, user: dict = Depends(get_current_user)):
    verify_property_access(payload.property_id, user)
    return SimulationService.resume_simulation(payload.property_id)


@router.post("/stop", summary="Stop Live Simulation Engine")
def stop_simulation(payload: SimulationPropertyRequest, user: dict = Depends(get_current_user)):
    verify_property_access(payload.property_id, user)
    return SimulationService.stop_simulation(payload.property_id)


@router.post("/reset", summary="Reset Live Simulation Accumulated Metrics")
def reset_simulation(payload: SimulationPropertyRequest, user: dict = Depends(get_current_user)):
    verify_property_access(payload.property_id, user)
    return SimulationService.reset_simulation(payload.property_id)


@router.post("/tick", summary="Advance Simulation by One Time Step")
def tick_simulation(payload: SimulationPropertyRequest, user: dict = Depends(get_current_user)):
    verify_property_access(payload.property_id, user)
    return SimulationService.tick_simulation(payload.property_id)
