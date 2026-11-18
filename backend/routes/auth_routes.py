import uuid
from fastapi import APIRouter, HTTPException, Depends, status
from backend.models.schemas import UserRegisterRequest, UserLoginRequest, AuthTokenResponse
from backend.auth.security import hash_password, verify_password, create_access_token
from backend.auth.dependencies import get_current_user
from backend.database.db import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthTokenResponse, summary="Register User or Family")
def register(payload: UserRegisterRequest):
    with get_db() as conn:
        cursor = conn.cursor()

        # Check existing email
        cursor.execute("SELECT id FROM users WHERE email = ?", (payload.email.lower().strip(),))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="An account with this email already exists.")

        user_id = f"usr_{uuid.uuid4().hex[:10]}"

        # Option A: Joining via family invite code
        if payload.invite_code:
            cursor.execute("SELECT id, name FROM families WHERE invite_code = ?", (payload.invite_code.strip(),))
            fam_row = cursor.fetchone()
            if not fam_row:
                raise HTTPException(status_code=400, detail="Invalid family invitation code.")
            family_id = fam_row[0]
            family_name = fam_row[1]
            role = "family_member"
        else:
            # Option B: Creating a brand new household / family
            family_id = f"fam_{uuid.uuid4().hex[:10]}"
            family_name = payload.family_name or f"{payload.full_name}'s Family Estate"
            invite_code = f"FAM-{uuid.uuid4().hex[:6].upper()}"
            cursor.execute("""
                INSERT INTO families (id, name, invite_code)
                VALUES (?, ?, ?)
            """, (family_id, family_name, invite_code))
            role = "family_admin"

            # Auto-create default primary property
            prop_id = f"prop_{uuid.uuid4().hex[:10]}"
            cursor.execute("""
                INSERT INTO properties (id, family_id, name, property_type, address, tariff_inr, square_feet)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (prop_id, family_id, f"{family_name} Primary Residence", "Residential House", "Family Headquarter", 8.5, 2800))

        # Insert user
        cursor.execute("""
            INSERT INTO users (id, email, password_hash, full_name, family_id, role, is_active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        """, (
            user_id,
            payload.email.lower().strip(),
            hash_password(payload.password),
            payload.full_name.strip(),
            family_id,
            role,
        ))

        token = create_access_token({"sub": user_id, "family_id": family_id, "role": role})

        return AuthTokenResponse(
            access_token=token,
            user={
                "id": user_id,
                "email": payload.email.lower().strip(),
                "full_name": payload.full_name.strip(),
                "family_id": family_id,
                "family_name": family_name,
                "role": role,
            },
        )


@router.post("/login", response_model=AuthTokenResponse, summary="Login Family Member")
def login(payload: UserLoginRequest):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.id, u.email, u.password_hash, u.full_name, u.role, u.family_id, u.is_active, f.name as family_name, f.invite_code
            FROM users u
            JOIN families f ON u.family_id = f.id
            WHERE u.email = ?
        """, (payload.email.lower().strip(),))
        row = cursor.fetchone()

        if not row or not verify_password(payload.password, row["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password.")

        if not row["is_active"]:
            raise HTTPException(status_code=403, detail="Your account has been deactivated by the household administrator.")

        user_dict = dict(row)
        del user_dict["password_hash"]

        token = create_access_token({"sub": user_dict["id"], "family_id": user_dict["family_id"], "role": user_dict["role"]})

        return AuthTokenResponse(
            access_token=token,
            user=user_dict,
        )


@router.get("/me", summary="Get Current Authenticated User")
def get_me(user: dict = Depends(get_current_user)):
    return user


@router.post("/logout", summary="Logout Session")
def logout(user: dict = Depends(get_current_user)):
    return {"status": "ok", "message": "Successfully logged out."}
