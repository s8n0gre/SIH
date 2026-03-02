# Essential Servers for Google ViT + Website

## Required Servers (4 Total)

### 1. MongoDB Database
- **Port:** 27017
- **Purpose:** Store civic reports and user data
- **Command:** `mongod --dbpath C:\data\db`

### 2. Backend API Server
- **Port:** 5000
- **Purpose:** Node.js API for database operations
- **Command:** `cd backend && npm start`

### 3. Google ViT Server
- **Port:** 5002 (Hugging Face) OR 5006 (Local Model)
- **Purpose:** AI image analysis for municipal issues
- **Commands:**
  - Hugging Face: `cd local-ai-server && python google_vit_server.py`
  - Local Model: `cd local-ai-server && python local_vit_server.py`

### 4. Frontend Website
- **Port:** 3000
- **Purpose:** React web interface
- **Command:** `npm start`

## Quick Start
Run `quick-start.bat` and select option 1 for all essential servers.

## Removed Overlapping AI Scripts
- `server.py` (LLaMA model - not needed for ViT)
- `vit_server.py` (duplicate ViT implementation)
- `gemini_vision_server.py` (alternative vision model)
- `opencv_vision_server.py` (basic computer vision)
- `enhanced_ai_server.py` (complex multi-model server)

## Port Summary
- 3000: Frontend (React Website)
- 5000: Backend API (Node.js)
- 5002: Google ViT (Hugging Face Model)
- 5006: Your Google ViT (Local Model Files)
- 27017: MongoDB Database