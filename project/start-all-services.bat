@echo off
echo Starting Civic Reporting System...
echo.

echo 1. Starting Backend Server...
cd backend
start "Backend Server" cmd /k "echo Backend Server && npm start"
cd ..

echo 2. Waiting for backend to initialize...
timeout /t 3 /nobreak > nul

echo 3. Starting Frontend Development Server...
start "Frontend Server" cmd /k "echo Frontend Server && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul