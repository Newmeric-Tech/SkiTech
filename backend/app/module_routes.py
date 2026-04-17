from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime
from .database import SessionLocal
from .models import Department, Employee, Vendor, Inventory, SOPCategory, SOPItem, Room, Booking, Task, Attendance
from .dependencies import get_current_user
from .schemas import (
    DepartmentCreate, DepartmentUpdate, DepartmentResponse,
    EmployeeCreate, EmployeeUpdate, EmployeeResponse,
    VendorCreate, VendorUpdate, VendorResponse,
    InventoryCreate, InventoryUpdate, InventoryResponse,
    SOPCategoryCreate, SOPCategoryUpdate, SOPCategoryResponse,
    SOPItemCreate, SOPItemUpdate, SOPItemResponse,
    RoomCreate, RoomUpdate, RoomResponse,
    BookingCreate, BookingUpdate, BookingResponse,
    TaskCreate, TaskUpdate, TaskResponse,
    AttendanceCreate, AttendanceUpdate, AttendanceResponse
)

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def verify_property_ownership(db: Session, property_id: UUID, tenant_id: UUID):
    from .models import Property
    property_obj = db.query(Property).filter(
        Property.id == property_id,
        Property.tenant_id == tenant_id,
        Property.deleted_at == None
    ).first()
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    return property_obj


# ============================================================
# DEPARTMENT ROUTES
# ============================================================

@router.get("/departments/{property_id}", response_model=List[DepartmentResponse])
def list_departments(
    property_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    departments = db.query(Department).filter(
        Department.tenant_id == tenant_id,
        Department.property_id == property_id,
        Department.deleted_at == None
    ).all()
    return departments


@router.post("/departments/{property_id}", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
def create_department(
    property_id: UUID,
    obj_in: DepartmentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    department = Department(
        tenant_id=tenant_id,
        property_id=property_id,
        name=obj_in.name,
        description=obj_in.description,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(department)
    db.commit()
    db.refresh(department)
    return department


@router.get("/departments/{property_id}/{department_id}", response_model=DepartmentResponse)
def get_department(
    property_id: UUID,
    department_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    department = db.query(Department).filter(
        Department.id == department_id,
        Department.tenant_id == tenant_id,
        Department.property_id == property_id,
        Department.deleted_at == None
    ).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    return department


@router.put("/departments/{property_id}/{department_id}", response_model=DepartmentResponse)
def update_department(
    property_id: UUID,
    department_id: UUID,
    obj_in: DepartmentUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    department = db.query(Department).filter(
        Department.id == department_id,
        Department.tenant_id == tenant_id,
        Department.deleted_at == None
    ).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(department, field, value)
    department.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(department)
    return department


@router.delete("/departments/{property_id}/{department_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_department(
    property_id: UUID,
    department_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    department = db.query(Department).filter(
        Department.id == department_id,
        Department.tenant_id == tenant_id,
        Department.deleted_at == None
    ).first()
    if not department:
        raise HTTPException(status_code=404, detail="Department not found")
    department.deleted_at = datetime.utcnow()
    db.commit()
    return None


# ============================================================
# EMPLOYEE ROUTES
# ============================================================

@router.get("/employees/{property_id}", response_model=List[EmployeeResponse])
def list_employees(
    property_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    employees = db.query(Employee).filter(
        Employee.tenant_id == tenant_id,
        Employee.property_id == property_id,
        Employee.deleted_at == None
    ).all()
    return employees


@router.post("/employees/{property_id}", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    property_id: UUID,
    obj_in: EmployeeCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    employee = Employee(
        tenant_id=tenant_id,
        property_id=property_id,
        first_name=obj_in.first_name,
        last_name=obj_in.last_name,
        email=obj_in.email,
        phone=obj_in.phone,
        position=obj_in.position,
        hire_date=obj_in.hire_date,
        salary=obj_in.salary,
        department_id=obj_in.department_id,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


@router.get("/employees/{property_id}/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    property_id: UUID,
    employee_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    employee = db.query(Employee).filter(
        Employee.id == employee_id,
        Employee.tenant_id == tenant_id,
        Employee.property_id == property_id,
        Employee.deleted_at == None
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@router.put("/employees/{property_id}/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    property_id: UUID,
    employee_id: UUID,
    obj_in: EmployeeUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    employee = db.query(Employee).filter(
        Employee.id == employee_id,
        Employee.tenant_id == tenant_id,
        Employee.deleted_at == None
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(employee, field, value)
    employee.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(employee)
    return employee


@router.delete("/employees/{property_id}/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    property_id: UUID,
    employee_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    employee = db.query(Employee).filter(
        Employee.id == employee_id,
        Employee.tenant_id == tenant_id,
        Employee.deleted_at == None
    ).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    employee.deleted_at = datetime.utcnow()
    db.commit()
    return None


# ============================================================
# VENDOR ROUTES
# ============================================================

@router.get("/vendors/{property_id}", response_model=List[VendorResponse])
def list_vendors(
    property_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    vendors = db.query(Vendor).filter(
        Vendor.tenant_id == tenant_id,
        Vendor.property_id == property_id,
        Vendor.deleted_at == None
    ).all()
    return vendors


@router.post("/vendors/{property_id}", response_model=VendorResponse, status_code=status.HTTP_201_CREATED)
def create_vendor(
    property_id: UUID,
    obj_in: VendorCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    vendor = Vendor(
        tenant_id=tenant_id,
        property_id=property_id,
        name=obj_in.name,
        contact_person=obj_in.contact_person,
        email=obj_in.email,
        phone=obj_in.phone,
        address=obj_in.address,
        service_type=obj_in.service_type,
        contract_start=obj_in.contract_start,
        contract_end=obj_in.contract_end,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


@router.get("/vendors/{property_id}/{vendor_id}", response_model=VendorResponse)
def get_vendor(
    property_id: UUID,
    vendor_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id,
        Vendor.tenant_id == tenant_id,
        Vendor.property_id == property_id,
        Vendor.deleted_at == None
    ).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return vendor


@router.put("/vendors/{property_id}/{vendor_id}", response_model=VendorResponse)
def update_vendor(
    property_id: UUID,
    vendor_id: UUID,
    obj_in: VendorUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id,
        Vendor.tenant_id == tenant_id,
        Vendor.deleted_at == None
    ).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vendor, field, value)
    vendor.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(vendor)
    return vendor


@router.delete("/vendors/{property_id}/{vendor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vendor(
    property_id: UUID,
    vendor_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id,
        Vendor.tenant_id == tenant_id,
        Vendor.deleted_at == None
    ).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    vendor.deleted_at = datetime.utcnow()
    db.commit()
    return None


# ============================================================
# INVENTORY ROUTES
# ============================================================

@router.get("/inventory/{property_id}", response_model=List[InventoryResponse])
def list_inventory(
    property_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    items = db.query(Inventory).filter(
        Inventory.tenant_id == tenant_id,
        Inventory.property_id == property_id,
        Inventory.deleted_at == None
    ).all()
    return items


@router.post("/inventory/{property_id}", response_model=InventoryResponse, status_code=status.HTTP_201_CREATED)
def create_inventory(
    property_id: UUID,
    obj_in: InventoryCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    item = Inventory(
        tenant_id=tenant_id,
        property_id=property_id,
        name=obj_in.name,
        category=obj_in.category,
        quantity=obj_in.quantity,
        unit=obj_in.unit,
        min_quantity=obj_in.min_quantity,
        max_quantity=obj_in.max_quantity,
        unit_price=obj_in.unit_price,
        supplier=obj_in.supplier,
        location=obj_in.location,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/inventory/{property_id}/{item_id}", response_model=InventoryResponse)
def get_inventory_item(
    property_id: UUID,
    item_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    item = db.query(Inventory).filter(
        Inventory.id == item_id,
        Inventory.tenant_id == tenant_id,
        Inventory.property_id == property_id,
        Inventory.deleted_at == None
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item


@router.put("/inventory/{property_id}/{item_id}", response_model=InventoryResponse)
def update_inventory(
    property_id: UUID,
    item_id: UUID,
    obj_in: InventoryUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    item = db.query(Inventory).filter(
        Inventory.id == item_id,
        Inventory.tenant_id == tenant_id,
        Inventory.deleted_at == None
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return item


@router.delete("/inventory/{property_id}/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inventory(
    property_id: UUID,
    item_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    item = db.query(Inventory).filter(
        Inventory.id == item_id,
        Inventory.tenant_id == tenant_id,
        Inventory.deleted_at == None
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    item.deleted_at = datetime.utcnow()
    db.commit()
    return None


# ============================================================
# SOP CATEGORY ROUTES
# ============================================================

@router.get("/sop/categories/{property_id}", response_model=List[SOPCategoryResponse])
def list_sop_categories(
    property_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    categories = db.query(SOPCategory).filter(
        SOPCategory.tenant_id == tenant_id,
        SOPCategory.property_id == property_id,
        SOPCategory.deleted_at == None
    ).all()
    return categories


@router.post("/sop/categories/{property_id}", response_model=SOPCategoryResponse, status_code=status.HTTP_201_CREATED)
def create_sop_category(
    property_id: UUID,
    obj_in: SOPCategoryCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    category = SOPCategory(
        tenant_id=tenant_id,
        property_id=property_id,
        name=obj_in.name,
        description=obj_in.description,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


# ============================================================
# SOP ITEM ROUTES
# ============================================================

@router.get("/sop/items/{property_id}", response_model=List[SOPItemResponse])
def list_sops(
    property_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    sops = db.query(SOPItem).filter(
        SOPItem.tenant_id == tenant_id,
        SOPItem.property_id == property_id,
        SOPItem.deleted_at == None
    ).all()
    return sops


@router.post("/sop/items/{property_id}", response_model=SOPItemResponse, status_code=status.HTTP_201_CREATED)
def create_sop_item(
    property_id: UUID,
    obj_in: SOPItemCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    sop = SOPItem(
        tenant_id=tenant_id,
        property_id=property_id,
        title=obj_in.title,
        description=obj_in.description,
        steps=obj_in.steps,
        priority=obj_in.priority,
        category_id=obj_in.category_id,
        department_id=obj_in.department_id,
        assigned_to=obj_in.assigned_to,
        due_date=obj_in.due_date,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(sop)
    db.commit()
    db.refresh(sop)
    return sop


@router.get("/sop/items/{property_id}/{sop_id}", response_model=SOPItemResponse)
def get_sop_item(
    property_id: UUID,
    sop_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    sop = db.query(SOPItem).filter(
        SOPItem.id == sop_id,
        SOPItem.tenant_id == tenant_id,
        SOPItem.property_id == property_id,
        SOPItem.deleted_at == None
    ).first()
    if not sop:
        raise HTTPException(status_code=404, detail="SOP not found")
    return sop


@router.put("/sop/items/{property_id}/{sop_id}", response_model=SOPItemResponse)
def update_sop_item(
    property_id: UUID,
    sop_id: UUID,
    obj_in: SOPItemUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    sop = db.query(SOPItem).filter(
        SOPItem.id == sop_id,
        SOPItem.tenant_id == tenant_id,
        SOPItem.deleted_at == None
    ).first()
    if not sop:
        raise HTTPException(status_code=404, detail="SOP not found")
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(sop, field, value)
    sop.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(sop)
    return sop


@router.delete("/sop/items/{property_id}/{sop_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_sop_item(
    property_id: UUID,
    sop_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    sop = db.query(SOPItem).filter(
        SOPItem.id == sop_id,
        SOPItem.tenant_id == tenant_id,
        SOPItem.deleted_at == None
    ).first()
    if not sop:
        raise HTTPException(status_code=404, detail="SOP not found")
    sop.deleted_at = datetime.utcnow()
    db.commit()
    return None


# ============================================================
# ROOM ROUTES
# ============================================================

@router.get("/rooms/{property_id}", response_model=List[RoomResponse])
def list_rooms(
    property_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    rooms = db.query(Room).filter(
        Room.tenant_id == tenant_id,
        Room.property_id == property_id,
        Room.deleted_at == None
    ).all()
    return rooms


@router.post("/rooms/{property_id}", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(
    property_id: UUID,
    obj_in: RoomCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    room = Room(
        tenant_id=tenant_id,
        property_id=property_id,
        room_number=obj_in.room_number,
        floor=obj_in.floor,
        room_type=obj_in.room_type,
        capacity=obj_in.capacity,
        price_per_night=obj_in.price_per_night,
        status=obj_in.status,
        amenities=obj_in.amenities,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


@router.get("/rooms/{property_id}/{room_id}", response_model=RoomResponse)
def get_room(
    property_id: UUID,
    room_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    room = db.query(Room).filter(
        Room.id == room_id,
        Room.tenant_id == tenant_id,
        Room.property_id == property_id,
        Room.deleted_at == None
    ).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@router.put("/rooms/{property_id}/{room_id}", response_model=RoomResponse)
def update_room(
    property_id: UUID,
    room_id: UUID,
    obj_in: RoomUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    room = db.query(Room).filter(
        Room.id == room_id,
        Room.tenant_id == tenant_id,
        Room.deleted_at == None
    ).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(room, field, value)
    room.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(room)
    return room


@router.delete("/rooms/{property_id}/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(
    property_id: UUID,
    room_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    room = db.query(Room).filter(
        Room.id == room_id,
        Room.tenant_id == tenant_id,
        Room.deleted_at == None
    ).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    room.deleted_at = datetime.utcnow()
    db.commit()
    return None


# ============================================================
# BOOKING ROUTES
# ============================================================

@router.get("/rooms/{property_id}/bookings", response_model=List[BookingResponse])
def list_bookings(
    property_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    bookings = db.query(Booking).filter(
        Booking.tenant_id == tenant_id,
        Booking.property_id == property_id,
        Booking.deleted_at == None
    ).order_by(Booking.check_in.desc()).all()
    return bookings


@router.post("/rooms/{property_id}/bookings", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    property_id: UUID,
    obj_in: BookingCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    
    room = db.query(Room).filter(
        Room.id == obj_in.room_id,
        Room.tenant_id == tenant_id,
        Room.property_id == property_id,
        Room.deleted_at == None
    ).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    
    if room.status != "available":
        raise HTTPException(status_code=400, detail="Room is not available")
    
    booking = Booking(
        tenant_id=tenant_id,
        property_id=property_id,
        room_id=obj_in.room_id,
        guest_name=obj_in.guest_name,
        guest_email=obj_in.guest_email,
        guest_phone=obj_in.guest_phone,
        check_in=obj_in.check_in,
        check_out=obj_in.check_out,
        num_guests=obj_in.num_guests,
        total_amount=obj_in.total_amount,
        special_requests=obj_in.special_requests,
        status="confirmed",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(booking)
    
    room.status = "occupied"
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/rooms/{property_id}/bookings/{booking_id}", response_model=BookingResponse)
def get_booking(
    property_id: UUID,
    booking_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.tenant_id == tenant_id,
        Booking.property_id == property_id,
        Booking.deleted_at == None
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.put("/rooms/{property_id}/bookings/{booking_id}", response_model=BookingResponse)
def update_booking(
    property_id: UUID,
    booking_id: UUID,
    obj_in: BookingUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.tenant_id == tenant_id,
        Booking.deleted_at == None
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    update_data = obj_in.model_dump(exclude_unset=True)
    
    if "status" in update_data and update_data["status"] in ["cancelled", "completed"]:
        room = db.query(Room).filter(Room.id == booking.room_id).first()
        if room:
            room.status = "available"
    
    for field, value in update_data.items():
        setattr(booking, field, value)
    booking.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(booking)
    return booking


@router.delete("/rooms/{property_id}/bookings/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booking(
    property_id: UUID,
    booking_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.tenant_id == tenant_id,
        Booking.deleted_at == None
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if room:
        room.status = "available"
    
    booking.deleted_at = datetime.utcnow()
    db.commit()
    return None


# ============================================================
# TASK ROUTES
# ============================================================

@router.get("/tasks/{property_id}", response_model=List[TaskResponse])
def list_tasks(
    property_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    tasks = db.query(Task).filter(
        Task.tenant_id == tenant_id,
        Task.property_id == property_id,
        Task.deleted_at == None
    ).order_by(Task.due_date.asc().nullsfirst()).all()
    return tasks


@router.post("/tasks/{property_id}", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    property_id: UUID,
    obj_in: TaskCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    task = Task(
        tenant_id=tenant_id,
        property_id=property_id,
        title=obj_in.title,
        description=obj_in.description,
        assigned_to=obj_in.assigned_to,
        department_id=obj_in.department_id,
        priority=obj_in.priority,
        due_date=obj_in.due_date,
        status="pending",
        created_by=user.get("user_id"),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/tasks/{property_id}/{task_id}", response_model=TaskResponse)
def get_task(
    property_id: UUID,
    task_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.tenant_id == tenant_id,
        Task.property_id == property_id,
        Task.deleted_at == None
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.put("/tasks/{property_id}/{task_id}", response_model=TaskResponse)
def update_task(
    property_id: UUID,
    task_id: UUID,
    obj_in: TaskUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.tenant_id == tenant_id,
        Task.deleted_at == None
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    update_data = obj_in.model_dump(exclude_unset=True)
    
    if "status" in update_data and update_data["status"] == "completed" and not task.completed_at:
        task.completed_at = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(task, field, value)
    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{property_id}/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    property_id: UUID,
    task_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.tenant_id == tenant_id,
        Task.deleted_at == None
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.deleted_at = datetime.utcnow()
    db.commit()
    return None


# ============================================================
# ATTENDANCE ROUTES
# ============================================================

@router.get("/attendance/{property_id}", response_model=List[AttendanceResponse])
def list_attendance(
    property_id: UUID,
    date: str = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    query = db.query(Attendance).filter(
        Attendance.tenant_id == tenant_id,
        Attendance.property_id == property_id
    )
    if date:
        from datetime import datetime as dt
        date_obj = datetime.strptime(date, "%Y-%m-%d")
        query = query.filter(Attendance.date == date_obj)
    return query.order_by(Attendance.date.desc()).all()


@router.post("/attendance/{property_id}", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
def create_attendance(
    property_id: UUID,
    obj_in: AttendanceCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    attendance = Attendance(
        tenant_id=tenant_id,
        property_id=property_id,
        employee_id=obj_in.employee_id,
        date=obj_in.date,
        check_in=obj_in.check_in,
        check_out=obj_in.check_out,
        status=obj_in.status,
        notes=obj_in.notes,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance


@router.post("/attendance/{property_id}/checkin")
def check_in(
    property_id: UUID,
    employee_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    existing = db.query(Attendance).filter(
        Attendance.employee_id == employee_id,
        Attendance.property_id == property_id,
        Attendance.date == today
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already checked in today")
    
    attendance = Attendance(
        tenant_id=tenant_id,
        property_id=property_id,
        employee_id=employee_id,
        date=today,
        check_in=datetime.utcnow(),
        status="present",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return {"message": "Checked in successfully", "attendance_id": str(attendance.id)}


@router.post("/attendance/{property_id}/checkout")
def check_out(
    property_id: UUID,
    employee_id: UUID,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tenant_id = user["tenant_id"]
    verify_property_ownership(db, property_id, tenant_id)
    
    today = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    attendance = db.query(Attendance).filter(
        Attendance.employee_id == employee_id,
        Attendance.property_id == property_id,
        Attendance.date == today
    ).first()
    
    if not attendance:
        raise HTTPException(status_code=400, detail="Not checked in today")
    
    if attendance.check_out:
        raise HTTPException(status_code=400, detail="Already checked out")
    
    attendance.check_out = datetime.utcnow()
    attendance.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(attendance)
    return {"message": "Checked out successfully"}
