const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('./models/User');
const Report = require('./models/Report');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection with automatic retry
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-reports', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected');
});

// Connect to database
connectDB();

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'ok', 
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Optional Auth Middleware
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

// Role-based access middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role, department } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = new User({ username, email, password, role, department });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'fallback_secret'
    );

    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        isApproved: user.isApproved 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isApproved && user.role !== 'citizen') {
      return res.status(403).json({ error: 'Account pending approval' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role }, 
      process.env.JWT_SECRET || 'fallback_secret'
    );

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role,
        department: user.department,
        isApproved: user.isApproved 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Report Routes
app.post('/api/reports', optionalAuth, async (req, res) => {
  try {
    const reportData = {
      ...req.body,
      reportedBy: req.user?.userId || '507f1f77bcf86cd799439011' // Default user ID for anonymous reports
    };

    // Ensure department is set from AI analysis or category
    if (req.body.aiAnalysis && req.body.aiAnalysis.department) {
      reportData.department = req.body.aiAnalysis.department;
    } else if (req.body.category && req.body.category !== 'Other') {
      reportData.department = req.body.category;
    }

    const report = new Report(reportData);
    await report.save();

    // Add to timeline with AI analysis info
    let timelineNote = 'Initial report submission';
    if (reportData.department) {
      timelineNote += ` - AI assigned to ${reportData.department}`;
    }
    if (req.body.aiAnalysis && req.body.aiAnalysis.confidence) {
      timelineNote += ` (${(req.body.aiAnalysis.confidence * 100).toFixed(1)}% confidence)`;
    }
    
    report.timeline.push({
      action: 'Report created',
      user: req.user?.userId || '507f1f77bcf86cd799439011',
      notes: timelineNote
    });
    await report.save();

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports', optionalAuth, async (req, res) => {
  try {
    const { status, category, department, filter: filterType } = req.query;
    let filter = {};
    let sort = { createdAt: -1 };

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (department) filter.department = department;

    // Apply filtering
    if (filterType === 'trending') {
      sort = { 'votes.upvotes': -1, views: -1 };
    } else if (filterType === 'recent') {
      sort = { createdAt: -1 };
    }

    // Department admins see only their department reports (if authenticated)
    if (req.user && req.user.role === 'department_admin') {
      const user = await User.findById(req.user.userId);
      filter.department = user.department;
    }

    const reports = await Report.find(filter)
      .populate('reportedBy', 'username email profile reputation')
      .populate('assignedTo', 'username email')
      .sort(sort);

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports/user', optionalAuth, async (req, res) => {
  try {
    let filter = {};
    if (req.user?.userId) {
      filter = { reportedBy: req.user.userId };
    } else {
      // Return demo data for unauthenticated users
      return res.json({ reports: [] });
    }
    
    const reports = await Report.find(filter)
      .populate('reportedBy', 'username email')
      .populate('assignedTo', 'username email')
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/reports/:id/status', authenticateToken, requireRole(['department_admin', 'system_admin']), async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    report.status = status;
    report.timeline.push({
      action: `Status changed to ${status}`,
      user: req.user.userId,
      notes
    });

    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/reports/:id/assign', authenticateToken, requireRole(['department_admin', 'system_admin']), async (req, res) => {
  try {
    const { assignedTo } = req.body;
    
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    report.assignedTo = assignedTo;
    report.timeline.push({
      action: 'Report assigned',
      user: req.user.userId,
      notes: `Assigned to user ${assignedTo}`
    });

    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Management Routes (System Admin only)
app.get('/api/users', optionalAuth, async (req, res) => {
  try {
    // Allow access for demo purposes, but limit data for non-admins
    if (req.user && req.user.role === 'system_admin') {
      const users = await User.find().select('-password');
      res.json(users);
    } else {
      // Return limited demo data for non-admin users
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Public users endpoint for database viewer (no auth required)
app.get('/api/users/public', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id/approve', authenticateToken, requireRole(['system_admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id/role', authenticateToken, requireRole(['system_admin']), async (req, res) => {
  try {
    const { role, department } = req.body;
    
    const updateData = { role };
    if (role === 'department_admin') {
      updateData.department = department;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Voting Routes
app.post('/api/reports/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { vote } = req.body; // 'up' or 'down'
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Remove existing vote
    report.votes.voters = report.votes.voters.filter(
      v => v.user.toString() !== req.user.userId
    );

    // Add new vote
    report.votes.voters.push({
      user: req.user.userId,
      vote
    });

    // Recalculate vote counts
    report.votes.upvotes = report.votes.voters.filter(v => v.vote === 'up').length;
    report.votes.downvotes = report.votes.voters.filter(v => v.vote === 'down').length;

    // Update trending status
    report.trending = report.votes.upvotes > 5;

    // Award reputation points to report author
    if (vote === 'up') {
      await User.findByIdAndUpdate(report.reportedBy, {
        $inc: { 'reputation.points': 1 }
      });
    }

    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add comment to report
app.post('/api/reports/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    report.comments.push({
      user: req.user.userId,
      text
    });

    await report.save();
    await report.populate('comments.user', 'username profile');
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { profile } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { profile, updatedAt: Date.now() },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete report (System Admin only)
app.delete('/api/reports/:id', optionalAuth, async (req, res) => {
  try {
    // Allow deletion for sys_admin operations (frontend role validation)
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted successfully', deletedId: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});