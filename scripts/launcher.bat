@echo off
cd /d "%~dp0.."
title Municipal Issue Reporting System - Launcher

:MENU
cls
echo =================================================================
echo  Municipal Issue Reporting System - Launcher
echo =================================================================
echo.
echo  Choose an option:
echo.
echo  1. Start Project (Single Port 5000) - Recommended
echo  2. Start Development Mode (Multiple Ports)
echo  3. Build and Run Production
echo  4. Test MongoDB Connection
echo  5. Manage Users (View/Create)
echo  6. Test API Endpoints
echo  7. MongoDB Setup Guide
echo  8. View Quick Start Guide
echo  9. Exit
echo.
echo =================================================================
echo.

set /p choice="Enter your choice (1-9): "

if "%choice%"=="1" goto START_SINGLE
if "%choice%"=="2" goto START_DEV
if "%choice%"=="3" goto START_PROD
if "%choice%"=="4" goto TEST_MONGO
if "%choice%"=="5" goto MANAGE_USERS
if "%choice%"=="6" goto TEST_API
if "%choice%"=="7" goto MONGO_SETUP
if "%choice%"=="8" goto QUICK_START
if "%choice%"=="9" goto EXIT

echo Invalid choice. Please try again.
pause
goto MENU

:START_SINGLE
cls
echo Starting project on single port (5000)...
call scripts\start-complete.bat
goto MENU

:START_DEV
cls
echo Starting development mode...
call scripts\start-dev.bat
goto MENU

:START_PROD
cls
echo Building and starting production...
call scripts\start-production.bat
goto MENU

:TEST_MONGO
cls
echo Testing MongoDB connection...
cd backend
node test-mongodb.js
cd ..
echo.
pause
goto MENU

:MANAGE_USERS
cls
echo Managing users...
cd backend
node manage-users.js
cd ..
echo.
pause
goto MENU

:TEST_API
cls
echo Testing API endpoints...
call scripts\test-api.bat
goto MENU

:MONGO_SETUP
cls
call scripts\setup-mongodb.bat
goto MENU

:QUICK_START
cls
type QUICK-START.md
echo.
pause
goto MENU

:EXIT
echo.
echo Thank you for using Municipal Issue Reporting System!
echo.
exit

