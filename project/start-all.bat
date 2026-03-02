@echo off
echo Starting Civic Reporting System...
echo.

echo Starting MongoDB (if not running)...
start "MongoDB" cmd /k "mongod --dbpath C:\data\db"
timeout /t 3 /nobreak >nul

echo Starting Backend Server...
start "Backend" cmd /k "cd backend && npm start"
timeout /t 3 /nobreak >nul

echo Starting Frontend Development Server...
start "Frontend" cmd /k "npm start"

echo.
echo All servers are starting up...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo MongoDB: mongodb://localhost:27017
echo.
pause