from pydantic import BaseModel, EmailStr
from typing import Optional, List
from uuid import UUID
from datetime import datetime


# ============================================================
# USER SCHEMAS
# ============================================================

class UserResponse(BaseModel):
    id: UUID
    email: str
    role: str
    tenant_id: UUID
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    role_id: Optional[UUID] = None
    property_id: Optional[UUID] = None
    department_id: Optional[UUID] = None
    is_active: bool = True
    is_verified: bool = False
    last_login: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


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


# ============================================================
# DEPARTMENT SCHEMAS
# ============================================================

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
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ============================================================
# EMPLOYEE SCHEMAS
# ============================================================

class EmployeeCreate(BaseModel):
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    hire_date: Optional[datetime] = None
    salary: Optional[float] = None
    department_id: Optional[UUID] = None


class EmployeeUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    position: Optional[str] = None
    hire_date: Optional[datetime] = None
    salary: Optional[float] = None
    department_id: Optional[UUID] = None
    is_active: Optional[bool] = None


class EmployeeResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    first_name: str
    last_name: str
    email: Optional[str]
    phone: Optional[str]
    position: Optional[str]
    department_id: Optional[UUID]
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ============================================================
# VENDOR SCHEMAS
# ============================================================

class VendorCreate(BaseModel):
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    service_type: Optional[str] = None
    contract_start: Optional[datetime] = None
    contract_end: Optional[datetime] = None


class VendorUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    service_type: Optional[str] = None
    contract_start: Optional[datetime] = None
    contract_end: Optional[datetime] = None
    is_active: Optional[bool] = None


class VendorResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    name: str
    contact_person: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    service_type: Optional[str]
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ============================================================
# INVENTORY SCHEMAS
# ============================================================

class InventoryCreate(BaseModel):
    name: str
    category: Optional[str] = None
    quantity: int = 0
    unit: Optional[str] = None
    min_quantity: int = 0
    max_quantity: Optional[int] = None
    unit_price: Optional[float] = None
    supplier: Optional[str] = None
    location: Optional[str] = None


class InventoryUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    unit: Optional[str] = None
    min_quantity: Optional[int] = None
    max_quantity: Optional[int] = None
    unit_price: Optional[float] = None
    supplier: Optional[str] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None


class InventoryResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    name: str
    category: Optional[str]
    quantity: int
    unit: Optional[str]
    min_quantity: int
    unit_price: Optional[float]
    supplier: Optional[str]
    location: Optional[str]
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ============================================================
# SOP SCHEMAS
# ============================================================

class SOPCategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None


class SOPCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class SOPCategoryResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    name: str
    description: Optional[str]
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class SOPItemCreate(BaseModel):
    title: str
    description: Optional[str] = None
    steps: Optional[List[dict]] = None
    priority: str = "medium"
    category_id: Optional[UUID] = None
    department_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    due_date: Optional[datetime] = None


class SOPItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    steps: Optional[List[dict]] = None
    priority: Optional[str] = None
    category_id: Optional[UUID] = None
    department_id: Optional[UUID] = None
    assigned_to: Optional[UUID] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    is_active: Optional[bool] = None


class SOPItemResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    title: str
    description: Optional[str]
    steps: Optional[List[dict]]
    priority: str
    category_id: Optional[UUID]
    department_id: Optional[UUID]
    assigned_to: Optional[UUID]
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ============================================================
# ROOM SCHEMAS
# ============================================================

class RoomCreate(BaseModel):
    room_number: str
    floor: Optional[int] = None
    room_type: Optional[str] = None
    capacity: int = 2
    price_per_night: Optional[float] = None
    status: str = "available"
    amenities: Optional[List[str]] = None


class RoomUpdate(BaseModel):
    room_number: Optional[str] = None
    floor: Optional[int] = None
    room_type: Optional[str] = None
    capacity: Optional[int] = None
    price_per_night: Optional[float] = None
    status: Optional[str] = None
    amenities: Optional[List[str]] = None
    is_active: Optional[bool] = None


class RoomResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    room_number: str
    floor: Optional[int]
    room_type: Optional[str]
    capacity: int
    price_per_night: Optional[float]
    status: str
    amenities: Optional[List[str]]
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ============================================================
# BOOKING SCHEMAS
# ============================================================

class BookingCreate(BaseModel):
    room_id: UUID
    guest_name: str
    guest_email: Optional[str] = None
    guest_phone: Optional[str] = None
    check_in: datetime
    check_out: datetime
    num_guests: int = 1
    total_amount: Optional[float] = None
    special_requests: Optional[str] = None


class BookingUpdate(BaseModel):
    guest_name: Optional[str] = None
    guest_email: Optional[str] = None
    guest_phone: Optional[str] = None
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    num_guests: Optional[int] = None
    total_amount: Optional[float] = None
    status: Optional[str] = None
    special_requests: Optional[str] = None


class BookingResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    room_id: UUID
    guest_name: str
    guest_email: Optional[str]
    guest_phone: Optional[str]
    check_in: datetime
    check_out: datetime
    num_guests: int
    total_amount: Optional[float]
    status: str
    special_requests: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ============================================================
# TASK SCHEMAS
# ============================================================

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    assigned_to: Optional[UUID] = None
    department_id: Optional[UUID] = None
    priority: str = "medium"
    due_date: Optional[datetime] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[UUID] = None
    department_id: Optional[UUID] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class TaskResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    title: str
    description: Optional[str]
    assigned_to: Optional[UUID]
    department_id: Optional[UUID]
    priority: str
    status: str
    due_date: Optional[datetime]
    completed_at: Optional[datetime]
    created_by: Optional[UUID]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


# ============================================================
# ATTENDANCE SCHEMAS
# ============================================================

class AttendanceCreate(BaseModel):
    employee_id: UUID
    date: datetime
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    status: str = "present"
    notes: Optional[str] = None


class AttendanceUpdate(BaseModel):
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class AttendanceResponse(BaseModel):
    id: UUID
    tenant_id: UUID
    property_id: UUID
    employee_id: UUID
    date: datetime
    check_in: Optional[datetime]
    check_out: Optional[datetime]
    status: str
    notes: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True