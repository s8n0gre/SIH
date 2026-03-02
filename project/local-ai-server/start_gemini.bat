@echo off
echo Starting Gemini Vision Municipal Issue Detection Server...
echo.

cd /d "%~dp0"

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo Python is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Installing required packages...
pip install google-generativeai pillow flask flask-cors opencv-python numpy

echo.
echo ⚠️  IMPORTANT: Set your Gemini API key in gemini_vision_server.py
echo    Get your API key from: https://makersuite.google.com/app/apikey
echo.

echo Starting Gemini Vision server on port 5004...
python gemini_vision_server.py

pause