import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Query, Header
from pydantic import BaseModel, Field
from backend.auth.dependencies import get_current_user, verify_property_access
from backend.database.db import get_db, log_activity

router = APIRouter(prefix="/iot", tags=["Mode C: Real-Time Hardware Integration"])


class IoTDeviceRegisterRequest(BaseModel):
    property_id: str
    device_name: str
    device_type: str = Field(..., description="'Smart Meter CT Clamp', 'Modbus RS485 Meter', 'ESP32 Energy Monitor', 'Raspberry Pi Node'")
    protocol: str = Field(default="HTTP/MQTT")


class IoTIngestReadingRequest(BaseModel):
    device_id: str
    api_key: str
    current_kw: float
    voltage: Optional[float] = 230.0
    power_factor: Optional[float] = 0.95
    timestamp: Optional[str] = None


@router.get("/devices", summary="List Registered IoT Hardware for Property")
def list_iot_devices(property_id: str, user: dict = Depends(get_current_user)):
    verify_property_access(property_id, user)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, property_id, device_name, device_type, protocol, api_key, is_online, last_reading_kw, last_seen, created_at
            FROM iot_devices
            WHERE property_id = ?
            ORDER BY created_at DESC
        """, (property_id,))
        devices = [dict(d) for d in cursor.fetchall()]

        # Re-verify online status (offline if no ping in 60 seconds)
        now = datetime.now(timezone.utc)
        for dev in devices:
            if dev["last_seen"]:
                try:
                    last_seen_dt = datetime.fromisoformat(dev["last_seen"].replace("Z", "+00:00"))
                    if (now - last_seen_dt).total_seconds() > 60:
                        dev["is_online"] = 0
                except Exception:
                    dev["is_online"] = 0
            else:
                dev["is_online"] = 0

        return devices


@router.post("/devices", summary="Register New Smart Meter / IoT Device")
def register_iot_device(payload: IoTDeviceRegisterRequest, user: dict = Depends(get_current_user)):
    verify_property_access(payload.property_id, user)
    device_id = f"iot_{uuid.uuid4().hex[:8]}"
    api_key = f"key_voltiq_{uuid.uuid4().hex[:16]}"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO iot_devices (id, property_id, device_name, device_type, protocol, api_key, is_online)
            VALUES (?, ?, ?, ?, ?, ?, 0)
        """, (device_id, payload.property_id, payload.device_name, payload.device_type, payload.protocol, api_key))

        cursor.execute("SELECT * FROM iot_devices WHERE id = ?", (device_id,))
        new_dev = dict(cursor.fetchone())

    log_activity(
        module="IoT Hardware Subsystem",
        action="IoT Device Registered",
        status="REGISTERED",
        details=f"Hardware '{payload.device_name}' ({payload.device_type}) enrolled for monitoring.",
        property_id=payload.property_id,
    )
    return new_dev


@router.post("/ingest", summary="Hardware Ingestion Endpoint (API/MQTT Gateway)")
def ingest_hardware_reading(payload: IoTIngestReadingRequest):
    """
    Called by physical ESP32, Arduino, Raspberry Pi, or Modbus energy monitors.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM iot_devices WHERE id = ? AND api_key = ?", (payload.device_id, payload.api_key))
        dev = cursor.fetchone()

        if not dev:
            raise HTTPException(status_code=401, detail="Invalid IoT hardware credentials or API key.")

        prop_id = dev["property_id"]
        now_iso = datetime.now(timezone.utc).isoformat()

        # Update device online state
        cursor.execute("""
            UPDATE iot_devices 
            SET is_online = 1, last_reading_kw = ?, last_seen = ? 
            WHERE id = ?
        """, (payload.current_kw, now_iso, payload.device_id))

        # Insert telemetry record into energy_records
        rec_id = f"iot_rec_{uuid.uuid4().hex[:10]}"
        cursor.execute("SELECT tariff_inr FROM properties WHERE id = ?", (prop_id,))
        p_row = cursor.fetchone()
        tariff = p_row[0] if p_row else 8.5

        # 5-second slice in kWh
        slice_kwh = round((payload.current_kw * 5.0) / 3600.0, 4)
        cost = round(slice_kwh * tariff, 2)

        cursor.execute("""
            INSERT INTO energy_records (id, property_id, timestamp, energy_kwh, cost_inr, temperature, appliance_name, is_anomaly, source)
            VALUES (?, ?, ?, ?, ?, 25.0, ?, 0, 'hardware_iot')
        """, (
            rec_id,
            prop_id,
            datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S"),
            slice_kwh,
            cost,
            dev["device_name"],
        ))

    return {
        "status": "ingested",
        "device_id": payload.device_id,
        "recorded_kw": payload.current_kw,
        "timestamp": now_iso,
    }


@router.get("/status", summary="IoT Gateway Subsystem Health")
def get_iot_status(property_id: str, user: dict = Depends(get_current_user)):
    verify_property_access(property_id, user)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*), SUM(is_online) FROM iot_devices WHERE property_id = ?", (property_id,))
        row = cursor.fetchone()
        total_devs = row[0] or 0
        online_devs = row[1] or 0

    return {
        "property_id": property_id,
        "total_enrolled_devices": total_devs,
        "online_active_devices": online_devs,
        "connection_status": "CONNECTED" if online_devs > 0 else "NOT CONNECTED",
        "gateway_protocol": "HTTP/MQTT REST Ingestion Gateway",
        "api_endpoint": "/api/iot/ingest",
    }
