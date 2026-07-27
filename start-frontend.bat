@echo off
cd /d %~dp0frontend

echo.
echo ================================================
echo   Starting Frontend Server...
echo ================================================
echo.
echo Website will be available at:
echo    http://localhost:5500
echo.
echo *** Make sure Backend is running first! ***
echo    (Run start-backend.bat in another window)
echo.
echo ================================================
echo.

python -m http.server 5500

pause
