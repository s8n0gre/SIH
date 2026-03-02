@echo off
title Essential Server Launcher - Google ViT
echo ========================================
echo    ESSENTIAL SERVERS FOR GOOGLE VIT
echo ========================================
echo.

echo Starting MongoDB...
start "MongoDB" cmd /k "mongod --dbpath C:\data\db"
timeout /t 3 /nobreak >nul

echo Starting Backend Server...
start "Backend" cmd /k "cd /d %~dp0backend && npm start"
timeout /t 3 /nobreak >nul

echo Starting Google ViT Server...
start "Google ViT" cmd /k "cd /d %~dp0local-ai-server && python google_vit_server.py"
timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0 && npm start"

echo.
echo ✅ Essential servers launched for Google ViT!
echo.
echo Services running on:
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:5000
echo - Google ViT: http://localhost:5002
echo - MongoDB: mongodb://localhost:27017
echo.
echo ⚠️  Removed overlapping AI servers:
echo   - server.py (LLaMA model - not needed for ViT)
echo   - vit_server.py (duplicate ViT implementation)
echo.
pause