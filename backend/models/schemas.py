from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


# --- Authentication Schemas ---
class UserRegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str
    family_name: Optional[str] = None  # If registering a new family
    invite_code: Optional[str] = None  # If joining an existing family


class UserLoginRequest(BaseModel):
    email: str
    password: str


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]


class FamilyMemberInviteRequest(BaseModel):
    email: str
    full_name: str
    role: str = Field(default="family_member", description="'property_manager' or 'family_member'")
    property_ids: Optional[List[str]] = Field(default=[], description="List of property IDs to assign")


# --- Property Schemas ---
class PropertyCreateRequest(BaseModel):
    name: str
    property_type: str = Field(
        default="Residential House",
        description="Residential House, Apartment, Family-Owned Office, Retail Shop, Supermarket, Shopping Complex, Warehouse, Restaurant, Small Business, Commercial Building, Custom",
    )
    address: str
    tariff_inr: float = Field(default=8.5, description="Electricity tariff in INR (₹/kWh)")
    square_feet: float = Field(default=2400.0)


class PropertyUpdateRequest(BaseModel):
    name: Optional[str] = None
    property_type: Optional[str] = None
    address: Optional[str] = None
    tariff_inr: Optional[float] = None
    square_feet: Optional[float] = None


# --- Appliance Schemas ---
class ApplianceCreateRequest(BaseModel):
    property_id: str
    name: str
    category: str
    rated_power_watts: float
    avg_daily_hours: float
    is_critical: bool = False


# --- Module 1: Preprocessing Schemas ---
class PreprocessDatasetRequest(BaseModel):
    dataset_id: str
    property_id: Optional[str] = None
    handle_missing: str = "impute_mean"  # 'drop', 'impute_mean', 'interpolate'
    remove_duplicates: bool = True
    detect_anomalies: bool = True


class PreprocessSummaryResponse(BaseModel):
    dataset_id: str
    filename: str
    original_rows: int
    cleaned_rows: int
    duplicates_removed: int
    missing_imputed: int
    anomalies_detected: int
    quality_score: float
    columns: List[str]
    detected_mappings: Dict[str, str]
    preview_rows: List[Dict[str, Any]]


# --- Module 2: ML Prediction Schemas ---
class ModelTrainRequest(BaseModel):
    property_id: str
    algorithms: List[str] = ["Linear Regression", "Decision Tree Regressor", "Random Forest Regressor"]
    test_size: float = 0.2


class ModelEvaluationMetric(BaseModel):
    model_name: str
    is_active: bool
    mae: float
    mse: float
    rmse: float
    r2_score: float
    training_samples: int
    trained_at: str


class PredictEnergyRequest(BaseModel):
    property_id: str
    appliance: Optional[str] = "Whole Property Total"
    temperature: float = 26.5
    household_size: int = 4
    hour_of_day: int = 14
    is_weekend: int = 0
    season: str = "Summer"


class PredictionResultResponse(BaseModel):
    property_id: str
    appliance: str
    predicted_kwh: float
    predicted_cost_inr: float
    confidence_interval: Dict[str, float]
    model_used: str
    unit: str = "kWh"


# --- Module 3: Energy Optimization Schemas ---
class RecommendationStatusUpdate(BaseModel):
    status: str = Field(..., description="'PENDING', 'IN_PROGRESS', 'COMPLETED'")


class RecommendationItem(BaseModel):
    id: str
    property_id: str
    title: str
    description: str
    potential_savings_kwh: float
    potential_savings_inr: float
    priority: str
    status: str
    category: str
    created_at: str
