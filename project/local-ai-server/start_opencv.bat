@echo off
echo Starting OpenCV Computer Vision Municipal Issue Detection Server...
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
pip install opencv-python pillow flask flask-cors numpy

echo.
echo Starting OpenCV Computer Vision server on port 5005...
python opencv_vision_server.py

pause