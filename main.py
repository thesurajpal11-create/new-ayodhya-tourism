import os
import secrets
from typing import Optional
from datetime import datetime, timedelta

from fastapi import FastAPI, APIRouter, Depends, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from pydantic import BaseModel, Field
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from database import engine, get_db, Base, SessionLocal
from app.models.user import User
from app.models.destination import Destination
from app.models.booking import Booking
from app.models.service import Service
from app.models.partner_application import PartnerApplication
from app.models.local_guide import LocalGuide
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.schemas.destination import DestinationCreate, DestinationResponse
from app.schemas.booking import BookingCreate, BookingResponse
from app.schemas.service import ServiceCreate, ServiceResponse

# Create tables
Base.metadata.create_all(bind=engine)


def ensure_database_schema() -> None:
    with SessionLocal() as db:
        inspector = inspect(db.bind)
        user_columns = {column["name"] for column in inspector.get_columns("users")}
        if "role" not in user_columns:
            db.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'customer'"))
        if "is_admin" not in user_columns:
            db.execute(text("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0"))
        if "is_active" not in user_columns:
            db.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1"))
        if "username" not in user_columns:
            db.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR(100)"))

        service_columns = {column["name"] for column in inspector.get_columns("services")}
        if "partner_price" not in service_columns:
            db.execute(text("ALTER TABLE services ADD COLUMN partner_price FLOAT"))
        if "owner_user_id" not in service_columns:
            db.execute(text("ALTER TABLE services ADD COLUMN owner_user_id INTEGER"))

        db.commit()


pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def seed_catalog_data(db: Session) -> None:
    """Populate a small catalog when the database is empty so pages remain functional."""
    destination_count = db.query(Destination).count()
    if destination_count == 0:
        default_destinations = [
            ("Ayodhya", "The sacred city of Lord Rama with temples, ghats, and spiritual heritage.", "Historic pilgrimage city with temples and river ghats.", "../images/ayodhya.jpg", "Best from October to March"),
            ("Varanasi", "The spiritual heart of India with Ganga aarti and temple circuits.", "Holy city known for ghats and evening aarti.", "../images/varanasi.jpg", "Best from October to March"),
            ("Chitrakoot", "A serene pilgrimage destination connected to the Ramayana.", "Peaceful spiritual destination with riverfront and temples.", "../images/chitrakoot.jpg", "Best from October to March"),
        ]
        for name, description, short_description, image_url, best_time in default_destinations:
            db.add(Destination(
                name=name,
                description=description,
                short_description=short_description,
                image_url=image_url,
                best_time_to_visit=best_time,
            ))
        db.commit()

    admin_user = db.query(User).filter(User.is_admin == True).first()
    if not admin_user:
        db.add(User(
            name="Admin",
            email="admin@ramnagari.com",
            password=hash_password("admin123"),
            phone="9999999999",
            role="admin",
            is_admin=True,
            is_active=True,
            username="admin",
        ))
        db.commit()

    service_count = db.query(Service).count()
    if service_count == 0:
        destinations = db.query(Destination).all()
        if destinations:
            hotel_seed_data = [
                (destinations[0].id, "Hotel", "Budget", "Comfort Stay Ayodhya", "Affordable stay near temple routes.", 1800, "per night", "../images/ayodhya.jpg", "Near temple route"),
                (destinations[0].id, "Hotel", "3 Star", "Rama Heritage Hotel", "Premium stay with breakfast and pickup.", 3200, "per night", "../images/ayodhya.jpg", "Near Ram Mandir"),
                (destinations[1].id if len(destinations) > 1 else destinations[0].id, "Hotel", "4 Star", "Ganga View Stay", "Comfortable riverside hotel in Varanasi.", 4800, "per night", "../images/varanasi.jpg", "Near Ganga ghat"),
            ]
            for destination_id, service_type, category, name, description, price, unit, image_url, contact_info in hotel_seed_data:
                db.add(Service(
                    destination_id=destination_id,
                    service_type=service_type,
                    category=category,
                    name=name,
                    description=description,
                    price_per_unit=price,
                    unit=unit,
                    image_url=image_url,
                    contact_info=contact_info,
                ))
            db.commit()


# Initialize FastAPI
app = FastAPI(title="Ayodhya Ramnagari Tourism API", version="1.0.0")

ensure_database_schema()
with SessionLocal() as session:
    seed_catalog_data(session)

# CORS configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
if allowed_origins.strip() == "*":
    origins = ["*"]
else:
    origins = [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Token storage (In production, use JWT)
tokens_store = {}
ALLOWED_ROLES = {"customer", "hotel_partner", "admin"}

class LocalGuideCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=10, max_length=20)
    languages: Optional[str] = Field(default="Hindi, English", max_length=200)
    specialties: Optional[str] = Field(default="Food, Ram Mandir crowd, Parking", max_length=1000)
    is_online: bool = False

class LocalGuideUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=100)
    phone: Optional[str] = Field(default=None, min_length=10, max_length=20)
    languages: Optional[str] = Field(default=None, max_length=200)
    specialties: Optional[str] = Field(default=None, max_length=1000)
    is_online: Optional[bool] = None
    is_active: Optional[bool] = None

def generate_token() -> str:
    return secrets.token_urlsafe(32)

def normalize_role(role: Optional[str]) -> str:
    if not role:
        return "customer"
    normalized = role.strip().lower()
    if normalized not in ALLOWED_ROLES:
        raise HTTPException(status_code=400, detail="Invalid role")
    return normalized

def build_pricing(price_value: float) -> dict:
    public_price = round(float(price_value or 0), 2)
    partner_price = round(public_price * 0.95, 2)
    return {"public_price": public_price, "partner_price": partner_price}

def get_role_from_token(authorization: Optional[str] = Header(None)) -> Optional[dict]:
    if not authorization:
        return None
    if not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ", 1)[1].strip()
    if not token or token not in tokens_store:
        raise HTTPException(status_code=401, detail="Invalid token")

    return tokens_store[token]

# ==================== AUTH ROUTES ====================
auth_router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@auth_router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    requested_role = normalize_role(getattr(user, "role", None))
    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password),
        phone=user.phone,
        role=requested_role,
        is_admin=requested_role == "admin"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "user_id": new_user.id,
        "role": new_user.role,
        "is_admin": new_user.is_admin,
    }

@auth_router.post("/login")
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return token"""
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    requested_role = normalize_role(getattr(credentials, "role", None))
    if user.is_admin:
        effective_role = "admin"
    elif requested_role in {"customer", "hotel_partner"}:
        if user.role and user.role != requested_role:
            raise HTTPException(status_code=403, detail="Role mismatch")
        effective_role = requested_role
    else:
        effective_role = user.role or "customer"

    token = generate_token()
    tokens_store[token] = {"user_id": user.id, "email": user.email, "role": effective_role}

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": effective_role,
            "is_admin": user.is_admin
        }
    }

# ==================== DESTINATION ROUTES ====================
destination_router = APIRouter(prefix="/api/destinations", tags=["Destinations"])

@destination_router.get("/")
def get_destinations(db: Session = Depends(get_db)):
    """Get all destinations"""
    destinations = db.query(Destination).all()
    return destinations

@destination_router.get("/{destination_id}")
def get_destination(destination_id: int, db: Session = Depends(get_db)):
    """Get specific destination"""
    destination = db.query(Destination).filter(Destination.id == destination_id).first()
    if not destination:
        raise HTTPException(status_code=404, detail="Destination not found")
    return destination

@destination_router.post("/")
def create_destination(destination: DestinationCreate, db: Session = Depends(get_db)):
    """Create new destination (Admin only)"""
    new_destination = Destination(
        name=destination.name,
        description=destination.description,
        short_description=destination.short_description,
        image_url=destination.image_url,
        best_time_to_visit=destination.best_time_to_visit
    )
    db.add(new_destination)
    db.commit()
    db.refresh(new_destination)
    return new_destination

# ==================== BOOKING ROUTES ====================
booking_router = APIRouter(prefix="/api/bookings", tags=["Bookings"])

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify authorization token"""
    token = credentials.credentials
    if token not in tokens_store:
        raise HTTPException(status_code=401, detail="Invalid token")
    return tokens_store[token]

@booking_router.post("/")
def create_booking(booking: BookingCreate, user_info = Depends(verify_token), db: Session = Depends(get_db)):
    """Create a new booking"""
    user_id = user_info["user_id"]
    
    new_booking = Booking(
        user_id=user_id,
        destination_id=booking.destination_id,
        service_type=booking.service_type,
        service_details=booking.service_details,
        check_in_date=booking.check_in_date,
        check_out_date=booking.check_out_date,
        number_of_people=booking.number_of_people,
        total_price=booking.total_price
    )
    db.add(new_booking)
    db.commit()
    db.refresh(new_booking)
    return new_booking

@booking_router.get("/")
def get_user_bookings(user_info = Depends(verify_token), db: Session = Depends(get_db)):
    """Get user's bookings"""
    user_id = user_info["user_id"]
    bookings = db.query(Booking).filter(Booking.user_id == user_id).all()
    return bookings

@booking_router.get("/{booking_id}")
def get_booking(booking_id: int, user_info = Depends(verify_token), db: Session = Depends(get_db)):
    """Get specific booking"""
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != user_info["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return booking

# ==================== SERVICE ROUTES ====================
service_router = APIRouter(prefix="/api/services", tags=["Services"])

@service_router.get("/destination/{destination_id}")
def get_destination_services(destination_id: int, db: Session = Depends(get_db)):
    """Get services for a destination"""
    services = db.query(Service).filter(Service.destination_id == destination_id).all()
    response = []
    for service in services:
        pricing = build_pricing(service.price_per_unit)
        response.append({
            **service.__dict__,
            "public_price": pricing["public_price"],
            "partner_price": pricing["partner_price"],
        })
    return response

@service_router.post("/")
def create_service(service: ServiceCreate, db: Session = Depends(get_db)):
    """Create new service"""
    new_service = Service(
        destination_id=service.destination_id,
        service_type=service.service_type,
        category=service.category,
        name=service.name,
        description=service.description,
        price_per_unit=service.price_per_unit,
        unit=service.unit,
        image_url=service.image_url,
        contact_info=service.contact_info
    )
    db.add(new_service)
    db.commit()
    db.refresh(new_service)
    return new_service

catalog_router = APIRouter(prefix="/api/catalog", tags=["Catalog"])

@catalog_router.get("/destinations")
def get_catalog_destinations(db: Session = Depends(get_db)):
    """Return a lightweight destination list for the hotel browsing page."""
    destinations = db.query(Destination).all()
    return [{"id": destination.id, "name": destination.name} for destination in destinations]

@catalog_router.get("/hotel-options")
def get_catalog_hotel_options(destination_id: int, category: Optional[str] = None, authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Return hotel options with price visibility based on the authenticated role."""
    auth_context = get_role_from_token(authorization) if authorization else None
    role = auth_context["role"] if auth_context else "customer"

    query = db.query(Service).filter(Service.service_type == "hotel")
    if destination_id:
        query = query.filter(Service.destination_id == destination_id)
    if category:
        query = query.filter(Service.category == category)

    services = query.all()
    options = []
    for service in services:
        pricing = build_pricing(service.price_per_unit)
        price_value = pricing["partner_price"] if role == "hotel_partner" else pricing["public_price"]
        options.append({
            "id": service.id,
            "display_name": service.name,
            "category": service.category or "Budget",
            "selling_price_per_room": price_value,
            "public_price": pricing["public_price"],
            "partner_price": pricing["partner_price"],
            "rooms_available": 10 + (service.id % 8),
            "distance_from_tour_km": round(1 + (service.id % 5) * 0.4, 1),
            "nearby_place": service.contact_info or "Tour centre",
            "amenities": ["AC Room", "Free WiFi", "Breakfast"],
            "check_in_time": "12:00 PM",
            "check_out_time": "11:00 AM",
            "image_url": service.image_url,
        })

    return options

# ==================== ADMIN ROUTES ====================
admin_router = APIRouter(prefix="/api/admin", tags=["Admin"])

def require_admin_user(user_info = Depends(verify_token), db: Session = Depends(get_db)) -> User:
    user = db.query(User).filter(User.id == user_info["user_id"]).first()
    if not user or not user.is_admin or not user.is_active:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

@admin_router.get("/bookings")
def get_all_bookings(user_info = Depends(verify_token), db: Session = Depends(get_db)):
    """Get all bookings (Admin only)"""
    user = db.query(User).filter(User.id == user_info["user_id"]).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    bookings = db.query(Booking).all()
    return bookings

@admin_router.put("/bookings/{booking_id}/status")
def update_booking_status(booking_id: int, status: str, user_info = Depends(verify_token), db: Session = Depends(get_db)):
    """Update booking status (Admin only)"""
    user = db.query(User).filter(User.id == user_info["user_id"]).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking.status = status
    booking.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(booking)
    return booking

@admin_router.get("/local-guides")
def list_local_guides(admin_user: User = Depends(require_admin_user), db: Session = Depends(get_db)):
    return db.query(LocalGuide).order_by(LocalGuide.created_at.desc()).all()

@admin_router.post("/local-guides")
def create_local_guide(payload: LocalGuideCreate, admin_user: User = Depends(require_admin_user), db: Session = Depends(get_db)):
    guide = LocalGuide(
        name=payload.name.strip(),
        phone=payload.phone.strip(),
        languages=(payload.languages or "").strip(),
        specialties=(payload.specialties or "").strip(),
        is_verified=True,
        is_online=payload.is_online,
        is_active=True,
    )
    db.add(guide)
    db.commit()
    db.refresh(guide)
    return guide

@admin_router.put("/local-guides/{guide_id}")
def update_local_guide(guide_id: int, payload: LocalGuideUpdate, admin_user: User = Depends(require_admin_user), db: Session = Depends(get_db)):
    guide = db.query(LocalGuide).filter(LocalGuide.id == guide_id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        if isinstance(value, str):
            value = value.strip()
        setattr(guide, field, value)
    db.commit()
    db.refresh(guide)
    return guide

@admin_router.delete("/local-guides/{guide_id}")
def disable_local_guide(guide_id: int, admin_user: User = Depends(require_admin_user), db: Session = Depends(get_db)):
    guide = db.query(LocalGuide).filter(LocalGuide.id == guide_id).first()
    if not guide:
        raise HTTPException(status_code=404, detail="Guide not found")
    guide.is_active = False
    guide.is_online = False
    db.commit()
    return {"message": "Guide disabled"}

local_guides_router = APIRouter(prefix="/api/local-guides", tags=["Local Guides"])

@local_guides_router.get("/online")
def get_online_local_guides(db: Session = Depends(get_db)):
    guides = db.query(LocalGuide).filter(
        LocalGuide.is_active == True,
        LocalGuide.is_verified == True,
        LocalGuide.is_online == True,
    ).order_by(LocalGuide.created_at.desc()).all()
    return [{
        "id": guide.id,
        "name": guide.name,
        "phone": guide.phone,
        "languages": guide.languages,
        "specialties": guide.specialties,
    } for guide in guides]

from app.routes.partner_management import router as partner_management_router

# Include routers
app.include_router(auth_router)
app.include_router(destination_router)
app.include_router(booking_router)
app.include_router(service_router)
app.include_router(catalog_router)
app.include_router(admin_router)
app.include_router(local_guides_router)
app.include_router(partner_management_router)

# Root endpoint
@app.get("/")
def read_root():
    return {
        "message": "Welcome to Ayodhya Ramnagari Tourism API",
        "version": "1.0.0",
        "endpoints": {
            "auth": "/api/auth",
            "destinations": "/api/destinations",
            "bookings": "/api/bookings",
            "services": "/api/services",
            "admin": "/api/admin"
        }
    }

@app.get("/api/")
def api_root():
    return {
        "message": "Ayodhya Ramnagari Tourism API",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
