# Municipal Issue Reporting System

A complete civic reporting system with AI-powered image analysis and Hindi speech recognition.

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (local installation or MongoDB Atlas)

## Setup Instructions

### 1. Install Dependencies

#### Backend (Node.js)
```bash
cd backend
npm install
```

#### Frontend (React)
```bash
npm install
```

#### Python Services
```bash
pip install -r requirements.txt
```

### 2. Environment Setup

Make sure MongoDB is running on your system or update the connection string in `backend/.env`

### 3. Download AI Model

Download the MiniCPM model file:
- File: `MiniCPM-V-2_6-Q3_K_S.gguf`
- Place it in the root directory (same level as `direct_minicpm_server.py`)

### 4. Start All Services

Run the startup script:
```bash
start-project.bat
```

This will start:
- Backend API (Port 5000)
- AI Vision Server (Port 5007) 
- Speech Recognition Server (Port 8000)
- Frontend Dev Server (Port 3000)

## Service Ports

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **AI Vision**: http://localhost:5007
- **Speech Recognition**: http://localhost:8000

## Features

- 📸 AI-powered image analysis for infrastructure issues
- 🎤 Hindi speech recognition for voice reports
- 🗺️ Interactive mapping and location services
- 👥 Multi-role user management (Citizens, Admins, Departments)
- 📊 Real-time analytics and reporting dashboard
- 🔄 Automated issue categorization and routing

## Troubleshooting

1. **MongoDB Connection Issues**: Ensure MongoDB is running and accessible
2. **AI Model Loading**: Verify the GGUF model file is in the correct location
3. **Port Conflicts**: Check if any services are already using the required ports
4. **Python Dependencies**: Install missing packages with `pip install <package-name>`

## API Endpoints

### Backend (Port 5000)
- `GET /health` - Health check
- `POST /api/reports` - Create new report
- `GET /api/reports` - Get all reports
- `POST /api/auth/login` - User authentication

### AI Vision (Port 5007)
- `GET /health` - Health check
- `POST /analyze` - Analyze uploaded image
- `POST /analyze_base64` - Analyze base64 image

### Speech Recognition (Port 8000)
- `GET /health` - Health check
- `POST /transcribe` - Transcribe audio to Hindi text