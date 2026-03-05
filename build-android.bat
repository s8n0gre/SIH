@echo off
title Build Android Native App
setlocal EnableDelayedExpansion

set NODE_PATH=D:\College\NodeJS\node-v22.14.0-win-x64
set PATH=%NODE_PATH%;%PATH%

echo =================================================================
echo  Android Build - Municipal Issue Reporting System
echo =================================================================
echo.

:: Step 1: Build the React frontend
echo [1/3] Building frontend production bundle...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo [Error] Vite build failed!
    pause
    exit /b %ERRORLEVEL%
)

:: Step 2: Copy output to Android project
echo [2/3] Copying build to Android project folder...
if not exist "D:\College\Translator-Android\www" mkdir "D:\College\Translator-Android\www"
xcopy /E /Y /I "dist\*" "D:\College\Translator-Android\www\"
if %ERRORLEVEL% neq 0 (
    echo [Error] Failed to copy files to D:\College\Translator-Android\www
    pause
    exit /b %ERRORLEVEL%
)

:: Step 3: Run Capacitor Sync
echo [3/3] Syncing Capacitor Android project...
cd /d "D:\College\Translator-Android"
call npx cap sync android
if %ERRORLEVEL% neq 0 (
    echo [Error] Capacitor sync failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo =================================================================
echo  Build and Sync Complete!
echo =================================================================
echo.
echo  The Android project is ready at:
echo  D:\College\Translator-Android\android
echo.
echo  You can now open this folder in Android Studio to compile the APK.
echo.
pause
