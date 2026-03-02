@echo off
echo Starting Your Local Google ViT Model Server...
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
echo Installing required packages for your Google ViT model...
pip install torch torchvision transformers pillow flask flask-cors numpy

echo.
echo Loading your Google ViT model files from ../Google Vit/
echo Starting your Google ViT server on port 5006...
python local_vit_server.py

pause