#!/bin/bash

# Ayodhya Ramnagari Tourism - Setup Script for Linux/Mac

echo ""
echo "========================================"
echo "Ayodhya Ramnagari Tourism - Setup"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

echo "[1/4] Creating virtual environment..."
cd backend
python3 -m venv venv
source venv/bin/activate

echo "[2/4] Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "To start the backend server:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python main.py"
echo ""
echo "To start the frontend server (in another terminal):"
echo "  cd frontend"
echo "  python -m http.server 5500"
echo ""
echo "Then access the website at:"
echo "  http://localhost:5500"
echo ""
echo "API will be available at:"
echo "  http://localhost:8000"
echo ""
echo "API Documentation (Swagger UI):"
echo "  http://localhost:8000/docs"
echo ""
