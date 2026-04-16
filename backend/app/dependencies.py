from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from .jwt_handler import decode_access_token

security = HTTPBearer()


def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Decodes JWT token and returns the payload.
    Also sets user info on request.state so AuditMiddleware
    can access it without decoding the token again.
    """
    payload = decode_access_token(credentials.credentials)

    # Set on request.state for the audit middleware to use
    request.state.user_id = payload.get("user_id")
    request.state.tenant_id = payload.get("tenant_id")
    request.state.user_email = payload.get("email", "")
    request.state.role = payload.get("role")

    return payload