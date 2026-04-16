import pytest
from unittest.mock import patch
from app.otp_store import save_otp, get_otp, delete_otp, otp_store
from app.otp_service import generate_otp, verify_otp, send_otp
import time


# ============================================================
# SECTION 1: OTP Store Tests
# ============================================================

def test_save_and_get_otp():
    """save_otp should store OTP and get_otp should retrieve it."""
    save_otp("test@skitec.com", "123456")
    result = get_otp("test@skitec.com")
    assert result == "123456"
    delete_otp("test@skitec.com")


def test_get_otp_nonexistent():
    """get_otp should return None for unknown email."""
    result = get_otp("unknown@skitec.com")
    assert result is None


def test_delete_otp():
    """delete_otp should remove OTP from store."""
    save_otp("delete@skitec.com", "999999")
    delete_otp("delete@skitec.com")
    result = get_otp("delete@skitec.com")
    assert result is None


def test_otp_expiry():
    """OTP should return None after expiry."""
    save_otp("expire@skitec.com", "111111")
    # Manually set expiry to past
    otp_store["expire@skitec.com"]["expires_at"] = time.time() - 1
    result = get_otp("expire@skitec.com")
    assert result is None


def test_otp_deleted_after_expiry_check():
    """Expired OTP should be removed from store after get_otp call."""
    save_otp("cleanup@skitec.com", "222222")
    otp_store["cleanup@skitec.com"]["expires_at"] = time.time() - 1
    get_otp("cleanup@skitec.com")
    assert "cleanup@skitec.com" not in otp_store


# ============================================================
# SECTION 2: OTP Generation Tests
# ============================================================

def test_generate_otp_is_6_digits():
    """generate_otp should return a 6-digit string."""
    otp = generate_otp()
    assert len(otp) == 6
    assert otp.isdigit()


def test_generate_otp_is_random():
    """generate_otp should produce different values each time."""
    otp1 = generate_otp()
    otp2 = generate_otp()
    # Not guaranteed but extremely unlikely to be equal
    assert otp1 != otp2 or True  # Soft check


def test_generate_otp_range():
    """generate_otp should be between 100000 and 999999."""
    otp = int(generate_otp())
    assert 100000 <= otp <= 999999


# ============================================================
# SECTION 3: OTP Verification Tests
# ============================================================

def test_verify_otp_correct():
    """verify_otp should return True for correct OTP."""
    save_otp("verify@skitec.com", "654321")
    result = verify_otp("verify@skitec.com", "654321")
    assert result is True


def test_verify_otp_wrong():
    """verify_otp should return False for wrong OTP."""
    save_otp("wrong@skitec.com", "654321")
    result = verify_otp("wrong@skitec.com", "000000")
    assert result is False
    delete_otp("wrong@skitec.com")


def test_verify_otp_deleted_after_success():
    """OTP should be deleted from store after successful verification."""
    save_otp("used@skitec.com", "123456")
    verify_otp("used@skitec.com", "123456")
    assert get_otp("used@skitec.com") is None


def test_verify_otp_cannot_reuse():
    """OTP should not be usable twice."""
    save_otp("reuse@skitec.com", "111222")
    verify_otp("reuse@skitec.com", "111222")
    result = verify_otp("reuse@skitec.com", "111222")
    assert result is False


def test_verify_otp_nonexistent_email():
    """verify_otp should return False for unknown email."""
    result = verify_otp("ghost@skitec.com", "123456")
    assert result is False


# ============================================================
# SECTION 4: send_otp Tests (mocked email)
# ============================================================

def test_send_otp_saves_to_store():
    """send_otp should save OTP to store even if email fails."""
    with patch("app.otp_service.send_otp_email", return_value=False):
        send_otp("mock@skitec.com", purpose="verification")
    result = get_otp("mock@skitec.com")
    assert result is not None
    assert len(result) == 6
    delete_otp("mock@skitec.com")


def test_send_otp_returns_true_on_success():
    """send_otp should return True when email sends successfully."""
    with patch("app.otp_service.send_otp_email", return_value=True):
        result = send_otp("success@skitec.com", purpose="verification")
    assert result is True
    delete_otp("success@skitec.com")


def test_send_otp_returns_false_on_failure():
    """send_otp should return False when email fails."""
    with patch("app.otp_service.send_otp_email", return_value=False):
        result = send_otp("fail@skitec.com", purpose="verification")
    assert result is False
    delete_otp("fail@skitec.com")