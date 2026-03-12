@echo off
REM CrowdSource - Start All Services
REM This script starts MongoDB, Backend, Frontend, and AI Server

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT=%SCRIPT_DIR%.."

REM Colors (using findstr for colored output)
set "INFO=[INFO]"
set "SUCCESS=[SUCCESS]"
set "ERROR=[ERROR]"
set "WARNING=[WARNING]"

echo.
echo ==========================================
echo CrowdSource - Starting All Services
echo ==========================================
echo.

REM Create data directory if it doesn't exist
if not exist "%PROJECT_ROOT%\data\mongodb" mkdir "%PROJECT_ROOT%\data\mongodb"

REM Check if MongoDB is running
echo %INFO% Checking MongoDB...
netstat -ano | findstr :27017 >nul
if %errorlevel% equ 0 (
    echo %WARNING% MongoDB is already running on port 27017
) else (
    echo %INFO% Starting MongoDB...
    set "MONGO_EXE=mongod"
    where mongod >nul 2>&1
    if %errorlevel% neq 0 (
        if exist "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" set "MONGO_EXE=C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe"
        if exist "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" set "MONGO_EXE=C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe"
        if exist "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" set "MONGO_EXE=C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe"
        if exist "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" set "MONGO_EXE=C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe"
    )
    start "MongoDB" "!MONGO_EXE!" --dbpath "%PROJECT_ROOT%\data\mongodb"
    timeout /t 3 /nobreak >nul
    echo %SUCCESS% MongoDB started
)

REM Check if Backend is running
echo %INFO% Checking Backend...
netstat -ano | findstr :5005 >nul
if %errorlevel% equ 0 (
    echo %WARNING% Backend is already running on port 5005
) else (
    echo %INFO% Starting Backend server...
    cd /d "%PROJECT_ROOT%\backend"
    call npm install >nul 2>&1
    start "Backend" cmd /k npm start
    timeout /t 3 /nobreak >nul
    echo %SUCCESS% Backend started
)

REM Check if Frontend is running
echo %INFO% Checking Frontend...
netstat -ano | findstr :5173 >nul
if %errorlevel% equ 0 (
    echo %WARNING% Frontend is already running on port 5173
) else (
    echo %INFO% Starting Frontend server...
    cd /d "%PROJECT_ROOT%\frontend"
    call npm install --legacy-peer-deps >nul 2>&1
    start "Frontend" cmd /k npm run dev
    timeout /t 3 /nobreak >nul
    echo %SUCCESS% Frontend started
)

REM Check if AI Server is running
echo %INFO% Checking AI Server...
netstat -ano | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo %WARNING% AI Server is already running on port 3001
) else (
    echo %INFO% Starting AI Server...
    cd /d "%PROJECT_ROOT%\ai_server"
    start "AI Server" cmd /k python direct_minicpm_server.py
    timeout /t 3 /nobreak >nul
    echo %SUCCESS% AI Server started
)

cd /d "%PROJECT_ROOT%"

echo.
echo ==========================================
echo %SUCCESS% All services started!
echo ==========================================
echo.
echo Services running on:
echo   MongoDB:    mongodb://localhost:27017
echo   Backend:    http://localhost:5005
echo   Frontend:   http://localhost:5173
echo   AI Server:  http://localhost:3001
echo.
echo Close individual windows to stop specific services.
echo.

pause
