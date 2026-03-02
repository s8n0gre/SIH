@echo off
cd /d "%~dp0.."
title Build and Run Production

echo =================================================================
echo  Building Frontend for Production...
echo =================================================================
call npm run build

echo.
echo =================================================================
echo  Starting Production Server...
echo =================================================================

:: Start AI Vision Server
start "AI Server" /D ai_server /MIN python direct_minicpm_server.py
timeout /t 3 /nobreak > nul

:: Start Speech Recognition Server
start "Speech Server" /D ai_server /MIN python -m uvicorn asr_backend:app --host 0.0.0.0 --port 8000
timeout /t 2 /nobreak > nul

:: Start Backend with Production Mode
cd backend
set NODE_ENV=production
call npm install http-proxy-middleware
start "Production Server (Port 5000)" node server.js
cd ..

timeout /t 3 /nobreak > nul

echo.
echo =================================================================
echo  Production Server Running on Port 5000
echo =================================================================
echo  Access: http://localhost:5000
echo =================================================================
echo.
pause

