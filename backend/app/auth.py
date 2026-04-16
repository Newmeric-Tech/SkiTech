from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from .models import User
from .security import hash_password, verify_password
from .jwt_handler import create_access_token, create_refresh_token


def register_user(db: Session, email: str, password: str, role: str, tenant_id: str):
    # Check if email already exists before attempting insert
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_pw = hash_password(password)
    user = User(email=email, password=hashed_pw, role=role, tenant_id=tenant_id)
    db.add(user)

    try:
        db.commit()
        db.refresh(user)
        return user
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )


def login_user(db: Session, email: str, password: str, expected_role: str | None = None):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    if not verify_password(password, user.password):
        return None

    if expected_role and user.role.lower() != expected_role.lower():
        return None

    payload = {
        "user_id": str(user.id),
        "tenant_id": str(user.tenant_id),
        "role": user.role
    }

    access_token = create_access_token(payload)
    refresh_token = create_refresh_token(payload)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token
    }