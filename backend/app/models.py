import uuid
from sqlalchemy import Column, String, Boolean, Text, DateTime, Index, Integer, Float, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
from datetime import datetime
import enum
from .database import Base


# ============================================================
# USER MODEL
# ============================================================

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    
    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    phone_number = Column(String(20), nullable=True)
    role_id = Column(UUID(as_uuid=True), nullable=True)
    property_id = Column(UUID(as_uuid=True), nullable=True)
    department_id = Column(UUID(as_uuid=True), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    
    __table_args__ = (
        Index("idx_users_tenant_id", "tenant_id"),
        Index("idx_users_property_id", "property_id"),
    )


# ============================================================
# PROPERTY MODEL
# ============================================================

class Property(Base):
    __tablename__ = "properties"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id = Column(UUID(as_uuid=True), nullable=False)

    name = Column(String(255), nullable=False)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)

    franchise_type = Column(
        String(50),
        nullable=False,
        default="owner-operated"
        # Values: franchise / non-franchise / owner-operated
    )

    num_rooms = Column(Integer, nullable=True)
    has_restaurant = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)  # soft delete

    # Relationships
    owner_details = relationship(
        "OwnerDetails",
        back_populates="property",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("idx_properties_tenant_id", "tenant_id"),
    )


# ============================================================
# OWNER DETAILS MODEL
# ============================================================

class OwnerDetails(Base):
    __tablename__ = "owner_details"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id = Column(UUID(as_uuid=True), nullable=False)

    property_id = Column(
        UUID(as_uuid=True),
        ForeignKey("properties.id", ondelete="CASCADE"),
        nullable=False
    )

    owner_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    email = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)

    ownership_type = Column(
        String(50),
        nullable=True
        # Values: sole-owner / partnership / company
    )

    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, nullable=True)

    # Relationships
    property = relationship("Property", back_populates="owner_details")

    __table_args__ = (
        Index("idx_owner_details_tenant_id", "tenant_id"),
        Index("idx_owner_details_property_id", "property_id"),
    )


# ============================================================
# AUDIT LOG MODEL
# ============================================================

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    property_id = Column(UUID(as_uuid=True), nullable=True)
    user_id = Column(UUID(as_uuid=True), nullable=True)

    user_email = Column(String(255))

    action = Column(String(50), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String, nullable=True)

    old_values = Column(JSONB, nullable=True)
    new_values = Column(JSONB, nullable=True)

    ip_address = Column(INET, nullable=True)
    user_agent = Column(Text, nullable=True)

    severity = Column(String(20), default="low")
    is_system_action = Column(Boolean, default=False)

    created_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_audit_user", "user_id"),
        Index("idx_audit_tenant", "tenant_id"),
    )


# ============================================================
# DEPARTMENT MODEL
# ============================================================

class Department(Base):
    __tablename__ = "departments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    property_id = Column(UUID(as_uuid=True), nullable=False)
    
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)
    deleted_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_departments_tenant", "tenant_id"),
        Index("idx_departments_property", "property_id"),
    )


# ============================================================
# EMPLOYEE MODEL
# ============================================================

class Employee(Base):
    __tablename__ = "employees"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    property_id = Column(UUID(as_uuid=True), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    position = Column(String(100), nullable=True)
    hire_date = Column(DateTime, nullable=True)
    salary = Column(Float, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)
    deleted_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_employees_tenant", "tenant_id"),
        Index("idx_employees_property", "property_id"),
        Index("idx_employees_department", "department_id"),
    )


# ============================================================
# VENDOR MODEL
# ============================================================

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    property_id = Column(UUID(as_uuid=True), nullable=False)
    
    name = Column(String(255), nullable=False)
    contact_person = Column(String(100), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    service_type = Column(String(100), nullable=True)
    contract_start = Column(DateTime, nullable=True)
    contract_end = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)
    deleted_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_vendors_tenant", "tenant_id"),
        Index("idx_vendors_property", "property_id"),
    )


# ============================================================
# INVENTORY MODEL
# ============================================================

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    property_id = Column(UUID(as_uuid=True), nullable=False)
    
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    quantity = Column(Integer, default=0, nullable=False)
    unit = Column(String(50), nullable=True)
    min_quantity = Column(Integer, default=0, nullable=False)
    max_quantity = Column(Integer, nullable=True)
    unit_price = Column(Float, nullable=True)
    supplier = Column(String(255), nullable=True)
    location = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)
    deleted_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_inventory_tenant", "tenant_id"),
        Index("idx_inventory_property", "property_id"),
    )


# ============================================================
# SOP CATEGORY MODEL
# ============================================================

class SOPCategory(Base):
    __tablename__ = "sop_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    property_id = Column(UUID(as_uuid=True), nullable=False)
    
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)
    deleted_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_sop_categories_tenant", "tenant_id"),
        Index("idx_sop_categories_property", "property_id"),
    )


# ============================================================
# SOP ITEM MODEL
# ============================================================

class SOPItem(Base):
    __tablename__ = "sop_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    property_id = Column(UUID(as_uuid=True), nullable=False)
    category_id = Column(UUID(as_uuid=True), ForeignKey("sop_categories.id"), nullable=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    steps = Column(JSONB, nullable=True)
    priority = Column(String(20), default="medium")
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    assigned_to = Column(UUID(as_uuid=True), nullable=True)
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)
    deleted_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_sop_items_tenant", "tenant_id"),
        Index("idx_sop_items_property", "property_id"),
        Index("idx_sop_items_category", "category_id"),
    )


# ============================================================
# ROOM MODEL
# ============================================================

class Room(Base):
    __tablename__ = "rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    property_id = Column(UUID(as_uuid=True), nullable=False)
    
    room_number = Column(String(20), nullable=False)
    floor = Column(Integer, nullable=True)
    room_type = Column(String(50), nullable=True)
    capacity = Column(Integer, default=2, nullable=False)
    price_per_night = Column(Float, nullable=True)
    status = Column(String(20), default="available")
    amenities = Column(JSONB, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)
    deleted_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_rooms_tenant", "tenant_id"),
        Index("idx_rooms_property", "property_id"),
        Index("idx_rooms_status", "status"),
    )


# ============================================================
# BOOKING MODEL
# ============================================================

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    property_id = Column(UUID(as_uuid=True), nullable=False)
    room_id = Column(UUID(as_uuid=True), ForeignKey("rooms.id"), nullable=False)
    
    guest_name = Column(String(255), nullable=False)
    guest_email = Column(String(255), nullable=True)
    guest_phone = Column(String(20), nullable=True)
    check_in = Column(DateTime, nullable=False)
    check_out = Column(DateTime, nullable=False)
    num_guests = Column(Integer, default=1, nullable=False)
    total_amount = Column(Float, nullable=True)
    status = Column(String(20), default="confirmed")
    special_requests = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)
    deleted_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_bookings_tenant", "tenant_id"),
        Index("idx_bookings_property", "property_id"),
        Index("idx_bookings_room", "room_id"),
        Index("idx_bookings_check_in", "check_in"),
    )


# ============================================================
# TASK MODEL
# ============================================================

class Task(Base):
    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    property_id = Column(UUID(as_uuid=True), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    assigned_to = Column(UUID(as_uuid=True), nullable=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    priority = Column(String(20), default="medium")
    status = Column(String(20), default="pending")
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_by = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)
    deleted_at = Column(DateTime, nullable=True)

    __table_args__ = (
        Index("idx_tasks_tenant", "tenant_id"),
        Index("idx_tasks_property", "property_id"),
        Index("idx_tasks_assigned", "assigned_to"),
        Index("idx_tasks_status", "status"),
    )


# ============================================================
# ATTENDANCE MODEL
# ============================================================

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), nullable=False)
    property_id = Column(UUID(as_uuid=True), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    
    date = Column(DateTime, nullable=False)
    check_in = Column(DateTime, nullable=True)
    check_out = Column(DateTime, nullable=True)
    status = Column(String(20), default="present")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)

    __table_args__ = (
        Index("idx_attendance_tenant", "tenant_id"),
        Index("idx_attendance_property", "property_id"),
        Index("idx_attendance_employee", "employee_id"),
        Index("idx_attendance_date", "date"),
    )