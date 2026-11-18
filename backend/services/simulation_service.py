import os
import json
import uuid
from datetime import datetime, timezone
import numpy as np
from typing import Dict, Any, Optional
from backend.database.db import get_db, log_activity


class SimulationService:
    @staticmethod
    def get_or_create_state(property_id: str) -> Dict[str, Any]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM simulation_states WHERE property_id = ?", (property_id,))
            row = cursor.fetchone()

            if not row:
                cursor.execute("""
                    INSERT INTO simulation_states (
                        property_id, status, current_power_kw, accumulated_kwh, cost_inr, 
                        tick_count, appliance_states_json, alerts_json
                    ) VALUES (?, 'STOPPED', 0.0, 0.0, 0.0, 0, '{}', '[]')
                """, (property_id,))
                cursor.execute("SELECT * FROM simulation_states WHERE property_id = ?", (property_id,))
                row = cursor.fetchone()

            state = dict(row)
            state["appliance_states"] = json.loads(state.get("appliance_states_json") or "{}")
            state["alerts"] = json.loads(state.get("alerts_json") or "[]")
            return state

    @staticmethod
    def start_simulation(property_id: str) -> Dict[str, Any]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM properties WHERE id = ?", (property_id,))
            prop = cursor.fetchone()
            if not prop:
                raise ValueError(f"Property '{property_id}' not found.")

            cursor.execute("""
                INSERT INTO simulation_states (property_id, status, tick_count, last_tick_time)
                VALUES (?, 'RUNNING', 1, CURRENT_TIMESTAMP)
                ON CONFLICT(property_id) DO UPDATE SET 
                    status = 'RUNNING',
                    last_tick_time = CURRENT_TIMESTAMP
            """, (property_id,))

        log_activity(
            module="Live Simulation Mode",
            action="Simulation Engine Started",
            status="RUNNING",
            details=f"Live telemetry simulation engine initiated for {prop['name']}.",
            property_id=property_id,
        )
        return SimulationService.tick_simulation(property_id)

    @staticmethod
    def pause_simulation(property_id: str) -> Dict[str, Any]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE simulation_states SET status = 'PAUSED' WHERE property_id = ?", (property_id,))

        log_activity(
            module="Live Simulation Mode",
            action="Simulation Paused",
            status="PAUSED",
            details="User paused live simulation feed.",
            property_id=property_id,
        )
        return SimulationService.get_or_create_state(property_id)

    @staticmethod
    def resume_simulation(property_id: str) -> Dict[str, Any]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE simulation_states SET status = 'RUNNING' WHERE property_id = ?", (property_id,))

        log_activity(
            module="Live Simulation Mode",
            action="Simulation Resumed",
            status="RUNNING",
            details="User resumed live simulation feed.",
            property_id=property_id,
        )
        return SimulationService.tick_simulation(property_id)

    @staticmethod
    def stop_simulation(property_id: str) -> Dict[str, Any]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE simulation_states SET status = 'STOPPED', current_power_kw = 0.0 WHERE property_id = ?", (property_id,))

        log_activity(
            module="Live Simulation Mode",
            action="Simulation Stopped",
            status="STOPPED",
            details="User stopped live simulation engine.",
            property_id=property_id,
        )
        return SimulationService.get_or_create_state(property_id)

    @staticmethod
    def reset_simulation(property_id: str) -> Dict[str, Any]:
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE simulation_states 
                SET status = 'STOPPED', current_power_kw = 0.0, accumulated_kwh = 0.0, 
                    cost_inr = 0.0, tick_count = 0, alerts_json = '[]'
                WHERE property_id = ?
            """, (property_id,))

        log_activity(
            module="Live Simulation Mode",
            action="Simulation Reset",
            status="RESET",
            details="Reset accumulated simulation metrics to zero.",
            property_id=property_id,
        )
        return SimulationService.get_or_create_state(property_id)

    @staticmethod
    def tick_simulation(property_id: str) -> Dict[str, Any]:
        """
        Generates realistic dynamic telemetry tick based on actual property profile and connected appliances.
        """
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM properties WHERE id = ?", (property_id,))
            prop_row = cursor.fetchone()
            if not prop_row:
                raise ValueError("Property not found.")
            prop = dict(prop_row)
            tariff = prop.get("tariff_inr", 8.5)
            p_type = prop.get("property_type", "Residential House")

            # Fetch appliances
            cursor.execute("SELECT * FROM appliances WHERE property_id = ?", (property_id,))
            appliances = [dict(a) for a in cursor.fetchall()]

            # Fetch existing state
            cursor.execute("SELECT * FROM simulation_states WHERE property_id = ?", (property_id,))
            state_row = cursor.fetchone()
            state = dict(state_row) if state_row else {
                "status": "RUNNING", "current_power_kw": 0.0, "accumulated_kwh": 0.0,
                "cost_inr": 0.0, "tick_count": 0, "alerts_json": "[]"
            }

            if state["status"] != "RUNNING":
                return SimulationService.get_or_create_state(property_id)

            tick_count = state.get("tick_count", 0) + 1
            now = datetime.now(timezone.utc)
            hour = now.hour

            # Calculate appliance-level simulated loads
            appliance_telemetry = []
            total_active_kw = 0.0

            for app in appliances:
                rated_kw = app["rated_power_watts"] / 1000.0
                category = app["category"].lower()

                # State modulation
                if "refriger" in category or "cold" in category or app["is_critical"]:
                    # Compressor cycles (80% duty cycle)
                    is_on = np.random.rand() > 0.15
                    draw = round(rated_kw * (0.85 + np.random.uniform(-0.05, 0.1)), 2) if is_on else 0.05
                    status_text = "COMPRESSOR ACTIVE" if is_on else "STANDBY"
                elif "air condition" in category or "hvac" in category:
                    # Climate control based on daytime
                    is_on = (9 <= hour <= 23) if "office" not in p_type.lower() else (8 <= hour <= 19)
                    draw = round(rated_kw * (0.75 + np.random.uniform(-0.1, 0.15)), 2) if is_on else 0.0
                    status_text = "COOLING LOAD" if is_on else "OFF"
                elif "light" in category:
                    is_on = (hour >= 17 or hour <= 7) if "office" not in p_type.lower() else (8 <= hour <= 20)
                    draw = round(rated_kw * 0.9, 2) if is_on else 0.0
                    status_text = "ILLUMINATED" if is_on else "OFF"
                else:
                    # Equipment / Plug load
                    is_on = np.random.rand() > 0.35
                    draw = round(rated_kw * np.random.uniform(0.4, 0.9), 2) if is_on else 0.0
                    status_text = "RUNNING" if is_on else "IDLE"

                total_active_kw += draw
                appliance_telemetry.append({
                    "id": app["id"],
                    "name": app["name"],
                    "category": app["category"],
                    "rated_kw": rated_kw,
                    "current_draw_kw": draw,
                    "status": status_text,
                })

            # Base building load + ambient noise
            property_baseload = {
                "Residential House": 0.5,
                "Apartment": 0.4,
                "Family-Owned Office": 3.2,
                "Retail Shop": 2.5,
                "Supermarket": 6.5,
                "Warehouse": 4.5,
                "Restaurant": 5.0,
            }.get(p_type, 1.5)

            current_power_kw = round(property_baseload + total_active_kw + np.random.uniform(-0.15, 0.2), 2)
            current_power_kw = max(0.2, current_power_kw)

            # Each tick represents ~5 seconds (5/3600 hours)
            step_hours = 5.0 / 3600.0
            step_kwh = round(current_power_kw * step_hours, 4)
            accumulated_kwh = round(state.get("accumulated_kwh", 0.0) + step_kwh, 3)
            cost_inr = round(accumulated_kwh * tariff, 2)

            # Generate alerts if threshold exceeded
            alerts = []
            critical_threshold = {
                "Residential House": 5.5,
                "Family-Owned Office": 18.0,
                "Supermarket": 25.0,
                "Warehouse": 28.0,
            }.get(p_type, 10.0)

            if current_power_kw > critical_threshold:
                alerts.append({
                    "id": f"alt_{uuid.uuid4().hex[:6]}",
                    "time": now.strftime("%H:%M:%S"),
                    "title": f"High Load Spike ({current_power_kw} kW)",
                    "message": f"Demand exceeded critical threshold of {critical_threshold} kW.",
                    "level": "WARNING",
                })

            # Insert telemetry record into energy_records marked as SIMULATION
            rec_id = f"sim_{uuid.uuid4().hex[:10]}"
            cursor.execute("""
                INSERT INTO energy_records (id, property_id, timestamp, energy_kwh, cost_inr, temperature, appliance_name, is_anomaly, source)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'simulation')
            """, (
                rec_id,
                property_id,
                now.strftime("%Y-%m-%d %H:%M:%S"),
                step_kwh,
                round(step_kwh * tariff, 2),
                26.5,
                "Live Simulation Stream",
                1 if alerts else 0,
            ))

            # Update simulation state
            cursor.execute("""
                UPDATE simulation_states
                SET current_power_kw = ?, accumulated_kwh = ?, cost_inr = ?, 
                    tick_count = ?, appliance_states_json = ?, alerts_json = ?,
                    last_tick_time = CURRENT_TIMESTAMP
                WHERE property_id = ?
            """, (
                current_power_kw,
                accumulated_kwh,
                cost_inr,
                tick_count,
                json.dumps(appliance_telemetry),
                json.dumps(alerts),
                property_id,
            ))

        return {
            "property_id": property_id,
            "status": "RUNNING",
            "is_simulation": True,
            "simulation_label": "LIVE SIMULATION (DATA SOURCE: SYNTHETIC REAL-TIME ENGINE)",
            "current_power_kw": current_power_kw,
            "accumulated_kwh": accumulated_kwh,
            "cost_inr": cost_inr,
            "tariff_inr": tariff,
            "tick_count": tick_count,
            "timestamp": now.strftime("%Y-%m-%d %H:%M:%S"),
            "appliance_telemetry": appliance_telemetry,
            "alerts": alerts,
        }
