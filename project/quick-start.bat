@echo off
title Quick Server Manager
color 0A

:menu
cls
echo ========================================
echo    CIVIC SYSTEM - SERVER MANAGER
echo ========================================
echo.
echo 1. Start All Essential Servers (Website + Google ViT)
echo 2. Start Google ViT Server (Hugging Face Model)
echo 3. Start Your Google ViT Model (Local Files)
echo 4. Kill All Servers
echo 5. Check Server Status
echo 6. Exit
echo.
set /p choice="Select option (1-6): "

if "%choice%"=="1" goto essential
if "%choice%"=="2" goto vit
if "%choice%"=="3" goto yourvit
if "%choice%"=="4" goto kill
if "%choice%"=="5" goto status
if "%choice%"=="6" goto exit
goto menu

:essential
echo Starting essential servers for Website + Google ViT...
echo.
echo Starting MongoDB...
start "MongoDB" cmd /k "mongod --dbpath C:\data\db"
timeout /t 2 /nobreak >nul

echo Starting Backend Server...
start "Backend" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 2 /nobreak >nul

echo Starting Google ViT Server (Hugging Face)...
start "Google ViT" cmd /k "cd /d %~dp0local-ai-server && call start_google_vit.bat"
timeout /t 2 /nobreak >nul

echo Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0 && npm start"

echo.
echo ✅ Essential servers launched!
echo.
echo Services running on:
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:5000
echo - Google ViT: http://localhost:5002
echo - MongoDB: mongodb://localhost:27017
echo.
pause
goto menu

:vit
echo Starting Google ViT Server...
cd local-ai-server
call start_google_vit.bat
cd ..
goto menu



:yourvit
echo Starting Your Google ViT Model Server (Using Your Model Files)...
cd local-ai-server
call start_your_vit.bat
cd ..
goto menu

:kill
echo Killing all server processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im python.exe 2>nul
taskkill /f /im mongod.exe 2>nul
echo ✅ All servers stopped!
pause
goto menu

:status
echo Checking essential server status...
echo.
echo Essential ports for Website + Google ViT:
netstat -an | findstr ":3000 :5000 :5002 :5006 :27017"
echo.
echo Port 3000: Frontend (React)
echo Port 5000: Backend API (Node.js)
echo Port 5002: Google ViT (Hugging Face)
echo Port 5006: Your Google ViT (Local Model)
echo Port 27017: MongoDB Database
echo.
pause
goto menu

:exit
exit