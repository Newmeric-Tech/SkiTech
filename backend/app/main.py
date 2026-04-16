from fastapi import FastAPI, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from .database import engine, Base, SessionLocal
from .auth import register_user, login_user
from .dependencies import get_current_user
from .rbac import require_roles
from .jwt_handler import decode_refresh_token, create_access_token, decode_access_token
from .permission_checker import require_permission
from .audit_middleware import AuditMiddleware
from .tenant_middleware import TenantIsolationMiddleware
from .audit_service import log_action
from .otp_service import send_otp, verify_otp
from .security import hash_password
from .models import User
from .property_routes import router as property_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SkiTech API", version="1.0.0")

# ============================================================
# REGISTER MIDDLEWARE
# ============================================================
app.add_middleware(AuditMiddleware)
app.add_middleware(TenantIsolationMiddleware)

# ============================================================
# REGISTER ROUTERS
# ============================================================
app.include_router(property_router, tags=["Property & Owner"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ============================================================
# AUTH ROUTES
# ============================================================

@app.post("/register", tags=["Auth"])
def register(email: str, password: str, role: str, tenant_id: str, db: Session = Depends(get_db)):
    user = register_user(db, email, password, role, tenant_id)
    send_otp(email, purpose="verification")
    return {
        "message": "Registration successful. Please check your email for the OTP to verify your account.",
        "email": email
    }


@app.post("/verify-otp", tags=["Auth"])
def verify_otp_route(email: str, otp: str, db: Session = Depends(get_db)):
    if not verify_otp(email, otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    log_action(
        db=db,
        tenant_id=str(user.tenant_id),
        user_id=str(user.id),
        user_email=email,
        action="VERIFY_EMAIL",
        resource_type="user",
        severity="medium",
    )

    return {"message": "Email verified successfully. You can now login."}


@app.post("/login", tags=["Auth"])
def login(email: str, password: str, request: Request, db: Session = Depends(get_db)):
    tokens = login_user(db, email, password)

    if not tokens:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    payload = decode_access_token(tokens["access_token"])

    log_action(
        db=db,
        tenant_id=payload["tenant_id"],
        user_id=payload["user_id"],
        user_email=email,
        action="LOGIN",
        resource_type="user",
        severity="medium",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    return tokens


@app.post("/refresh", tags=["Auth"])
def refresh_token(refresh_token: str):
    payload = decode_refresh_token(refresh_token)
    new_access_token = create_access_token({
        "user_id": payload["user_id"],
        "tenant_id": payload["tenant_id"],
        "role": payload["role"]
    })
    return {"access_token": new_access_token}


@app.post("/forgot-password", tags=["Auth"])
def forgot_password(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"message": "If this email exists, an OTP has been sent."}
    send_otp(email, purpose="password_reset")
    return {"message": "If this email exists, an OTP has been sent."}


@app.post("/reset-password", tags=["Auth"])
def reset_password(email: str, otp: str, new_password: str, db: Session = Depends(get_db)):
    if not verify_otp(email, otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password = hash_password(new_password)
    db.commit()

    log_action(
        db=db,
        tenant_id=str(user.tenant_id),
        user_id=str(user.id),
        user_email=email,
        action="PASSWORD_RESET",
        resource_type="user",
        severity="high",
    )

    return {"message": "Password reset successfully. You can now login with your new password."}


# ============================================================
# PROTECTED ROUTES
# ============================================================

@app.get("/dashboard", tags=["Protected"])
def dashboard(user=Depends(require_permission("view_dashboard"))):
    return {"message": "Dashboard access granted"}


@app.get("/admin", tags=["Protected"])
def admin_dashboard(user=Depends(require_roles(["Super Admin"]))):
    return {"message": "Welcome Super Admin"}


@app.get("/tenant", tags=["Protected"])
def tenant_dashboard(user=Depends(require_roles(["Tenant Admin"]))):
    return {"message": "Welcome Tenant Admin"}


@app.get("/manager", tags=["Protected"])
def manager_dashboard(user=Depends(require_roles(["Manager"]))):
    return {"message": "Welcome Manager"}


@app.get("/staff", tags=["Protected"])
def get_staff(user=Depends(require_permission("manage_staff"))):
    return {"message": "Staff management access granted"}