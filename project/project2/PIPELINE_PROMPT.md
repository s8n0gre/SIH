# CivicReport Project Pipeline Prompt

## Project Overview
Implement a comprehensive civic reporting platform with the following complete feature set:

## Frontend Stack (React + TypeScript + Vite)
```json
{
  "framework": "React 18.3.1 with TypeScript",
  "bundler": "Vite 5.4.2",
  "styling": "TailwindCSS 3.4.1",
  "icons": "Lucide React 0.344.0",
  "auth": "JWT with localStorage"
}
```

## Backend Stack (Node.js + Express + MongoDB)
```json
{
  "runtime": "Node.js with Express 4.18.2",
  "database": "MongoDB with Mongoose 8.0.0",
  "auth": "JWT + bcryptjs",
  "middleware": "CORS, dotenv"
}
```

## Core Features to Implement

### 1. Authentication System
- **SignIn/SignUp** components with form validation
- **JWT token management** with localStorage
- **Protected routes** with authentication middleware
- **Logout functionality** in header
- **User profile management**

### 2. Report Management System
- **Create reports** with title, description, category, location
- **View all reports** in community feed
- **Real-time status tracking** (pending, in-progress, completed)
- **Voting system** (upvote/downvote reports)
- **Comments and replies** on reports
- **Category filtering** (Roads, Water, Electricity, Waste, Parks, Safety)
- **Report filtering** (all, nearby, trending, recent)

### 3. Interactive Map Features
- **MapView** component with location plotting
- **MiniMap** widget for quick navigation
- **Geolocation integration** for nearby reports
- **Distance calculation** from user location
- **View reports on map** functionality

### 4. Dashboard & Analytics
- **Live dashboard** with report statistics
- **Status counters** (reported, in-progress, solved)
- **User reputation system** with points and badges
- **Report history tracking**

### 5. Emergency System
- **Emergency reporting** component
- **Quick action buttons**
- **Priority handling**

### 6. UI/UX Components
- **Responsive header** with navigation tabs
- **Floating action button** for quick report creation
- **Modal system** (ReportModal, ProfileModal)
- **Error boundary** for error handling
- **Mobile-responsive design**

## Database Schema

### User Model
```javascript
{
  email: String (required, unique),
  password: String (required, hashed),
  name: String (required),
  timestamps: true
}
```

### Report Model
```javascript
{
  title: String (required),
  description: String (required),
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  category: String (required),
  status: String (enum: pending, in-progress, resolved),
  userId: ObjectId (ref: User),
  timestamps: true
}
```

## API Endpoints Structure
```
POST /api/auth/register - User registration
POST /api/auth/login - User login
GET /api/reports - Get all reports
POST /api/reports - Create new report
GET /api/reports/:id - Get report by ID
PUT /api/reports/:id - Update report
DELETE /api/reports/:id - Delete report
GET /api/users/profile - Get user profile
PUT /api/users/profile - Update user profile
```

## State Management
- **AppContext** with React Context API
- **Global state** for reports, user, location
- **Local state** for UI interactions
- **localStorage** for persistence

## Key Functionalities
1. **Real-time community feed** with all user reports
2. **Geolocation-based** nearby reports
3. **Interactive voting** and commenting system
4. **Multi-level filtering** and categorization
5. **Responsive map integration**
6. **User authentication** and profile management
7. **Live statistics dashboard**
8. **Mobile-first responsive design**

## File Structure
```
project/
├── src/
│   ├── components/ (13 React components)
│   ├── config/ (API configuration)
│   ├── store/ (Context management)
│   └── App.tsx (Main application)
├── backend/
│   ├── src/
│   │   ├── config/ (Database connection)
│   │   ├── models/ (User, Report schemas)
│   │   ├── routes/ (API endpoints)
│   │   ├── middleware/ (Authentication)
│   │   └── server.js (Express server)
│   └── .env (Environment variables)
└── Configuration files (Vite, Tailwind, TypeScript)
```

## Implementation Priority
1. Setup backend with MongoDB connection
2. Implement authentication system
3. Create report CRUD operations
4. Build community feed with filtering
5. Add map integration and geolocation
6. Implement voting and commenting
7. Create dashboard and analytics
8. Add emergency features
9. Polish UI/UX and responsiveness

## Environment Setup
```bash
# Frontend
npm install react react-dom @types/react @types/react-dom
npm install -D vite @vitejs/plugin-react typescript
npm install tailwindcss autoprefixer postcss
npm install lucide-react

# Backend
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
npm install -D nodemon
```

This prompt provides a complete blueprint for implementing all features from the CivicReport project.