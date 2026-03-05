@echo off
title Project Starter (with MiniCPM)

REM Force NVIDIA dedicated GPU
set CUDA_VISIBLE_DEVICES=0
set CUDA_DEVICE_ORDER=PCI_BUS_ID

echo =================================================================
echo  Project Startup Script (MiniCPM Edition)
echo =================================================================
echo  GPU Mode: NVIDIA GTX 1650 (Dedicated)
echo =================================================================
echo.
echo This script will start the 4 essential servers in separate windows:
echo   1. Backend API  (Node.js)
echo   2. AI Server    (Python MiniCPM)
echo   3. Speech Server (Hindi Recognition)
echo   4. Frontend     (Vite Dev Server)
echo.
echo =================================================================
echo.
REM pause

:: 1. Start Backend API Server
echo [1/4] Starting Backend API Server on port 5000...
cd backend
start "Backend API" node server.js
cd ..

echo      Waiting 5 seconds for the API to initialize...
timeout /t 5 /nobreak > nul

:: 2. Start the AI Vision Server
echo [2/4] Starting MiniCPM AI Vision Server on port 5007...
start "AI Server (MiniCPM)" python direct_minicpm_server.py

echo      Waiting 3 seconds for the AI server to initialize...
timeout /t 3 /nobreak > nul

:: 3. Start the ASR Backend Server
echo [3/4] Starting ASR Backend Server on port 8000...
start "ASR Server (Hindi)" python -m uvicorn asr_backend:app --host 0.0.0.0 --port 8000 --reload

echo      Waiting 2 seconds for the speech server to initialize...
timeout /t 2 /nobreak > nul

:: 4. Start the Frontend Development Server
echo [4/4] Starting Frontend Dev Server on port 3000...
start "Frontend (Vite)" npm run dev

echo.
echo =================================================================
echo  All servers have been launched in separate windows.
echo =================================================================
echo.