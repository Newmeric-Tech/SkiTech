import uuid
from sqlalchemy import Column, String, Boolean, Text, DateTime, Index, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from sqlalchemy.orm import relationship
from sqlalchemy import ForeignKey
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