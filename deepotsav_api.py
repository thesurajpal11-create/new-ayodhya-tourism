import asyncio
import os
import re
import smtplib
import ssl
import threading
import time
from datetime import date, datetime, timedelta, timezone
from email.message import EmailMessage
from typing import Literal
from uuid import UUID

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field, ValidationError, field_validator, model_validator
from sqlalchemy import Column, DateTime, Integer, String, Text, create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./ayodhya_tourism.db")
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False},
        pool_pre_ping=True,
    )
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class WebsiteReview(Base):
    __tablename__ = "website_reviews"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    rating = Column(Integer, nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), index=True)


Base.metadata.create_all(bind=engine)

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
    allow_methods=["GET", "POST", "OPTIONS"],
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


class ReviewSubmission(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    rating: int = Field(ge=4, le=5)
    message: str = Field(min_length=5, max_length=1500)
    website: str = Field(default="", max_length=200)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if len(cleaned) < 2 or any(ord(character) < 32 for character in cleaned):
            raise ValueError("Enter a valid name")
        return cleaned

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        cleaned = value.strip()
        if len(cleaned) < 5 or any(ord(character) < 32 and character not in "\n\t" for character in cleaned):
            raise ValueError("Enter a valid review")
        return cleaned


class CabPartnerRegistration(BaseModel):
    submission_id: UUID
    owner_name: str = Field(min_length=2, max_length=120)
    mobile_number: str = Field(min_length=10, max_length=20)
    whatsapp_number: str = Field(min_length=10, max_length=20)
    email: EmailStr | None = None
    city: str = Field(min_length=2, max_length=120)
    vehicle_type: Literal["Hatchback", "Sedan", "SUV", "Innova", "Tempo Traveller", "Other"]
    vehicle_model: str = Field(min_length=2, max_length=120)
    registration_number: str = Field(min_length=4, max_length=30)
    manufacturing_year: int = Field(ge=1950, le=date.today().year)
    passenger_capacity: int = Field(ge=1, le=50)
    air_conditioning: Literal["AC", "Non-AC"]
    luggage_capacity: str = Field(min_length=2, max_length=160)
    service_types: list[Literal["Local", "Outstation", "One-way", "Round trip"]] = Field(min_length=1)
    operating_cities: str = Field(min_length=2, max_length=1200)
    available_routes: str = Field(min_length=2, max_length=1200)
    owner_is_driver: bool
    availability: str = Field(min_length=2, max_length=500)
    rate_basis: Literal["Per km", "Per trip"]
    rate_amount: float = Field(gt=0, le=1000000, allow_inf_nan=False)
    rc_details: str = Field(min_length=2, max_length=1000)
    insurance_valid_until: date
    permit_fitness_details: str = Field(min_length=2, max_length=1500)
    driving_licence_details: str = Field(default="", max_length=1000)
    accuracy_consent: bool
    contact_consent: bool
    website: str = Field(default="", max_length=200)
    form_started_at: int = Field(ge=0)

    @field_validator("owner_name", "city", "vehicle_model", "luggage_capacity", "availability", "rc_details", "permit_fitness_details")
    @classmethod
    def normalize_text(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if len(cleaned) < 2 or any(ord(character) < 32 for character in cleaned):
            raise ValueError("Enter valid text")
        return cleaned

    @field_validator("mobile_number", "whatsapp_number")
    @classmethod
    def validate_phone_number(cls, value: str) -> str:
        cleaned = value.strip()
        digits = re.sub(r"\D", "", cleaned)
        if not re.fullmatch(r"[0-9+() -]{10,20}", cleaned) or not 10 <= len(digits) <= 15:
            raise ValueError("Enter a valid phone number")
        return cleaned

    @field_validator("registration_number")
    @classmethod
    def normalize_registration_number(cls, value: str) -> str:
        cleaned = " ".join(value.upper().split())
        if len(cleaned) < 4 or any(ord(character) < 32 for character in cleaned):
            raise ValueError("Enter a valid registration number")
        return cleaned

    @field_validator("operating_cities", "available_routes")
    @classmethod
    def normalize_multiline_text(cls, value: str) -> str:
        cleaned = "\n".join(line.strip() for line in value.splitlines() if line.strip())
        if len(cleaned) < 2 or any(ord(character) < 32 and character not in "\n\t" for character in cleaned):
            raise ValueError("Enter valid service locations")
        return cleaned

    @field_validator("driving_licence_details")
    @classmethod
    def normalize_driving_licence(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if any(ord(character) < 32 for character in cleaned):
            raise ValueError("Enter valid driving licence details")
        return cleaned

    @field_validator("accuracy_consent", "contact_consent")
    @classmethod
    def require_consent(cls, value: bool) -> bool:
        if not value:
            raise ValueError("Both consent checkboxes must be selected")
        return value

    @model_validator(mode="after")
    def require_driver_licence_when_applicable(self) -> "CabPartnerRegistration":
        if self.owner_is_driver and len(self.driving_licence_details.strip()) < 2:
            raise ValueError("Driving licence details are required when the owner is also the driver")
        return self


enquiry_attempts: dict[str, list[float]] = {}
review_attempts: dict[str, list[float]] = {}
cab_registration_attempts: dict[str, list[float]] = {}
cab_registration_ids: dict[str, float] = {}
cab_registration_lock = threading.Lock()


def review_to_dict(review: WebsiteReview) -> dict[str, object]:
    created_at = review.created_at
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    return {
        "id": review.id,
        "name": review.name,
        "rating": review.rating,
        "message": review.message,
        "created_at": created_at.isoformat(),
    }


@app.get("/api/reviews")
def list_reviews():
    with SessionLocal() as db:
        return [
            review_to_dict(review)
            for review in db.query(WebsiteReview).order_by(WebsiteReview.created_at.desc()).all()
        ]


@app.post("/api/reviews", status_code=201)
def submit_review(review: ReviewSubmission, request: Request):
    if review.website.strip():
        return {"success": True}

    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    recent_attempts = [
        attempt for attempt in review_attempts.get(client_ip, [])
        if now - attempt < 900
    ]
    if len(recent_attempts) >= 5:
        raise HTTPException(status_code=429, detail="Please wait before submitting another review.")
    recent_attempts.append(now)
    review_attempts[client_ip] = recent_attempts

    with SessionLocal() as db:
        saved_review = WebsiteReview(
            name=review.name,
            rating=review.rating,
            message=review.message,
        )
        db.add(saved_review)
        try:
            db.commit()
        except SQLAlchemyError as error:
            db.rollback()
            raise HTTPException(status_code=503, detail="We could not save your review. Please try again.") from error
        db.refresh(saved_review)
        return {"success": True, "review": review_to_dict(saved_review)}


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


def send_cab_partner_registration_email(
    registration: CabPartnerRegistration,
    photo_data: bytes | None,
    photo_subtype: str | None,
) -> None:
    smtp_host = os.getenv("SMTP_HOST", "").strip()
    smtp_username = os.getenv("SMTP_USERNAME", "").strip()
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    if not smtp_host or not smtp_username or not smtp_password:
        raise HTTPException(status_code=503, detail="Registration email is not configured yet. Please contact Ramnagri Tourism.")

    try:
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
    except ValueError as error:
        raise HTTPException(status_code=503, detail="Registration email is not configured yet.") from error

    recipient = os.getenv("ENQUIRY_TO_EMAIL", "ayodhyaramnagritourism@gmail.com").strip()
    sender = os.getenv("SMTP_FROM_EMAIL", smtp_username).strip()
    india_timezone = timezone(timedelta(hours=5, minutes=30), "IST")
    submitted_at = datetime.now(timezone.utc).astimezone(india_timezone).strftime("%Y-%m-%d %H:%M:%S %Z")
    message = EmailMessage()
    message["Subject"] = f"New Cab Partner Registration: {registration.owner_name}"
    message["From"] = sender
    message["To"] = recipient
    if registration.email:
        message["Reply-To"] = str(registration.email)

    message.set_content(
        "New cab partner registration — pending manual review\n\n"
        f"Submitted: {submitted_at}\n\n"
        "OWNER CONTACT\n"
        f"Name: {registration.owner_name}\n"
        f"Mobile: {registration.mobile_number}\n"
        f"WhatsApp: {registration.whatsapp_number}\n"
        f"Email: {registration.email or 'Not provided'}\n"
        f"City: {registration.city}\n\n"
        "VEHICLE\n"
        f"Type: {registration.vehicle_type}\n"
        f"Brand and model: {registration.vehicle_model}\n"
        f"Registration number: {registration.registration_number}\n"
        f"Manufacturing year: {registration.manufacturing_year}\n"
        f"Passenger capacity (excluding driver): {registration.passenger_capacity}\n"
        f"Air conditioning: {registration.air_conditioning}\n"
        f"Luggage capacity: {registration.luggage_capacity}\n"
        f"Photo attached: {'Yes' if photo_data else 'No'}\n\n"
        "SERVICES\n"
        f"Services: {', '.join(registration.service_types)}\n"
        f"Operating cities:\n{registration.operating_cities}\n"
        f"Available routes:\n{registration.available_routes}\n"
        f"Owner is also the driver: {'Yes' if registration.owner_is_driver else 'No'}\n"
        f"Availability: {registration.availability}\n"
        f"Approximate rate: INR {registration.rate_amount:,.2f} {registration.rate_basis}\n\n"
        "VERIFICATION DETAILS — NOT YET VERIFIED\n"
        f"RC details: {registration.rc_details}\n"
        f"Insurance valid until: {registration.insurance_valid_until.isoformat()}\n"
        f"Permit and fitness certificate details: {registration.permit_fitness_details}\n"
        f"Driving licence details: {registration.driving_licence_details or 'Not applicable'}\n\n"
        "Consents: Accuracy confirmed; contact consent granted.\n"
        "Review this request before approving or listing any vehicle."
    )
    if photo_data and photo_subtype:
        message.add_attachment(
            photo_data,
            maintype="image",
            subtype=photo_subtype,
            filename=f"cab-partner-vehicle.{photo_subtype}",
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
        raise HTTPException(
            status_code=502,
            detail="We could not email your registration. Your information was not listed; please try again or contact us.",
        ) from error


def registration_boolean(value: object, field_name: str) -> bool:
    normalized = str(value).strip().lower()
    if normalized in {"true", "1", "on", "yes"}:
        return True
    if normalized in {"false", "0", "off", "no"}:
        return False
    raise HTTPException(status_code=422, detail=f"Please provide a valid value for {field_name}.")


@app.post("/api/cab-partners/registrations", status_code=201)
async def submit_cab_partner_registration(request: Request):
    content_length = request.headers.get("content-length")
    if content_length and content_length.isdigit() and int(content_length) > 6 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="The registration is too large. Vehicle photos must be 5 MB or smaller.")

    form = await request.form()
    if str(form.get("website", "")).strip():
        raise HTTPException(status_code=400, detail="Please review the registration form and try again.")

    started_at = form.get("form_started_at")
    if not isinstance(started_at, str) or not started_at.isdigit():
        raise HTTPException(status_code=400, detail="Please review the registration form and try again.")
    elapsed_seconds = time.time() - (int(started_at) / 1000)
    if elapsed_seconds < 2 or elapsed_seconds > 7200:
        raise HTTPException(status_code=400, detail="Please review the registration form and try again.")

    payload = {
        key: form.get(key)
        for key in (
            "submission_id", "owner_name", "mobile_number", "whatsapp_number", "email", "city",
            "vehicle_type", "vehicle_model", "registration_number", "manufacturing_year",
            "passenger_capacity", "air_conditioning", "luggage_capacity", "operating_cities",
            "available_routes", "owner_is_driver", "availability", "rate_basis", "rate_amount",
            "rc_details", "insurance_valid_until", "permit_fitness_details", "driving_licence_details",
            "accuracy_consent", "contact_consent", "website", "form_started_at",
        )
    }
    payload["service_types"] = form.getlist("service_types")
    for boolean_key in ("owner_is_driver", "accuracy_consent", "contact_consent"):
        payload[boolean_key] = registration_boolean(payload[boolean_key], boolean_key)
    if payload.get("email") == "":
        payload["email"] = None

    try:
        registration = CabPartnerRegistration.model_validate(payload)
    except ValidationError as error:
        raise HTTPException(
            status_code=422,
            detail="Some registration details are missing or invalid. Please check the form and try again.",
        ) from error

    photo = form.get("vehicle_photo")
    photo_data = None
    photo_subtype = None
    if photo and getattr(photo, "filename", ""):
        if not hasattr(photo, "read"):
            raise HTTPException(status_code=400, detail="Please upload a valid vehicle photo.")
        photo_data = await photo.read(5 * 1024 * 1024 + 1)
        await photo.close()
        if len(photo_data) > 5 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Vehicle photos must be 5 MB or smaller.")
        detected_types = (
            (b"\xff\xd8\xff", "jpeg"),
            (b"\x89PNG\r\n\x1a\n", "png"),
            (b"RIFF", "webp"),
        )
        photo_subtype = next((subtype for signature, subtype in detected_types if photo_data.startswith(signature)), None)
        if photo_subtype == "webp" and photo_data[8:12] != b"WEBP":
            photo_subtype = None
        if not photo_subtype:
            raise HTTPException(status_code=400, detail="Upload a valid JPEG, PNG, or WebP vehicle photo.")

    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    with cab_registration_lock:
        cab_registration_ids.update({
            key: timestamp for key, timestamp in cab_registration_ids.items()
            if now - timestamp < 86400
        })
        if str(registration.submission_id) in cab_registration_ids:
            raise HTTPException(
                status_code=409,
                detail="This registration was already submitted. Please contact us if you need to check its status.",
            )
        recent_attempts = [
            attempt for attempt in cab_registration_attempts.get(client_ip, [])
            if now - attempt < 900
        ]
        if len(recent_attempts) >= 3:
            raise HTTPException(status_code=429, detail="Please wait before submitting another registration.")
        recent_attempts.append(now)
        cab_registration_attempts[client_ip] = recent_attempts
        cab_registration_ids[str(registration.submission_id)] = now

    try:
        await asyncio.to_thread(send_cab_partner_registration_email, registration, photo_data, photo_subtype)
    except HTTPException:
        with cab_registration_lock:
            cab_registration_ids.pop(str(registration.submission_id), None)
        raise

    return {
        "success": True,
        "message": "Your cab partner registration was emailed for manual review. Your vehicle has not been listed or verified.",
    }
