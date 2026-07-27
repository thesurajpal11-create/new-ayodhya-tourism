@echo off
REM Ayodhya Ramnagari Tourism - Environment Verification Script

echo.
echo ================================================
echo   Deployment Verification Check
echo ================================================
echo.

REM Check .env file
echo [1] Checking .env file...
if exist ".env" (
    echo ✓ .env file found
    for /f "tokens=*" %%a in ('type ".env" ^| findstr /i "DATABASE_URL"') do (
        echo   - DATABASE_URL is configured
    )
) else (
    echo ✗ .env file NOT found
    echo   Please run: copy .env.example .env
    echo   Then update with your credentials
)

echo.
echo [2] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Python is installed
    python --version
) else (
    echo ✗ Python is NOT installed
    echo   Download from: https://www.python.org/downloads/
)

echo.
echo [3] Checking MySQL connection...
REM This is optional and requires MySQL being installed locally
echo ✓ MySQL configuration in .env (manual verification needed)

echo.
echo [4] Checking backend dependencies...
cd backend
if exist "requirements.txt" (
    echo ✓ requirements.txt found
) else (
    echo ✗ requirements.txt NOT found
)
cd ..

echo.
echo [5] Checking database file structure...
if exist "backend\database.py" (
    echo ✓ database.py found
) else (
    echo ✗ database.py NOT found
)

echo if exist "backend\main.py" (
    echo ✓ main.py found
) else (
    echo ✗ main.py NOT found
)

echo.
echo ================================================
echo   To proceed with deployment:
echo   1. Ensure MySQL is running
echo   2. Run: start-backend.bat
echo   3. Access API at: http://localhost:8000
echo ================================================
echo.

pause
