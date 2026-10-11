import os
import re
import smtplib
import ssl
import time
from datetime import date
from email.message import EmailMessage

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, field_validator

app = FastAPI(
    title="Ramnagari Tourism Deepotsav Enquiry API",
    docs_url=None,
    redoc_url=None,
)

allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "https://ramnagritourism.com,https://www.ramnagritourism.com,http://localhost:5500,http://127.0.0.1:5500",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in allowed_origins.split(",") if origin.strip()],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)


class DeepotsavEnquiry(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    mobile: str = Field(min_length=10, max_length=20)
    email: EmailStr
    travellers: int = Field(ge=1, le=30)
    arrival_date: date
    nights: str = Field(pattern=r"^(1|2|3|4|5\+)$")
    hotel_requirement: str = Field(pattern=r"^(Need hotel options|Have own stay)$")
    hotel_category: str = Field(default="No preference", max_length=40)
    cab_requirement: str = Field(pattern=r"^(Need cab|No cab required)$")
    vehicle_type: str = Field(default="No preference", max_length=40)
    additional_requests: str = Field(default="", max_length=1500)
    website: str = Field(default="", max_length=200)
    form_started_at: int = Field(ge=0)

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if len(cleaned) < 2 or any(ord(character) < 32 for character in cleaned):
            raise ValueError("Enter a valid name")
        return cleaned

    @field_validator("mobile")
    @classmethod
    def validate_mobile(cls, value: str) -> str:
        cleaned = value.strip()
        digits = re.sub(r"\D", "", cleaned)
        if not re.fullmatch(r"[0-9+() -]{10,20}", cleaned) or not 10 <= len(digits) <= 15:
            raise ValueError("Enter a valid mobile number")
        return cleaned

    @field_validator("arrival_date")
    @classmethod
    def validate_arrival_date(cls, value: date) -> date:
        if value < date.today():
            raise ValueError("Arrival date cannot be in the past")
        return value


enquiry_attempts: dict[str, list[float]] = {}


def send_enquiry_email(enquiry: DeepotsavEnquiry) -> None:
    smtp_host = os.getenv("SMTP_HOST", "").strip()
    smtp_username = os.getenv("SMTP_USERNAME", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    if not smtp_host or not smtp_username or not smtp_password:
        raise HTTPException(status_code=503, detail="Enquiry email is not configured yet. Please call or WhatsApp us.")

    try:
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
    except ValueError as error:
        raise HTTPException(status_code=503, detail="Enquiry email is not configured yet.") from error

    recipient = os.getenv("ENQUIRY_TO_EMAIL", "ayodhyaramnagritourism@gmail.com").strip()
    sender = os.getenv("SMTP_FROM_EMAIL", smtp_username).strip()
    message = EmailMessage()
    message["Subject"] = "New Ayodhya Deepotsav Tour Enquiry"
    message["From"] = sender
    message["To"] = recipient
    message["Reply-To"] = str(enquiry.email)
    message.set_content(
        "New Ayodhya Deepotsav tour enquiry\n\n"
        f"Name: {enquiry.full_name}\n"
        f"Mobile: {enquiry.mobile}\n"
        f"Email: {enquiry.email}\n"
        f"Travellers: {enquiry.travellers}\n"
        f"Arrival date: {enquiry.arrival_date.isoformat()}\n"
        f"Stay duration: {enquiry.nights} night(s)\n"
        f"Hotel requirement: {enquiry.hotel_requirement}\n"
        f"Hotel category: {enquiry.hotel_category}\n"
        f"Cab requirement: {enquiry.cab_requirement}\n"
        f"Preferred vehicle: {enquiry.vehicle_type}\n\n"
        f"Additional requests:\n{enquiry.additional_requests or 'None'}\n"
    )

    try:
        if smtp_port == 465:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=15, context=ssl.create_default_context()) as server:
                server.login(smtp_username, smtp_password)
                server.send_message(message)
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                server.starttls(context=ssl.create_default_context())
                server.login(smtp_username, smtp_password)
                server.send_message(message)
    except (OSError, smtplib.SMTPException) as error:
        raise HTTPException(status_code=502, detail="We could not send your enquiry right now. Please call or WhatsApp us.") from error


@app.post("/api/enquiries/deepotsav", status_code=201)
def submit_deepotsav_enquiry(enquiry: DeepotsavEnquiry, request: Request):
    if enquiry.website.strip():
        return {"success": True, "message": "Thank you. Your enquiry has been received."}

    submitted_after_seconds = time.time() - (enquiry.form_started_at / 1000)
    if submitted_after_seconds < 3 or submitted_after_seconds > 7200:
        raise HTTPException(status_code=400, detail="Please review the form and try again.")

    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    recent_attempts = [
        attempt for attempt in enquiry_attempts.get(client_ip, [])
        if now - attempt < 900
    ]
    if len(recent_attempts) >= 4:
        raise HTTPException(status_code=429, detail="Please wait before sending another enquiry.")
    recent_attempts.append(now)
    enquiry_attempts[client_ip] = recent_attempts

    send_enquiry_email(enquiry)
    return {"success": True, "message": "Thank you. Your enquiry has been sent successfully."}
