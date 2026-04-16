from fastapi import Depends, HTTPException, status
from .dependencies import get_current_user

def require_roles(allowed_roles: list):
    def role_checker(user=Depends(get_current_user)):
        if user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access forbidden: insufficient permissions"
            )
        return user
    return role_checker