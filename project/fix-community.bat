@echo off
echo ========================================
echo   FIXING COMMUNITY FUNCTIONALITY
echo ========================================

echo.
echo Step 1: Installing backend dependencies...
cd backend
call npm install

echo.
echo Step 2: Starting MongoDB (if installed)...
echo If MongoDB is not installed, the backend will retry connection automatically.

echo.
echo Step 3: Seeding database with sample data...
call npm run seed

echo.
echo Step 4: Starting backend server...
echo Backend will run on http://localhost:5000
start "Backend Server" cmd /k "npm start"

echo.
echo Step 5: Starting frontend...
cd ..
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo   COMMUNITY SHOULD NOW BE WORKING!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo The community feed will now show real data instead of demo data.
echo.
pause