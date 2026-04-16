from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime


# ============================================================
# PROPERTY SCHEMAS
# ============================================================

class PropertyCreate(BaseModel):
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    franchise_type: Optional[str] = "owner-operated"
    num_rooms: Optional[int] = None
    has_restaurant: Optional[bool] = False


class PropertyUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    postal_code: Optional[str] = None
    franchise_type: Optional[str] = None
    num_rooms: Optional[int] = None
    has_restaurant: Optional[bool] = None
    is_active: Optional[bool] = None


class PropertyResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    name: str
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    country: Optional[str]
    postal_code: Optional[str]
    franchise_type: str
    num_rooms: Optional[int]
    has_restaurant: bool
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ============================================================
# OWNER DETAILS SCHEMAS
# ============================================================

class OwnerDetailsCreate(BaseModel):
    owner_name: str
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    ownership_type: Optional[str] = None


class OwnerDetailsUpdate(BaseModel):
    owner_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    ownership_type: Optional[str] = None


class OwnerDetailsResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    owner_name: str
    phone: Optional[str]
    email: Optional[str]
    address: Optional[str]
    ownership_type: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True