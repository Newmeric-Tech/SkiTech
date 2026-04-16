from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from app.database import SessionLocal
from app.audit_service import log_action


# Routes that should be automatically audited
# Format: (METHOD, path_prefix) -> (action, resource_type, severity)
AUDITED_ROUTES = {
    ("POST", "/register"):          ("CREATE",  "user",      "low"),
    ("POST", "/properties"):        ("CREATE",  "property",  "medium"),
    ("PUT",  "/properties"):        ("UPDATE",  "property",  "medium"),
    ("DELETE", "/properties"):      ("DELETE",  "property",  "high"),
    ("POST", "/employees"):         ("CREATE",  "employee",  "low"),
    ("PUT",  "/employees"):         ("UPDATE",  "employee",  "low"),
    ("DELETE", "/employees"):       ("DELETE",  "employee",  "medium"),
    ("POST", "/sop/category"):      ("CREATE",  "sop",       "low"),
    ("PUT",  "/sop/category"):      ("UPDATE",  "sop",       "low"),
    ("DELETE", "/sop/category"):    ("DELETE",  "sop",       "medium"),
    ("POST", "/sop/items"):         ("CREATE",  "sop_item",  "low"),
    ("PUT",  "/sop/items"):         ("UPDATE",  "sop_item",  "low"),
    ("DELETE", "/sop/items"):       ("DELETE",  "sop_item",  "medium"),
    ("POST", "/inventory/items"):   ("CREATE",  "inventory", "low"),
    ("PUT",  "/inventory/items"):   ("UPDATE",  "inventory", "low"),
    ("DELETE", "/inventory/items"): ("DELETE",  "inventory", "medium"),
}


class AuditMiddleware(BaseHTTPMiddleware):
    """
    Middleware that automatically logs important API actions.

    How it works:
    1. Every request passes through this middleware
    2. The actual route handler runs first via call_next()
    3. If the response is successful (2xx) and the route is
       in AUDITED_ROUTES, we save an audit log
    4. User info is read from request.state (set by get_current_user)
    5. If audit logging fails, it never affects the API response
    """

    async def dispatch(self, request: Request, call_next):

        # Let the actual request process first
        response = await call_next(request)

        # Only log successful responses (2xx status codes)
        if not (200 <= response.status_code < 300):
            return response

        # Check if this route should be audited
        matched_action = None
        matched_resource = None
        matched_severity = None

        for (method, path), (action, resource, severity) in AUDITED_ROUTES.items():
            if request.method == method and request.url.path.startswith(path):
                matched_action = action
                matched_resource = resource
                matched_severity = severity
                break

        if not matched_action:
            return response

        # Get user info from request.state
        # This is set by get_current_user in dependencies.py
        user_id = getattr(request.state, "user_id", None)
        tenant_id = getattr(request.state, "tenant_id", None)
        user_email = getattr(request.state, "user_email", "")

        # Skip audit if user info is not available
        if not user_id or not tenant_id:
            return response

        # Get request metadata
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")

        # Save audit log
        db = SessionLocal()
        try:
            log_action(
                db=db,
                tenant_id=tenant_id,
                user_id=user_id,
                user_email=user_email,
                action=matched_action,
                resource_type=matched_resource,
                severity=matched_severity,
                ip_address=ip_address,
                user_agent=user_agent,
            )
        finally:
            db.close()

        return response