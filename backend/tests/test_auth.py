import pytest
from unittest.mock import MagicMock, patch
from fastapi import HTTPException

from app.security import hash_password, verify_password
from app.jwt_handler import (
    create_access_token,
    create_refresh_token,
    decode_access_token,
    decode_refresh_token,
)
from app.auth import register_user, login_user


# ============================================================
# SECTION 1: Password Hashing Tests
# ============================================================

def test_hash_password_returns_hashed_string():
    """hash_password should return a hashed string, not plain text."""
    plain = "mypassword123"
    hashed = hash_password(plain)
    assert hashed != plain
    assert isinstance(hashed, str)


def test_verify_password_correct():
    """verify_password should return True for correct password."""
    plain = "mypassword123"
    hashed = hash_password(plain)
    assert verify_password(plain, hashed) is True


def test_verify_password_wrong():
    """verify_password should return False for wrong password."""
    hashed = hash_password("correctpassword")
    assert verify_password("wrongpassword", hashed) is False


def test_different_hashes_for_same_password():
    """Same password should produce different hashes each time (bcrypt salt)."""
    plain = "mypassword123"
    hash1 = hash_password(plain)
    hash2 = hash_password(plain)
    assert hash1 != hash2


# ============================================================
# SECTION 2: JWT Token Tests
# ============================================================

def test_create_access_token_returns_string():
    """create_access_token should return a JWT string."""
    token = create_access_token({"user_id": "123", "tenant_id": "abc", "role": "Staff"})
    assert isinstance(token, str)
    assert len(token) > 0


def test_create_refresh_token_returns_string():
    """create_refresh_token should return a JWT string."""
    token = create_refresh_token({"user_id": "123", "tenant_id": "abc", "role": "Staff"})
    assert isinstance(token, str)
    assert len(token) > 0


def test_decode_access_token_valid():
    """decode_access_token should correctly decode a valid access token."""
    payload = {"user_id": "123", "tenant_id": "abc", "role": "Staff"}
    token = create_access_token(payload)
    decoded = decode_access_token(token)

    assert decoded["user_id"] == "123"
    assert decoded["tenant_id"] == "abc"
    assert decoded["role"] == "Staff"
    assert decoded["type"] == "access"


def test_decode_refresh_token_valid():
    """decode_refresh_token should correctly decode a valid refresh token."""
    payload = {"user_id": "123", "tenant_id": "abc", "role": "Staff"}
    token = create_refresh_token(payload)
    decoded = decode_refresh_token(token)

    assert decoded["user_id"] == "123"
    assert decoded["type"] == "refresh"


def test_decode_access_token_invalid():
    """decode_access_token should raise HTTP 401 for an invalid token."""
    with pytest.raises(HTTPException) as exc_info:
        decode_access_token("this.is.not.a.valid.token")
    assert exc_info.value.status_code == 401


def test_decode_refresh_token_invalid():
    """decode_refresh_token should raise HTTP 401 for an invalid token."""
    with pytest.raises(HTTPException) as exc_info:
        decode_refresh_token("this.is.not.a.valid.token")
    assert exc_info.value.status_code == 401


def test_access_token_rejected_as_refresh():
    """An access token should be rejected when decoded as a refresh token."""
    payload = {"user_id": "123", "tenant_id": "abc", "role": "Staff"}
    access_token = create_access_token(payload)

    with pytest.raises(HTTPException) as exc_info:
        decode_refresh_token(access_token)
    assert exc_info.value.status_code == 401


def test_refresh_token_rejected_as_access():
    """A refresh token should be rejected when decoded as an access token."""
    payload = {"user_id": "123", "tenant_id": "abc", "role": "Staff"}
    refresh_token = create_refresh_token(payload)

    with pytest.raises(HTTPException) as exc_info:
        decode_access_token(refresh_token)
    assert exc_info.value.status_code == 401


# ============================================================
# SECTION 3: register_user Tests
# ============================================================

def test_register_user_success():
    """register_user should create and return a user object."""
    mock_db = MagicMock()

    # ADD THIS LINE
    mock_db.query.return_value.filter.return_value.first.return_value = None

    mock_user = MagicMock()
    mock_user.email = "test@example.com"
    mock_user.role = "Staff"

    mock_db.add = MagicMock()
    mock_db.commit = MagicMock()
    mock_db.refresh = MagicMock()

    with patch("app.auth.User") as MockUser:
        MockUser.return_value = mock_user
        result = register_user(mock_db, "test@example.com", "password123", "Staff", "tenant-uuid-123")

    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()


def test_register_user_password_is_hashed():
    """register_user should store a hashed password, not plain text."""
    mock_db = MagicMock()

    # ADD THIS LINE
    mock_db.query.return_value.filter.return_value.first.return_value = None

    captured = {}

    with patch("app.auth.User") as MockUser:
        def capture_user(**kwargs):
            captured.update(kwargs)
            return MagicMock()
        MockUser.side_effect = capture_user
        register_user(mock_db, "test@example.com", "plainpassword", "Staff", "tenant-uuid-123")

    assert "password" in captured
    assert captured["password"] != "plainpassword"
    assert verify_password("plainpassword", captured["password"]) is True


# ============================================================
# SECTION 4: login_user Tests
# ============================================================

def test_login_user_success():
    """login_user should return access and refresh tokens for valid credentials."""
    mock_db = MagicMock()

    mock_user = MagicMock()
    mock_user.id = "user-uuid-123"
    mock_user.tenant_id = "tenant-uuid-456"
    mock_user.role = "Staff"
    mock_user.password = hash_password("correctpassword")

    mock_db.query.return_value.filter.return_value.first.return_value = mock_user

    result = login_user(mock_db, "test@example.com", "correctpassword")

    assert result is not None
    assert "access_token" in result
    assert "refresh_token" in result


def test_login_user_wrong_email():
    """login_user should return None if user is not found."""
    mock_db = MagicMock()
    mock_db.query.return_value.filter.return_value.first.return_value = None

    result = login_user(mock_db, "nonexistent@example.com", "anypassword")

    assert result is None


def test_login_user_wrong_password():
    """login_user should return None if password is incorrect."""
    mock_db = MagicMock()

    mock_user = MagicMock()
    mock_user.id = "user-uuid-123"
    mock_user.tenant_id = "tenant-uuid-456"
    mock_user.role = "Staff"
    mock_user.password = hash_password("correctpassword")

    mock_db.query.return_value.filter.return_value.first.return_value = mock_user

    result = login_user(mock_db, "test@example.com", "wrongpassword")

    assert result is None


def test_login_user_tokens_are_valid():
    """Tokens returned by login_user should be decodable."""
    mock_db = MagicMock()

    mock_user = MagicMock()
    mock_user.id = "user-uuid-123"
    mock_user.tenant_id = "tenant-uuid-456"
    mock_user.role = "Manager"
    mock_user.password = hash_password("mypassword")

    mock_db.query.return_value.filter.return_value.first.return_value = mock_user

    result = login_user(mock_db, "manager@example.com", "mypassword")

    decoded_access = decode_access_token(result["access_token"])
    decoded_refresh = decode_refresh_token(result["refresh_token"])

    assert decoded_access["role"] == "Manager"
    assert decoded_refresh["type"] == "refresh"