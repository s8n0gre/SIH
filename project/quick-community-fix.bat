@echo off
echo Starting Community Backend...

cd backend
echo Installing dependencies...
call npm install

echo Starting backend server...
start "Community Backend" cmd /k "npm start"

echo.
echo Community backend is starting on http://localhost:5000
echo Your community feed should now work!
echo.
pause