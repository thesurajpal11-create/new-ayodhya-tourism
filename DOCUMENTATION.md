# Project Documentation - Ayodhya Ramnagari Tourism

## 📁 Complete Project Structure

```
tour/
│
├── README.md                 # Main documentation
├── QUICKSTART.md            # Quick start guide
├── CONFIGURATION.md          # Configuration guide
├── DEPLOYMENT.md            # Deployment instructions
├── .env.example             # Environment variables template
├── setup.bat                # Setup script for Windows
├── setup.sh                 # Setup script for Linux/Mac
│
├── backend/                 # FastAPI Backend
│   ├── main.py             # FastAPI application entry point
│   ├── database.py         # Database connection setup
│   ├── requirements.txt     # Python dependencies
│   ├── seed_data.py        # Sample data script
│   │
│   └── app/
│       ├── __init__.py
│       │
│       ├── models/         # SQLAlchemy models (Database tables)
│       │   ├── __init__.py
│       │   ├── user.py     # User model
│       │   ├── destination.py     # Destination model
│       │   ├── booking.py         # Booking model
│       │   └── service.py         # Service model
│       │
│       ├── schemas/        # Pydantic schemas (Request/Response validation)
│       │   ├── __init__.py
│       │   ├── user.py
│       │   ├── destination.py
│       │   ├── booking.py
│       │   └── service.py
│       │
│       └── routes/         # API route handlers (Currently integrated in main.py)
│           ├── __init__.py
│           ├── auth.py     # Authentication routes
│           ├── destinations.py     # Destination routes
│           ├── bookings.py         # Booking routes
│           └── admin.py     # Admin routes
│
└── frontend/               # HTML/CSS/JavaScript Frontend
    ├── index.html          # Homepage
    │
    ├── pages/              # Individual pages
    │   ├── destinations.html       # All destinations
    │   ├── destination-detail.html # Individual destination
    │   ├── login.html              # Login page
    │   ├── signup.html             # Sign up page
    │   ├── bookings.html           # Bookings page
    │   ├── contact.html            # Contact page
    │   ├── profile.html            # User profile
    │   └── admin.html              # Admin dashboard
    │
    ├── css/
    │   └── style.css       # All styling (responsive)
    │
    ├── js/                 # JavaScript files
    │   ├── main.js         # Main utility functions, auth check
    │   ├── auth.js         # Login/Signup logic
    │   ├── bookings.js     # Booking system logic
    │   ├── destinations.js # Destinations page logic
    │   ├── destination-detail.js   # Destination detail logic
    │   └── admin.js        # Admin dashboard logic
    │
    └── images/            # Destination images folder
        └── (placeholder for images)
```

## 🔌 API Endpoints Reference

### Base URL
```
http://localhost:8000
```

### Authentication Endpoints

#### Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "7607745628"
}

Response: 
{
  "message": "User created successfully",
  "user_id": 1
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "access_token": "token_string_here",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "is_admin": false
  }
}
```

### Destination Endpoints

#### Get All Destinations
```
GET /api/destinations

Response:
[
  {
    "id": 1,
    "name": "Ayodhya",
    "description": "...",
    "short_description": "...",
    "image_url": null,
    "rating": 4.5,
    "reviews_count": 0,
    "best_time_to_visit": "October to March",
    "created_at": "2024-01-15T10:30:00"
  },
  ...
]
```

#### Get Specific Destination
```
GET /api/destinations/{destination_id}

Response: (Single destination object)
```

#### Create Destination (Admin)
```
POST /api/destinations
Authorization: Bearer token
Content-Type: application/json

{
  "name": "New Destination",
  "description": "Full description...",
  "short_description": "Short description",
  "image_url": "/images/destination.jpg",
  "best_time_to_visit": "October to March"
}
```

### Services Endpoints

#### Get Services for Destination
```
GET /api/services/destination/{destination_id}

Response:
[
  {
    "id": 1,
    "destination_id": 1,
    "service_type": "hotel",
    "name": "Hotel Name",
    "description": "Description",
    "price_per_unit": 5000,
    "unit": "per night",
    "image_url": null,
    "rating": 4.5,
    "contact_info": "7607745628",
    "created_at": "2024-01-15T10:30:00"
  },
  ...
]
```

#### Create Service (Admin)
```
POST /api/services
Authorization: Bearer token
Content-Type: application/json

{
  "destination_id": 1,
  "service_type": "hotel",
  "name": "Hotel Name",
  "description": "Description",
  "price_per_unit": 5000,
  "unit": "per night",
  "image_url": "/images/service.jpg",
  "contact_info": "7607745628"
}
```

### Booking Endpoints

#### Create Booking
```
POST /api/bookings
Authorization: Bearer token
Content-Type: application/json

{
  "destination_id": 1,
  "service_type": "hotel",
  "service_details": "Room with AC",
  "check_in_date": "2024-02-15T10:00:00",
  "check_out_date": "2024-02-20T10:00:00",
  "number_of_people": 4,
  "total_price": 25000
}

Response:
{
  "id": 1,
  "user_id": 1,
  "destination_id": 1,
  "service_type": "hotel",
  "service_details": "Room with AC",
  "check_in_date": "2024-02-15T10:00:00",
  "check_out_date": "2024-02-20T10:00:00",
  "number_of_people": 4,
  "total_price": 25000,
  "status": "pending",
  "created_at": "2024-01-15T10:30:00"
}
```

#### Get User Bookings
```
GET /api/bookings
Authorization: Bearer token

Response: (Array of booking objects)
```

#### Get Specific Booking
```
GET /api/bookings/{booking_id}
Authorization: Bearer token

Response: (Single booking object)
```

### Admin Endpoints

#### Get All Bookings
```
GET /api/admin/bookings
Authorization: Bearer token
(User must have is_admin = true)

Response: (Array of all bookings)
```

#### Update Booking Status
```
PUT /api/admin/bookings/{booking_id}/status
Authorization: Bearer token
Content-Type: application/json

{
  "status": "confirmed"
}

Note: Valid statuses are: pending, confirmed, completed, cancelled
```

## 📊 Database Models

### User Table
```
┌─────────────────┬──────────────┬────────────────┐
│ Column          │ Type         │ Constraints    │
├─────────────────┼──────────────┼────────────────┤
│ id              │ INT          │ PK, AI         │
│ name            │ VARCHAR(100) │ NOT NULL       │
│ email           │ VARCHAR(100) │ UNIQUE, NOT NULL
│ password        │ VARCHAR(255) │ NOT NULL       │
│ phone           │ VARCHAR(20)  │ NULLABLE       │
│ is_admin        │ BOOLEAN      │ DEFAULT false  │
│ created_at      │ DATETIME     │ DEFAULT NOW()  │
│ updated_at      │ DATETIME     │ DEFAULT NOW()  │
└─────────────────┴──────────────┴────────────────┘
```

### Destination Table
```
┌──────────────────────┬──────────────┬──────────┐
│ Column               │ Type         │ Constraints
├──────────────────────┼──────────────┼──────────┤
│ id                   │ INT          │ PK, AI
│ name                 │ VARCHAR(100) │ UNIQUE, NOT NULL
│ description          │ TEXT         │ NOT NULL
│ short_description    │ VARCHAR(255) │ NOT NULL
│ image_url            │ VARCHAR(500) │ NULLABLE
│ rating               │ FLOAT        │ DEFAULT 4.5
│ reviews_count        │ INT          │ DEFAULT 0
│ best_time_to_visit   │ VARCHAR(100) │ NULLABLE
│ created_at           │ DATETIME     │ DEFAULT NOW()
│ updated_at           │ DATETIME     │ DEFAULT NOW()
└──────────────────────┴──────────────┴──────────┘
```

### Booking Table
```
┌──────────────────┬──────────────┬──────────────────┐
│ Column           │ Type         │ Constraints      │
├──────────────────┼──────────────┼──────────────────┤
│ id               │ INT          │ PK, AI           │
│ user_id          │ INT          │ FK(users.id)     │
│ destination_id   │ INT          │ FK(destinations) │
│ service_type     │ VARCHAR(100) │ NOT NULL         │
│ service_details  │ TEXT         │ NULLABLE         │
│ check_in_date    │ DATETIME     │ NOT NULL         │
│ check_out_date   │ DATETIME     │ NOT NULL         │
│ number_of_people │ INT          │ DEFAULT 1        │
│ total_price      │ FLOAT        │ NOT NULL         │
│ status           │ ENUM         │ pending,confirmed│
│                  │              │ completed,cancel │
│ created_at       │ DATETIME     │ DEFAULT NOW()    │
│ updated_at       │ DATETIME     │ DEFAULT NOW()    │
└──────────────────┴──────────────┴──────────────────┘
```

### Service Table
```
┌─────────────────┬──────────────┬──────────────────┐
│ Column          │ Type         │ Constraints      │
├─────────────────┼──────────────┼──────────────────┤
│ id              │ INT          │ PK, AI           │
│ destination_id  │ INT          │ FK(destinations) │
│ service_type    │ VARCHAR(100) │ NOT NULL         │
│ name            │ VARCHAR(200) │ NOT NULL         │
│ description     │ TEXT         │ NOT NULL         │
│ price_per_unit  │ FLOAT        │ NOT NULL         │
│ unit            │ VARCHAR(50)  │ DEFAULT "per..."│
│ image_url       │ VARCHAR(500) │ NULLABLE         │
│ rating          │ FLOAT        │ DEFAULT 4.5      │
│ contact_info    │ VARCHAR(200) │ NULLABLE         │
│ created_at      │ DATETIME     │ DEFAULT NOW()    │
│ updated_at      │ DATETIME     │ DEFAULT NOW()    │
└─────────────────┴──────────────┴──────────────────┘
```

## 🎯 User Flows

### Booking Flow

```
User
  ↓
Browse Destinations
  ↓
Sign Up / Login
  ↓
Select Destination
  ↓
Choose Service & Dates
  ↓
Submit Booking
  ↓
Booking Created (Pending)
  ↓
Admin Confirms
  ↓
User Receives Confirmation
  ↓
Complete Tour
  ↓
Mark as Completed
```

### Admin Flow

```
Admin Login
  ↓
Admin Dashboard
  ↓
├─ View All Bookings
├─ Update Booking Status
├─ Manage Destinations
├─ Manage Services
└─ View Users
```

## 🔐 Security Features

1. **Password Hashing**: Bcrypt encryption for passwords
2. **Token Authentication**: Bearer token for API requests
3. **Database Constraints**: Foreign keys, unique constraints
4. **Input Validation**: Pydantic schemas validate all inputs
5. **Admin Verification**: Only admins can access admin endpoints

## 📱 Frontend Features

### Pages
- **Home**: Featured destinations, about section
- **All Destinations**: Browse all 5 destinations
- **Destination Detail**: Full information with services
- **Login/Signup**: User authentication
- **Bookings**: Create and manage bookings
- **Contact**: Contact information and form
- **Admin Dashboard**: Management interface

### Responsive Design
- Mobile-friendly (320px+)
- Tablet optimized
- Desktop full-featured
- Smooth animations
- Fast loading

## 🚀 Performance

- **Frontend**: Vanilla JavaScript (no framework overhead)
- **Backend**: FastAPI (high performance)
- **Database**: Indexed queries for speed
- **Caching**: HTML5 localStorage for auth tokens
- **Compression**: Minified CSS and JavaScript

## 📈 Future Enhancements

1. **YouTube Integration**: Video tours on destination pages
2. **Payment Gateway**: Online payment processing
3. **Email Notifications**: Booking confirmations
4. **User Reviews**: Rating and review system
5. **Advanced Search**: Filters and sorting
6. **Analytics Dashboard**: Booking trends and statistics
7. **Mobile App**: Native Android/iOS apps
8. **Multi-language**: Support for multiple languages
9. **Chat Support**: Live chat with customers
10. **Social Sharing**: Share bookings and destinations

---

**For more help, refer to QUICKSTART.md or CONFIGURATION.md**
