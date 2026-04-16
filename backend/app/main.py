from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(AuditMiddleware)
app.add_middleware(TenantIsolationMiddleware)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "skitech-api"}


@app.get("/")
def root():
    return {"message": "SkiTech API", "version": "1.0.0", "docs": "/docs"}


from fastapi import APIRouter

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(property_router)


@api_router.post("/auth/register")
def register(email: str, password: str, role: str, tenant_id: str, db: Session = Depends(get_db)):
    user = register_user(db, email, password, role, tenant_id)
    send_otp(email, purpose="verification")
    return {
        "message": "Registration successful. Please check your email for the OTP to verify your account.",
        "email": email
    }


@api_router.post("/auth/verify-otp")
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


from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str
    expected_role: str | None = None


@api_router.post("/auth/login")
def login(request_data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    email = request_data.email
    password = request_data.password
    expected_role = request_data.expected_role
    tokens = login_user(db, email, password, expected_role)

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


@api_router.post("/auth/refresh")
def refresh_token(refresh_token: str):
    payload = decode_refresh_token(refresh_token)
    new_access_token = create_access_token({
        "user_id": payload["user_id"],
        "tenant_id": payload["tenant_id"],
        "role": payload["role"]
    })
    return {"access_token": new_access_token}


@api_router.post("/auth/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return {"message": "If this email exists, an OTP has been sent."}
    send_otp(email, purpose="password_reset")
    return {"message": "If this email exists, an OTP has been sent."}


@api_router.post("/auth/reset-password")
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


@api_router.post("/auth/logout")
def logout(user=Depends(get_current_user), db: Session = Depends(get_db)):
    return {"message": "Logged out successfully"}


@api_router.post("/auth/superadmin-login")
def superadmin_login(request_data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    tokens = login_user(db, request_data.email, request_data.password)

    if not tokens:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = db.query(User).filter(User.email == request_data.email).first()
    if user.role != "Super Admin":
        raise HTTPException(status_code=403, detail="Not authorized as Super Admin")

    log_action(
        db=db,
        tenant_id=str(user.tenant_id),
        user_id=str(user.id),
        user_email=request_data.email,
        action="LOGIN",
        resource_type="user",
        severity="medium",
        ip_address=request.client.host if request.client else None,
    )

    return tokens


@api_router.get("/users/me")
def get_current_user_info(user=Depends(get_current_user), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.id == user["user_id"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": str(db_user.id),
        "email": db_user.email,
        "first_name": db_user.first_name,
        "last_name": db_user.last_name,
        "phone_number": db_user.phone_number,
        "role_id": str(db_user.role_id) if db_user.role_id else None,
        "tenant_id": str(db_user.tenant_id),
        "property_id": str(db_user.property_id) if db_user.property_id else None,
        "is_active": db_user.is_active,
        "is_verified": db_user.is_verified,
        "last_login": str(db_user.last_login) if db_user.last_login else None,
        "created_at": str(db_user.created_at),
    }


@api_router.get("/stats/owner")
def get_owner_stats(user=Depends(require_roles(["Tenant Admin", "Super Admin"]))):
    return {
        "total_properties": 0,
        "total_staff": 0,
        "daily_revenue": 0,
        "pending_tasks": 0,
        "overdue_tasks": 0,
        "revenue_trend": [],
        "recent_alerts": []
    }


@api_router.get("/stats/manager/{property_id}")
def get_manager_stats(property_id: str, user=Depends(require_roles(["Manager"]))):
    return {
        "staff_present": 0,
        "staff_total": 0,
        "tasks_pending": 0,
        "tasks_overdue": 0,
        "checkins_today": 0,
        "daily_revenue": 0,
        "todays_tasks": [],
        "staff_attendance": [],
        "weekly_tasks": []
    }


@api_router.get("/stats/staff/me")
def get_staff_stats(user=Depends(get_current_user)):
    return {
        "shift_hours": 0,
        "my_tasks_today": 0,
        "my_tasks_overdue": 0,
        "completed_this_week": 0,
        "pending_sops": 0,
        "todays_tasks": [],
        "weekly_performance": []
    }


@api_router.get("/users/")
def list_users(user=Depends(require_roles(["Super Admin", "Tenant Admin"])), db: Session = Depends(get_db)):
    users = db.query(User).filter(User.tenant_id == user["tenant_id"]).all()
    return [{
        "id": str(u.id),
        "email": u.email,
        "first_name": u.first_name,
        "last_name": u.last_name,
        "phone_number": u.phone_number,
        "role_id": str(u.role_id) if u.role_id else None,
        "tenant_id": str(u.tenant_id),
        "property_id": str(u.property_id) if u.property_id else None,
        "is_active": u.is_active,
        "is_verified": u.is_verified,
        "last_login": str(u.last_login) if u.last_login else None,
        "created_at": str(u.created_at),
    } for u in users]


@api_router.get("/reports/audit")
def get_audit_log(user=Depends(require_roles(["Super Admin", "Tenant Admin"]))):
    return {"total": 0, "page": 1, "limit": 50, "logs": []}


@api_router.get("/reports/occupancy")
def get_occupancy_report(user=Depends(get_current_user)):
    return {"occupancy_rate": 0, "total_rooms": 0, "occupied": 0}


@api_router.get("/departments/{property_id}")
def list_departments(property_id: str, user=Depends(get_current_user)):
    return []


@api_router.get("/employees/{property_id}")
def list_employees(property_id: str, user=Depends(get_current_user)):
    return []


@api_router.get("/vendors/{property_id}")
def list_vendors(property_id: str, user=Depends(get_current_user)):
    return []


@api_router.get("/inventory/{property_id}")
def list_inventory(property_id: str, user=Depends(get_current_user)):
    return []


@api_router.get("/sop/categories/{property_id}")
def list_sop_categories(property_id: str, user=Depends(get_current_user)):
    return []


@api_router.get("/sop/items/{property_id}")
def list_sops(property_id: str, user=Depends(get_current_user)):
    return []


@api_router.get("/governance/workflows")
def list_workflows(user=Depends(get_current_user)):
    return []


@api_router.get("/governance/instances")
def list_workflow_instances(user=Depends(get_current_user)):
    return []


@api_router.get("/rooms/{property_id}")
def list_rooms(property_id: str, user=Depends(get_current_user)):
    return []


@api_router.get("/rooms/{property_id}/bookings")
def list_bookings(property_id: str, user=Depends(get_current_user)):
    return []


app.include_router(api_router)
