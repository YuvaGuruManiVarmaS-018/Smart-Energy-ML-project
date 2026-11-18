from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from backend.auth.security import decode_access_token
from backend.database.db import get_db

security_bearer = HTTPBearer(auto_error=False)


def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> Dict[str, Any]:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication session.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload["sub"]
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT u.id, u.email, u.full_name, u.role, u.family_id, u.is_active, f.name as family_name, f.invite_code
            FROM users u
            JOIN families f ON u.family_id = f.id
            WHERE u.id = ?
        """, (user_id,))
        row = cursor.fetchone()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account not found.",
            )

        user_dict = dict(row)
        if not user_dict.get("is_active"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This user account has been deactivated by the household administrator.",
            )

        return user_dict


def verify_property_access(property_id: str, user: Dict[str, Any]) -> Dict[str, Any]:
    """
    Strict multi-tenant property authorization check.
    Ensures users cannot access properties belonging to other families.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM properties WHERE id = ?", (property_id,))
        prop = cursor.fetchone()

        if not prop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Property '{property_id}' not found.",
            )

        prop_dict = dict(prop)

        # 1. Family isolation check
        if prop_dict["family_id"] != user["family_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: You cannot access property records belonging to another household.",
            )

        # 2. Role-based check
        if user["role"] == "family_admin":
            return prop_dict

        # If property_manager or family_member, verify explicit property mapping
        cursor.execute("""
            SELECT * FROM property_members 
            WHERE property_id = ? AND user_id = ?
        """, (property_id, user["id"]))
        mapping = cursor.fetchone()

        if not mapping and user["role"] == "property_manager":
            # Manager without assignment to this property
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: You are not assigned to manage this property.",
            )

        return prop_dict
