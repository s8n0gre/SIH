@echo off
echo ========================================
echo    JHARKHAND CIVIC REPORTS SYSTEM
echo    Comprehensive Demo Data Setup
echo ========================================
echo.

echo [1/5] Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo Error: Failed to install backend dependencies
    pause
    exit /b 1
)
echo ✅ Backend dependencies installed
echo.

echo [2/5] Seeding initial demo data...
call npm run seed
if errorlevel 1 (
    echo Error: Failed to seed initial data
    pause
    exit /b 1
)
echo ✅ Initial demo data seeded
echo.

echo [3/5] Generating comprehensive bulk data...
call npm run bulk-data
if errorlevel 1 (
    echo Error: Failed to generate bulk data
    pause
    exit /b 1
)
echo ✅ Comprehensive data generated
echo.

echo [4/5] Starting backend server...
start "Civic Reports Backend" cmd /k "npm start"
timeout /t 5 /nobreak >nul

echo [5/5] Starting frontend server...
cd ..
start "Civic Reports Frontend" cmd /k "npm start"

echo.
echo ========================================
echo           SETUP COMPLETE! 🎉
echo ========================================
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000
echo 🗄️  MongoDB: mongodb://localhost:27017/civic-reports
echo.
echo 📊 DATA SUMMARY:
echo • 200+ Users (Citizens + Admins)
echo • 500+ Reports across all departments
echo • 5 Jharkhand cities covered
echo • Realistic voting and timeline data
echo.
echo 🔑 LOGIN CREDENTIALS:
echo ┌─────────────────────────────────────────┐
echo │ CITIZENS:                               │
echo │ • rajesh.kumar@gmail.com / password123  │
echo │ • priya.singh@yahoo.com / password123   │
echo │ • amit.sharma@outlook.com / password123 │
echo │                                         │
echo │ DEPARTMENT ADMINS:                      │
echo │ • roads@jharkhand.gov.in / admin123     │
echo │ • water@jharkhand.gov.in / admin123     │
echo │ • electricity@jharkhand.gov.in / admin123│
echo │                                         │
echo │ SYSTEM ADMIN:                           │
echo │ • admin@jharkhand.gov.in / super123     │
echo └─────────────────────────────────────────┘
echo.
echo 💡 TIP: Use the Database tab to view all data
echo 💡 TIP: Check MongoDB Compass for raw data
echo.
pause