@echo off
title Unified Project Starter

set CUDA_VISIBLE_DEVICES=0
set CUDA_DEVICE_ORDER=PCI_BUS_ID

echo =================================================================
echo  Municipal Issue Reporting System - Unified Startup
echo =================================================================
echo  All services will run through Port 5000
echo =================================================================
echo.

:: 1. Start AI Vision Server (Background)
echo [1/3] Starting AI Vision Server on port 5007...
start /MIN "AI Server" python direct_minicpm_server.py
timeout /t 3 /nobreak > nul

:: 2. Start Speech Recognition Server (Background)
echo [2/3] Starting Speech Recognition Server on port 8000...
start /MIN "Speech Server" python -m uvicorn asr_backend:app --host 0.0.0.0 --port 8000 --reload
timeout /t 2 /nobreak > nul

:: 3. Start Backend API with Proxies (Main Server)
echo [3/3] Starting Main Backend Server on port 5000...
cd backend
call npm install http-proxy-middleware
start "Backend API (Port 5000)" node server.js
cd ..

timeout /t 3 /nobreak > nul

echo.
echo =================================================================
echo  Server Started Successfully!
echo =================================================================
echo  Access your application at: http://localhost:5000
echo.
echo  All services are proxied through port 5000:
echo    - API:          http://localhost:5000/api
echo    - AI Vision:    http://localhost:5000/ai-vision
echo    - Speech:       http://localhost:5000/speech
echo    - Health Check: http://localhost:5000/health
echo =================================================================
echo.
echo Press any key to open the application in your browser...
pause > nul
start http://localhost:5000

echo.
echo Application is running. Close this window to stop all services.
pause
