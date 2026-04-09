"""
Seed script to create demo user credentials
"""
import asyncio
from app.core.database import engine
from app.core.security import hash_password
from app.models.models import User, Role, Tenant
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

DEMO_USERS = [
    {
        "email": "superadmin@skitech.test",
        "password": "SuperAdmin123",
        "first_name": "Super",
        "last_name": "Admin",
        "role": "Super Admin",
    },
    {
        "email": "tenantadmin@skitech.test",
        "password": "TenantAdmin123",
        "first_name": "Tenant",
        "last_name": "Admin",
        "role": "Tenant Admin",
    },
    {
        "email": "manager@skitech.test",
        "password": "Manager123",
        "first_name": "Hotel",
        "last_name": "Manager",
        "role": "Manager",
    },
    {
        "email": "staff@skitech.test",
        "password": "Staff123",
        "first_name": "Front",
        "last_name": "Desk",
        "role": "Staff",
    },
]


async def seed_users():
    """Create demo users for testing"""
    AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Tenant))
        tenant = result.scalar_one_or_none()
        if not tenant:
            print("✗ No tenant found. Run seed_tenant.py first.")
            return
        tenant_id = tenant.id

        result = await session.execute(select(Role))
        roles = {role.name: role.id for role in result.scalars().all()}
        if not roles:
            print("✗ No roles found. Run seed_roles.py first.")
            return

        for user_data in DEMO_USERS:
            result = await session.execute(
                select(User).where(User.email == user_data["email"])
            )
            if result.scalar_one_or_none():
                print(f"✓ User '{user_data['email']}' already exists")
                continue

            role_id = roles.get(user_data["role"])
            if not role_id:
                print(f"✗ Role '{user_data['role']}' not found")
                continue

            user = User(
                email=user_data["email"],
                password_hash=hash_password(user_data["password"]),
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                role_id=role_id,
                tenant_id=tenant_id,
                is_active=True,
                is_verified=True,
            )
            session.add(user)
            print(f"✓ Created user '{user_data['email']}' with role '{user_data['role']}'")

        await session.commit()

    print("\n" + "=" * 50)
    print("DEMO CREDENTIALS")
    print("=" * 50)
    for user_data in DEMO_USERS:
        print(f"  Email:    {user_data['email']}")
        print(f"  Password: {user_data['password']}")
        print(f"  Role:     {user_data['role']}")
        print("-" * 30)


if __name__ == "__main__":
    asyncio.run(seed_users())
