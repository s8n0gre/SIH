# AI Context Guide: Municipal Issue Reporting System

## Project Overview
A full-stack civic reporting platform with AI-powered image analysis and Hindi speech recognition for municipal infrastructure issue reporting.

## Technology Stack

### Frontend (React + TypeScript + Vite)
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 7.3.1
- **Styling**: TailwindCSS 3.4.1
- **State Management**: React Context API (ThemeContext)
- **Mapping**: Leaflet 1.9.4
- **Charts**: Recharts 3.2.1
- **Icons**: Lucide React 0.344.0

### Backend (Node.js + Express)
- **Runtime**: Node.js v16+
- **Framework**: Express 4.18.2
- **Database**: MongoDB (Mongoose 7.5.0)
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 2.4.3
- **Proxy**: http-proxy-middleware 2.0.9

### AI Services (Python)
- **AI Vision Server**: Flask + llama-cpp-python (MiniCPM-V-2.6 model)
- **Speech Recognition**: FastAPI + Transformers (Wav2Vec2 Hindi ASR)
- **Deep Learning**: PyTorch with CUDA support

## Architecture

### Service Architecture (Microservices)
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Port 3000)                      │
│              React + TypeScript + Vite                       │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST API
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend API Server (Port 5000)                  │
│                  Express + MongoDB                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Routes  │  │Report Routes │  │ User Routes  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────────────────────────────────────────┐     │
│  │         Proxy Middleware Layer                    │     │
│  │  /ai-vision → 5007  |  /speech → 8000            │     │
│  └──────────────────────────────────────────────────┘     │
└───────────┬─────────────────────┬────────────────────────┘
            │                     │
            ▼                     ▼
┌──────────────────────┐  ┌──────────────────────┐
│  AI Vision Server    │  │  Speech Recognition  │
│    (Port 5007)       │  │     (Port 8000)      │
│  Flask + MiniCPM     │  │  FastAPI + Wav2Vec2  │
│  GGUF Model (GPU)    │  │  Hindi ASR (GPU)     │
└──────────────────────┘  └──────────────────────┘
            │
            ▼
┌──────────────────────────────────────────────────────────┐
│              MongoDB Database (Port 27017)                │
│  Collections: users, reports, stats                       │
└──────────────────────────────────────────────────────────┘
```

## Data Models

### User Schema (MongoDB)
```javascript
{
  username: String (unique, required),
  email: String (unique, required),
  password: String (bcrypt hashed, required),
  role: Enum ['citizen', 'department_admin', 'system_admin'],
  department: Enum ['Roads & Infrastructure', 'Water Services', 
                    'Electricity', 'Waste Management', 
                    'Parks & Recreation', 'Public Safety'],
  isApproved: Boolean (auto-true for citizens),
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    address: String,
    avatar: String
  },
  reputation: {
    points: Number (default: 0),
    badges: [String],
    level: String (default: 'Citizen')
  },
  banned: Boolean,
  banReason: String,
  bannedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Report Schema (MongoDB)
```javascript
{
  title: String (required),
  description: String (required),
  category: Enum ['Roads & Infrastructure', 'Water Services', 
                  'Electricity', 'Waste Management', 
                  'Parks & Recreation', 'Public Safety', 'Other'],
  location: {
    address: String (required),
    coordinates: {
      latitude: Number (required),
      longitude: Number (required)
    }
  },
  images: [String], // Base64 or URLs
  status: String (default: 'open'),
  priority: Enum ['low', 'medium', 'high', 'urgent'],
  reportedBy: ObjectId (ref: User),
  assignedTo: ObjectId (ref: User),
  department: String,
  votes: {
    upvotes: Number,
    downvotes: Number,
    voters: [{
      user: ObjectId (ref: User),
      vote: Enum ['up', 'down']
    }]
  },
  views: Number,
  trending: Boolean,
  comments: [{
    user: ObjectId (ref: User),
    text: String,
    timestamp: Date
  }],
  aiAnalysis: {
    confidence: Number,
    detectedObjects: [String],
    detectedIssues: [String]
  },
  timeline: [{
    action: String,
    user: ObjectId (ref: User),
    timestamp: Date,
    notes: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Stats Schema (MongoDB)
```javascript
{
  totalReports: Number,
  inProgress: Number,
  completed: Number,
  pending: Number,
  activeUsers: Number,
  lastUpdated: Date
}
```

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user (returns JWT token)

### Report Routes
- `POST /api/reports` - Create new report (optional auth)
- `GET /api/reports` - Get all reports with filters (optional auth)
- `GET /api/reports/user` - Get user's reports (requires auth)
- `PUT /api/reports/:id/status` - Update report status
- `PUT /api/reports/:id/assign` - Assign report (dept/sys admin)
- `DELETE /api/reports/:id` - Delete report (sys admin)
- `POST /api/reports/:id/vote` - Vote on report (requires auth)
- `POST /api/reports/:id/comments` - Add comment (requires auth)

### User Management Routes
- `GET /api/users` - Get all users (requires auth)
- `GET /api/users/public` - Get users (no auth, for DB viewer)
- `GET /api/users/profile` - Get user profile (requires auth)
- `PUT /api/users/profile` - Update profile (requires auth)
- `PUT /api/users/:id/approve` - Approve user (sys admin)
- `PUT /api/users/:id/role` - Update user role
- `PUT /api/users/:id/department` - Update department
- `PUT /api/users/:id/ban` - Ban user

### Stats Routes
- `GET /api/stats/global` - Get global statistics

### AI Service Routes (Proxied)
- `POST /ai-vision/analyze` - Analyze image (multipart/form-data)
- `POST /ai-vision/analyze_base64` - Analyze base64 image
- `GET /ai-vision/health` - AI service health check
- `POST /speech/transcribe` - Transcribe audio to Hindi text
- `GET /speech/health` - Speech service health check

### Health Check
- `GET /health` - Backend health + MongoDB status

## Request/Response Flow

### 1. User Registration Flow
```
Frontend → POST /api/auth/register
  Body: { username, email, password, role, department }
    ↓
Backend validates → Creates User in MongoDB
    ↓
Hashes password (bcrypt) → Saves user
    ↓
Generates JWT token → Returns { token, user }
    ↓
Frontend stores token in localStorage
```

### 2. Report Creation Flow
```
Frontend → User fills form + uploads image
    ↓
Image converted to base64
    ↓
POST /ai-vision/analyze_base64 { image: base64 }
    ↓
AI Vision Server (MiniCPM model on GPU)
  - Loads GGUF model (ggml-model-IQ3_M.gguf)
  - Analyzes image with vision-language model
  - Returns: { category, department, description, confidence }
    ↓
Frontend → POST /api/reports
  Body: { title, description, category, location, images, aiAnalysis }
    ↓
Backend creates Report in MongoDB
  - Auto-assigns department based on AI analysis
  - Creates timeline entry
  - Updates global stats
    ↓
Returns created report → Frontend shows success
```

### 3. Voice Input Flow
```
Frontend → User records audio (WebM/OGG format)
    ↓
POST /speech/transcribe (multipart/form-data)
    ↓
Speech Server (FastAPI + Wav2Vec2)
  - Converts audio to mono 16kHz
  - Loads Hindi ASR model (ai4bharatindicwav2vec-hindi)
  - Runs inference on GPU
  - Returns: { transcript: "हिंदी text" }
    ↓
Frontend fills description field with transcript
```

### 4. Authentication Flow
```
Every authenticated request includes:
  Headers: { Authorization: "Bearer <JWT_TOKEN>" }
    ↓
Backend middleware (authenticateToken)
  - Extracts token from header
  - Verifies JWT signature
  - Decodes userId and role
  - Attaches to req.user
    ↓
Route handler checks permissions
  - requireRole(['system_admin']) for admin routes
  - optionalAuth for public routes
```

## Frontend Architecture

### Component Structure
```
src/
├── App.tsx                    # Main app with routing & auth
├── main.tsx                   # Entry point
├── components/
│   ├── Auth.tsx              # Login/Register
│   ├── HomePage.tsx          # Dashboard home
│   ├── ReportIssue.tsx       # Report creation form
│   ├── CommunityFeed.tsx     # Public feed of reports
│   ├── AdminDashboard.tsx    # Admin panel
│   ├── SystemAdmin.tsx       # System admin panel
│   ├── DatabaseViewer.tsx    # MongoDB data viewer
│   ├── VoiceInput.tsx        # Hindi speech recording
│   ├── MapComponent.tsx      # Leaflet map integration
│   ├── Header.tsx            # Top navigation
│   ├── Messages.tsx          # Chat/messaging
│   ├── Helpline.tsx          # Emergency contacts
│   └── [20+ more components]
├── contexts/
│   └── ThemeContext.tsx      # Dark/light theme
├── hooks/
│   └── useSwipeNavigation.ts # Mobile swipe gestures
└── services/
    ├── api.ts                # API service layer
    ├── aiModel.ts            # AI integration
    └── i18n.ts               # Internationalization
```

### State Management
- **Local State**: useState for component-level state
- **Context API**: ThemeContext for global theme
- **LocalStorage**: authToken, civicUser, introSeen
- **API Service**: Centralized API calls with retry logic

### Routing (Tab-based)
- home → HomePage
- report → ReportIssue
- feed → CommunityFeed
- messages → Messages
- helpline → Helpline

## Backend Architecture

### Middleware Stack
1. CORS (allow all origins)
2. express.json (50mb limit for images)
3. express.urlencoded (50mb limit)
4. authenticateToken (JWT verification)
5. optionalAuth (JWT if present)
6. requireRole (role-based access)

### Database Connection
- Auto-retry on connection failure
- Fallback to demo mode if MongoDB unavailable
- Connection events: disconnected, reconnected
- Health check endpoint reports DB status

### Proxy Configuration
Backend proxies AI services to avoid CORS:
- `/ai-vision/*` → `http://localhost:5007`
- `/speech/*` → `http://localhost:8000`

## AI Services

### 1. AI Vision Server (direct_minicpm_server.py)
**Purpose**: Analyze infrastructure images and categorize issues

**Model**: MiniCPM-V-2.6 (Vision-Language Model)
- File: `ggml-model-IQ3_M.gguf` (>1GB)
- Format: GGUF (quantized for efficiency)
- Runs on: NVIDIA GPU (CUDA)

**Configuration**:
```python
llm = Llama(
    model_path="ggml-model-IQ3_M.gguf",
    chat_handler=MiniCPMv26ChatHandler,
    n_ctx=4096,           # Context window
    n_gpu_layers=-1,      # All layers on GPU
    main_gpu=0,           # Use GPU 0
    use_mmap=False,       # Load to RAM first
    use_mlock=True,       # Lock in memory
    n_threads=1,          # Single thread (GPU mode)
)
```

**Analysis Process**:
1. Receives base64 image
2. Sends to MiniCPM with prompt: "Describe the municipal infrastructure issue in 2–3 concise sentences"
3. Model generates description
4. Categorizes based on keywords (road, water, electricity, etc.)
5. Returns structured analysis

**Fallback Mode**: If model fails to load, returns basic categorization

### 2. Speech Recognition Server (asr_backend.py)
**Purpose**: Transcribe Hindi audio to text

**Model**: AI4Bharat IndicWav2Vec Hindi
- Path: `./ai4bharatindicwav2vec-hindi/`
- Architecture: Wav2Vec2ForCTC
- Language: Hindi (Devanagari script)
- Runs on: NVIDIA GPU (CUDA)

**Audio Processing**:
1. Accepts WebM/OGG/MP3/WAV audio
2. Converts to mono 16kHz using pydub
3. Resamples if needed (torchaudio)
4. Processes with Wav2Vec2Processor
5. Runs CTC inference on GPU
6. Decodes to Hindi text

**Configuration**:
```python
processor = Wav2Vec2Processor.from_pretrained(MODEL_PATH)
model = Wav2Vec2ForCTC.from_pretrained(MODEL_PATH).to("cuda:0")
```

## Startup Sequence

### Complete Startup (start-complete.bat)
```
Step 1: Test MongoDB connection
  → Runs backend/test-mongodb.js
  → Exits if MongoDB not available

Step 2: Check dependencies
  → Installs http-proxy-middleware if missing

Step 3: Start AI Vision Server
  → python direct_minicpm_server.py
  → Runs in minimized window on port 5007

Step 4: Start Speech Recognition Server
  → python -m uvicorn asr_backend:app --port 8000
  → Runs in minimized window

Step 5: Start Backend API Server
  → cd backend && node server.js
  → Runs in visible window on port 5000
  → Proxies AI services

Step 6: Open browser
  → http://localhost:5000
  → Runs API tests
```

### Development Mode (start-dev.bat)
- Frontend: `npm run dev` (port 3000)
- Backend: `cd backend && node server.js` (port 5000)
- AI services: Started separately

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/civic-reports
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### Python Services
```
CUDA_VISIBLE_DEVICES=0      # Use GPU 0
LLAMA_CUBLAS=1              # Force CUDA kernels
```

## Key Features Implementation

### 1. AI-Powered Image Analysis
- User uploads image → Converted to base64
- Sent to MiniCPM vision model
- Model analyzes infrastructure damage
- Auto-categorizes and assigns department
- Confidence score returned

### 2. Hindi Speech Recognition
- User records voice → WebM audio blob
- Sent to Wav2Vec2 ASR server
- Transcribed to Hindi (Devanagari)
- Auto-fills description field

### 3. Real-time Stats
- MongoDB aggregation on reports collection
- Cached in Stats collection
- Updated on every report creation/status change
- Displayed on dashboard

### 4. Role-Based Access Control
- **Citizen**: Create reports, vote, comment
- **Department Admin**: View department reports, assign, update status
- **System Admin**: Full access, user management, delete reports

### 5. Voting & Trending
- Users vote up/down on reports
- Reputation points awarded to report author
- Reports with >5 upvotes marked as trending
- Sorted by votes in feed

### 6. Timeline Tracking
- Every action logged in report.timeline
- Includes: creation, assignment, status changes
- Shows user who performed action
- Displayed in report details

## Database Operations

### Report Creation
```javascript
1. Validate required fields (title, description, category)
2. Get/create anonymous user if not authenticated
3. Map department from AI analysis
4. Create Report document
5. Add timeline entry
6. Update Stats collection
7. Return created report
```

### Stats Update
```javascript
async function updateStats() {
  totalReports = await Report.countDocuments()
  inProgress = await Report.countDocuments({ status: 'in-progress' })
  completed = await Report.countDocuments({ status: 'completed' })
  pending = await Report.countDocuments({ status: 'pending' })
  activeUsers = await User.countDocuments({ isApproved: true })
  
  await Stats.findOneAndUpdate({}, { ...stats }, { upsert: true })
}
```

## Security Implementation

### Password Security
- Hashed with bcryptjs (12 rounds)
- Never stored in plain text
- Compared using bcrypt.compare()

### JWT Authentication
- Token generated on login/register
- Includes: userId, role
- Verified on protected routes
- Stored in localStorage (frontend)

### Role-Based Authorization
```javascript
requireRole(['system_admin']) // Only sys admin
requireRole(['department_admin', 'system_admin']) // Admin or sys admin
optionalAuth // Public route, auth if present
```

### Input Validation
- Required fields checked
- Enum validation for categories, roles
- MongoDB schema validation
- File size limits (50mb)

## Error Handling

### Backend
- Try-catch blocks on all routes
- Mongoose validation errors
- JWT verification errors
- MongoDB connection errors
- Returns JSON error responses

### Frontend
- API service retry logic (3 attempts)
- Fallback to demo data if backend unavailable
- Connection status monitoring
- User-friendly error notifications

### AI Services
- Model loading fallback mode
- Basic categorization if AI fails
- Health check endpoints
- Graceful degradation

## Performance Optimizations

### Backend
- MongoDB indexing on frequently queried fields
- Populate only required fields
- Pagination support (via query params)
- Connection pooling (Mongoose default)

### Frontend
- Code splitting (Vite)
- Lazy loading components
- Image compression before upload
- Debounced search/filter

### AI Services
- GPU acceleration (CUDA)
- Model quantization (GGUF format)
- Memory locking (use_mlock)
- Single-threaded GPU mode

## Deployment Considerations

### Production Mode
- `NODE_ENV=production`
- Backend serves static frontend files
- All services on same domain (no CORS)
- MongoDB Atlas for cloud database

### Scaling
- Backend: Horizontal scaling with load balancer
- AI Services: Queue-based processing (Redis/RabbitMQ)
- Database: MongoDB replica set
- Frontend: CDN for static assets

## Troubleshooting Guide

### MongoDB Connection Failed
- Check if MongoDB service is running
- Verify connection string in .env
- Use MongoDB Atlas as alternative

### AI Model Not Loading
- Verify GGUF file exists and >1GB
- Check CUDA installation
- Falls back to basic categorization

### Port Conflicts
- Change ports in respective config files
- Update proxy configuration
- Check for processes using ports

### GPU Not Detected
- Install CUDA toolkit
- Install PyTorch with CUDA support
- Set CUDA_VISIBLE_DEVICES=0

## File Structure Summary
```
CrowdSource/
├── backend/              # Node.js Express API
│   ├── models/          # Mongoose schemas
│   ├── server.js        # Main server file
│   └── .env             # Environment variables
├── src/                 # React frontend
│   ├── components/      # React components
│   ├── services/        # API service layer
│   └── App.tsx          # Main app component
├── ai4bharatindicwav2vec-hindi/  # Hindi ASR model
├── direct_minicpm_server.py      # AI vision server
├── asr_backend.py                # Speech recognition server
├── ggml-model-IQ3_M.gguf        # MiniCPM vision model
├── requirements.txt              # Python dependencies
├── package.json                  # Frontend dependencies
├── start-complete.bat            # Complete startup script
└── vite.config.ts               # Vite configuration
```

## Development Workflow

1. **Start MongoDB**: `net start MongoDB` or use Atlas
2. **Install Dependencies**: 
   - `npm install` (frontend)
   - `cd backend && npm install` (backend)
   - `pip install -r requirements.txt` (Python)
3. **Start Services**: Run `start-complete.bat`
4. **Access Application**: http://localhost:5000 or http://localhost:3000 (dev)
5. **Test APIs**: Use test-api.bat or Postman

## Testing Endpoints

### Health Checks
- Backend: `GET http://localhost:5000/health`
- AI Vision: `GET http://localhost:5007/health`
- Speech: `GET http://localhost:8000/health`

### Quick Test
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get Reports
curl http://localhost:5000/api/reports
```

---

**This document provides complete context for AI assistants to understand the project architecture, data flow, and implementation details.**
