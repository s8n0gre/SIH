# Trash Folder

This folder contains redundant and obsolete files that are no longer needed for the project.

## Files Moved Here:

### Redundant HTML Files:
- `admin-login.html` - Replaced by React Auth component
- `admin.html` - Replaced by React AdminDashboard component

### Obsolete GPU/CUDA Scripts:
- `check_gpu.py` - GPU checking utility (not needed)
- `force_nvidia_gpu.bat` - GPU forcing script (not needed)
- `install_cuda.bat` - CUDA installation script (not needed)

### Duplicate/Old Startup Scripts:
- `start-project.bat` - Old startup script (replaced by start-complete.bat)
- `start-unified.bat` - Duplicate of start-complete.bat

### Development Files:
- `test-api.http` - API testing file (replaced by test-api.bat)
- `Dockerfile` - Docker configuration (not currently used)
- `create-admin.js` - Replaced by manage-users.js

## Active Files to Use:

### Startup:
- `launcher.bat` - Main menu launcher
- `start-complete.bat` - Single port (5000) startup
- `start-dev.bat` - Development mode
- `start-production.bat` - Production build

### Utilities:
- `backend/manage-users.js` - User management
- `backend/test-mongodb.js` - Test database
- `backend/test-auth.js` - Test authentication
- `backend/reset-password.js` - Reset user passwords
- `test-api.bat` - Test API endpoints

### Documentation:
- `README.md` - Main project documentation
- `QUICK-START.md` - Quick start guide
- `STARTUP-GUIDE.md` - Detailed startup guide

You can safely delete this entire folder if needed.
