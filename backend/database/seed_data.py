import os
import uuid
from datetime import datetime, timedelta, timezone
import numpy as np
from backend.database.db import get_db, init_db
from backend.auth.security import hash_password


def seed():
    init_db()

    with get_db() as conn:
        cursor = conn.cursor()

        # Check if already seeded
        cursor.execute("SELECT COUNT(*) FROM families")
        if cursor.fetchone()[0] > 0:
            print("[SeedData] Database already seeded. Skipping.")
            return

        print("[SeedData] Pre-populating database with multi-property family data...")

        # 1. Family
        family_id = "fam_sharma_01"
        cursor.execute("""
            INSERT INTO families (id, name, invite_code)
            VALUES (?, ?, ?)
        """, (family_id, "Sharma Family Holdings & Residences", "SHARMA-ENERGY-2026"))

        # 2. Users (Admin, Manager, Member)
        users = [
            (
                "usr_admin_01",
                "admin@sharma-family.com",
                hash_password("admin123"),
                "Rajesh Sharma",
                family_id,
                "family_admin",
                1,
            ),
            (
                "usr_mgr_02",
                "manager@sharma-family.com",
                hash_password("manager123"),
                "Amit Sharma",
                family_id,
                "property_manager",
                1,
            ),
            (
                "usr_mem_03",
                "priya@sharma-family.com",
                hash_password("member123"),
                "Priya Sharma",
                family_id,
                "family_member",
                1,
            ),
        ]
        cursor.executemany("""
            INSERT INTO users (id, email, password_hash, full_name, family_id, role, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, users)

        # 3. Properties (Residential House, Family Office, Supermarket, Warehouse)
        properties = [
            (
                "prop_villa_01",
                family_id,
                "Greenwood Villa (Home)",
                "Residential House",
                "Plot 42, Palm Meadows, Whitefield, Bengaluru",
                8.0,
                3200.0,
            ),
            (
                "prop_office_02",
                family_id,
                "Sharma Tech Park (Office)",
                "Family-Owned Office",
                "Tower B, 4th Floor, Electronic City, Bengaluru",
                10.5,
                6500.0,
            ),
            (
                "prop_mart_03",
                family_id,
                "City Mart Supermarket (Retail)",
                "Supermarket",
                "Shop 12-16, Commercial Street, Bengaluru",
                9.5,
                4800.0,
            ),
            (
                "prop_warehouse_04",
                family_id,
                "Central Logistics Warehouse",
                "Warehouse",
                "Plot 88, Peenya Industrial Area, Phase 2, Bengaluru",
                8.5,
                14000.0,
            ),
        ]
        cursor.executemany("""
            INSERT INTO properties (id, family_id, name, property_type, address, tariff_inr, square_feet)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, properties)

        # 4. Property Members mapping for Amit (Manager of Office & Supermarket)
        property_members = [
            ("pm_01", "prop_office_02", "usr_mgr_02", "manager"),
            ("pm_02", "prop_mart_03", "usr_mgr_02", "manager"),
            ("pm_03", "prop_villa_01", "usr_mem_03", "viewer"),
        ]
        cursor.executemany("""
            INSERT INTO property_members (id, property_id, user_id, access_level)
            VALUES (?, ?, ?, ?)
        """, property_members)

        # 5. Connected Appliances per Property
        appliances = [
            # Villa
            ("app_v1", "prop_villa_01", "Dual-Inverter AC (Master Bed)", "Air Conditioning", 1800, 7.5, 0),
            ("app_v2", "prop_villa_01", "Dual-Inverter AC (Living)", "Air Conditioning", 2200, 6.0, 0),
            ("app_v3", "prop_villa_01", "Samsung Double-Door Refrigerator", "Refrigeration", 350, 24.0, 1),
            ("app_v4", "prop_villa_01", "Solar Geyser & Water Pump", "Water Heating", 2000, 3.0, 1),
            ("app_v5", "prop_villa_01", "Smart LED Lighting System", "Lighting", 400, 8.0, 0),
            # Office
            ("app_o1", "prop_office_02", "Central VRF Air Conditioning Hub", "HVAC", 12000, 10.0, 1),
            ("app_o2", "prop_office_02", "Main IT Server Rack & UPS", "IT Equipment", 4500, 24.0, 1),
            ("app_o3", "prop_office_02", "Workstations & Monitored PCs (45 units)", "Office Equipment", 6500, 9.0, 0),
            ("app_o4", "prop_office_02", "Floor High-Efficiency LED Panels", "Lighting", 1800, 11.0, 0),
            # Supermarket
            ("app_m1", "prop_mart_03", "Commercial Walk-in Freezers", "Refrigeration", 8500, 24.0, 1),
            ("app_m2", "prop_mart_03", "Open Dairy Display Chillers", "Refrigeration", 6000, 16.0, 1),
            ("app_m3", "prop_mart_03", "Aisle Display Spotlights & Retail Signage", "Lighting", 3200, 14.0, 0),
            ("app_m4", "prop_mart_03", "Checkout POS Terminals & Security", "Billing & IT", 1200, 15.0, 1),
            # Warehouse
            ("app_w1", "prop_warehouse_04", "Heavy-Duty Ventilation Air Scrubbers", "Ventilation", 7500, 16.0, 1),
            ("app_w2", "prop_warehouse_04", "Cold Storage Bay Section 1", "Industrial Cooling", 14000, 24.0, 1),
            ("app_w3", "prop_warehouse_04", "High-Mast Industrial LED Floodlights", "Lighting", 4200, 12.0, 0),
            ("app_w4", "prop_warehouse_04", "Electric Forklift Charging Dock", "Heavy Equipment", 9000, 6.0, 0),
        ]
        cursor.executemany("""
            INSERT INTO appliances (id, property_id, name, category, rated_power_watts, avg_daily_hours, is_critical)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, appliances)

        # 6. Energy Telemetry Records (Last 30 days hourly readings)
        np.random.seed(42)
        base_date = datetime.now(timezone.utc) - timedelta(days=30)
        energy_records = []

        prop_profiles = {
            "prop_villa_01": {"base": 1.2, "peak_mult": 2.2, "tariff": 8.0},
            "prop_office_02": {"base": 8.5, "peak_mult": 4.5, "tariff": 10.5},
            "prop_mart_03": {"base": 12.0, "peak_mult": 3.0, "tariff": 9.5},
            "prop_warehouse_04": {"base": 18.0, "peak_mult": 2.2, "tariff": 8.5},
        }

        # Generate 720 hours (30 days) of telemetry for each property
        for p_id, profile in prop_profiles.items():
            for hour_step in range(720):
                record_time = base_date + timedelta(hours=hour_step)
                hour = record_time.hour
                is_weekend = 1 if record_time.weekday() >= 5 else 0

                # Temperature cycle
                temp = round(22 + 8 * np.sin(2 * np.pi * hour / 24 - 1.5) + np.random.normal(0, 1.2), 1)

                # Time of day modulation
                if p_id == "prop_office_02":
                    activity = 0.2 if is_weekend else (1.0 if (8 <= hour <= 19) else 0.15)
                elif p_id == "prop_mart_03":
                    activity = 1.0 if (9 <= hour <= 22) else 0.4
                elif p_id == "prop_warehouse_04":
                    activity = 0.9 if (6 <= hour <= 20) else 0.6
                else:  # Villa
                    activity = 0.8 if is_weekend else (0.9 if (hour <= 8 or hour >= 18) else 0.35)

                kwh = round(profile["base"] + profile["peak_mult"] * activity + max(0, temp - 26) * 0.4 + np.random.normal(0, 0.2), 2)
                kwh = max(0.5, kwh)
                cost = round(kwh * profile["tariff"], 2)
                is_anomaly = 1 if (hour_step in [142, 388, 512] and p_id in ["prop_office_02", "prop_mart_03"]) else 0

                energy_records.append((
                    f"rec_{p_id}_{hour_step}",
                    p_id,
                    record_time.strftime("%Y-%m-%d %H:%M:%S"),
                    kwh,
                    cost,
                    temp,
                    "Total Facility Aggregate",
                    is_anomaly,
                    "telemetry",
                ))

        cursor.executemany("""
            INSERT INTO energy_records (id, property_id, timestamp, energy_kwh, cost_inr, temperature, appliance_name, is_anomaly, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, energy_records)

        # 7. Pre-populated Tailored Recommendations (Module 3)
        recommendations = [
            (
                "rec_01",
                "prop_villa_01",
                "Optimum HVAC Setpoint Optimization",
                "Increasing AC thermostat setpoint from 20°C to 24°C during night hours reduces compressor duty cycle by 24%.",
                85.0,
                680.0,
                "HIGH",
                "PENDING",
                "HVAC",
            ),
            (
                "rec_02",
                "prop_villa_01",
                "Water Geyser Timer Automation",
                "Install a digital timer to prevent continuous 2kW geyser standby reheating during afternoon hours.",
                45.0,
                360.0,
                "MEDIUM",
                "COMPLETED",
                "WATER HEATING",
            ),
            (
                "rec_03",
                "prop_office_02",
                "Peak Tariff HVAC Load Shifting",
                "Pre-cool the office space between 14:00-17:00 before the peak electricity tariff tier kicks in (18:00-22:00 @ ₹12.5/kWh).",
                320.0,
                3360.0,
                "HIGH",
                "PENDING",
                "PEAK_SHIFT",
            ),
            (
                "rec_04",
                "prop_office_02",
                "Automate Idle Workstation Sleep State",
                "Enable group policy sleep mode after 20 minutes of inactivity across 45 workstation monitors and computing units.",
                180.0,
                1890.0,
                "MEDIUM",
                "IN_PROGRESS",
                "OFFICE IT",
            ),
            (
                "rec_05",
                "prop_mart_03",
                "Refrigeration Night Curtains & Door Seals",
                "Deploy thermal insulating night blinds over dairy open chillers to reduce nocturnal cooling loss by 35%.",
                420.0,
                3990.0,
                "HIGH",
                "PENDING",
                "REFRIGERATION",
            ),
            (
                "rec_06",
                "prop_warehouse_04",
                "Forklift Charging Schedule Alignment",
                "Shift high-draw 9kW battery charging exclusively to off-peak night window (23:00-06:00) taking advantage of low industrial tariffs.",
                580.0,
                4930.0,
                "HIGH",
                "COMPLETED",
                "EQUIPMENT",
            ),
        ]
        cursor.executemany("""
            INSERT INTO recommendations (id, property_id, title, description, potential_savings_kwh, potential_savings_inr, priority, status, category)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, recommendations)

        # 8. Initial Notifications
        notifications = [
            (
                "notif_01",
                family_id,
                "prop_office_02",
                "Peak Tariff Alert (18:00 - 22:00)",
                "Office energy tariff switches to ₹12.50/kWh in 30 minutes. Non-critical loads should be throttled.",
                "warning",
                0,
            ),
            (
                "notif_02",
                family_id,
                "prop_mart_03",
                "Chiller Temperature Anomaly Detected",
                "Walk-in freezer compressor ran 95 minutes continuously above standard cycle. Potential door seal leakage.",
                "urgent",
                0,
            ),
            (
                "notif_03",
                family_id,
                "prop_villa_01",
                "Energy Saving Goal Achieved!",
                "Geyser timer optimization was marked completed. Saved ₹360 this billing cycle.",
                "success",
                1,
            ),
        ]
        cursor.executemany("""
            INSERT INTO notifications (id, family_id, property_id, title, message, type, is_read)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, notifications)

        print("[SeedData] Successfully pre-populated family, 4 properties, appliances, and 2,880 telemetry readings!")


if __name__ == "__main__":
    seed()
