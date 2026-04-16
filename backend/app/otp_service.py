import random
import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv
from .otp_store import save_otp, get_otp, delete_otp

load_dotenv()

SMTP_EMAIL = os.getenv("SMTP_EMAIL")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587


def generate_otp() -> str:
    """Generate a 6-digit OTP."""
    return str(random.randint(100000, 999999))


def send_otp_email(to_email: str, otp: str, purpose: str = "verification"):
    """
    Send OTP via Gmail SMTP.

    Args:
        to_email : Recipient email address
        otp      : The 6-digit OTP
        purpose  : 'verification' for signup, 'password_reset' for reset
    """
    if purpose == "password_reset":
        subject = "SkiTech — Password Reset OTP"
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #1F4E79;">SkiTech Password Reset</h2>
            <p>You requested a password reset. Use the OTP below to reset your password.</p>
            <div style="background: #EBF3FB; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h1 style="color: #1F4E79; letter-spacing: 8px;">{otp}</h1>
            </div>
            <p>This OTP is valid for <strong>5 minutes</strong>.</p>
            <p>If you did not request this, please ignore this email.</p>
            <hr>
            <small style="color: #888;">SkiTech Platform — Newmeric Tech LLC</small>
        </body>
        </html>
        """
    else:
        subject = "SkiTech — Email Verification OTP"
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #1F4E79;">Welcome to SkiTech!</h2>
            <p>Thank you for signing up. Use the OTP below to verify your email address.</p>
            <div style="background: #EBF3FB; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                <h1 style="color: #1F4E79; letter-spacing: 8px;">{otp}</h1>
            </div>
            <p>This OTP is valid for <strong>5 minutes</strong>.</p>
            <p>If you did not create an account, please ignore this email.</p>
            <hr>
            <small style="color: #888;">SkiTech Platform — Newmeric Tech LLC</small>
        </body>
        </html>
        """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_EMAIL
        msg["To"] = to_email
        msg.attach(MIMEText(body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.sendmail(SMTP_EMAIL, to_email, msg.as_string())

        print(f"[OTP] Email sent to {to_email}")
        return True

    except Exception as e:
        print(f"[OTP ERROR] Failed to send email: {e}")
        return False


def send_otp(email: str, purpose: str = "verification") -> bool:
    """
    Generate and send OTP to the given email.

    Args:
        email   : Recipient email
        purpose : 'verification' or 'password_reset'

    Returns:
        True if sent successfully, False otherwise
    """
    otp = generate_otp()
    save_otp(email, otp)

    success = send_otp_email(email, otp, purpose)

    if not success:
        # Still keep OTP in store even if email fails
        # So we can debug during development
        print(f"[OTP DEBUG] OTP for {email} is: {otp}")

    return success


def verify_otp(email: str, otp: str) -> bool:
    """
    Verify the OTP for a given email.

    Args:
        email : The email to verify
        otp   : The OTP submitted by the user

    Returns:
        True if OTP is correct and not expired, False otherwise
    """
    stored_otp = get_otp(email)

    if not stored_otp:
        return False

    if stored_otp != otp:
        return False

    # OTP is correct — delete it so it can't be reused
    delete_otp(email)
    return True