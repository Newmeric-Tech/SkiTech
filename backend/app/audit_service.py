from sqlalchemy.orm import Session
from app.models import AuditLog


def log_action(
    db: Session,
    tenant_id: str,
    user_id: str,
    user_email: str,
    action: str,
    resource_type: str,
    resource_id: str = None,
    old_values: dict = None,
    new_values: dict = None,
    ip_address: str = None,
    user_agent: str = None,
    severity: str = "low",
    property_id: str = None,
    is_system_action: bool = False,
):
    """
    Saves an audit log entry to the database.

    Args:
        db            : SQLAlchemy database session
        tenant_id     : UUID of the tenant performing the action
        user_id       : UUID of the user performing the action
        user_email    : Email of the user
        action        : Action performed e.g. LOGIN, CREATE, UPDATE, DELETE
        resource_type : What was acted on e.g. user, property, employee, sop
        resource_id   : UUID of the specific resource (optional)
        old_values    : Previous state of the resource (optional)
        new_values    : New state of the resource (optional)
        ip_address    : IP address of the request (optional)
        user_agent    : Browser/client info (optional)
        severity      : low | medium | high | critical (default: low)
        property_id   : UUID of property if action is property-scoped (optional)
        is_system_action : True if triggered by system not a user (default: False)
    """
    try:
        audit_log = AuditLog(
            tenant_id=tenant_id,
            user_id=user_id,
            user_email=user_email,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id else None,
            old_values=old_values,
            new_values=new_values,
            ip_address=ip_address,
            user_agent=user_agent,
            severity=severity,
            property_id=property_id,
            is_system_action=is_system_action,
        )

        db.add(audit_log)
        db.commit()

    except Exception as e:
        # Audit logging must NEVER crash the main API request
        # If it fails, rollback only the audit log insert
        db.rollback()
        print(f"[AUDIT LOG ERROR] Failed to save audit log: {e}")