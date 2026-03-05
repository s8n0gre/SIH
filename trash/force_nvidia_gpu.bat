@echo off
echo Forcing NVIDIA GPU usage...
echo.

REM Force NVIDIA GPU for CUDA applications
set CUDA_VISIBLE_DEVICES=0

REM Disable integrated GPU
set CUDA_DEVICE_ORDER=PCI_BUS_ID

echo Environment variables set:
echo CUDA_VISIBLE_DEVICES=0
echo CUDA_DEVICE_ORDER=PCI_BUS_ID
echo.

echo Testing GPU detection...
python check_gpu.py
echo.

pause
