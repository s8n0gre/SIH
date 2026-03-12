# CrowdSource - Start All Services

This directory contains scripts to start all required services for the CrowdSource application.

## Services Started

- **MongoDB** (Port 27017) - Database
- **Backend** (Port 5000) - Node.js/Express API server
- **Frontend** (Port 5173) - Vite development server
- **AI Server** (Port 3001) - Python AI/ML server

## Prerequisites

Ensure you have the following installed:
- Node.js and npm
- Python 3.8+
- MongoDB
- Git

## Usage

### Windows (Batch)
```bash
scripts\start-all-services.bat
```

### Windows (PowerShell)
```powershell
.\scripts\start-all-services.ps1
```

### Linux/macOS (Bash)
```bash
bash scripts/start-all-services.sh
```

## What Each Script Does

1. **Checks if services are already running** - Prevents port conflicts
2. **Creates necessary directories** - MongoDB data directory
3. **Installs dependencies** - npm packages for backend and frontend
4. **Starts all services** - In separate processes/windows
5. **Displays service URLs** - For easy access

## Service URLs

Once all services are running, access them at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- AI Server: http://localhost:3001
- MongoDB: mongodb://localhost:27017

## Stopping Services

### Windows
- Close the command windows for each service, or
- Use Task Manager to end the processes

### Linux/macOS
- Press `Ctrl+C` in the terminal running the script

## Troubleshooting

### Port Already in Use
If a port is already in use, the script will skip that service. You can:
1. Stop the existing process using that port
2. Change the port in the respective service configuration

### MongoDB Not Starting
Ensure MongoDB is installed and the data directory has write permissions:
```bash
mkdir -p data/mongodb
chmod 755 data/mongodb
```

### Dependencies Not Installing
If npm install fails, try manually:
```bash
cd backend && npm install
cd .. && npm install
```

### Python Dependencies
Ensure Python dependencies are installed:
```bash
cd ai_server
pip install -r requirements.txt
```

## Notes

- The scripts use non-blocking execution, so all services run simultaneously
- Each service runs in its own process/window
- Logs are displayed in real-time in each service's window
- The main script window shows startup status for all services
