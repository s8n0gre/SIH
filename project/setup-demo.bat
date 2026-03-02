@echo off
echo Setting up demo data and starting servers...
echo.

echo Installing backend dependencies...
cd backend
call npm install
echo.

echo Seeding database with demo data...
call npm run seed
echo.

echo Starting backend server...
start "Backend Server" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo Starting frontend server...
cd ..
start "Frontend Server" cmd /k "npm start"

echo.
echo ✅ Demo setup complete!
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo MongoDB: mongodb://localhost:27017/civic-reports
echo.
echo Demo Login Credentials:
echo - Citizen: john@example.com / password123
echo - Roads Admin: roads@gov.in / admin123
echo - System Admin: admin@gov.in / super123
echo.
pause