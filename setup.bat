@echo off
REM Ayodhya Ramnagari Tourism - Setup Script for Windows

echo.
echo ========================================
echo Ayodhya Ramnagari Tourism - Setup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH
    exit /b 1
)

echo [1/4] Creating virtual environment...
cd backend
python -m venv venv
call venv\Scripts\activate.bat

echo [2/4] Installing Python dependencies...
pip install -r requirements.txt

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the backend server:
echo   cd backend
echo   venv\Scripts\activate
echo   python main.py
echo.
echo To start the frontend server (in another terminal):
echo   cd frontend
echo   python -m http.server 5500
echo.
echo Then access the website at:
echo   http://localhost:5500
echo.
echo API will be available at:
echo   http://localhost:8000
echo.
echo API Documentation (Swagger UI):
echo   http://localhost:8000/docs
echo.
pause
