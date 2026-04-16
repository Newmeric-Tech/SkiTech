from fastapi import Depends, HTTPException, status
from .dependencies import get_current_user
from .permissions import ROLE_PERMISSIONS


def require_permission(permission: str):
    """
    Route dependency that checks if the current user's role
    has the required permission.

    Usage:
        @app.get("/vendors")
        def list_vendors(user=Depends(require_permission("view_vendor"))):
            ...
    """
    def permission_checker(user=Depends(get_current_user)):
        role = user.get("role")

        # Super Admin with manage_all bypasses all permission checks
        if "manage_all" in ROLE_PERMISSIONS.get(role, []):
            return user

        if permission not in ROLE_PERMISSIONS.get(role, []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: '{permission}' is required for this action"
            )

        return user

    return permission_checker


def require_any_permission(permissions: list):
    """
    Route dependency that checks if the user has ANY of the
    listed permissions. Useful for routes that multiple roles
    can access in different ways.

    Usage:
        @app.get("/sop/items")
        def list_sop(user=Depends(require_any_permission(["view_sop", "manage_all"]))):
            ...
    """
    def permission_checker(user=Depends(get_current_user)):
        role = user.get("role")
        user_permissions = ROLE_PERMISSIONS.get(role, [])

        # Super Admin bypasses all checks
        if "manage_all" in user_permissions:
            return user

        if not any(p in user_permissions for p in permissions):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: one of {permissions} is required"
            )

        return user

    return permission_checker


def require_all_permissions(permissions: list):
    """
    Route dependency that checks if the user has ALL of the
    listed permissions.

    Usage:
        @app.post("/sop/category")
        def create_sop(user=Depends(require_all_permissions(["create_sop", "manage_staff"]))):
            ...
    """
    def permission_checker(user=Depends(get_current_user)):
        role = user.get("role")
        user_permissions = ROLE_PERMISSIONS.get(role, [])

        # Super Admin bypasses all checks
        if "manage_all" in user_permissions:
            return user

        missing = [p for p in permissions if p not in user_permissions]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: missing permissions {missing}"
            )

        return user

    return permission_checker