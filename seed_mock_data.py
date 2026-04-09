"""
Comprehensive mock data seed for SkiTech.

Idempotent — safe to re-run. Skips records that already exist.
Run after seed_roles.py and seed_tenant.py have been executed.

    python seed_mock_data.py
"""
import asyncio
import random
from datetime import datetime, timedelta
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.database import engine
from app.core.security import hash_password
from app.models.models import (
    AuditLog,
    Booking,
    Department,
    Employee,
    GovernanceWorkflow,
    InventoryItem,
    InventoryMovement,
    OwnerDetails,
    Property,
    Role,
    Room,
    SOPCategory,
    SOPItem,
    Tenant,
    User,
    Vendor,
    WorkflowInstance,
)

AsyncSessionLocal = sessionmaker(
    bind=engine, class_=AsyncSession, expire_on_commit=False
)


# ───────────────────────────────────────────────────────────
# Helpers
# ───────────────────────────────────────────────────────────
async def get_or_create(session, model, lookup: dict, **defaults):
    """Return existing row matching lookup or create+add a new one (no commit)."""
    stmt = select(model).filter_by(**lookup)
    res = await session.execute(stmt)
    row = res.scalar_one_or_none()
    if row:
        return row, False
    # defaults may overlap with lookup keys (e.g. when both come from a spec
    # dict). Lookup wins so the row matches what we just queried for.
    merged = {**defaults, **lookup}
    row = model(**merged)
    session.add(row)
    return row, True


async def seed():
    async with AsyncSessionLocal() as session:
        # ── Tenant ──────────────────────────────────────────
        res = await session.execute(select(Tenant).limit(1))
        tenant = res.scalar_one_or_none()
        if not tenant:
            print("✗ No tenant exists. Run seed_tenant.py first.")
            return
        tid = tenant.id
        print(f"✓ Using tenant {tenant.business_name} ({tid})")

        # ── Roles ───────────────────────────────────────────
        roles_res = await session.execute(select(Role))
        roles = {r.name: r for r in roles_res.scalars().all()}
        if "Tenant Admin" not in roles:
            print("✗ Roles missing. Run seed_roles.py first.")
            return

        # ── Users (one of each role, pre-verified) ──────────
        user_seeds = [
            ("superadmin@skitech.local", "Super", "Admin", "Super Admin"),
            ("tenantadmin@skitech.local", "Tenant", "Admin", "Tenant Admin"),
            ("manager@skitech.local", "Hotel", "Manager", "Manager"),
            ("staff@skitech.local", "Front", "Desk", "Staff"),
        ]
        # Force-reset passwords on each run so test creds are always known.
        users_by_email = {}
        for email, fn, ln, role_name in user_seeds:
            existing = (
                await session.execute(select(User).where(User.email == email))
            ).scalar_one_or_none()
            if existing:
                existing.password_hash = hash_password("Password123")
                existing.is_active = True
                existing.is_verified = True
                existing.first_name = existing.first_name or fn
                existing.last_name = existing.last_name or ln
                existing.role_id = roles[role_name].id
                users_by_email[email] = existing
                print(f"  ↻ reset password for {email} / Password123 [{role_name}]")
                continue
            u = User(
                email=email,
                password_hash=hash_password("Password123"),
                first_name=fn,
                last_name=ln,
                tenant_id=tid,
                role_id=roles[role_name].id,
                is_active=True,
                is_verified=True,
            )
            session.add(u)
            users_by_email[email] = u
            print(f"  + user {email} / Password123 [{role_name}]")
        await session.flush()

        # ── Properties ──────────────────────────────────────
        property_seeds = [
            dict(
                name="Grand Horizon Hotel",
                address="123 Marina Blvd",
                city="Dubai",
                state="Dubai",
                country="UAE",
                postal_code="00000",
                franchise_type="owner-operated",
                num_rooms=12,
                has_restaurant=True,
                is_active=True,
            ),
            dict(
                name="Skyline Suites",
                address="45 Sheikh Zayed Rd",
                city="Dubai",
                state="Dubai",
                country="UAE",
                postal_code="00001",
                franchise_type="franchise",
                num_rooms=8,
                has_restaurant=False,
                is_active=True,
            ),
        ]
        properties = []
        for spec in property_seeds:
            row, created = await get_or_create(
                session, Property, {"tenant_id": tid, "name": spec["name"]}, **spec
            )
            properties.append(row)
            if created:
                print(f"  + property {spec['name']}")
        await session.flush()

        # ── Owner details ───────────────────────────────────
        for p in properties:
            existing = (
                await session.execute(
                    select(OwnerDetails).where(OwnerDetails.property_id == p.id)
                )
            ).scalar_one_or_none()
            if existing:
                continue
            session.add(
                OwnerDetails(
                    tenant_id=tid,
                    property_id=p.id,
                    owner_name="Khalid Al Maktoum",
                    phone="+971-50-1234567",
                    email=f"owner+{p.name.lower().replace(' ', '')}@skitech.local",
                    address=p.address,
                    ownership_type="sole-owner",
                )
            )
        await session.flush()

        # ── Departments per property ────────────────────────
        dept_specs = [
            ("Front Desk", "Reception, check-in/check-out, guest services"),
            ("Housekeeping", "Room cleaning, laundry, turndown service"),
            ("Food & Beverage", "Restaurant, bar, room service"),
            ("Maintenance", "Engineering, repairs, preventive maintenance"),
            ("Security", "Surveillance, safety, incident response"),
        ]
        departments_by_property = {}
        for p in properties:
            dlist = []
            for name, desc in dept_specs:
                row, created = await get_or_create(
                    session,
                    Department,
                    {"tenant_id": tid, "property_id": p.id, "name": name},
                    description=desc,
                    is_active=True,
                )
                dlist.append(row)
            departments_by_property[p.id] = dlist
        await session.flush()

        # ── Employees (link a couple of users + extras) ─────
        first_names = ["Ahmed", "Fatima", "Raj", "Maria", "Yusuf", "Lina", "Omar", "Sara"]
        last_names = ["Khalid", "Al Ali", "Patel", "Santos", "Ibrahim", "Mansour", "Hassan", "Said"]
        positions = ["Receptionist", "Housekeeper", "Chef", "Engineer", "Guard"]

        for p in properties:
            existing_count = (
                await session.execute(
                    select(Employee).where(Employee.property_id == p.id).limit(1)
                )
            ).scalar_one_or_none()
            if existing_count:
                continue

            depts = departments_by_property[p.id]
            for i in range(5):
                fn = first_names[i % len(first_names)]
                ln = last_names[i % len(last_names)]
                dept = depts[i % len(depts)]
                role_name = "Manager" if i == 0 else "Staff"
                session.add(
                    Employee(
                        tenant_id=tid,
                        property_id=p.id,
                        role_id=roles[role_name].id,
                        department_id=dept.id,
                        employee_code=f"EMP-{p.id.hex[:4].upper()}-{i+1:03d}",
                        first_name=fn,
                        last_name=ln,
                        email=f"{fn.lower()}.{ln.lower().replace(' ', '')}.{p.id.hex[:4]}@skitech.local",
                        phone=f"+971-50-{random.randint(1000000, 9999999)}",
                        position=positions[i % len(positions)],
                        is_active=True,
                        start_date=datetime.utcnow() - timedelta(days=random.randint(30, 720)),
                    )
                )
        await session.flush()

        # ── Vendors per property ────────────────────────────
        vendor_specs = [
            ("Bright Linens Co.", "Aisha Noor", "+971-50-1112233", "sales@brightlinens.ae"),
            ("Crystal Springs Water", "Mohammed Reza", "+971-50-2223344", "orders@crystal.ae"),
            ("Gulf Food Supply", "Priya Singh", "+971-50-3334455", "sales@gulffood.ae"),
            ("Sparkle Cleaning Chem", "James Lin", "+971-50-4445566", "support@sparkle.ae"),
        ]
        for p in properties:
            existing = (
                await session.execute(
                    select(Vendor).where(Vendor.property_id == p.id).limit(1)
                )
            ).scalar_one_or_none()
            if existing:
                continue
            for name, contact, phone, email in vendor_specs:
                session.add(
                    Vendor(
                        tenant_id=tid,
                        property_id=p.id,
                        name=name,
                        contact_person=contact,
                        phone=phone,
                        email=email,
                        address="Industrial Area, Dubai",
                        is_active=True,
                    )
                )
        await session.flush()

        # ── Inventory items ─────────────────────────────────
        inventory_specs = [
            ("Bath Towels", "pcs", 120, 30),
            ("Bed Sheets (King)", "pcs", 80, 20),
            ("Shampoo Bottles", "pcs", 60, 15),
            ("Toilet Paper Rolls", "pcs", 200, 50),
            ("Coffee Beans", "kg", 25, 10),
            ("Mineral Water", "btl", 240, 60),
            ("Cleaning Spray", "btl", 35, 10),
            ("Light Bulbs", "pcs", 45, 15),
        ]
        for p in properties:
            existing = (
                await session.execute(
                    select(InventoryItem).where(InventoryItem.property_id == p.id).limit(1)
                )
            ).scalar_one_or_none()
            if existing:
                continue
            housekeeping = next(
                d for d in departments_by_property[p.id] if d.name == "Housekeeping"
            )
            for name, unit, qty, reorder in inventory_specs:
                session.add(
                    InventoryItem(
                        tenant_id=tid,
                        property_id=p.id,
                        department_id=housekeeping.id,
                        item_name=name,
                        quantity=qty,
                        unit=unit,
                        reorder_level=reorder,
                    )
                )
        await session.flush()

        # ── Rooms ───────────────────────────────────────────
        room_types = [("Standard", 180), ("Deluxe", 280), ("Suite", 480), ("Penthouse", 980)]
        for p in properties:
            existing = (
                await session.execute(
                    select(Room).where(Room.property_id == p.id).limit(1)
                )
            ).scalar_one_or_none()
            if existing:
                continue
            for floor in range(1, 4):
                for n in range(1, 5):
                    rtype, price = room_types[(floor + n) % len(room_types)]
                    session.add(
                        Room(
                            tenant_id=tid,
                            property_id=p.id,
                            room_number=f"{floor}{n:02d}",
                            room_type=rtype,
                            price_per_night=Decimal(price),
                            status="available",
                        )
                    )
        await session.flush()

        # ── Bookings (some completed today for revenue) ─────
        guest_names = [
            "John Smith", "Layla Hassan", "Pierre Dubois", "Anika Sharma",
            "Kenji Tanaka", "Olivia Brown", "Ravi Kapoor", "Mia Rossi",
        ]
        for p in properties:
            existing = (
                await session.execute(
                    select(Booking).where(Booking.property_id == p.id).limit(1)
                )
            ).scalar_one_or_none()
            if existing:
                continue

            rooms_res = await session.execute(
                select(Room).where(Room.property_id == p.id).limit(8)
            )
            rooms = rooms_res.scalars().all()
            if not rooms:
                continue

            today = datetime.utcnow().replace(hour=14, minute=0, second=0, microsecond=0)

            # 3 completed today (revenue counted)
            for i in range(3):
                room = rooms[i]
                price = float(room.price_per_night or 200)
                session.add(
                    Booking(
                        tenant_id=tid,
                        property_id=p.id,
                        room_id=room.id,
                        customer_name=guest_names[i],
                        customer_phone=f"+971-50-{random.randint(1000000, 9999999)}",
                        check_in=today - timedelta(days=2),
                        check_out=today,
                        total_amount=Decimal(price * 2),
                        status="completed",
                    )
                )
                room.status = "available"

            # 2 currently checked in
            for i in range(3, 5):
                room = rooms[i]
                price = float(room.price_per_night or 200)
                session.add(
                    Booking(
                        tenant_id=tid,
                        property_id=p.id,
                        room_id=room.id,
                        customer_name=guest_names[i],
                        customer_phone=f"+971-50-{random.randint(1000000, 9999999)}",
                        check_in=today - timedelta(days=1),
                        check_out=today + timedelta(days=2),
                        total_amount=Decimal(price * 3),
                        status="checked_in",
                    )
                )
                room.status = "occupied"

            # 2 upcoming
            for i in range(5, 7):
                room = rooms[i]
                price = float(room.price_per_night or 200)
                session.add(
                    Booking(
                        tenant_id=tid,
                        property_id=p.id,
                        room_id=room.id,
                        customer_name=guest_names[i],
                        customer_phone=f"+971-50-{random.randint(1000000, 9999999)}",
                        check_in=today + timedelta(days=2),
                        check_out=today + timedelta(days=5),
                        total_amount=Decimal(price * 3),
                        status="booked",
                    )
                )
        await session.flush()

        # ── SOP categories + items ──────────────────────────
        sop_cat_specs = [
            ("Front Desk", "Reception & guest service procedures"),
            ("Housekeeping", "Room cleaning & laundry procedures"),
            ("Safety", "Emergency, fire & security procedures"),
        ]
        sop_item_specs = [
            ("Check-in Procedure", "Standard guest check-in workflow", "high", "pending"),
            ("Room Turnaround", "Daily room cleaning checklist", "high", "in_progress"),
            ("Fire Drill Protocol", "Quarterly fire drill execution", "medium", "pending"),
            ("Lost & Found Handling", "Logging and storage of lost items", "low", "completed"),
            ("VIP Welcome", "Special-treatment script for VIP guests", "medium", "pending"),
        ]
        for p in properties:
            existing = (
                await session.execute(
                    select(SOPCategory).where(SOPCategory.property_id == p.id).limit(1)
                )
            ).scalar_one_or_none()
            if existing:
                continue
            cats = []
            for name, desc in sop_cat_specs:
                c = SOPCategory(
                    tenant_id=tid, property_id=p.id, name=name, description=desc
                )
                session.add(c)
                cats.append(c)
            await session.flush()

            for i, (title, desc, prio, status) in enumerate(sop_item_specs):
                session.add(
                    SOPItem(
                        tenant_id=tid,
                        property_id=p.id,
                        category_id=cats[i % len(cats)].id,
                        title=title,
                        description=desc,
                        priority=prio,
                        status=status,
                        due_date=datetime.utcnow() + timedelta(days=random.randint(1, 14)),
                    )
                )
        await session.flush()

        # ── Governance workflows ────────────────────────────
        wf_specs = [
            ("Leave Request", "LEAVE_REQUEST", "Employee leave approval"),
            ("Expense Approval", "EXPENSE_APPROVAL", "Finance expense approval"),
            ("Vendor Onboarding", "VENDOR_ONBOARD", "New vendor approval"),
        ]
        workflows = []
        for name, code, desc in wf_specs:
            row, created = await get_or_create(
                session,
                GovernanceWorkflow,
                {"code": code},
                name=name,
                description=desc,
                is_active=True,
            )
            workflows.append(row)
        await session.flush()

        # ── Workflow instances (a few pending) ──────────────
        existing_wi = (
            await session.execute(select(WorkflowInstance).limit(1))
        ).scalar_one_or_none()
        if not existing_wi and workflows:
            requester = users_by_email.get("manager@skitech.local")
            approver = users_by_email.get("tenantadmin@skitech.local")
            if requester and approver:
                import uuid
                for wf in workflows:
                    session.add(
                        WorkflowInstance(
                            workflow_id=wf.id,
                            request_type=wf.code,
                            request_id=uuid.uuid4(),
                            description=f"Sample {wf.name} pending approval",
                            requested_by_id=requester.id,
                            current_approver_id=approver.id,
                            status="pending",
                            current_step=1,
                        )
                    )

        # ── Audit logs (a handful) ──────────────────────────
        existing_audit = (
            await session.execute(select(AuditLog).limit(1))
        ).scalar_one_or_none()
        if not existing_audit:
            actor = users_by_email.get("tenantadmin@skitech.local")
            actions = [
                ("LOGIN", "user", "low"),
                ("CREATE", "property", "medium"),
                ("UPDATE", "inventory_item", "low"),
                ("CREATE", "booking", "low"),
                ("DELETE", "vendor", "high"),
                ("UPDATE", "user", "medium"),
            ]
            now = datetime.utcnow()
            for i, (action, rtype, sev) in enumerate(actions):
                session.add(
                    AuditLog(
                        tenant_id=tid,
                        user_id=actor.id if actor else None,
                        user_email=actor.email if actor else None,
                        action=action,
                        resource_type=rtype,
                        resource_id=None,
                        details=f"Seed audit entry: {action} on {rtype}",
                        severity=sev,
                        status="success",
                        created_at=now - timedelta(hours=i * 3),
                    )
                )

        await session.commit()
        print("\n✓ Mock data seeded successfully.")
        print("\nLogin credentials (all passwords: Password123):")
        for email, _, _, role in user_seeds:
            print(f"  • {email}  [{role}]")


if __name__ == "__main__":
    asyncio.run(seed())
