from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from backend.model.schemas import (
    EnergyPredictionInput,
    EnergyPredictionBatchInput,
    EnergyPredictionOutput,
    EnergyPredictionBatchOutput,
    ModelInfoResponse,
)
from backend.services.prediction_service import (
    PredictionService,
    get_prediction_service,
)

router = APIRouter(prefix="/predict", tags=["Predictions"])


@router.post("", response_model=EnergyPredictionOutput, summary="Predict Energy Consumption")
def predict_energy(
    payload: EnergyPredictionInput,
    service: PredictionService = Depends(get_prediction_service),
):
    """
    Predict energy consumption (kWh) for a specific appliance or All Appliances (Whole Home)
    based on Kaggle smart home telemetry (temperature, household size, season, hour).
    """
    try:
        return service.predict(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.post("/batch", response_model=EnergyPredictionBatchOutput, summary="Batch Diurnal Prediction")
def predict_batch(
    payload: EnergyPredictionBatchInput,
    service: PredictionService = Depends(get_prediction_service),
):
    """
    Generate 24-hour diurnal load profiles across hours and conditions.
    """
    try:
        return service.predict_batch(payload.instances)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction error: {str(e)}")


@router.get("/appliances", summary="Get Available Appliances & Benchmark Statistics")
def get_appliances(
    service: PredictionService = Depends(get_prediction_service),
):
    """
    Retrieve supported smart home appliances and their Kaggle dataset statistical benchmarks.
    """
    return {
        "appliances": ["All Appliances (Whole Home)"] + service.appliances,
        "appliance_stats": service.appliance_stats,
    }


@router.get("/model-info", response_model=ModelInfoResponse, summary="Get Model Metadata & Kaggle Metrics")
def get_model_info(
    service: PredictionService = Depends(get_prediction_service),
):
    """
    Retrieve model hyperparameters, features, and evaluation performance on the Kaggle dataset.
    """
    return service.get_info()
