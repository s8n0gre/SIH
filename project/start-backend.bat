@echo off
echo Starting backend and health servers...
cd backend
start "Backend Server" cmd /k "npm start"
cd ..
start "Health Server" cmd /k "python local-ai-server\health-server.py"
echo Servers started in new windows
echo Backend: http://localhost:5000
echo Health Check: http://localhost:5006
pause