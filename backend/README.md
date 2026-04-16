# SkiTech Backend

A multi-tenant hotel management SaaS platform built with FastAPI, PostgreSQL, and AWS serverless architecture.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Authentication & RBAC](#authentication--rbac)
- [API Endpoints](#api-endpoints)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Contributors](#contributors)

---

## Project Overview

SkiTech is a comprehensive multi-tenant SaaS platform designed for hotel and property management businesses. It centralizes operations, workforce management, SOP management, inventory tracking, and business intelligence under one scalable cloud-native system.

The platform supports multiple hotel chains (tenants) on a single deployment, with complete data isolation between tenants and strict role-based access control across all operations.

**Key capabilities:**
- Multi-tenant architecture with full tenant data isolation
- Role-based access control (Super Admin, Tenant Admin, Manager, Staff)
- JWT-based stateless authentication with access and refresh tokens
- Secure API protection using FastAPI dependency injection
- Audit logging for all critical actions
- Serverless-ready backend (AWS Lambda + API Gateway)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend Framework | FastAPI (Python) |
| Database | PostgreSQL |
| ORM | SQLAlchemy 2.x |
| Authentication | JWT (python-jose) |
| Password Hashing | bcrypt (passlib) |
| Server | Uvicorn |
| Testing | Pytest |
| Cloud | AWS Lambda + API Gateway |
| Frontend | React / Next.js |
| Mobile (Phase 3) | Flutter |

---

## Architecture Overview

```
Client (Web / Mobile)
        │
        ▼
   API Gateway
        │
        ▼
  FastAPI Backend
        │
   ┌────┴────┐
   │         │
JWT Auth   RBAC
Middleware  Middleware
   │         │
   └────┬────┘
        │
        ▼
  Business Logic
  (Auth / Property / SOP / Inventory)
        │
        ▼
   PostgreSQL
   (tenant-isolated queries)
        │
        ▼
   Audit Logs
```

**Multi-Tenant Flow:**
Every request carries a JWT token containing `user_id`, `tenant_id`, and `role`. All database queries are automatically scoped to the `tenant_id` from the token, ensuring complete data isolation between hotel chains.

**Role Hierarchy:**
```
Super Admin
    └── Tenant Admin
            └── Manager
                    └── Staff
```

---

## Project Structure

```
SkiTech-Code/
│
├── app/
│   ├── __init__.py
│   ├── main.py               # FastAPI app entry point, all routes
│   ├── database.py           # SQLAlchemy engine and session setup
│   ├── models.py             # Database models (User, etc.)
│   ├── auth.py               # Register and login business logic
│   ├── security.py           # Password hashing using bcrypt
│   ├── jwt_handler.py        # JWT token creation and decoding
│   ├── dependencies.py       # get_current_user dependency
│   ├── rbac.py               # Role-based route protection
│   ├── permissions.py        # Role to permissions mapping
│   └── permission_checker.py # Permission-based route protection
│
├── tests/
│   ├── __init__.py
│   └── test_auth.py          # Unit tests for auth module (18 tests)
│
├── .env                      # Environment variables (not committed)
├── .gitignore
├── requirements.txt
└── README.md
```

---

## Authentication & RBAC

### JWT Token Structure

Every access token contains:

```json
{
  "user_id": "uuid",
  "tenant_id": "uuid",
  "role": "Manager",
  "type": "access",
  "exp": 1700000000
}
```

- **Access Token** — expires in 30 minutes
- **Refresh Token** — expires in 7 days

### Role Permissions

| Permission | Super Admin | Tenant Admin | Manager | Staff |
|------------|-------------|--------------|---------|-------|
| view_dashboard | ✅ | ✅ | ✅ | ✅ |
| manage_property | ✅ | ✅ | ❌ | ❌ |
| manage_staff | ✅ | ✅ | ✅ | ❌ |
| manage_all | ✅ | ❌ | ❌ | ❌ |

---

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register a new user | No |
| POST | `/login` | Login and receive tokens | No |
| POST | `/refresh` | Get new access token using refresh token | No |

### Role-Based Dashboards

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET | `/dashboard` | General dashboard | All roles |
| GET | `/admin` | Super Admin dashboard | Super Admin |
| GET | `/tenant` | Tenant Admin dashboard | Tenant Admin |
| GET | `/manager` | Manager dashboard | Manager |

### Module APIs

| Method | Endpoint | Description | Required Permission |
|--------|----------|-------------|---------------------|
| GET | `/staff` | Staff management | manage_staff |
| GET | `/properties` | Property management | manage_property |

---

## Setup & Installation

### Prerequisites

- Python 3.10+
- PostgreSQL 16
- Git

### Step 1 — Clone the Repository

```bash
git clone https://github.com/Newmeric-Tech/SkiTech-backend.git
cd SkiTech-backend
```

### Step 2 — Create Virtual Environment

```bash
python -m venv venv
```

Activate it:

**Windows:**
```bash
venv\Scripts\activate
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

### Step 3 — Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4 — Setup PostgreSQL Database

Open your PostgreSQL terminal and run:

```sql
CREATE DATABASE skitech;
```

### Step 5 — Configure Environment Variables

Create a `.env` file in the root of the project:

```
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/skitech
JWT_SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256
```

### Step 6 — Run the Server

```bash
uvicorn app.main:app --reload
```

The API will be available at:
```
http://127.0.0.1:8000
```

Swagger UI (interactive API docs):
```
http://127.0.0.1:8000/docs
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | postgresql://postgres:password@localhost:5432/skitech |
| JWT_SECRET_KEY | Secret key for signing JWT tokens | your_strong_secret_key |
| JWT_ALGORITHM | Algorithm used for JWT | HS256 |

> Never commit your `.env` file. It is already listed in `.gitignore`.

---

## Running Tests

Run all tests:

```bash
pytest tests/ -v
```

Expected output — 18 tests covering:
- Password hashing and verification
- JWT access and refresh token creation
- JWT decoding (valid and invalid tokens)
- Token type enforcement (access vs refresh)
- User registration logic
- User login logic (success, wrong email, wrong password)
- Token validity after login

---

## Contributors

| Name | Role |
|------|------|
| Nupur | Team Lead & Backend Developer |
| Amardeep | Backend Developer |
| Rishi | Database Engineer |
| Krishna | Frontend Developer (Next.js) |
| Yatri | UI/UX Designer (Figma) |
| Ansh | QA & GitHub Management |
| Shradha | Documentation |

---

## Organization

**Newmeric Tech LLC**
GitHub: [Newmeric-Tech](https://github.com/Newmeric-Tech)
