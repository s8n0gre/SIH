@echo off
echo Starting Google ViT Municipal Issue Detection Server...
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
pip install torch torchvision transformers pillow flask flask-cors numpy opencv-python

echo.
echo Starting Google ViT server on port 5002...
python google_vit_server.py

pause