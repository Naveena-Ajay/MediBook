"""Email utilities for appointment confirmations."""

from __future__ import annotations

import smtplib
from email.message import EmailMessage

SMTP_HOST = "smtp.example.com"
SMTP_PORT = 587
SMTP_USER = "no-reply@example.com"
SMTP_PASS = "change-me"
SMTP_SENDER = "MediBook <no-reply@example.com>"


def build_message(to_email: str, subject: str, body: str) -> EmailMessage:
    """Build a plain text email message."""
    msg = EmailMessage()
    msg["From"] = SMTP_SENDER
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.set_content(body)
    return msg


def format_datetime(dt_text: str) -> str:
    """Format datetime string for human-friendly emails."""
    return dt_text.replace("T", " ").replace("Z", " UTC")


def build_footer() -> str:
    """Return a consistent email footer."""
    return "\n\n---\nThis is an automated message from MediBook."


def smtp_config_summary() -> dict:
    """Return a redacted SMTP configuration summary."""
    return {
        "host": SMTP_HOST,
        "port": SMTP_PORT,
        "sender": SMTP_SENDER,
    }


def send_email(to_email: str, subject: str, body: str) -> bool:
    """Send an email and return True on success.

    This uses basic SMTP with STARTTLS. In production, use environment
    variables or a dedicated email service.
    """
    message = build_message(to_email, subject, body + build_footer())
    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(SMTP_USER, SMTP_PASS)
            smtp.send_message(message)
        return True
    except Exception:
        return False


def send_email_with_retry(to_email: str, subject: str, body: str, attempts: int = 2) -> bool:
    """Attempt to send an email multiple times."""
    for _ in range(max(attempts, 1)):
        if send_email(to_email, subject, body):
            return True
    return False


def appointment_confirmation(to_email: str, patient_name: str, doctor_name: str, when: str) -> bool:
    """Send a confirmation email for a booked appointment."""
    subject = "MediBook Appointment Confirmation"
    body = (
        f"Hello {patient_name},\n\n"
        f"Your appointment with Dr. {doctor_name} is confirmed for {format_datetime(when)}.\n"
        "If you need to reschedule, please log in to MediBook.\n\n"
        "Thank you,\nMediBook Team"
    )
    return send_email_with_retry(to_email, subject, body)


def appointment_canceled(to_email: str, patient_name: str, doctor_name: str, when: str) -> bool:
    """Send a cancellation email."""
    subject = "MediBook Appointment Canceled"
    body = (
        f"Hello {patient_name},\n\n"
        f"Your appointment with Dr. {doctor_name} on {format_datetime(when)} was canceled.\n"
        "You can book a new time in MediBook.\n\n"
        "Thank you,\nMediBook Team"
    )
    return send_email_with_retry(to_email, subject, body)


def appointment_rescheduled(to_email: str, patient_name: str, doctor_name: str, when: str) -> bool:
    """Send a reschedule email."""
    subject = "MediBook Appointment Rescheduled"
    body = (
        f"Hello {patient_name},\n\n"
        f"Your appointment with Dr. {doctor_name} was rescheduled to {format_datetime(when)}.\n"
        "If you have questions, contact your clinic.\n\n"
        "Thank you,\nMediBook Team"
    )
    return send_email_with_retry(to_email, subject, body)
