# Troubleshooting Guide

## My Reports Section Not Working

### Problem
- "My Reports" section shows loading spinner indefinitely
- Error message: "Failed to load reports" or "Unable to connect to server"
- Community feed not displaying data

### Root Causes & Solutions

#### 1. Backend Server Not Running
**Symptoms:** Connection errors, server offline indicator
**Solution:**
```bash
# Option 1: Use the startup script
double-click start-all-services.bat

# Option 2: Manual startup
cd backend
npm install
npm start
```

#### 2. Database Connection Issues
**Symptoms:** Backend starts but reports don't load
**Solution:**
- Ensure MongoDB is installed and running
- Check connection string in backend/.env
- Default: mongodb://localhost:27017/civic-reports

#### 3. Authentication Issues
**Symptoms:** 401/403 errors in browser console
**Solution:**
- Clear browser localStorage
- Re-login to the application
- Check if JWT token is valid

#### 4. Port Conflicts
**Symptoms:** Backend fails to start on port 5000
**Solution:**
```bash
# Check what's using port 5000
netstat -an | findstr :5000

# Kill the process or change port in backend/server.js
```

### Quick Fixes

#### Reset Everything
```bash
# 1. Stop all servers (Ctrl+C in terminals)
# 2. Clear browser data
# 3. Restart servers
cd backend
npm start

# In new terminal
npm run dev
```

#### Use Demo Data
If backend issues persist, the app will automatically show demo data for:
- My Reports section
- Community Feed
- Live Feed

### Verification Steps

1. **Check Backend Status:**
   - Visit http://localhost:5000/health
   - Should return: `{"status":"ok","database":"connected"}`

2. **Check Frontend:**
   - Visit http://localhost:5173
   - Look for "Server Connected" indicator in Dashboard

3. **Check Browser Console:**
   - Press F12 → Console tab
   - Look for error messages

### Common Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Failed to fetch" | Backend not running | Start backend server |
| "Access token required" | Not logged in | Login again |
| "Invalid token" | Expired session | Clear storage, login |
| "Connection refused" | Wrong port/URL | Check API_BASE_URL |

### Still Having Issues?

1. Check if all dependencies are installed:
   ```bash
   cd backend && npm install
   cd .. && npm install
   ```

2. Verify Node.js version:
   ```bash
   node --version  # Should be 16+ 
   ```

3. Check for firewall/antivirus blocking ports 5000 or 5173

4. Try running in incognito/private browser mode

### Demo Mode
If you can't get the backend running, the application will work in demo mode with sample data. All features will be functional except data persistence.