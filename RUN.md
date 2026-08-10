# 🚀 RUN THE WEBSITE NOW!

## Option 1: Windows (Easiest - Just Run 1 Command)

### Setup Backend (One Time)
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Start Backend
```powershell
cd backend
venv\Scripts\activate
python main.py
```

### Start Frontend (New PowerShell Window)
```powershell
cd frontend
python -m http.server 5500
```

### Open in Browser
```
http://localhost:5500
```

---

## Option 2: Simple Multi-Window Startup

### Terminal 1 - Backend
```bash
cd c:\Users\Dell\Desktop\tour\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

Wait for message: `INFO: Uvicorn running on http://0.0.0.0:8000`

### Terminal 2 - Frontend
```bash
cd c:\Users\Dell\Desktop\tour\frontend
python -m http.server 5500
```

Wait for message: `Serving HTTP on 0.0.0.0 port 5500`

### Browser
Open: **http://localhost:5500**

---

## 🎯 What You'll See

### Home Page
- Navigation bar with Ayodhya Ramnagari Branding
- Welcome hero section
- 5 Featured Destinations
- About Us section
- Footer with contact info

### Website Features to Test

1. **Sign Up** (pages/signup.html)
   - Create account
   - Fields: Name, Email, Phone, Password

2. **Login** (pages/login.html)
   - Login with credentials
   - See authenticated user menu

3. **Destinations** (pages/destinations.html)
   - Browse all 5 destinations
   - View destination cards
   - Click to see details

4. **Destination Details** (pages/destination-detail.html?id=1)
   - Full description
   - Available services
   - Booking option

5. **Bookings** (pages/bookings.html)
   - Make new booking
   - Select destination & dates
   - View your bookings

6. **Contact** (pages/contact.html)
   - Phone number
   - WhatsApp link
   - Email
   - Instagram & YouTube links
   - Contact form

7. **Admin Panel** (pages/admin.html)
   - View bookings
   - Update booking status
   - Manage destinations
   - Manage services

---

## 🔧 Important Notes

### Database Setup (First Time Only)
1. Install MySQL if you don't have it
2. Create database:
   ```sql
   mysql -u root -p
   CREATE DATABASE ayodhya_tourism;
   EXIT;
   ```

3. Update credentials in `backend/database.py`
   ```python
   DATABASE_URL = "mysql+mysqlconnector://root:your_password@localhost:3306/ayodhya_tourism"
   ```

### Tables Auto-Created
- Tables are created automatically when you run `python main.py`
- You'll see output like: `SELECT 'CREATE TABLE users...'`

### API Testing
API runs at: **http://localhost:8000**

Swagger UI (Test all endpoints): **http://localhost:8000/docs**

---

## 🎨 Live Demo URLs

Once running:

| Page | URL |
|------|-----|
| Home | http://localhost:5500 |
| Destinations | http://localhost:5500/pages/destinations.html |
| Login | http://localhost:5500/pages/login.html |
| Signup | http://localhost:5500/pages/signup.html |
| Bookings | http://localhost:5500/pages/bookings.html |
| Contact | http://localhost:5500/pages/contact.html |
| Admin | http://localhost:5500/pages/admin.html |
| API Docs | http://localhost:8000/docs |

---

## ⚡ Quick Test User Flow

1. Open http://localhost:5500
2. Click "Sign Up" → Create account with:
   - Name: John Doe
   - Email: john@test.com
   - Phone: 7607745628
   - Password: test123

3. Click "Login" → Use your credentials

4. Click "Destinations" → Browse 5 sacred destinations

5. Click on "Ayodhya" → See full details and services

6. Click "Bookings" → Select dates and book

7. See your bookings listed

---

## 🆘 Troubleshooting

### Port Already in Use
```powershell
# If port 5500 is in use
python -m http.server 5501
# Or 5502, 5503, etc.
```

### Python Not Found
- Install Python 3.8+: https://www.python.org/downloads/
- Make sure "Add Python to PATH" is checked during installation

### Requirements Installation Fails
```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

### MySQL Connection Error
- Check if MySQL is running
- Verify username/password in database.py
- Ensure database is created

### Frontend Shows Blank
- Check browser console (F12)
- Make sure API is running on port 8000
- Check network tab for failed requests

---

## 📱 Test Features

### As Regular User
- ✅ Sign up/Login
- ✅ Browse destinations
- ✅ View services
- ✅ Create booking
- ✅ See booking status
- ✅ Contact via form

### As Admin (Need to set is_admin = 1 in database)
- ✅ View all bookings
- ✅ Update booking status
- ✅ Manage destinations
- ✅ Manage services
- ✅ View dashboard stats

---

## 🎉 You're Ready!

Copy & paste the commands above into your PowerShell terminal and watch your website come to life! 🚀

**Start:** Open 2 PowerShell terminals and run the commands above!

---

*Need help? Check QUICKSTART.md for detailed setup instructions*
