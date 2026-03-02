@echo off
title Remote Server Deployment
echo ========================================
echo    REMOTE SERVER DEPLOYMENT TOOL
echo ========================================
echo.

set /p servers="Enter server IPs (comma-separated): "
set /p username="Enter username: "
set /p script_path="Enter remote script path: "

echo.
echo Deploying to servers: %servers%
echo.

for %%s in (%servers%) do (
    echo Connecting to %%s...
    start "Server-%%s" cmd /k "psexec \\%%s -u %username% -p -i %script_path%"
    timeout /t 1 /nobreak >nul
)

echo.
echo ✅ Deployment initiated to all servers!
pause