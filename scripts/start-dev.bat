@echo off
cd /d "%~dp0.."
title Development Mode Startup

echo =================================================================
echo  Development Mode - All Services
echo =================================================================
echo.

:: Test MongoDB
echo Testing MongoDB...
cd backend
node test-mongodb.js
if errorlevel 1 (
    echo MongoDB not available. Please start MongoDB or use MongoDB Atlas.
    pause
    exit /b 1
)
cd ..
echo.

:: Install backend dependencies
echo Installing backend dependencies...
cd backend
call npm install http-proxy-middleware
cd ..
echo.

:: Start all services
echo Starting AI Vision Server...
start "AI Vision" /D ai_server /MIN python direct_minicpm_server.py
ping 127.0.0.1 -n 3 > nul

echo Starting Speech Server...
start "Speech" /D ai_server /MIN python -m uvicorn asr_backend:app --host 0.0.0.0 --port 8000
ping 127.0.0.1 -n 2 > nul

echo Starting Backend API...
cd backend
start "Backend API" cmd /k "node server.js"
cd ..
ping 127.0.0.1 -n 3 > nul

echo Starting Frontend Dev Server...
start "Frontend Dev" cmd /k "npm run dev"

echo.
echo =================================================================
echo  Development Servers Running:
echo =================================================================
echo  Frontend: http://localhost:3000
echo  Backend: http://localhost:5000
echo  AI Vision: http://localhost:5007
echo  Speech: http://localhost:8000
echo =================================================================
echo.
pause

