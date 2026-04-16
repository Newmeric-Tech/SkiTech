import time

# In-memory OTP store
# Format: { "email": { "otp": "123456", "expires_at": timestamp } }
# This will be replaced with Redis in production

otp_store = {}

OTP_EXPIRY_SECONDS = 300  # 5 minutes


def save_otp(email: str, otp: str):
    """Save OTP with expiry timestamp."""
    otp_store[email] = {
        "otp": otp,
        "expires_at": time.time() + OTP_EXPIRY_SECONDS
    }


def get_otp(email: str):
    """Get OTP for email if it exists and hasn't expired."""
    record = otp_store.get(email)

    if not record:
        return None

    # Check if OTP has expired
    if time.time() > record["expires_at"]:
        delete_otp(email)
        return None

    return record["otp"]


def delete_otp(email: str):
    """Delete OTP after successful verification."""
    otp_store.pop(email, None)