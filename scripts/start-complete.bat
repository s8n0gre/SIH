@echo off
cd /d "%~dp0.."
title Complete Project Startup

echo =================================================================
echo  Municipal Issue Reporting System - Complete Startup
echo =================================================================
echo.

:: Test MongoDB Connection
echo [Step 1/5] Testing MongoDB connection...
cd backend
node test-mongodb.js
if errorlevel 1 (
    echo.
    echo ❌ MongoDB is not running!
    echo.
    echo Please choose an option:
    echo 1. Start MongoDB service: net start MongoDB
    echo 2. Use MongoDB Atlas: Run setup-mongodb.bat
    echo.
    pause
    exit /b 1
)
cd ..
echo ✅ MongoDB is ready
echo.

:: Install dependencies if needed
echo [Step 2/5] Checking dependencies...
cd backend
if not exist "node_modules\http-proxy-middleware" (
    echo Installing http-proxy-middleware...
    call npm install http-proxy-middleware
)
cd ..
echo ✅ Dependencies ready
echo.

:: Start AI Vision Server
echo [Step 3/5] Starting AI Vision Server (Port 5007)...
start "AI Vision Server" /D ai_server /MIN python direct_minicpm_server.py
ping 127.0.0.1 -n 4 > nul
echo ✅ AI Vision Server started
echo.

:: Start Speech Recognition Server
echo [Step 4/5] Starting Speech Recognition Server (Port 8000)...
start "Speech Server" /D ai_server /MIN python -m uvicorn asr_backend:app --host 0.0.0.0 --port 8000
ping 127.0.0.1 -n 3 > nul
echo ✅ Speech Server started
echo.

:: Start Backend API Server
echo [Step 5/5] Starting Backend API Server (Port 5005)...
cd backend
start "Backend API - Port 5005" cmd /k "node server.js"
cd ..
ping 127.0.0.1 -n 4 > nul
echo ✅ Backend Server started
echo.

echo =================================================================
echo  🚀 All Services Started Successfully!
echo =================================================================
echo.
echo  Main Server: http://localhost:5005
echo  Health Check: http://localhost:5005/health
echo  API Endpoints: http://localhost:5005/api
echo  AI Vision: http://localhost:5005/ai-vision
echo  Speech: http://localhost:5005/speech
echo.
echo =================================================================
echo.
echo Opening application in browser...
start http://localhost:5005
echo.
echo Press any key to run API tests...
pause > nul
call scripts\test-api.bat

