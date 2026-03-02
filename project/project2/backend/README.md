# Backend Setup with MongoDB

## Prerequisites
- Node.js installed
- MongoDB installed and running locally

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   - Update `.env` file with your MongoDB connection string
   - Change `JWT_SECRET` to a secure random string

3. **Start MongoDB:**
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017/your-app-db`

4. **Run the server:**
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create new report
- `GET /api/reports/:id` - Get report by ID
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

All protected routes require Authorization header: `Bearer <token>`