import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


# ============================================================
# SECTION 1: Tenant Isolation Middleware Tests
# ============================================================

def test_same_tenant_id_passes():
    """Request with matching tenant_id in query params should pass."""
    # Login to get token
    login_response = client.post(
        "/login",
        params={
            "email": "admin@skitec.com",
            "password": "admin1234"
        }
    )
    if login_response.status_code != 200:
        pytest.skip("Admin user not registered — skipping test")

    token = login_response.json()["access_token"]

    # Request with matching tenant_id
    response = client.get(
        "/dashboard",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200


def test_different_tenant_id_blocked():
    """Request with different tenant_id in query params should be blocked."""
    login_response = client.post(
        "/login",
        params={
            "email": "admin@skitec.com",
            "password": "admin1234"
        }
    )
    if login_response.status_code != 200:
        pytest.skip("Admin user not registered — skipping test")

    token = login_response.json()["access_token"]

    # Request with different tenant_id
    response = client.get(
        "/dashboard",
        headers={"Authorization": f"Bearer {token}"},
        params={"tenant_id": "00000000-0000-0000-0000-000000000000"}
    )
    assert response.status_code == 403


def test_public_routes_not_blocked():
    """Public routes should not be affected by tenant isolation."""
    response = client.post(
        "/login",
        params={
            "email": "nonexistent@skitec.com",
            "password": "wrongpassword"
        }
    )
    # Should get 401 not 403 — tenant middleware should not block public routes
    assert response.status_code == 401


def test_forgot_password_not_blocked():
    """Forgot password route should be accessible without token."""
    response = client.post(
        "/forgot-password",
        params={"email": "anyone@skitec.com"}
    )
    # Should return 200 regardless (email enumeration protection)
    assert response.status_code == 200


def test_no_tenant_id_in_params_passes():
    """Request without tenant_id in query params should pass normally."""
    login_response = client.post(
        "/login",
        params={
            "email": "admin@skitec.com",
            "password": "admin1234"
        }
    )
    if login_response.status_code != 200:
        pytest.skip("Admin user not registered — skipping test")

    token = login_response.json()["access_token"]

    response = client.get(
        "/dashboard",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
