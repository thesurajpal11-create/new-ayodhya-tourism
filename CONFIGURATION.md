# Configuration Guide - Ayodhya Ramnagari Tourism

## Database Configuration

### MySQL Setup

1. **Install MySQL Server**
   - Windows: https://dev.mysql.com/downloads/mysql/
   - Mac: `brew install mysql`
   - Linux (Ubuntu): `sudo apt-get install mysql-server`

2. **Start MySQL Service**
   ```bash
   # Windows (SQL Server running as service)
   # Mac: brew services start mysql
   # Linux: sudo systemctl start mysql
   ```

3. **Create Database**
   ```bash
   mysql -u root -p
   ```
   ```sql
   CREATE DATABASE ayodhya_tourism CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   EXIT;
   ```

### Configure Backend Connection

File: `backend/database.py`

```python
# Change this line with your credentials:
DATABASE_URL = "mysql+mysqlconnector://USERNAME:PASSWORD@HOSTNAME:PORT/DATABASE_NAME"

# Example:
DATABASE_URL = "mysql+mysqlconnector://root:mypassword@localhost:3306/ayodhya_tourism"
```

**Parameters:**
- `USERNAME`: MySQL username (default: root)
- `PASSWORD`: MySQL password
- `HOSTNAME`: Server address (default: localhost)
- `PORT`: MySQL port (default: 3306)
- `DATABASE_NAME`: Database name (ayodhya_tourism)

## API Configuration

### Backend Settings

File: `backend/main.py`

```python
# Change host and port if needed
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",      # Listen on all interfaces
        port=8000,           # Change if port is in use
        reload=True          # Auto-reload on code changes
    )
```

### API Base URL

File: `frontend/js/main.js`

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
// Change to match your backend:
// const API_BASE_URL = 'http://192.168.1.100:8000/api';  // Network
// const API_BASE_URL = 'http://yourdomain.com/api';       // Production
```

## Frontend Configuration

### Website Title & Branding

File: `frontend/index.html` (and other pages)

```html
<title>Ayodhya Ramnagari - Tourism & Travel</title>
<!-- Change above to customize browser tab title -->
```

### Colors Customization

File: `frontend/css/style.css`

```css
:root {
    --primary-color: #d4a574;      /* Main gold */
    --secondary-color: #8b4513;    /* Brown */
    --accent-color: #daa520;       /* Golden yellow */
    --text-color: #333;            /* Dark gray */
    --light-bg: #f5f5f5;           /* Light gray bg */
    --white: #ffffff;              /* White */
}
```

### Contact Information

File: `frontend/pages/contact.html`

```html
<!-- Update these with your details: -->
<p><a href="tel:+917607745628">7607745628</a></p>
<p><a href="https://wa.me/917607745628" target="_blank">Chat on WhatsApp</a></p>
<p><a href="mailto:info@ayodhyaramnagari.com">info@ayodhyaramnagari.com</a></p>
<p><a href="https://www.instagram.com/ayodhyaramnagari" target="_blank">@ayodhyaramnagari</a></p>
<p><a href="https://www.youtube.com/@AR_Tourism" target="_blank">Channel Link</a></p>
```

Also update in `frontend/index.html` footer section.

## Destinations Configuration

### Add New Destination

#### Method 1: Through Admin Panel
1. Login as admin
2. Go to Admin Panel
3. Click "Destinations" → "Add New Destination"
4. Fill details and submit

#### Method 2: Direct Database
```sql
INSERT INTO destinations (name, description, short_description, image_url, best_time_to_visit, rating, reviews_count)
VALUES (
    'Destination Name',
    'Full description...',
    'Short description...',
    '/images/destination.jpg',
    'Best season',
    4.5,
    100
);
```

#### Method 3: Using API
```bash
curl -X POST http://localhost:8000/api/destinations \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Destination",
    "description": "Full description",
    "short_description": "Short desc",
    "image_url": "/images/destination.jpg",
    "best_time_to_visit": "October to March"
  }'
```

## Services Configuration

### Add Services for Destinations

#### Method 1: Admin Panel
1. Go to Admin Panel
2. Click "Services" → "Add New Service"
3. Select destination, type, and details

#### Method 2: Database
```sql
INSERT INTO services (destination_id, service_type, name, description, price_per_unit, unit, contact_info)
VALUES (
    1,                          -- Destination ID
    'hotel',                    -- Type: hotel, tour, transportation, package, restaurant
    'Hotel Name',               
    'Description',
    5000,                       -- Price
    'per night',                -- Unit
    '7607745628'           -- Contact
);
```

## Security Configuration

### For Production Deployment

1. **Change Secret Key** (`backend/main.py`)
   ```python
   # Replace simple token with JWT
   from jose import JWTError, jwt
   SECRET_KEY = "your-secret-key-here-change-this"
   ```

2. **Enable CORS Properly**
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://yourdomain.com"],  # Specific domains only
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. **Use Environment Variables**
   - Don't hardcode credentials
   - Use .env file:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=secure_password
     SECRET_KEY=your_secret_key
     ```

4. **Enable HTTPS**
   - Use SSL certificates
   - Configure in deployment setup

## Email Configuration (Future)

To add email notifications:

File: Create `backend/email.py`

```python
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

conf = ConnectionConfig(
    mail_username = "your_email@gmail.com",
    mail_password = "your_app_password",
    mail_from = "noreply@ayodhyaramnagari.com",
    mail_port = 587,
    mail_server = "smtp.gmail.com",
    mail_tls = True,
    mail_ssl = False,
)

async def send_confirmation_email(email: str, booking_id: int):
    message = MessageSchema(
        subject="Booking Confirmation",
        recipients=[email],
        body=f"Your booking #{booking_id} has been confirmed!",
        subtype="html",
    )
    fm = FastMail(conf)
    await fm.send_message(message)
```

## Payment Gateway Configuration (Future)

### Razorpay Integration

1. Create Razorpay account: https://razorpay.com
2. Get API keys
3. Add to environment variables
4. Install: `pip install razorpay`

```python
# backend/payment.py
import razorpay

client = razorpay.Client(
    auth=("YOUR_KEY_ID", "YOUR_KEY_SECRET")
)

def create_payment(amount, booking_id):
    payment = client.order.create(
        data={
            "amount": amount * 100,  # Amount in paise
            "currency": "INR",
            "receipt": str(booking_id),
        }
    )
    return payment
```

## Logging Configuration

File: Create `backend/logging_config.py`

```python
import logging
import logging.handlers

# Create logger
logger = logging.getLogger("ayodhya_tourism")
logger.setLevel(logging.INFO)

# File handler
fh = logging.handlers.RotatingFileHandler(
    "logs/app.log",
    maxBytes=10485760,  # 10MB
    backupCount=5
)

formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
fh.setFormatter(formatter)
logger.addHandler(fh)
```

## Performance Configuration

### Database Optimization

```sql
-- Add indexes for faster queries
CREATE INDEX idx_destination_id ON bookings(destination_id);
CREATE INDEX idx_user_id ON bookings(user_id);
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_destination_name ON destinations(name);
```

### API Rate Limiting

Add to `backend/main.py`:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/auth/login")
@limiter.limit("5/minute")
def login(request: Request, credentials: UserLogin, db: Session = Depends(get_db)):
    # Login endpoint limited to 5 requests per minute
    pass
```

## Backup Configuration

### Automated MySQL Backups

```bash
# backup.sh (Linux/Mac)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p ayodhya_tourism > backups/ayodhya_tourism_$DATE.sql

# Schedule with cron (every day at 2 AM)
# 0 2 * * * /path/to/backup.sh
```

```
REM backup.bat (Windows)
FOR /f "tokens=2-4 delims=/ " %%a IN ('date /t') DO (set mydate=%%c%%a%%b)
FOR /f "tokens=1-2 delims=/:" %%a IN ('time /t') DO (set mytime=%%a%%b)
mysqldump -u root -p ayodhya_tourism > backups\ayodhya_tourism_%mydate%_%mytime%.sql
```

---

**All configuration is optional. Default settings work for local development!**
