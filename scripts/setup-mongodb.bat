@echo off
cd /d "%~dp0.."
title MongoDB Setup Guide

echo =================================================================
echo  MongoDB Database Setup Options
echo =================================================================
echo.
echo You have 2 options to fix the MongoDB connection:
echo.
echo OPTION 1: Use MongoDB Atlas (Cloud - Recommended)
echo -------------------------------------------------
echo 1. Go to: https://www.mongodb.com/cloud/atlas/register
echo 2. Create a free account
echo 3. Create a free cluster (M0 Sandbox)
echo 4. Click "Connect" on your cluster
echo 5. Choose "Connect your application"
echo 6. Copy the connection string
echo 7. Update backend\.env file with:
echo    MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civic-reports
echo.
echo OPTION 2: Install MongoDB Locally
echo -------------------------------------------------
echo 1. Download from: https://www.mongodb.com/try/download/community
echo 2. Install MongoDB Community Server
echo 3. Start MongoDB service:
echo    net start MongoDB
echo 4. Keep the current .env configuration
echo.
echo =================================================================
echo.
pause

