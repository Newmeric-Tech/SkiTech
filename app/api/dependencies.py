"""
FastAPI Dependencies - app/api/dependencies.py

JWT authentication + permission/role checking.
"""

import uuid
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_token, has_permission

security = HTTPBearer()


def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Decode JWT and return payload.
    Also sets user info on request.state for middleware.
    """
    payload = decode_token(credentials.credentials)

    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    # Expose on request.state so AuditMiddleware can read it
    request.state.user_id = payload.get("user_id")
    request.state.tenant_id = payload.get("tenant_id")
    request.state.user_email = payload.get("email", "")
    request.state.role = payload.get("role")

    return payload


def require_permission(permission: str):
    """Route dependency: enforce a specific permission."""
    def checker(user: dict = Depends(get_current_user)) -> dict:
        role = user.get("role", "")
        if not has_permission(role, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: '{permission}' required",
            )
        return user
    return checker


def require_roles(roles: list):
    """Route dependency: allow only specific roles."""
    def checker(user: dict = Depends(get_current_user)) -> dict:
        if user.get("role") not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: insufficient role",
            )
        return user
    return checker
