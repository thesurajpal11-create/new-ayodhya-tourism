# Quick Start Guide - Ayodhya Ramnagari Tourism Website

## 🚀 Get Started in 5 Minutes

### Step 1: Download & Setup Backend

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Setup MySQL Database

1. **Install MySQL** if you haven't already
   - Download from: https://dev.mysql.com/downloads/mysql/

2. **Create Database**
   ```sql
   CREATE DATABASE ayodhya_tourism;
   ```

3. **Update Database Credentials**
   - Edit `backend/database.py`
   - Replace your_password with your MySQL password
   ```python
   DATABASE_URL = "mysql+mysqlconnector://root:your_password@localhost:3306/ayodhya_tourism"
   ```

### Step 3: Start Backend Server

```bash
# Make sure you're in the backend directory and venv is activated
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Visit: http://localhost:8000 to verify API is running

### Step 4: Start Frontend Server

Open a **NEW terminal** window:

```bash
# Navigate to frontend folder
cd frontend

# Start local server
python -m http.server 5500

# Or if you have Node installed:
npx http-server
```

### Step 5: Access the Website

Open your browser and go to:
```
http://localhost:5500
```

## 📝 Initial Setup Checklist

- [ ] Python 3.8+ installed
- [ ] MySQL installed and running
- [ ] Database created
- [ ] Database credentials updated
- [ ] Backend dependencies installed
- [ ] Backend server running
- [ ] Frontend server running
- [ ] Website accessible at http://localhost:5500

## 🔗 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Website | http://localhost:5500 | Main frontend |
| API | http://localhost:8000 | Backend API |
| API Docs | http://localhost:8000/docs | Swagger UI documentation |
| Admin Panel | http://localhost:5500/pages/admin.html | Admin dashboard |

## 🧪 Test the Website

### 1. Create an Account
- Click "Sign Up" on homepage
- Enter your details
- Submit

### 2. Login
- Click "Login"
- Use your credentials
- You should be logged in

### 3. Browse Destinations
- Click "Destinations" in navbar
- View all 5 destinations
- Click on any destination to see details

### 4. Make a Booking
- Click "Bookings" in navbar
- Select destination, dates, and people
- Click "Book Now"
- Check "Your Bookings" section

### 5. Admin Panel (Test Only)
- Note: You need to be an admin to access
- URL: http://localhost:5500/pages/admin.html
- Admin features: manage destinations, services, bookings

## ⚠️ Troubleshooting

### Issue: "Connection refused" error
**Solution:**
- Check if MySQL is running
- Verify database credentials in `database.py`
- Try creating database again

### Issue: "Port 8000 already in use"
**Solution:**
```bash
# Change port in main.py
uvicorn.run(app, host="0.0.0.0", port=8001)
# Then update API_BASE_URL in js/main.js
```

### Issue: Frontend not loading data
**Solution:**
- Check if backend is running
- Check browser console for errors (F12)
- Verify API_BASE_URL in js/main.js is correct

### Issue: Database tables not created
**Solution:**
- Tables are auto-created when you run the backend
- Check database.py for correct DATABASE_URL
- Run backend again

## 📱 Browser Requirements

- Chrome/Firefox/Safari/Edge (latest versions)
- JavaScript must be enabled
- No plugins required

## 🎨 Customization

### Update Contact Information
File: `frontend/pages/contact.html`
- Search for phone number
- Update all contact details

### Update Branding
File: `frontend/css/style.css`
- Search `:root` section
- Update colors:
  - `--primary-color`: Main gold color
  - `--secondary-color`: Brown color
  - `--accent-color`: Yellow accent

### Add Destinations
- Use Admin Panel or
- Directly in database:
  ```sql
  INSERT INTO destinations (name, description, short_description, best_time_to_visit) 
  VALUES ('New Destination', 'Description...', 'Short desc', 'Best season');
  ```

## 📚 Next Steps

1. **Add Sample Data**
   ```bash
   cd backend
   python seed_data.py
   ```

2. **Add Images**
   - Place destination images in `frontend/images/`
   - Update image URLs in admin panel

3. **Add YouTube Videos**
   - Update destination page
   - Add YouTube video ID in admin panel

4. **Deploy to Production**
   - See DEPLOYMENT.md for detailed instructions

## 🆘 Need Help?

1. Check the main README.md for detailed documentation
2. Check FastAPI docs at http://localhost:8000/docs
3. Look for error messages in:
   - Browser console (F12)
   - Backend terminal output
   - MySQL error logs

## 🔓 Default Admin Account (For Testing)

After setting up, you can manually create an admin account:

```sql
UPDATE users SET is_admin = 1 WHERE email = 'your_email@example.com';
```

---

**🎉 You're all set! Start exploring the Ayodhya Ramnagari Tourism website!**
