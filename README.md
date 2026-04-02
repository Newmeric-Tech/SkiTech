# SkiTech Backend

Enterprise hospitality governance platform — **fully merged FastAPI backend**.

Merged from 4 source projects:
- **Project-ansh** — basic FastAPI scaffold, logging, middleware
- **SkiTech-Nupur** — JWT auth, OTP email, RBAC, property/owner CRUD, audit + tenant isolation middleware
- **SciTech-amardeep** — async SQLAlchemy architecture, governance workflows, service layer pattern
- **skitech-Rishiiii** — full database schema: Alembic migrations, inventory movements, SOP versions + role visibility, departments, vendors, hotel rooms/bookings, restaurant tables/orders

---

## Project Structure

```
skitech_backend/
├── main.py                         # Entry point (uvicorn main:app)
├── requirements.txt
├── .env                            # Copy and fill in your values
├── alembic.ini
├── alembic/
│   ├── env.py
│   └── versions/                   # Add migration files here
├── app/
│   ├── __init__.py                 # FastAPI app factory (app object lives here)
│   ├── core/
│   │   ├── config.py               # Settings from env vars
│   │   ├── database.py             # Async SQLAlchemy engine + get_db dependency
│   │   ├── security.py             # JWT, password hashing, RBAC permission map
│   │   └── constants.py
│   ├── models/
│   │   ├── base.py                 # UUIDMixin, TimestampMixin, SoftDeleteMixin, Base
│   │   ├── models.py               # ALL ORM models (merged from all 4 projects)
│   │   └── __init__.py
│   ├── schemas/
│   │   ├── schemas.py              # All Pydantic request/response schemas
│   │   └── common.py               # PaginatedResponse, ErrorResponse
│   ├── api/
│   │   ├── dependencies.py         # get_current_user, require_permission, require_roles
│   │   └── v1/
│   │       ├── router.py           # Aggregates all endpoint routers
│   │       └── endpoints/
│   │           ├── auth.py         # Register, OTP verify, Login, Refresh, Logout
│   │           ├── properties.py   # Property CRUD + OwnerDetails
│   │           ├── workforce.py    # Departments, Employees, Vendors
│   │           ├── inventory.py    # Inventory CRUD + stock movements
│   │           ├── sop.py          # SOP categories, items, versions
│   │           └── governance.py   # Approval workflows
│   ├── middleware/
│   │   └── middleware.py           # Logging, ErrorHandler, Audit, TenantIsolation
│   └── utils/
│       ├── exceptions.py           # Custom exception classes
│       └── otp.py                  # In-memory OTP store + email sender
└── tests/
    └── test_auth.py
```

---

## Database Schema (all tables)

| Table | Description |
|---|---|
| `roles` | RBAC roles (Super Admin, Tenant Admin, Manager, Staff) |
| `permissions` | Granular resource+action permissions |
| `role_permissions` | Junction: role → permission |
| `tenants` | Multi-tenant organisations |
| `subscription_plans` | SaaS subscription plans |
| `tenant_subscriptions` | Tenant ↔ plan assignments |
| `users` | Auth users (email, hashed password, role, tenant, property) |
| `properties` | Hotel/restaurant properties per tenant |
| `owner_details` | Property ownership info |
| `employees` | Staff members attached to a property/department |
| `departments` | Organisational departments per property |
| `vendors` | Suppliers per property |
| `inventory_items` | Stock items per property/department |
| `inventory_movements` | Stock IN / OUT / ADJUST history |
| `low_stock_alerts` | Auto-triggered when qty ≤ reorder_level |
| `sop_categories` | SOP groupings per property |
| `sop_items` | Individual SOPs with priority/status/assignment |
| `sop_versions` | Version history for each SOP |
| `sop_role_visibility` | Role-based SOP visibility control |
| `rooms` | Hotel rooms (available/occupied/maintenance) |
| `bookings` | Room bookings with check-in/check-out |
| `restaurant_tables` | Restaurant table management |
| `orders` | Restaurant orders |
| `order_items` | Items within an order |
| `governance_workflows` | Approval workflow templates |
| `workflow_instances` | Running approval processes |
| `audit_logs` | Immutable action trail |

---

## Setup & Run

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure environment
```bash
cp .env .env.local   # edit to add your database URL, secret key, SMTP creds
```

Key variables:
```env
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
SECRET_KEY=your-32-char-minimum-secret-key
SMTP_EMAIL=your@gmail.com
SMTP_PASSWORD=your-app-password
```

### 3. Run database migrations
```bash
# Auto-create all tables (dev mode — runs on startup via init_db())
uvicorn main:app --reload

# OR use Alembic for production migrations:
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

### 4. Start the server
```bash
# Development
uvicorn main:app --reload

# Production
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

Open **http://localhost:8000/docs** for the interactive Swagger UI.

---

## API Endpoints

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Register + send OTP |
| POST | `/api/v1/auth/verify-otp` | Verify email OTP |
| POST | `/api/v1/auth/login` | Login → access + refresh tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/forgot-password` | Send password-reset OTP |
| POST | `/api/v1/auth/reset-password` | Reset password with OTP |
| POST | `/api/v1/auth/logout` | Logout (client discards token) |

### Properties
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/properties/` | Create property |
| GET | `/api/v1/properties/` | List properties (tenant-scoped) |
| GET | `/api/v1/properties/{id}` | Get property |
| PUT | `/api/v1/properties/{id}` | Update property |
| DELETE | `/api/v1/properties/{id}` | Soft-delete property |
| POST | `/api/v1/properties/{id}/owner` | Add owner details |
| GET | `/api/v1/properties/{id}/owner` | List owner details |
| PUT | `/api/v1/properties/{id}/owner/{oid}` | Update owner details |

### Workforce
| Method | Path | Description |
|---|---|---|
| POST/GET | `/api/v1/departments/{property_id}` | Departments CRUD |
| POST/GET | `/api/v1/employees/{property_id}` | Employees CRUD |
| PUT/DELETE | `/api/v1/employees/{id}` | Update/delete employee |
| POST/GET | `/api/v1/vendors/{property_id}` | Vendors CRUD |

### Inventory
| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/inventory/{property_id}` | Create item |
| GET | `/api/v1/inventory/{property_id}` | List items |
| PUT/DELETE | `/api/v1/inventory/item/{id}` | Update/delete item |
| POST | `/api/v1/inventory/item/{id}/add-stock` | Add stock |
| POST | `/api/v1/inventory/item/{id}/remove-stock` | Remove stock |
| POST | `/api/v1/inventory/item/{id}/adjust-stock` | Set absolute quantity |

### SOP
| Method | Path | Description |
|---|---|---|
| POST/GET | `/api/v1/sop/categories` | SOP categories |
| POST/GET | `/api/v1/sop/items/{property_id}` | SOP items (role-filtered) |
| PUT/DELETE | `/api/v1/sop/items/{id}` | Update/delete SOP |
| POST/GET | `/api/v1/sop/items/{id}/versions` | Version history |

### Governance
| Method | Path | Description |
|---|---|---|
| POST/GET | `/api/v1/governance/workflows` | Workflow templates |
| POST/GET | `/api/v1/governance/instances` | Workflow instances |
| PUT | `/api/v1/governance/instances/{id}/approve` | Approve |
| PUT | `/api/v1/governance/instances/{id}/reject` | Reject |

---

## RBAC — Role Permissions

| Permission | Super Admin | Tenant Admin | Manager | Staff |
|---|:---:|:---:|:---:|:---:|
| manage_property | ✅ | ✅ | ❌ | ❌ |
| manage_staff | ✅ | ✅ | ✅ | ❌ |
| view/create/update/delete SOP | ✅ | ✅ | view+create+update | view only |
| manage_inventory | ✅ | ✅ | view only | view only |
| manage vendors | ✅ | ✅ | view only | ❌ |
| manage owner details | ✅ | ✅ | ❌ | ❌ |
| manage departments | ✅ | ✅ | create+update | view only |

**SOP visibility by role:**
- **Staff** → only SOPs in their own department
- **Manager** → all SOPs in their property
- **Admin/Super Admin** → all SOPs across all properties

---

## Security Features

- ✅ **JWT authentication** (access + refresh tokens)
- ✅ **OTP email verification** on register + password reset
- ✅ **Bcrypt password hashing**
- ✅ **RBAC** with granular permission checking
- ✅ **Tenant isolation** — users cannot access other tenants' data
- ✅ **Soft deletes** — records marked deleted, never hard-removed
- ✅ **Audit trail** — every write operation logged automatically
- ✅ **Request logging** — every request/response with timing

---

## Running Tests
```bash
pytest tests/ -v
```

---

## Notes for Production

1. **SECRET_KEY** — use a random 64-char string, keep secret
2. **DATABASE_URL** — use a managed Postgres (Neon, Supabase, RDS, etc.)
3. **OTP store** — replace the in-memory `_otp_store` in `app/utils/otp.py` with Redis
4. **Workers** — run with `--workers 4` (or use Gunicorn + UvicornWorker)
5. **Migrations** — use Alembic instead of `init_db()` for production schema changes
