# Quick Start Guide

## ✅ MongoDB Status: CONNECTED

Your database is working perfectly with 3 existing users.

---

## 🚀 Start the Project

### For Single Port (Port 5000) - Recommended for VS Code Port Forwarding:
```bash
start-complete.bat
```

### For Development Mode (Multiple Ports):
```bash
start-dev.bat
```

---

## 🔐 Login Credentials

### Existing Users:
1. **System Admin**
   - Email: `admin@municipal.gov`
   - Password: (your password)

2. **Department Admin**
   - Email: `dept@municipal.gov`
   - Password: (your password)

3. **Citizen**
   - Email: `deadborshi@gmail.com`
   - Password: (your password)

### Test Users (if needed):
- Citizen: `citizen@test.com` / `password123`
- Dept Admin: `dept@test.com` / `password123`
- System Admin: `admin@test.com` / `password123`

---

## 📡 Service Endpoints (Single Port Mode)

When using `start-complete.bat`, everything runs through **Port 5000**:

- **Main Application**: http://localhost:5000
- **API**: http://localhost:5000/api
- **AI Vision**: http://localhost:5000/ai-vision
- **Speech Recognition**: http://localhost:5000/speech
- **Health Check**: http://localhost:5000/health

---

## 🛠️ Useful Commands

### Check MongoDB Connection:
```bash
cd backend
node test-mongodb.js
```

### List/Create Users:
```bash
cd backend
node manage-users.js
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

## 📝 Sign Up New User

You can sign up directly from the application:
1. Start the server: `start-complete.bat`
2. Open: http://localhost:5000
3. Click "Sign Up"
4. Fill in details:
   - Username
   - Email
   - Password
   - Role (citizen/department_admin/system_admin)
   - Department (if department_admin)

Citizens are auto-approved. Admins need approval from system admin.

---

## 🔧 Troubleshooting

### Can't Login?
1. Check MongoDB is running: `node backend/test-mongodb.js`
2. Verify user exists: `node backend/manage-users.js`
3. Check backend server is running on port 5000
4. Check browser console for errors

### MongoDB Connection Issues?
- Run: `setup-mongodb.bat` for setup instructions
- Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### Port Already in Use?
- Close existing Node.js/Python processes
- Check Task Manager for node.exe and python.exe

---

## 📦 What Gets Started

1. **AI Vision Server** (Port 5007) - Analyzes images
2. **Speech Recognition** (Port 8000) - Hindi voice input
3. **Backend API** (Port 5000) - Main server with proxies
4. **Frontend** (Served through Port 5000 in production)

All services are accessible through Port 5000 when using `start-complete.bat`.

---

## 🎯 Next Steps

1. Run `start-complete.bat`
2. Open http://localhost:5000
3. Login with existing credentials
4. Start reporting issues!

For Visual Studio port forwarding, just forward **Port 5000** and everything will work.
