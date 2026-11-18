import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends
from backend.models.schemas import PropertyCreateRequest, PropertyUpdateRequest, FamilyMemberInviteRequest, ApplianceCreateRequest
from backend.auth.dependencies import get_current_user, verify_property_access
from backend.auth.security import hash_password
from backend.database.db import get_db

router = APIRouter(prefix="/family", tags=["Family & Properties"])


@router.get("/properties", summary="List All Permitted Family Properties")
def get_properties(user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()

        # If admin, fetch all properties owned by family
        if user["role"] == "family_admin":
            cursor.execute("""
                SELECT * FROM properties 
                WHERE family_id = ? 
                ORDER BY created_at ASC
            """, (user["family_id"],))
        else:
            # If property_manager or member, fetch properties assigned in property_members or all family props
            cursor.execute("""
                SELECT DISTINCT p.* FROM properties p
                LEFT JOIN property_members pm ON p.id = pm.property_id
                WHERE p.family_id = ? AND (pm.user_id = ? OR p.family_id = ?)
                ORDER BY p.created_at ASC
            """, (user["family_id"], user["id"], user["family_id"]))

        rows = cursor.fetchall()
        return [dict(r) for r in rows]


@router.post("/properties", summary="Register a New Family Property")
def create_property(payload: PropertyCreateRequest, user: dict = Depends(get_current_user)):
    if user["role"] != "family_admin":
        raise HTTPException(status_code=403, detail="Only the Family Administrator can add new properties.")

    prop_id = f"prop_{uuid.uuid4().hex[:8]}"
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO properties (id, family_id, name, property_type, address, tariff_inr, square_feet)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            prop_id,
            user["family_id"],
            payload.name,
            payload.property_type,
            payload.address,
            payload.tariff_inr,
            payload.square_feet,
        ))

        cursor.execute("SELECT * FROM properties WHERE id = ?", (prop_id,))
        return dict(cursor.fetchone())


@router.put("/properties/{property_id}", summary="Update Property Settings or Tariff")
def update_property(property_id: str, payload: PropertyUpdateRequest, user: dict = Depends(get_current_user)):
    prop = verify_property_access(property_id, user)
    if user["role"] not in ["family_admin", "property_manager"]:
        raise HTTPException(status_code=403, detail="Insufficient permission to edit property parameters.")

    with get_db() as conn:
        cursor = conn.cursor()
        updates = []
        params = []
        if payload.name:
            updates.append("name = ?")
            params.append(payload.name)
        if payload.property_type:
            updates.append("property_type = ?")
            params.append(payload.property_type)
        if payload.address:
            updates.append("address = ?")
            params.append(payload.address)
        if payload.tariff_inr is not None:
            updates.append("tariff_inr = ?")
            params.append(payload.tariff_inr)
        if payload.square_feet is not None:
            updates.append("square_feet = ?")
            params.append(payload.square_feet)

        if updates:
            params.append(property_id)
            cursor.execute(f"UPDATE properties SET {', '.join(updates)} WHERE id = ?", params)

        cursor.execute("SELECT * FROM properties WHERE id = ?", (property_id,))
        return dict(cursor.fetchone())


@router.get("/members", summary="List All Family Members")
def get_family_members(user: dict = Depends(get_current_user)):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, email, full_name, role, is_active, created_at
            FROM users
            WHERE family_id = ?
            ORDER BY created_at ASC
        """, (user["family_id"],))
        rows = cursor.fetchall()
        return [dict(r) for r in rows]


@router.post("/invite", summary="Invite or Register a Family Member")
def invite_member(payload: FamilyMemberInviteRequest, user: dict = Depends(get_current_user)):
    if user["role"] != "family_admin":
        raise HTTPException(status_code=403, detail="Only the Family Administrator can invite family members.")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM users WHERE email = ?", (payload.email.lower().strip(),))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="User with this email already exists.")

        user_id = f"usr_{uuid.uuid4().hex[:10]}"
        temp_pass = "welcome123"

        cursor.execute("""
            INSERT INTO users (id, email, password_hash, full_name, family_id, role, is_active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        """, (
            user_id,
            payload.email.lower().strip(),
            hash_password(temp_pass),
            payload.full_name,
            user["family_id"],
            payload.role,
        ))

        # Assign properties if provided
        for p_id in payload.property_ids:
            cursor.execute("""
                INSERT OR IGNORE INTO property_members (id, property_id, user_id, access_level)
                VALUES (?, ?, ?, 'manager')
            """, (f"pm_{uuid.uuid4().hex[:8]}", p_id, user_id))

        return {
            "status": "success",
            "message": f"Member '{payload.full_name}' added to household.",
            "default_password": temp_pass,
            "user_id": user_id,
        }


@router.delete("/members/{member_id}", summary="Remove / Deactivate Family Member")
def remove_member(member_id: str, user: dict = Depends(get_current_user)):
    if user["role"] != "family_admin":
        raise HTTPException(status_code=403, detail="Only the Family Administrator can remove members.")

    if member_id == user["id"]:
        raise HTTPException(status_code=400, detail="You cannot remove yourself as Family Administrator.")

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET is_active = 0 WHERE id = ? AND family_id = ?", (member_id, user["family_id"]))
        return {"status": "success", "message": "Member access has been revoked."}


@router.get("/appliances", summary="Get Appliances for a Property")
def get_appliances(property_id: str, user: dict = Depends(get_current_user)):
    verify_property_access(property_id, user)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM appliances WHERE property_id = ? ORDER BY rated_power_watts DESC", (property_id,))
        return [dict(r) for r in cursor.fetchall()]


@router.post("/appliances", summary="Add Connected Appliance / Equipment")
def add_appliance(payload: ApplianceCreateRequest, user: dict = Depends(get_current_user)):
    verify_property_access(payload.property_id, user)
    app_id = f"app_{uuid.uuid4().hex[:8]}"

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO appliances (id, property_id, name, category, rated_power_watts, avg_daily_hours, is_critical)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            app_id,
            payload.property_id,
            payload.name,
            payload.category,
            payload.rated_power_watts,
            payload.avg_daily_hours,
            1 if payload.is_critical else 0,
        ))

        cursor.execute("SELECT * FROM appliances WHERE id = ?", (app_id,))
        return dict(cursor.fetchone())
