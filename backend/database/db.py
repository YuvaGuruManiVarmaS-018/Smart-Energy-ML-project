import os
import sqlite3
import uuid
from typing import Generator, Any, Dict, List, Optional
from contextlib import contextmanager

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_DIR = os.path.join(BASE_DIR, "backend", "database")
DB_PATH = os.path.join(DB_DIR, "smart_energy.db")

os.makedirs(DB_DIR, exist_ok=True)


def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


@contextmanager
def get_db():
    conn = get_db_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def log_activity(
    module: str,
    action: str,
    status: str,
    details: str = "",
    property_id: Optional[str] = None,
    family_id: Optional[str] = None,
):
    """
    Records genuine backend events, preprocessing triggers, model training, and predictions.
    """
    try:
        act_id = f"act_{uuid.uuid4().hex[:10]}"
        with get_db() as conn:
            cursor = conn.cursor()
            if property_id and not family_id:
                cursor.execute("SELECT family_id FROM properties WHERE id = ?", (property_id,))
                p_row = cursor.fetchone()
                if p_row:
                    family_id = p_row[0]

            cursor.execute("""
                INSERT INTO system_activities (id, family_id, property_id, module, action, status, details)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (act_id, family_id, property_id, module, action, status, details))
    except Exception as e:
        print(f"[ActivityLog] Error logging activity: {e}")


def init_db():
    with get_db() as conn:
        cursor = conn.cursor()

        # 1. Families
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS families (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            invite_code TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 2. Users
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
            role TEXT NOT NULL CHECK(role IN ('family_admin', 'property_manager', 'family_member')),
            is_active INTEGER DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 3. Properties
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS properties (
            id TEXT PRIMARY KEY,
            family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            property_type TEXT NOT NULL,
            address TEXT,
            tariff_inr REAL DEFAULT 8.5,
            square_feet REAL DEFAULT 2500,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 4. Property Members
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS property_members (
            id TEXT PRIMARY KEY,
            property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            access_level TEXT DEFAULT 'manager',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(property_id, user_id)
        );
        """)

        # 5. Appliances
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS appliances (
            id TEXT PRIMARY KEY,
            property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            rated_power_watts REAL DEFAULT 1500,
            avg_daily_hours REAL DEFAULT 6.0,
            is_critical INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 6. Energy Records
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS energy_records (
            id TEXT PRIMARY KEY,
            property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
            timestamp TEXT NOT NULL,
            energy_kwh REAL NOT NULL,
            cost_inr REAL NOT NULL,
            temperature REAL,
            appliance_name TEXT,
            is_anomaly INTEGER DEFAULT 0,
            source TEXT DEFAULT 'telemetry'
        );
        """)

        # 7. Uploaded Datasets (Module 1)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS uploaded_datasets (
            id TEXT PRIMARY KEY,
            property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
            filename TEXT NOT NULL,
            total_rows INTEGER NOT NULL,
            cleaned_rows INTEGER NOT NULL,
            columns_json TEXT NOT NULL,
            quality_score REAL DEFAULT 95.0,
            file_path TEXT NOT NULL,
            cleaned_file_path TEXT,
            uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 8. Model Training History (Module 2)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS model_training_history (
            id TEXT PRIMARY KEY,
            property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
            model_name TEXT NOT NULL,
            is_active INTEGER DEFAULT 0,
            mae REAL NOT NULL,
            mse REAL NOT NULL,
            rmse REAL NOT NULL,
            r2_score REAL NOT NULL,
            training_samples INTEGER NOT NULL,
            trained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            model_path TEXT
        );
        """)

        # 9. Predictions
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id TEXT PRIMARY KEY,
            property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
            model_used TEXT NOT NULL,
            input_features_json TEXT NOT NULL,
            predicted_kwh REAL NOT NULL,
            predicted_cost_inr REAL NOT NULL,
            target_period TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 10. Recommendations (Module 3)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS recommendations (
            id TEXT PRIMARY KEY,
            property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            potential_savings_kwh REAL NOT NULL,
            potential_savings_inr REAL NOT NULL,
            priority TEXT DEFAULT 'MEDIUM',
            status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED')),
            category TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 11. Notifications
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            family_id TEXT NOT NULL REFERENCES families(id) ON DELETE CASCADE,
            property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'info',
            is_read INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 12. Reports
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            period TEXT NOT NULL,
            total_kwh REAL NOT NULL,
            total_cost_inr REAL NOT NULL,
            savings_achieved_inr REAL DEFAULT 0.0,
            file_path TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 13. System Activity Logs (Real Backend Process Monitor)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS system_activities (
            id TEXT PRIMARY KEY,
            family_id TEXT,
            property_id TEXT,
            module TEXT NOT NULL,
            action TEXT NOT NULL,
            status TEXT NOT NULL,
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 14. IoT Devices Registry (Mode C)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS iot_devices (
            id TEXT PRIMARY KEY,
            property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
            device_name TEXT NOT NULL,
            device_type TEXT NOT NULL,
            protocol TEXT DEFAULT 'HTTP/MQTT',
            api_key TEXT UNIQUE NOT NULL,
            is_online INTEGER DEFAULT 0,
            last_reading_kw REAL DEFAULT 0.0,
            last_seen TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        # 15. Simulation States (Mode B)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS simulation_states (
            property_id TEXT PRIMARY KEY REFERENCES properties(id) ON DELETE CASCADE,
            status TEXT DEFAULT 'STOPPED' CHECK(status IN ('STOPPED', 'RUNNING', 'PAUSED')),
            current_power_kw REAL DEFAULT 0.0,
            accumulated_kwh REAL DEFAULT 0.0,
            cost_inr REAL DEFAULT 0.0,
            tick_count INTEGER DEFAULT 0,
            appliance_states_json TEXT DEFAULT '{}',
            alerts_json TEXT DEFAULT '[]',
            last_tick_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

        print(f"[Database] SQLite schema verified and initialized at {DB_PATH}")
