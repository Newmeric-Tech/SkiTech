from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from uuid import UUID
from datetime import datetime

from .database import SessionLocal
from .models import Property, OwnerDetails
from .dependencies import get_current_user
from .permission_checker import require_permission
from .audit_service import log_action
from .schemas import (
    PropertyCreate, PropertyUpdate, PropertyResponse,
    OwnerDetailsCreate, OwnerDetailsUpdate, OwnerDetailsResponse
)

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================
# PROPERTY CRUD ROUTES
# ============================================================

@router.post("/properties", response_model=PropertyResponse, status_code=status.HTTP_201_CREATED)
def create_property(
    obj_in: PropertyCreate,
    db: Session = Depends(get_db),
    user=Depends(require_permission("manage_property"))
):
    """
    Create a new property.
    Only Tenant Admin and Super Admin can create properties.
    Tenant ID is automatically taken from the JWT token.
    """
    tenant_id = user["tenant_id"]

    # Check for duplicate property name within same tenant
    existing = db.query(Property).filter(
        Property.tenant_id == tenant_id,
        Property.name == obj_in.name,
        Property.deleted_at == None
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="A property with this name already exists"
        )

    property_obj = Property(
        tenant_id=tenant_id,
        name=obj_in.name,
        address=obj_in.address,
        city=obj_in.city,
        state=obj_in.state,
        country=obj_in.country,
        postal_code=obj_in.postal_code,
        franchise_type=obj_in.franchise_type or "owner-operated",
        num_rooms=obj_in.num_rooms,
        has_restaurant=obj_in.has_restaurant or False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(property_obj)
    db.commit()
    db.refresh(property_obj)

    # Audit log
    log_action(
        db=db,
        tenant_id=str(tenant_id),
        user_id=str(user["user_id"]),
        user_email=user.get("email", ""),
        action="CREATE",
        resource_type="property",
        resource_id=str(property_obj.id),
        new_values={"name": property_obj.name, "franchise_type": property_obj.franchise_type},
        severity="medium",
    )

    return property_obj


@router.get("/properties", response_model=List[PropertyResponse])
def list_properties(
    db: Session = Depends(get_db),
    user=Depends(require_permission("manage_property")),
    skip: int = 0,
    limit: int = 100,
):
    """
    List all properties for the current tenant.
    Tenant ID is automatically taken from JWT — cannot see other tenant's properties.
    """
    tenant_id = user["tenant_id"]

    properties = db.query(Property).filter(
        Property.tenant_id == tenant_id,
        Property.deleted_at == None
    ).offset(skip).limit(limit).all()

    return properties


@router.get("/properties/{property_id}", response_model=PropertyResponse)
def get_property(
    property_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(require_permission("manage_property"))
):
    """
    Get a single property by ID.
    Tenant isolation enforced — cannot access another tenant's property.
    """
    tenant_id = user["tenant_id"]

    property_obj = db.query(Property).filter(
        Property.id == property_id,
        Property.tenant_id == tenant_id,
        Property.deleted_at == None
    ).first()

    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")

    return property_obj


@router.put("/properties/{property_id}", response_model=PropertyResponse)
def update_property(
    property_id: UUID,
    obj_in: PropertyUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_permission("manage_property"))
):
    """
    Update a property.
    Only fields provided will be updated (partial update).
    Tenant isolation enforced.
    """
    tenant_id = user["tenant_id"]

    property_obj = db.query(Property).filter(
        Property.id == property_id,
        Property.tenant_id == tenant_id,
        Property.deleted_at == None
    ).first()

    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")

    # Save old values for audit log
    old_values = {
        "name": property_obj.name,
        "franchise_type": property_obj.franchise_type,
        "is_active": property_obj.is_active
    }

    # Update only provided fields
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(property_obj, field, value)

    property_obj.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(property_obj)

    # Audit log
    log_action(
        db=db,
        tenant_id=str(tenant_id),
        user_id=str(user["user_id"]),
        user_email=user.get("email", ""),
        action="UPDATE",
        resource_type="property",
        resource_id=str(property_obj.id),
        old_values=old_values,
        new_values=update_data,
        severity="medium",
    )

    return property_obj


@router.delete("/properties/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_property(
    property_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(require_permission("manage_property"))
):
    """
    Soft delete a property.
    Sets deleted_at timestamp instead of actually deleting the record.
    Tenant isolation enforced.
    """
    tenant_id = user["tenant_id"]

    property_obj = db.query(Property).filter(
        Property.id == property_id,
        Property.tenant_id == tenant_id,
        Property.deleted_at == None
    ).first()

    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")

    # Soft delete
    property_obj.deleted_at = datetime.utcnow()
    property_obj.is_active = False
    db.commit()

    # Audit log
    log_action(
        db=db,
        tenant_id=str(tenant_id),
        user_id=str(user["user_id"]),
        user_email=user.get("email", ""),
        action="DELETE",
        resource_type="property",
        resource_id=str(property_id),
        severity="high",
    )

    return None


# ============================================================
# OWNER DETAILS ROUTES
# ============================================================

@router.post("/properties/{property_id}/owner", response_model=OwnerDetailsResponse, status_code=status.HTTP_201_CREATED)
def create_owner_details(
    property_id: UUID,
    obj_in: OwnerDetailsCreate,
    db: Session = Depends(get_db),
    user=Depends(require_permission("manage_owner"))
):
    """
    Create owner details for a property.
    Only Super Admin and Tenant Admin can manage owner details.
    """
    tenant_id = user["tenant_id"]

    # Verify property exists and belongs to this tenant
    property_obj = db.query(Property).filter(
        Property.id == property_id,
        Property.tenant_id == tenant_id,
        Property.deleted_at == None
    ).first()

    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")

    # Check if owner details already exist for this property
    existing = db.query(OwnerDetails).filter(
        OwnerDetails.property_id == property_id,
        OwnerDetails.tenant_id == tenant_id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Owner details already exist for this property. Use PUT to update."
        )

    owner = OwnerDetails(
        tenant_id=tenant_id,
        property_id=property_id,
        owner_name=obj_in.owner_name,
        phone=obj_in.phone,
        email=obj_in.email,
        address=obj_in.address,
        ownership_type=obj_in.ownership_type,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    db.add(owner)
    db.commit()
    db.refresh(owner)

    log_action(
        db=db,
        tenant_id=str(tenant_id),
        user_id=str(user["user_id"]),
        user_email=user.get("email", ""),
        action="CREATE",
        resource_type="owner_details",
        resource_id=str(owner.id),
        severity="medium",
    )

    return owner


@router.get("/properties/{property_id}/owner", response_model=OwnerDetailsResponse)
def get_owner_details(
    property_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(require_permission("view_owner"))
):
    """
    Get owner details for a property.
    Only Super Admin and Tenant Admin can view owner details.
    """
    tenant_id = user["tenant_id"]

    owner = db.query(OwnerDetails).filter(
        OwnerDetails.property_id == property_id,
        OwnerDetails.tenant_id == tenant_id
    ).first()

    if not owner:
        raise HTTPException(status_code=404, detail="Owner details not found")

    return owner


@router.put("/owners/{owner_id}", response_model=OwnerDetailsResponse)
def update_owner_details(
    owner_id: UUID,
    obj_in: OwnerDetailsUpdate,
    db: Session = Depends(get_db),
    user=Depends(require_permission("manage_owner"))
):
    """
    Update owner details.
    Tenant isolation enforced.
    """
    tenant_id = user["tenant_id"]

    owner = db.query(OwnerDetails).filter(
        OwnerDetails.id == owner_id,
        OwnerDetails.tenant_id == tenant_id
    ).first()

    if not owner:
        raise HTTPException(status_code=404, detail="Owner details not found")

    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(owner, field, value)

    owner.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(owner)

    log_action(
        db=db,
        tenant_id=str(tenant_id),
        user_id=str(user["user_id"]),
        user_email=user.get("email", ""),
        action="UPDATE",
        resource_type="owner_details",
        resource_id=str(owner_id),
        severity="medium",
    )

    return owner