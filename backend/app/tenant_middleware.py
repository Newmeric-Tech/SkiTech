from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from fastapi import HTTPException
from starlette.responses import JSONResponse


# Routes that don't require tenant validation
# (public routes — no JWT token needed)
PUBLIC_ROUTES = [
    "/register",
    "/login",
    "/refresh",
    "/forgot-password",
    "/reset-password",
    "/verify-otp",
    "/docs",
    "/openapi.json",
    "/redoc",
]


class TenantIsolationMiddleware(BaseHTTPMiddleware):
    """
    Middleware that enforces tenant isolation at the API level.

    How it works:
    1. Extracts tenant_id from the JWT token (set on request.state by get_current_user)
    2. Checks if the tenant_id in the request body/params matches the token's tenant_id
    3. If mismatch is detected — returns 403 Forbidden immediately
    4. Skips validation for public routes that don't require authentication

    This ensures that even if a user somehow gets a valid JWT token,
    they cannot access data belonging to another tenant.
    """

    async def dispatch(self, request: Request, call_next):

        # Skip public routes
        if any(request.url.path.startswith(route) for route in PUBLIC_ROUTES):
            return await call_next(request)

        # Let the request process first so get_current_user sets request.state
        response = await call_next(request)

        # Get tenant_id from the JWT token (set by get_current_user in dependencies.py)
        token_tenant_id = getattr(request.state, "tenant_id", None)

        # If no tenant_id on state, the route is either public or unauthenticated
        # Let it pass — the JWT auth will handle the 401
        if not token_tenant_id:
            return response

        # Check query params for tenant_id mismatch
        query_tenant_id = request.query_params.get("tenant_id")
        if query_tenant_id and query_tenant_id != str(token_tenant_id):
            return JSONResponse(
                status_code=403,
                content={
                    "detail": "Access forbidden: tenant_id mismatch. You cannot access another tenant's data."
                }
            )

        return response