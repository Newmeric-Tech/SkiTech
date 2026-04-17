from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
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
from .models import User, Property, Employee, Task, Room, Booking, Attendance, AuditLog, Inventory, SOPItem
from .property_routes import router as property_router
from .module_routes import router as module_router
import os
from datetime import datetime, timedelta
from uuid import UUID

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SkiTech API", version="1.0.0")

CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
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
api_router.include_router(module_router)


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
        "role": db_user.role,
        "role_id": str(db_user.role_id) if db_user.role_id else None,
        "tenant_id": str(db_user.tenant_id),
        "property_id": str(db_user.property_id) if db_user.property_id else None,
        "is_active": db_user.is_active,
        "is_verified": db_user.is_verified,
        "last_login": str(db_user.last_login) if db_user.last_login else None,
        "created_at": str(db_user.created_at),
    }


@api_router.get("/stats/owner")
def get_owner_stats(user=Depends(require_roles(["Tenant Admin", "Super Admin"])), db: Session = Depends(get_db)):
    tenant_id = user["tenant_id"]
    
    total_properties = db.query(Property).filter(
        Property.tenant_id == tenant_id,
        Property.deleted_at == None,
        Property.is_active == True
    ).count()
    
    total_staff = db.query(Employee).filter(
        Employee.tenant_id == tenant_id,
        Employee.deleted_at == None,
        Employee.is_active == True
    ).count()
    
    today = datetime.utcnow().date()
    daily_bookings = db.query(Booking).filter(
        Booking.tenant_id == tenant_id,
        func.date(Booking.check_in) == today,
        Booking.deleted_at == None
    ).all()
    daily_revenue = sum(b.total_amount or 0 for b in daily_bookings)
    
    pending_tasks = db.query(Task).filter(
        Task.tenant_id == tenant_id,
        Task.status == "pending",
        Task.deleted_at == None
    ).count()
    
    overdue_tasks = db.query(Task).filter(
        Task.tenant_id == tenant_id,
        Task.status == "pending",
        Task.due_date < datetime.utcnow(),
        Task.deleted_at == None
    ).count()
    
    revenue_trend = []
    for i in range(7):
        date = today - timedelta(days=6-i)
        day_bookings = db.query(Booking).filter(
            Booking.tenant_id == tenant_id,
            func.date(Booking.check_in) == date,
            Booking.deleted_at == None
        ).all()
        revenue = sum(b.total_amount or 0 for b in day_bookings)
        revenue_trend.append({"day": date.strftime("%Y-%m-%d"), "revenue": revenue})
    
    recent_alerts = []
    low_inventory = db.query(Inventory).filter(
        Inventory.tenant_id == tenant_id,
        Inventory.quantity <= Inventory.min_quantity,
        Inventory.deleted_at == None
    ).limit(5).all()
    for item in low_inventory:
        recent_alerts.append({
            "type": "inventory",
            "title": f"Low stock: {item.name}",
            "property_name": "All Properties",
            "time_ago": "Just now",
            "severity": "high"
        })
    
    return {
        "total_properties": total_properties,
        "total_staff": total_staff,
        "daily_revenue": daily_revenue,
        "pending_tasks": pending_tasks,
        "overdue_tasks": overdue_tasks,
        "revenue_trend": revenue_trend,
        "recent_alerts": recent_alerts
    }


@api_router.get("/stats/manager/{property_id}")
def get_manager_stats(property_id: UUID, user=Depends(require_roles(["Manager"])), db: Session = Depends(get_db)):
    tenant_id = user["tenant_id"]
    
    property_obj = db.query(Property).filter(
        Property.id == property_id,
        Property.tenant_id == tenant_id,
        Property.deleted_at == None
    ).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    
    today = datetime.utcnow().date()
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    staff_total = db.query(Employee).filter(
        Employee.tenant_id == tenant_id,
        Employee.property_id == property_id,
        Employee.is_active == True,
        Employee.deleted_at == None
    ).count()
    
    staff_present = db.query(Attendance).filter(
        Attendance.tenant_id == tenant_id,
        Attendance.property_id == property_id,
        Attendance.date == today_start,
        Attendance.status == "present"
    ).count()
    
    tasks_pending = db.query(Task).filter(
        Task.tenant_id == tenant_id,
        Task.property_id == property_id,
        Task.status == "pending",
        Task.deleted_at == None
    ).count()
    
    tasks_overdue = db.query(Task).filter(
        Task.tenant_id == tenant_id,
        Task.property_id == property_id,
        Task.status == "pending",
        Task.due_date < datetime.utcnow(),
        Task.deleted_at == None
    ).count()
    
    todays_bookings = db.query(Booking).filter(
        Booking.tenant_id == tenant_id,
        Booking.property_id == property_id,
        func.date(Booking.check_in) == today,
        Booking.deleted_at == None
    ).all()
    daily_revenue = sum(b.total_amount or 0 for b in todays_bookings)
    checkins_today = len(todays_bookings)
    
    todays_tasks = db.query(Task).filter(
        Task.tenant_id == tenant_id,
        Task.property_id == property_id,
        Task.due_date >= today_start,
        Task.deleted_at == None
    ).limit(10).all()
    todays_tasks_data = [{
        "id": str(t.id),
        "task": t.title,
        "assignee": str(t.assigned_to) if t.assigned_to else "Unassigned",
        "due": str(t.due_date) if t.due_date else "",
        "status": t.status
    } for t in todays_tasks]
    
    staff_attendance = db.query(Attendance, Employee).join(
        Employee, Attendance.employee_id == Employee.id
    ).filter(
        Attendance.tenant_id == tenant_id,
        Attendance.property_id == property_id,
        Attendance.date == today_start
    ).all()
    staff_attendance_data = [{
        "name": f"{a.Employee.first_name} {a.Employee.last_name}" if a.Employee else "Unknown",
        "dept": str(a.Employee.department_id) if a.Employee and a.Employee.department_id else "General",
        "check_in": str(a.Attendance.check_in) if a.Attendance.check_in else None,
        "status": a.Attendance.status,
        "initials": (a.Employee.first_name[0] + a.Employee.last_name[0]).upper() if a.Employee else "??"
    } for a in staff_attendance]
    
    weekly_tasks = []
    for i in range(7):
        date = today - timedelta(days=6-i)
        day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        done = db.query(Task).filter(
            Task.tenant_id == tenant_id,
            Task.property_id == property_id,
            Task.completed_at >= day_start,
            Task.completed_at <= day_end,
            Task.deleted_at == None
        ).count()
        
        total = db.query(Task).filter(
            Task.tenant_id == tenant_id,
            Task.property_id == property_id,
            Task.due_date <= day_end,
            Task.deleted_at == None
        ).count()
        
        weekly_tasks.append({"day": date.strftime("%Y-%m-%d"), "done": done, "total": total})
    
    return {
        "staff_present": staff_present,
        "staff_total": staff_total,
        "tasks_pending": tasks_pending,
        "tasks_overdue": tasks_overdue,
        "checkins_today": checkins_today,
        "daily_revenue": daily_revenue,
        "todays_tasks": todays_tasks_data,
        "staff_attendance": staff_attendance_data,
        "weekly_tasks": weekly_tasks
    }


@api_router.get("/stats/staff/me")
def get_staff_stats(user=Depends(get_current_user), db: Session = Depends(get_db)):
    tenant_id = user["tenant_id"]
    user_id = user["user_id"]
    
    today = datetime.utcnow().date()
    today_start = today.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today - timedelta(days=today.weekday())
    
    today_attendance = db.query(Attendance).filter(
        Attendance.tenant_id == tenant_id,
        Attendance.employee_id == user_id,
        Attendance.date == today_start
    ).first()
    
    shift_hours = 0.0
    if today_attendance and today_attendance.check_in:
        end_time = today_attendance.check_out if today_attendance.check_out else datetime.utcnow()
        shift_hours = round((end_time - today_attendance.check_in).total_seconds() / 3600, 1)
    
    my_tasks_today = db.query(Task).filter(
        Task.tenant_id == tenant_id,
        Task.assigned_to == user_id,
        Task.due_date >= today_start,
        Task.due_date < today_start + timedelta(days=1),
        Task.deleted_at == None
    ).count()
    
    my_tasks_overdue = db.query(Task).filter(
        Task.tenant_id == tenant_id,
        Task.assigned_to == user_id,
        Task.status == "pending",
        Task.due_date < today_start,
        Task.deleted_at == None
    ).count()
    
    completed_this_week = db.query(Task).filter(
        Task.tenant_id == tenant_id,
        Task.assigned_to == user_id,
        Task.completed_at >= week_start,
        Task.deleted_at == None
    ).count()
    
    pending_sops = db.query(SOPItem).filter(
        SOPItem.tenant_id == tenant_id,
        SOPItem.assigned_to == user_id,
        SOPItem.completed_at == None,
        SOPItem.deleted_at == None
    ).count()
    
    todays_tasks = db.query(Task).filter(
        Task.tenant_id == tenant_id,
        Task.assigned_to == user_id,
        Task.due_date >= today_start,
        Task.due_date < today_start + timedelta(days=1),
        Task.deleted_at == None
    ).limit(10).all()
    todays_tasks_data = [{
        "id": str(t.id),
        "task": t.title,
        "assignee": "Me",
        "due": str(t.due_date) if t.due_date else "",
        "status": t.status
    } for t in todays_tasks]
    
    weekly_performance = []
    for i in range(7):
        date = today - timedelta(days=6-i)
        day_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = date.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        completed = db.query(Task).filter(
            Task.tenant_id == tenant_id,
            Task.assigned_to == user_id,
            Task.completed_at >= day_start,
            Task.completed_at <= day_end,
            Task.deleted_at == None
        ).count()
        
        total = db.query(Task).filter(
            Task.tenant_id == tenant_id,
            Task.assigned_to == user_id,
            Task.due_date <= day_end,
            Task.deleted_at == None
        ).count()
        
        weekly_performance.append({"day": date.strftime("%Y-%m-%d"), "done": completed, "total": total})
    
    return {
        "shift_hours": shift_hours,
        "my_tasks_today": my_tasks_today,
        "my_tasks_overdue": my_tasks_overdue,
        "completed_this_week": completed_this_week,
        "pending_sops": pending_sops,
        "todays_tasks": todays_tasks_data,
        "weekly_performance": weekly_performance
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
        "role": u.role,
        "role_id": str(u.role_id) if u.role_id else None,
        "tenant_id": str(u.tenant_id),
        "property_id": str(u.property_id) if u.property_id else None,
        "is_active": u.is_active,
        "is_verified": u.is_verified,
        "last_login": str(u.last_login) if u.last_login else None,
        "created_at": str(u.created_at),
    } for u in users]


@api_router.get("/reports/audit")
def get_audit_log(
    user=Depends(require_roles(["Super Admin", "Tenant Admin"])),
    limit: int = 50,
    page: int = 1,
    db: Session = Depends(get_db)
):
    tenant_id = user["tenant_id"]
    skip = (page - 1) * limit
    
    total = db.query(AuditLog).filter(AuditLog.tenant_id == tenant_id).count()
    
    logs = db.query(AuditLog).filter(
        AuditLog.tenant_id == tenant_id
    ).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    
    logs_data = [{
        "id": str(log.id),
        "action": log.action,
        "actor": log.user_email,
        "actor_email": log.user_email,
        "resource": log.resource_id,
        "resource_type": log.resource_type,
        "ip": str(log.ip_address) if log.ip_address else None,
        "created_at": str(log.created_at)
    } for log in logs]
    
    return {
        "total": total,
        "page": page,
        "limit": limit,
        "logs": logs_data
    }


@api_router.get("/reports/occupancy")
def get_occupancy_report(
    property_id: UUID = None,
    user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tenant_id = user["tenant_id"]
    
    query = db.query(Room).filter(
        Room.tenant_id == tenant_id,
        Room.deleted_at == None
    )
    
    if property_id:
        query = query.filter(Room.property_id == property_id)
    
    total_rooms = query.count()
    occupied_rooms = query.filter(Room.status == "occupied").count()
    
    occupancy_rate = (occupied_rooms / total_rooms * 100) if total_rooms > 0 else 0
    
    return {
        "occupancy_rate": round(occupancy_rate, 2),
        "total_rooms": total_rooms,
        "occupied": occupied_rooms
    }


@api_router.get("/governance/workflows")
def list_workflows(user=Depends(get_current_user)):
    return []


@api_router.get("/governance/instances")
def list_workflow_instances(user=Depends(get_current_user)):
    return []


app.include_router(api_router)
