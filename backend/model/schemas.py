from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class EnergyPredictionInput(BaseModel):
    appliance_type: str = Field(
        default="All Appliances (Whole Home)",
        description="Target appliance or 'All Appliances (Whole Home)'",
        example="Air Conditioning",
    )
    outdoor_temperature: float = Field(
        default=24.0,
        description="Ambient outdoor temperature in Celsius (°C)",
        ge=-15.0,
        le=50.0,
        example=28.5,
    )
    household_size: int = Field(
        default=3,
        description="Number of occupants in household (1-5)",
        ge=1,
        le=10,
        example=3,
    )
    season: str = Field(
        default="Summer",
        description="Current season ('Summer', 'Winter', 'Spring', 'Fall')",
        example="Summer",
    )
    hour_of_day: int = Field(
        default=14,
        description="Hour of day (0-23)",
        ge=0,
        le=23,
        example=14,
    )
    is_weekend: int = Field(
        default=0,
        description="1 for weekend, 0 for weekday",
        ge=0,
        le=1,
        example=0,
    )
    month: Optional[int] = Field(
        default=7,
        description="Month of year (1-12)",
        ge=1,
        le=12,
        example=7,
    )


class ApplianceBreakdownItem(BaseModel):
    appliance: str
    predicted_kwh: float
    estimated_cost_usd: float
    percentage: float


class EnergyPredictionOutput(BaseModel):
    predicted_energy_kwh: float
    appliance_type: str
    estimated_cost_usd: float
    confidence_interval: Dict[str, float]
    breakdown: Optional[List[ApplianceBreakdownItem]] = None
    unit: str = "kWh"


class EnergyPredictionBatchInput(BaseModel):
    instances: List[EnergyPredictionInput]


class EnergyPredictionBatchOutput(BaseModel):
    total_predictions: int
    total_energy_kwh: float
    total_estimated_cost_usd: float
    predictions: List[EnergyPredictionOutput]
    model_version: str


class ModelInfoResponse(BaseModel):
    status: str
    dataset_source: Optional[str] = None
    total_dataset_rows: Optional[int] = None
    model_type: Optional[str] = None
    features: List[str]
    appliances: List[str]
    metrics: Dict[str, Any]
    appliance_stats: Dict[str, Any]
    last_trained: Optional[str] = None
