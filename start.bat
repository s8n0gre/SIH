@echo off
title Municipal Issue Reporting System - Startup

set NODE_PATH=D:\College\NodeJS\node-v22.14.0-win-x64
set PATH=%NODE_PATH%;%PATH%

echo =================================================================
echo  Municipal Issue Reporting System
echo =================================================================
echo.
echo  Node.js: %NODE_PATH%
echo.

echo [1/3] Starting MongoDB (Port 27017)...
start "MongoDB Local" cmd /k "D:\College\MongoDB\mongodb-win32-x86_64-windows-7.0.5\bin\mongod.exe --dbpath D:\College\MongoDB\data\db"
ping 127.0.0.1 -n 5 > nul

echo [2/3] Starting Backend API (Port 5005)...
cd /d "%~dp0backend"
start "Backend API" cmd /k "set PATH=%NODE_PATH%;%PATH% && node server.js"
cd /d "%~dp0"
ping 127.0.0.1 -n 4 > nul

echo [3/3] Starting Frontend Dev Server (Port 3000)...
start "Frontend Dev" cmd /k "set PATH=%NODE_PATH%;%PATH% && npm run dev"
ping 127.0.0.1 -n 4 > nul

echo.
echo =================================================================
echo  All Services Started!
echo =================================================================
echo.
echo  Frontend:  http://localhost:3000/SIH/
echo  Backend:   http://localhost:5005
echo  Health:    http://localhost:5005/health
echo  API:       http://localhost:5005/api
echo.
echo =================================================================
echo.
start http://localhost:3000/SIH/
pause
