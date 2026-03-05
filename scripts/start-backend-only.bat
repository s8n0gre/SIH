@echo off
cd /d "%~dp0.."
title Quick Start - Backend Only

echo =================================================================
echo  Quick Start - Backend Only
echo =================================================================
echo.

echo Testing MongoDB...
cd backend
node test-mongodb.js
if errorlevel 1 (
    echo MongoDB not available.
    pause
    exit /b 1
)
cd ..
echo.

echo Installing dependencies...
cd backend
call npm install http-proxy-middleware
cd ..
echo.

echo Starting Backend API (Port 5005)...
cd backend
start "Backend API" cmd /k "node server.js"
cd ..
ping 127.0.0.1 -n 3 > nul

echo.
echo =================================================================
echo  Server Running: http://localhost:5005
echo =================================================================
echo.
echo AI and Speech services disabled (model file incomplete)
echo.
pause

