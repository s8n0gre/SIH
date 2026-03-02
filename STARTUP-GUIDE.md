# Startup Scripts Guide

## Available Startup Options

### 1. **start-complete.bat** (Recommended for Single Port Hosting)
Runs all services through **Port 5000** with proxying.
- Backend API proxies AI Vision and Speech services
- Perfect for Visual Studio port forwarding
- All services accessible through http://localhost:5000

**Usage:**
```bash
start-complete.bat
```

**Endpoints:**
- Main: http://localhost:5000
- API: http://localhost:5000/api
- AI Vision: http://localhost:5000/ai-vision
- Speech: http://localhost:5000/speech

---

### 2. **start-dev.bat** (Development Mode)
Runs all services on separate ports with hot-reload.
- Frontend: Port 3000 (Vite dev server)
- Backend: Port 5000
- AI Vision: Port 5007
- Speech: Port 8000

**Usage:**
```bash
start-dev.bat
```

---

### 3. **start-production.bat** (Production Build)
Builds frontend and serves through backend.
- Builds optimized production bundle
- Serves static files from backend
- Single port: 5000

**Usage:**
```bash
start-production.bat
```

---

## MongoDB Setup

### If MongoDB Connection Fails:

**Option 1: Local MongoDB**
```bash
# Install MongoDB Community Server
# Then start the service:
net start MongoDB
```

**Option 2: MongoDB Atlas (Cloud)**
```bash
# Run the setup guide:
setup-mongodb.bat

# Or manually:
# 1. Go to https://www.mongodb.com/cloud/atlas
# 2. Create free cluster
# 3. Get connection string
# 4. Update backend/.env:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/civic-reports
```

---

## Testing

### Test MongoDB Connection:
```bash
cd backend
node test-mongodb.js
```

### Test Authentication:
```bash
cd backend
node test-auth.js
```

### Test API Endpoints:
```bash
test-api.bat
```

---

## For Visual Studio Port Forwarding

Use **start-complete.bat** - it runs everything through port 5000.

Then in Visual Studio:
1. Forward port 5000
2. Access all services through the forwarded URL
3. All API, AI, and Speech services work through the same port

---

## Troubleshooting

### MongoDB Not Connected
- Run: `setup-mongodb.bat` for instructions
- Or test: `cd backend && node test-mongodb.js`

### Port Already in Use
- Close existing Node.js/Python processes
- Or change ports in backend/.env and vite.config.ts

### AI/Speech Services Not Working
- Check if Python dependencies are installed: `pip install -r requirements.txt`
- Verify model file exists: `MiniCPM-V-2_6-Q3_K_S.gguf`
