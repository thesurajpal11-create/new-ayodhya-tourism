# Deployment Guide - Ayodhya Ramnagari Tourism

## Local Setup with DATABASE_URL

### Prerequisites
- Python 3.8+
- MySQL Server running
- Git (for version control)

### 1. Database Setup

Ensure MySQL is running and create the database:

```bash
mysql -u root -p

# Enter password: root1234
CREATE DATABASE ayodhya_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2. Environment Configuration

A `.env` file has been created with the following DATABASE_URL:

```
DATABASE_URL=mysql+pymysql://root:root1234@localhost:3306/ayodhya_db
```

**Location:** `c:\Users\Dell\Desktop\tour\.env`

**To modify:** Edit the `.env` file (do NOT commit to git)

### 3. Quick Start - Windows

```bash
# Option 1: Run the batch script (Recommended)
start-backend.bat

# Option 2: Manual setup
cd backend
python -m venv venv
call venv\Scripts\activate.bat
pip install -r requirements.txt
python main.py
```

### 4. Backend Server

The backend API will be available at:
- **API Base URL:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### 5. Frontend Setup

In a separate terminal:

```bash
cd path/to/tour
python -m http.server 5500
```

Access the application at: http://localhost:5500

---

## Production Deployment (Render)

### Steps to Deploy on Render

1. **Connect Your Repository**
   - Push code to GitHub
   - Connect GitHub repository to Render

2. **Set Environment Variables on Render Dashboard**
   
   Go to your Render service settings and add:
   
   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | `mysql+pymysql://root:root1234@localhost:3306/ayodhya_db` |
   | `ALLOWED_ORIGINS` | `https://your-frontend-domain.com` |

3. **render.yaml Configuration**
   
   Configured in the root `render.yaml`:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Runtime:** Python

4. **Deploy**
   - Render will automatically deploy when you push to the main branch
   - Monitor deployment status in Render dashboard

### Required Environment Variables for Production

```
DATABASE_URL=mysql+pymysql://root:root1234@localhost:3306/ayodhya_db
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://yourdomain.com
API_DEBUG=False
```

### Deepotsav Enquiry Email

The Deepotsav form sends JSON to `POST /api/enquiries/deepotsav` on the separate `ramnagari-deepotsav-enquiries` Render service defined in the root `render.yaml`. Configure these variables in that service's Render Environment settings; SMTP credentials must never be placed in frontend JavaScript:

| Variable | Value |
|----------|-------|
| `SMTP_HOST` | Your email provider's SMTP host, for example `smtp.gmail.com` |
| `SMTP_PORT` | `587` for STARTTLS, or `465` for SSL |
| `SMTP_USERNAME` | The sending mailbox username |
| `SMTP_PASSWORD` | A provider-issued app password or SMTP credential |
| `ENQUIRY_TO_EMAIL` | `ayodhyaramnagritourism@gmail.com` or your preferred receiving mailbox |
| `ALLOWED_ORIGINS` | `https://ramnagritourism.com,https://www.ramnagritourism.com` |

For Gmail, use an App Password with two-step verification enabled, not the mailbox login password. Render reads these values from its environment; do not commit them to the repository. After the new service deploys, copy its public HTTPS URL and set `window.RAMNAGARI_API_BASE_URL` in `config.js` to that URL (no trailing slash). This URL is public configuration, not a secret. Redeploy the website after changing it, then send a test enquiry; success is shown only after SMTP accepts the message. For local development, add the local frontend origin to `ALLOWED_ORIGINS` on the email service.

The existing `ayodhya-tourism-backend` service still starts `main:app`. In this checkout, importing `main.py` currently fails because its pre-existing `app` package is absent. Deploy the new `ramnagari-deepotsav-enquiries` service independently; the package enquiry API does not import or depend on the legacy backend.

---

## Database Configuration Details

### MySQL Connection String Format

```
mysql+pymysql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

**Example:**
```
mysql+pymysql://root:root1234@localhost:3306/ayodhya_db
```

### Components:
- **Protocol:** `mysql+pymysql://`
- **Username:** `root`
- **Password:** `root1234`
- **Host:** `localhost`
- **Port:** `3306` (default MySQL port)
- **Database:** `ayodhya_db`

### For Remote MySQL:
```
mysql+pymysql://username:password@remote-host.com:3306/ayodhya_db
```

---

## Database Initialization

### Auto-Creation
Tables are automatically created when the app starts due to this code in `backend/main.py`:

```python
Base.metadata.create_all(bind=engine)
```

### Seed Data (Optional)

To populate with sample data:

```bash
cd backend
python seed_data.py
```

This will add:
- Ayodhya
- Varanasi
- Chitrakoot
- Mathura
- Gaya

---

## Troubleshooting

### Issue: "DATABASE_URL environment variable is required"

**Solution:** 
- Ensure `.env` file exists in the project root
- Check that DATABASE_URL is properly set
- Run `start-backend.bat` which loads the .env file

### Issue: "Can't connect to MySQL server"

**Solutions:**
1. Verify MySQL is running:
   ```bash
   mysql -u root -p
   ```

2. Check credentials in .env file match your MySQL setup

3. Verify database `ayodhya_db` exists:
   ```bash
   mysql -u root -p
   SHOW DATABASES;
   ```

### Issue: Port already in use (8000)

**Solution:**
```bash
# Windows: Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or change port in start-backend.bat
```

---

## Security Notes for Production

1. **Change Database Password:** Update the password from `root1234` to a secure password
2. **Use Environment Variables:** Store sensitive data in environment variables, not in code
3. **HTTPS:** Use HTTPS for production deployments
4. **CORS:** Update ALLOWED_ORIGINS to specific domain(s)
5. **Secrets:** Use a secrets manager for production credentials

---

## Deployment Checklist

- [ ] Database created and running
- [ ] `.env` file configured with DATABASE_URL
- [ ] `requirements.txt` has all dependencies
- [ ] Backend starts without errors
- [ ] Frontend loads successfully
- [ ] API docs accessible at /docs
- [ ] Environment variables set on Render
- [ ] GitHub repository connected
- [ ] render.yaml in backend folder
- [ ] ALLOWED_ORIGINS updated for production
- [ ] Database password changed for production
- [ ] Tests passed
- [ ] Performance tested

---

## File Structure

```
tour/
├── .env                          # Environment variables (created)
├── backend/
│   ├── main.py                   # FastAPI entry point
│   ├── database.py               # Database configuration
│   ├── requirements.txt          # Python dependencies
│   ├── render.yaml               # Render deployment config
│   ├── seed_data.py             # Sample data
│   └── app/
│       ├── models/              # Database models
│       ├── routes/              # API endpoints
│       ├── schemas/             # Request/response schemas
│       └── __init__.py
├── pages/                        # Frontend HTML
├── js/                          # Frontend JavaScript
└── style.css                    # Frontend CSS
```

---

## Next Steps

1. ✅ Database URL configured
2. ✅ Environment file created
3. ✅ Deployment files updated
4. Run `start-backend.bat` to test locally
5. Commit and push to GitHub
6. Deploy on Render
7. Monitor and maintain

