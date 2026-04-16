from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from .dependencies import get_current_user


# ============================================================
# SOP VISIBILITY RULES
# ============================================================
#
# Staff   → can only view SOPs assigned to their department
# Manager → can view all SOPs for their property
# Admin   → can view and manage all SOPs across all properties
#
# ============================================================


def get_sop_visibility_filter(user: dict) -> dict:
    """
    Returns a filter dict based on the user's role.
    This filter is applied when querying SOPs.

    Args:
        user: JWT payload containing user_id, tenant_id, role

    Returns:
        dict with filter parameters to apply to SOP queries
    """
    role = user.get("role")
    tenant_id = user.get("tenant_id")
    user_id = user.get("user_id")

    if role in ["Super Admin", "Tenant Admin"]:
        # Admin can see all SOPs across all properties
        return {
            "tenant_id": tenant_id,
            "property_id": None,      # No property filter
            "department_id": None,    # No department filter
        }

    elif role == "Manager":
        # Manager can see all SOPs for their property
        return {
            "tenant_id": tenant_id,
            "property_id": user.get("property_id"),  # Filter by property
            "department_id": None,                    # No department filter
        }

    elif role == "Staff":
        # Staff can only see SOPs assigned to their department
        return {
            "tenant_id": tenant_id,
            "property_id": user.get("property_id"),   # Filter by property
            "department_id": user.get("department_id"), # Filter by department
        }

    else:
        # Unknown role — block access
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: unknown role"
        )


def require_sop_visibility(user=Depends(get_current_user)):
    """
    FastAPI dependency that returns SOP visibility filter for current user.
    Use this on SOP list endpoints.

    Usage:
        @router.get("/sop/items")
        def list_sop_items(
            db: Session = Depends(get_db),
            visibility: dict = Depends(require_sop_visibility)
        ):
            # Use visibility filter in your query
            query = db.query(SOPItem).filter(
                SOPItem.tenant_id == visibility["tenant_id"]
            )
            if visibility["property_id"]:
                query = query.filter(SOPItem.property_id == visibility["property_id"])
            if visibility["department_id"]:
                query = query.filter(SOPItem.department_id == visibility["department_id"])
            return query.all()
    """
    return get_sop_visibility_filter(user)


# ============================================================
# ROLE SUMMARY
# ============================================================
#
# Role          | Can See
# --------------|------------------------------------------
# Super Admin   | All SOPs across all properties
# Tenant Admin  | All SOPs across all properties
# Manager       | All SOPs within their property
# Staff         | Only SOPs in their department
#
# ============================================================