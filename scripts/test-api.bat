@echo off
cd /d "%~dp0.."
title Test API Endpoints

echo Testing Backend API...
echo.

echo Test 1: Health Check
curl -X GET http://localhost:5000/health
echo.
echo.

echo Test 2: Register New User
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"password123\",\"role\":\"citizen\"}"
echo.
echo.

echo Test 3: Login
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"password123\"}"
echo.
echo.

pause

