"""
All Pydantic schemas - app/schemas/schemas.py
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


# ===========================================================
# AUTH / USER
# ===========================================================

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: str = "Staff"
    tenant_id: UUID

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if not any(c.isupper() for c in v):
            raise ValueError("Password must have at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must have at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must have at least one digit")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    email: EmailStr
    otp: str
    new_password: str = Field(..., min_length=8)


# ===========================================================
# PROPERTY
# ===========================================================

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
    franchise_type: Optional[str]
    num_rooms: Optional[int]
    has_restaurant: Optional[bool]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ===========================================================
# OWNER DETAILS
# ===========================================================

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
    created_at: datetime

    class Config:
        from_attributes = True


# ===========================================================
# DEPARTMENT
# ===========================================================

class DepartmentCreate(BaseModel):
    name: str
    description: Optional[str] = None


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class DepartmentResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    name: str
    description: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ===========================================================
# EMPLOYEE
# ===========================================================

class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    employee_code: Optional[str] = None
    role_id: UUID
    department_id: Optional[UUID] = None
    position: Optional[str] = None
    start_date: Optional[datetime] = None


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    department_id: Optional[UUID] = None
    position: Optional[str] = None
    is_active: Optional[bool] = None
    end_date: Optional[datetime] = None


class EmployeeResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    first_name: str
    last_name: str
    email: Optional[str]
    phone: Optional[str]
    employee_code: Optional[str]
    position: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ===========================================================
# VENDOR
# ===========================================================

class VendorCreate(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None


class VendorUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None


class VendorResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    name: str
    contact_person: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    address: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ===========================================================
# INVENTORY
# ===========================================================

class InventoryCreate(BaseModel):
    item_name: str
    quantity: int = 0
    unit: Optional[str] = None
    reorder_level: Optional[int] = None
    department_id: Optional[UUID] = None


class InventoryUpdate(BaseModel):
    item_name: Optional[str] = None
    unit: Optional[str] = None
    reorder_level: Optional[int] = None
    department_id: Optional[UUID] = None


class InventoryResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    item_name: str
    quantity: int
    unit: Optional[str]
    reorder_level: Optional[int]
    department_id: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True


class StockAdjustRequest(BaseModel):
    quantity: int = Field(..., gt=0)
    notes: Optional[str] = None
    vendor_id: Optional[UUID] = None
    department_id: Optional[UUID] = None


class AdjustStockRequest(BaseModel):
    new_quantity: int = Field(..., ge=0)
    notes: Optional[str] = None


# ===========================================================
# SOP
# ===========================================================

class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class StatusEnum(str, Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"


class SOPCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None


class SOPCategoryResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    name: str
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class SOPCreate(BaseModel):
    category_id: UUID
    title: str
    description: Optional[str] = None
    assigned_employee_id: Optional[UUID] = None
    department_id: Optional[UUID] = None
    priority: PriorityEnum = PriorityEnum.medium
    status: StatusEnum = StatusEnum.pending
    due_date: Optional[datetime] = None


class SOPUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_employee_id: Optional[UUID] = None
    department_id: Optional[UUID] = None
    priority: Optional[PriorityEnum] = None
    status: Optional[StatusEnum] = None
    due_date: Optional[datetime] = None


class SOPResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    category_id: UUID
    title: str
    description: Optional[str]
    priority: str
    status: str
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SOPVersionCreate(BaseModel):
    content: str
    version_number: int


class SOPVersionResponse(BaseModel):
    id: UUID
    sop_item_id: UUID
    version_number: int
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


# ===========================================================
# GOVERNANCE
# ===========================================================

class WorkflowCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None


class WorkflowResponse(BaseModel):
    id: UUID
    name: str
    code: str
    description: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class WorkflowInstanceCreate(BaseModel):
    workflow_id: UUID
    request_type: str
    request_id: UUID
    description: Optional[str] = None


class WorkflowInstanceResponse(BaseModel):
    id: UUID
    workflow_id: UUID
    request_type: str
    status: str
    current_step: int
    rejection_reason: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class WorkflowRejectRequest(BaseModel):
    reason: str = Field(..., min_length=1)
