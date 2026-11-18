import os
from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np
import joblib

from backend.model.schemas import (
    EnergyPredictionInput,
    EnergyPredictionOutput,
    EnergyPredictionBatchOutput,
    ApplianceBreakdownItem,
    ModelInfoResponse,
)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "saved_models", "energy_model.joblib")
ELECTRICITY_RATE_PER_KWH = 0.15  # USD per kWh

ALL_APPLIANCES = [
    "Air Conditioning",
    "Heater",
    "Fridge",
    "Oven",
    "Dishwasher",
    "Washing Machine",
    "Microwave",
    "Computer",
    "TV",
    "Lights",
]


class PredictionService:
    def __init__(self, model_path: str = MODEL_PATH):
        self.model_path = model_path
        self.pipeline = None
        self.features: List[str] = [
            "Appliance Type",
            "Season",
            "Outdoor Temperature (°C)",
            "Household Size",
            "hour",
            "month",
            "is_weekend",
        ]
        self.appliances: List[str] = ALL_APPLIANCES
        self.appliance_stats: Dict[str, Any] = {}
        self.metrics: Dict[str, Any] = {}
        self.dataset_source: Optional[str] = None
        self.total_rows: Optional[int] = None
        self.model_type: Optional[str] = None
        self.last_trained: Optional[str] = None
        self.load_model()

    def load_model(self) -> None:
        if os.path.exists(self.model_path):
            try:
                payload = joblib.load(self.model_path)
                self.pipeline = payload.get("pipeline")
                self.features = payload.get("features", self.features)
                self.appliances = payload.get("appliances", self.appliances)
                self.appliance_stats = payload.get("appliance_stats", {})
                self.metrics = payload.get("metrics", {})
                self.dataset_source = self.metrics.get("dataset_source", "Kaggle: mexwell/smart-home-energy-consumption")
                self.total_rows = self.metrics.get("total_dataset_rows", 100000)
                self.model_type = self.metrics.get("model_type", "HistGradientBoostingRegressor")
                self.last_trained = self.metrics.get("timestamp")
                print(f"[PredictionService] Successfully loaded trained pipeline from {self.model_path}")
            except Exception as e:
                print(f"[PredictionService] Error loading model: {e}. Fallback enabled.")
                self.pipeline = None
        else:
            print(f"[PredictionService] No model at {self.model_path}. Using fallback.")

    def _predict_single_appliance(self, appliance: str, item: EnergyPredictionInput) -> float:
        if self.pipeline is not None:
            # Map input to dataframe
            row = {
                "Appliance Type": [appliance],
                "Season": [item.season.capitalize()],
                "Outdoor Temperature (°C)": [item.outdoor_temperature],
                "Household Size": [item.household_size],
                "hour": [item.hour_of_day],
                "month": [item.month or 7],
                "is_weekend": [item.is_weekend],
            }
            df = pd.DataFrame(row)
            val = float(self.pipeline.predict(df)[0])
            return max(0.05, round(val, 3))
        else:
            # Fallback benchmark estimation
            base_map = {
                "Air Conditioning": 3.5,
                "Heater": 3.48,
                "Fridge": 0.3,
                "Oven": 1.1,
                "Dishwasher": 1.1,
                "Washing Machine": 1.1,
                "Microwave": 1.1,
                "Computer": 1.1,
                "TV": 1.1,
                "Lights": 1.08,
            }
            return base_map.get(appliance, 1.2)

    def predict(self, input_data: EnergyPredictionInput) -> EnergyPredictionOutput:
        target_appliance = input_data.appliance_type.strip()
        is_whole_home = (
            "all" in target_appliance.lower()
            or "whole" in target_appliance.lower()
            or "total" in target_appliance.lower()
        )

        if is_whole_home:
            breakdown_list: List[ApplianceBreakdownItem] = []
            total_kwh = 0.0

            for app in self.appliances:
                app_kwh = self._predict_single_appliance(app, input_data)
                total_kwh += app_kwh
                breakdown_list.append(
                    ApplianceBreakdownItem(
                        appliance=app,
                        predicted_kwh=round(app_kwh, 2),
                        estimated_cost_usd=round(app_kwh * ELECTRICITY_RATE_PER_KWH, 2),
                        percentage=0.0,  # will normalize
                    )
                )

            total_kwh = round(total_kwh, 2)
            # Normalize percentages
            for item in breakdown_list:
                item.percentage = round((item.predicted_kwh / total_kwh) * 100, 1) if total_kwh > 0 else 0.0

            # Sort descending by consumption
            breakdown_list.sort(key=lambda x: x.predicted_kwh, reverse=True)

            cost = round(total_kwh * ELECTRICITY_RATE_PER_KWH, 2)
            lower = round(total_kwh * 0.94, 2)
            upper = round(total_kwh * 1.06, 2)

            return EnergyPredictionOutput(
                predicted_energy_kwh=total_kwh,
                appliance_type="All Appliances (Whole Home)",
                estimated_cost_usd=cost,
                confidence_interval={"lower_bound": lower, "upper_bound": upper},
                breakdown=breakdown_list,
                unit="kWh",
            )
        else:
            # Match to specific appliance
            matched = next((a for a in self.appliances if a.lower() == target_appliance.lower()), target_appliance)
            val = self._predict_single_appliance(matched, input_data)
            cost = round(val * ELECTRICITY_RATE_PER_KWH, 3)
            lower = round(val * 0.92, 3)
            upper = round(val * 1.08, 3)

            return EnergyPredictionOutput(
                predicted_energy_kwh=val,
                appliance_type=matched,
                estimated_cost_usd=cost,
                confidence_interval={"lower_bound": lower, "upper_bound": upper},
                breakdown=None,
                unit="kWh",
            )

    def predict_batch(self, instances: List[EnergyPredictionInput]) -> EnergyPredictionBatchOutput:
        outputs = [self.predict(item) for item in instances]
        total_energy = round(sum(o.predicted_energy_kwh for o in outputs), 2)
        total_cost = round(sum(o.estimated_cost_usd for o in outputs), 2)

        return EnergyPredictionBatchOutput(
            total_predictions=len(outputs),
            total_energy_kwh=total_energy,
            total_estimated_cost_usd=total_cost,
            predictions=outputs,
            model_version="2.0.0-kaggle",
        )

    def get_info(self) -> ModelInfoResponse:
        return ModelInfoResponse(
            status="active" if self.pipeline is not None else "fallback",
            dataset_source=self.dataset_source,
            total_dataset_rows=self.total_rows,
            model_type=self.model_type,
            features=self.features,
            appliances=self.appliances,
            metrics=self.metrics,
            appliance_stats=self.appliance_stats,
            last_trained=self.last_trained,
        )


_service_instance: Optional[PredictionService] = None


def get_prediction_service() -> PredictionService:
    global _service_instance
    if _service_instance is None:
        _service_instance = PredictionService()
    return _service_instance
