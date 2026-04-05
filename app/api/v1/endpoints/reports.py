"""
Reports Routes - app/api/v1/endpoints/reports.py

GET /reports/occupancy          → property wise room occupancy
GET /reports/audit              → audit trail with filters
"""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user, require_roles
from app.core.database import get_db
from app.models.models import AuditLog, Booking, Property, Room
from app.schemas.schemas import AuditReportResponse, OccupancyReportResponse

router = APIRouter(prefix="/reports", tags=["Reports"])


# ── Occupancy Report ──────────────────────────────────────────────────────────

@router.get("/occupancy", response_model=OccupancyReportResponse)
async def get_occupancy_report(
    property_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(require_roles(["Super Admin", "Tenant Admin", "Manager"])),
):
    """
    Property wise room occupancy report.
    Optional property_id filter — if not given, returns all properties.
    """
    tenant_id = UUID(user["tenant_id"])

    # Get properties
    prop_q = select(Property).where(
        Property.tenant_id == tenant_id,
        Property.deleted_at == None,
        Property.is_active == True,
    )
    if property_id:
        prop_q = prop_q.where(Property.id == property_id)

    prop_result = await db.execute(prop_q)
    properties = prop_result.scalars().all()

    reports = []
    for prop in properties:
        # Total rooms
        total_q = select(func.count(Room.id)).where(
            Room.property_id == prop.id,
            Room.tenant_id == tenant_id,
            Room.deleted_at == None,
        )
        total_rooms = (await db.execute(total_q)).scalar() or 0

        # Occupied rooms
        occupied_q = select(func.count(Room.id)).where(
            Room.property_id == prop.id,
            Room.tenant_id == tenant_id,
            Room.deleted_at == None,
            Room.status == "occupied",
        )
        occupied_rooms = (await db.execute(occupied_q)).scalar() or 0

        # Maintenance rooms
        maintenance_q = select(func.count(Room.id)).where(
            Room.property_id == prop.id,
            Room.tenant_id == tenant_id,
            Room.deleted_at == None,
            Room.status == "maintenance",
        )
        maintenance_rooms = (await db.execute(maintenance_q)).scalar() or 0

        available_rooms = total_rooms - occupied_rooms - maintenance_rooms
        occupancy_pct = round(
            (occupied_rooms / total_rooms * 100) if total_rooms > 0 else 0.0, 2
        )

        reports.append({
            "property_id": prop.id,
            "property_name": prop.name,
            "total_rooms": total_rooms,
            "occupied_rooms": occupied_rooms,
            "available_rooms": available_rooms,
            "maintenance_rooms": maintenance_rooms,
            "occupancy_percentage": occupancy_pct,
        })

    return {
        "period": "current",
        "reports": reports,
    }


# ── Audit Report ──────────────────────────────────────────────────────────────

@router.get("/audit", response_model=AuditReportResponse)
async def get_audit_report(
    resource_type: Optional[str] = None,
    action: Optional[str] = None,
    severity: Optional[str] = None,
    user_id: Optional[UUID] = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, le=200),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_roles(["Super Admin", "Tenant Admin"])),
):
    """
    Audit trail report with optional filters.
    Only Super Admin and Tenant Admin can access.
    """
    tenant_id = UUID(current_user["tenant_id"])

    # Base query
    base_q = select(AuditLog).where(
        AuditLog.tenant_id == tenant_id,
    )

    # Optional filters
    if resource_type:
        base_q = base_q.where(AuditLog.resource_type == resource_type)
    if action:
        base_q = base_q.where(AuditLog.action == action)
    if severity:
        base_q = base_q.where(AuditLog.severity == severity)
    if user_id:
        base_q = base_q.where(AuditLog.user_id == user_id)

    # Total count
    count_q = select(func.count()).select_from(base_q.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    # Paginated results — latest first
    offset = (page - 1) * limit
    logs_q = base_q.order_by(AuditLog.created_at.desc()).offset(offset).limit(limit)
    logs_result = await db.execute(logs_q)
    logs = logs_result.scalars().all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "logs": logs,
    }