@echo off
echo.
echo ================================================
echo   Ayodhya Ramnagari Tourism - Quick Start
echo ================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo.
    echo Please download Python from: https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    pause
    exit /b 1
)

echo [Step 1] Checking Python...
python --version

REM Navigate to backend
cd /d %~dp0backend

echo.
echo [Step 2] Checking Virtual Environment...
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo.
echo [Step 3] Activating Virtual Environment...
call venv\Scripts\activate.bat

echo.
echo [Step 4] Installing Dependencies...
pip install -r requirements.txt >nul 2>&1

echo.
echo [Step 5] Loading Environment Configuration...
REM Load .env file if it exists
if exist "..\\.env" (
    for /f "tokens=*" %%a in ('type "..\\.env" ^| findstr /v "^#" ^| findstr /v "^$"') do (
        set "%%a"
    )
    echo Environment variables loaded from .env
) else (
    echo WARNING: .env file not found. Make sure to set DATABASE_URL environment variable.
)

echo.
echo ================================================
echo   Starting Backend Server...
echo ================================================
echo.
echo API will be available at:
echo    http://localhost:8000
echo.
echo Swagger API Docs:
echo    http://localhost:8000/docs
echo.
echo *** IMPORTANT: Keep this window open! ***
echo.
echo Open ANOTHER PowerShell window and run:
echo    cd frontend
echo    python -m http.server 5500
echo.
echo Then open in browser:
echo    http://localhost:5500
echo.
echo ================================================
echo.

python main.py

pause
