const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
require('dotenv').config();

const User = require('./models/User');
const Report = require('./models/Report');
const Stats = require('./models/Stats');
const { Conversation, Message } = require('./models/Chat');
const Friendship = require('./models/Friendship');
const Notification = require('./models/Notification');
const snSync = require('./servicenow-sync');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection with automatic retry and fallback
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-reports';

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`âœ… MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('âŒ MongoDB connection error:', error.message);
    console.log('ðŸ’¡ MongoDB not available. Server will run with limited functionality.');
    console.log('ðŸ“‹ To fix: Install MongoDB or use MongoDB Atlas cloud database');
    return false;
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('âš ï¸ MongoDB disconnected. Attempting to reconnect...');
});
mongoose.connection.on('reconnected', () => {
  console.log('âœ… MongoDB reconnected');
});

let dbConnected = false;
connectDB().then(connected => {
  dbConnected = connected;
  if (!connected) console.log('âš ï¸  Running in demo mode without database');
});

// Health check endpoint
app.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    database: dbStatus,
    mongodb_available: dbConnected,
    demo_mode: !dbConnected,
    timestamp: new Date().toISOString()
  });
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Auth Middleware â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
      if (!err) req.user = user;
    });
  }
  next();
};

const requireRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Auth Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role, departmentId, phoneNumber, address } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const user = new User({ username, email, password, role, departmentId, phoneNumber, address });
    await user.save();

    // Sync new citizen to ServiceNow
    snSync.pushCitizen(user).catch(e => console.warn('[SN Sync] register push failed:', e.message));

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
        isApproved: user.isApproved,
        isActive: user.isActive,
        isVerified: user.isVerified,
        reputationPoints: user.reputationPoints,
        level: user.level
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

    // Update lastLoginAt and reset failed attempts
    await User.findByIdAndUpdate(user._id, {
      lastLoginAt: new Date(),
      failedLoginAttempts: 0
    });

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
        departmentId: user.departmentId,
        isApproved: user.isApproved,
        isActive: user.isActive,
        isVerified: user.isVerified,
        reputationPoints: user.reputationPoints,
        level: user.level,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Report Routes â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.post('/api/reports', optionalAuth, async (req, res) => {
  try {
    console.log('POST /api/reports - Request body:', req.body);

    if (!req.body.title || !req.body.description || !req.body.category) {
      return res.status(400).json({ error: 'Missing required fields: title, description, category' });
    }

    // Ensure a reportedBy user exists (anonymous fallback)
    let reportedBy = req.user?.userId;
    if (!reportedBy) {
      let anonymousUser = await User.findOne({ username: 'anonymous' });
      if (!anonymousUser) {
        anonymousUser = await new User({
          username: 'anonymous',
          email: 'anonymous@system.local',
          password: 'anonymous123',
          role: 'citizen'
        }).save();
      }
      reportedBy = anonymousUser._id;
    }

    // Normalise location fields â€” support both old nested shape and new flat shape
    const locationAddress =
      req.body.locationAddress ||
      req.body.location?.address ||
      'Unknown';
    const latitude =
      req.body.latitude ??
      req.body.location?.coordinates?.latitude ??
      23.3441;
    const longitude =
      req.body.longitude ??
      req.body.location?.coordinates?.longitude ??
      85.3096;

    // Normalise AI analysis â€” support old aiAnalysis object and new flat fields
    const ai = req.body.aiAnalysis || {};
    const aiDetectedCategory = req.body.aiDetectedCategory || ai.category || null;
    const aiSeverityPrediction = req.body.aiSeverityPrediction || ai.priority || null;
    const aiConfidenceScore = req.body.aiConfidenceScore ?? ai.confidence ?? null;
    const aiRecommendation = req.body.aiRecommendation || ai.description || null;
    const aiModelVersion = req.body.aiModelVersion || null;

    // Department routing
    const departmentMapping = {
      'Roads Department': 'Roads & Infrastructure',
      'Water Department': 'Water Services',
      'Electricity Department': 'Electricity',
      'Waste Department': 'Waste Management',
      'Parks Department': 'Parks & Recreation',
      'Safety Department': 'Public Safety',
      'Infrastructure Failure Department': 'Roads & Infrastructure',
      'Utility Failure Department': 'Electricity',
      'Water System Failure Department': 'Water Services',
      'Fire Hazard Department': 'Public Safety',
      'Flood/Water Hazard Department': 'Water Services',
      'Environmental Contamination Department': 'Public Safety'
    };

    let departmentId = req.body.departmentId || req.body.department || req.body.category;
    if (departmentMapping[departmentId]) departmentId = departmentMapping[departmentId];

    const reportData = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      subCategory: req.body.subCategory || null,
      departmentId,
      reportedBy,
      wardId: req.body.wardId || null,
      zoneId: req.body.zoneId || null,
      municipalityId: req.body.municipalityId || null,
      locationAddress,
      latitude,
      longitude,
      impact: req.body.impact || 'medium',
      urgency: req.body.urgency || 'medium',
      priority: req.body.priority || (aiConfidenceScore > 0.8 ? 'high' : 'medium'),
      status: req.body.status || 'open',
      images: req.body.images || [],
      attachments: req.body.attachments || [],
      isAnonymous: req.body.isAnonymous || false,
      aiDetectedCategory,
      aiSeverityPrediction,
      aiConfidenceScore,
      aiRecommendation,
      aiModelVersion
    };

    console.log('Creating report with data:', reportData);
    const report = new Report(reportData);
    await report.save();
    console.log('Report saved with ID:', report._id, '| Ticket:', report.ticketNumber);

    // Initial timeline entry
    let timelineNote = 'Initial report submission';
    if (departmentId) timelineNote += ` - routed to ${departmentId}`;
    if (aiConfidenceScore) timelineNote += ` (AI confidence: ${(aiConfidenceScore * 100).toFixed(1)}%)`;

    report.timeline.push({ action: 'Report created', user: reportedBy, notes: timelineNote });
    await report.save();

    // Sync new report to ServiceNow (non-blocking)
    snSync.pushReport(report).catch(e => console.warn('[SN Sync] report push failed:', e.message));

    await updateStats();
    console.log('Stats updated after report creation');

    res.status(201).json(report);
  } catch (error) {
    console.error('POST /api/reports error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports', optionalAuth, async (req, res) => {
  try {
    const { status, category, departmentId, department, filter: filterType } = req.query;
    let filter = {};
    let sort = { updatedAt: -1, createdAt: -1 };

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (departmentId || department) filter.departmentId = departmentId || department;

    if (filterType === 'trending') {
      sort = { upvotes: -1, views: -1, updatedAt: -1 };
    } else if (filterType === 'recent') {
      sort = { createdAt: -1 };
    } else if (filterType === 'updated') {
      sort = { updatedAt: -1 };
    }

    if (req.user && req.user.role === 'department_admin') {
      const user = await User.findById(req.user.userId);
      filter.departmentId = user.departmentId;
    }

    const reports = await Report.find(filter)
      .populate('reportedBy', 'username email reputationPoints level')
      .populate('assignedTo', 'username email')
      .sort(sort);

    console.log(`Reports query: ${reports.length} reports found with filter:`, filter);
    res.json(reports);
  } catch (error) {
    console.error('Reports fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports/user', optionalAuth, async (req, res) => {
  try {
    if (!req.user?.userId) return res.json({ reports: [] });

    const reports = await Report.find({ reportedBy: req.user.userId })
      .populate('reportedBy', 'username email')
      .populate('assignedTo', 'username email')
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/reports/:id/status', async (req, res) => {
  try {
    const { status, notes } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    report.status = status;
    report.updatedAt = new Date();

    // Stamp resolved / closed timestamps
    if (status === 'resolved' && !report.resolvedAt) report.resolvedAt = new Date();
    if (status === 'closed' && !report.closedAt) report.closedAt = new Date();

    if (notes) {
      report.timeline.push({ action: `Status changed to ${status}`, notes });
    }

    await report.save();
    await updateStats();

    // Sync status update to ServiceNow (non-blocking)
    snSync.pushReport(report).catch(e => console.warn('[SN Sync] status push failed:', e.message));

    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/reports/:id/assign', authenticateToken, requireRole(['department_admin', 'system_admin']), async (req, res) => {
  try {
    const { assignedTo, assignmentGroupId } = req.body;

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    report.assignedTo = assignedTo;
    if (assignmentGroupId) report.assignmentGroupId = assignmentGroupId;
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ User Management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

app.put('/api/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    await User.findByIdAndUpdate(req.params.id, { role });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update role' });
  }
});

app.put('/api/users/:id/department', async (req, res) => {
  try {
    const { departmentId } = req.body;
    await User.findByIdAndUpdate(req.params.id, { departmentId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update department' });
  }
});

app.put('/api/users/:id/ban', async (req, res) => {
  try {
    const { banned, reason } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { banned: banned ?? true },
      { new: true }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to ban user' });
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

// Update user profile (top-level fields)
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { phoneNumber, address, profileImageUrl } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { phoneNumber, address, profileImageUrl, updatedAt: Date.now() },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Voting Route â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.post('/api/reports/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { vote } = req.body; // 'up' or 'down'
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const userId = req.user.userId.toString();

    // Remove previous vote by this user
    report.uniqueVoterIds = report.uniqueVoterIds.filter(v => !v.startsWith(userId));

    // Record new vote: stored as "userId:up" or "userId:down"
    report.uniqueVoterIds.push(`${userId}:${vote}`);

    // Recount
    report.upvotes = report.uniqueVoterIds.filter(v => v.endsWith(':up')).length;
    report.downvotes = report.uniqueVoterIds.filter(v => v.endsWith(':down')).length;

    // Engagement
    report.engagementScore = report.upvotes - report.downvotes;
    report.trending = report.upvotes > 5;

    // Award reputation point to report author on upvote
    if (vote === 'up') {
      await User.findByIdAndUpdate(report.reportedBy, {
        $inc: { reputationPoints: 1 }
      });
    }

    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Comments Route â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.post('/api/reports/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    report.comments.push({ user: req.user.userId, text });
    await report.save();
    await report.populate('comments.user', 'username profileImageUrl');
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const updateStats = async () => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday); startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalReports,
      reportsToday,
      reportsThisWeek,
      reportsThisMonth,
      reportsLastMonth,
      highPriorityCount,
      mediumPriorityCount,
      lowPriorityCount,
      activeUsers,
      totalComments,
      allReports
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ createdAt: { $gte: startOfToday } }),
      Report.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Report.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Report.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Report.countDocuments({ priority: { $in: ['high', 'urgent'] } }),
      Report.countDocuments({ priority: 'medium' }),
      Report.countDocuments({ priority: 'low' }),
      User.countDocuments({ isApproved: true, isActive: true }),
      Report.aggregate([{ $project: { count: { $size: '$comments' } } }, { $group: { _id: null, total: { $sum: '$count' } } }]),
      Report.find({}, 'status priority departmentId category wardId upvotes downvotes createdAt resolvedAt')
    ]);

    // Build breakdown maps
    const reportsByStatus = {};
    const reportsByPriority = {};
    const reportsByDepartment = {};
    const reportsByCategory = {};
    const reportsByWard = {};
    let totalVotes = 0;

    allReports.forEach(r => {
      reportsByStatus[r.status] = (reportsByStatus[r.status] || 0) + 1;
      reportsByPriority[r.priority] = (reportsByPriority[r.priority] || 0) + 1;
      if (r.departmentId) reportsByDepartment[r.departmentId] = (reportsByDepartment[r.departmentId] || 0) + 1;
      if (r.category) reportsByCategory[r.category] = (reportsByCategory[r.category] || 0) + 1;
      if (r.wardId) reportsByWard[r.wardId] = (reportsByWard[r.wardId] || 0) + 1;
      totalVotes += (r.upvotes || 0) + (r.downvotes || 0);
    });

    // Growth rate (month-on-month)
    const growthRate = reportsLastMonth > 0
      ? parseFloat(((reportsThisMonth - reportsLastMonth) / reportsLastMonth * 100).toFixed(2))
      : 0;

    // Average resolution time (hours) for resolved reports
    const resolvedReports = allReports.filter(r => r.resolvedAt && r.createdAt);
    const averageResolutionTime = resolvedReports.length
      ? parseFloat((resolvedReports.reduce((sum, r) => sum + (r.resolvedAt - r.createdAt) / 3600000, 0) / resolvedReports.length).toFixed(2))
      : 0;

    // Median resolution time
    const sortedTimes = resolvedReports
      .map(r => (r.resolvedAt - r.createdAt) / 3600000)
      .sort((a, b) => a - b);
    const medianResolutionTime = sortedTimes.length
      ? parseFloat((sortedTimes.length % 2 === 0
        ? (sortedTimes[sortedTimes.length / 2 - 1] + sortedTimes[sortedTimes.length / 2]) / 2
        : sortedTimes[Math.floor(sortedTimes.length / 2)]).toFixed(2))
      : 0;

    // Top trending category
    const topTrendingCategory = Object.entries(reportsByCategory)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    const totalCommentsCount = totalComments[0]?.total || 0;

    await Stats.findOneAndUpdate(
      {},
      {
        totalReports,
        reportsToday,
        reportsThisWeek,
        reportsThisMonth,
        reportsLastMonth,
        growthRate,
        reportsByStatus,
        reportsByPriority,
        reportsByDepartment,
        reportsByCategory,
        reportsByWard,
        highPriorityCount,
        mediumPriorityCount,
        lowPriorityCount,
        overdueReports: 0,       // placeholder â€” requires SLA deadline logic
        slaBreachedCount: 0,     // placeholder â€” requires SLA deadline logic
        averageResponseTime: 0,  // placeholder â€” requires first-response timestamp
        averageResolutionTime,
        medianResolutionTime,
        topTrendingCategory,
        totalComments: totalCommentsCount,
        totalVotes,
        activeUsers,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Stats update error:', error);
  }
  // Push updated stats to ServiceNow after each recalculation
  try {
    const latestStats = await Stats.findOne();
    if (latestStats) snSync.pushStats(latestStats).catch(e => console.warn('[SN Sync] stats push failed:', e.message));
  } catch (_) { }
};

app.get('/api/stats/global', async (req, res) => {
  try {
    await updateStats();
    let stats = await Stats.findOne();
    if (!stats) {
      stats = {
        totalReports: 0,
        reportsToday: 0,
        reportsThisWeek: 0,
        reportsThisMonth: 0,
        activeUsers: 0,
        reportsByStatus: {},
        reportsByPriority: {}
      };
    }
    res.json(stats);
  } catch (error) {
    console.error('Global stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Delete Report â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.delete('/api/reports/:id', optionalAuth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: 'Report deleted successfully', deletedId: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Friends / Connections â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// Search all users + return friendship status relative to the requester
app.get('/api/friends/search', async (req, res) => {
  try {
    const { q = '', userId } = req.query;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    let uId;
    try {
      uId = new mongoose.Types.ObjectId(userId);
    } catch {
      return res.status(400).json({ error: 'invalid userId' });
    }

    const filter = q.trim()
      ? { _id: { $ne: uId }, $or: [{ username: { $regex: q, $options: 'i' } }, { email: { $regex: q, $options: 'i' } }] }
      : { _id: { $ne: uId } };

    const users = await User.find(filter, '_id username email role profileImageUrl').lean();

    // Fetch all friendships involving this user
    const friendships = await Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }]
    }).lean();

    const withStatus = users.map(u => {
      const f = friendships.find(fs =>
        fs.requester.toString() === u._id.toString() ||
        fs.recipient.toString() === u._id.toString()
      );
      let friendStatus = 'none';
      if (f) {
        if (f.status === 'accepted') friendStatus = 'friends';
        else if (f.status === 'pending') {
          friendStatus = f.requester.toString() === userId ? 'sent' : 'received';
        } else {
          friendStatus = f.status; // rejected
        }
      }
      return { ...u, friendStatus, friendshipId: f?._id || null };
    });

    res.json(withStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────── Notifications ──────────────────────────────

// GET unread count
app.get('/api/notifications/unread/:userId', async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.params.userId, read: false });
    res.json({ count });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET all notifications for a user (latest 40)
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.params.userId })
      .populate('fromUserId', 'username profileImageUrl')
      .sort({ createdAt: -1 })
      .limit(40)
      .lean();
    res.json(notifs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT mark one as read
app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Mark all notifications as read for a user
app.put('/api/notifications/mark-all-read/:userId', async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.params.userId, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear all notifications for a user
app.delete('/api/notifications/clear-all/:userId', async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.params.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────── Friends / Connections ───────────────────────

// Send a friend request
app.post('/api/friends/request', async (req, res) => {
  try {
    const { requesterId, recipientId } = req.body;
    if (!requesterId || !recipientId) return res.status(400).json({ error: 'requesterId and recipientId required' });
    if (requesterId === recipientId) return res.status(400).json({ error: 'Cannot friend yourself' });

    const existing = await Friendship.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId }
      ]
    });
    if (existing) return res.status(409).json({ error: 'Friendship already exists', status: existing.status });

    const f = await new Friendship({ requester: requesterId, recipient: recipientId }).save();

    // Notify recipient
    const requester = await User.findById(requesterId, 'username').lean();
    await new Notification({
      userId: recipientId,
      fromUserId: requesterId,
      type: 'friend_request',
      message: `${requester?.username || 'Someone'} sent you a friend request`,
      meta: { friendshipId: f._id }
    }).save();

    res.status(201).json(f);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept a friend request
app.put('/api/friends/:id/accept', async (req, res) => {
  try {
    const f = await Friendship.findById(req.params.id);
    if (!f) return res.status(404).json({ error: 'Friendship not found' });

    // Mark original friend request notification as handled
    // (Do this first so even historically stuck clicks resolve themselves)
    await Notification.updateMany(
      { 'meta.friendshipId': f._id, type: 'friend_request', 'meta.handled': { $ne: true } },
      { $set: { 'meta.handled': true, 'read': true } }
    );

    // Prevent duplicate accepts from creating multiple notifications
    if (f.status === 'accepted') {
      return res.json(f);
    }

    f.status = 'accepted';
    await f.save();

    // Notify requester that their request was accepted
    const recipient = await User.findById(f.recipient, 'username').lean();
    await new Notification({
      userId: f.requester,
      fromUserId: f.recipient,
      type: 'friend_accepted',
      message: `${recipient?.username || 'Someone'} accepted your friend request`,
      meta: { friendshipId: f._id }
    }).save();

    res.json(f);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject / remove a friendship
app.delete('/api/friends/:id', async (req, res) => {
  try {
    await Friendship.findByIdAndDelete(req.params.id);

    // Mark original friend request notification as handled
    await Notification.updateMany(
      { 'meta.friendshipId': req.params.id, type: 'friend_request' },
      { $set: { 'meta.handled': true, 'read': true } }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all accepted friends for a user
app.get('/api/friends/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const friendships = await Friendship.find({
      $or: [{ requester: userId }, { recipient: userId }],
      status: 'accepted'
    }).populate('requester recipient', 'username email role profileImageUrl').lean();

    const friends = friendships.map(f => {
      const friend = f.requester._id.toString() === userId ? f.recipient : f.requester;
      return { ...friend, friendshipId: f._id };
    });
    res.json(friends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Chat Routes (MongoDB only) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// ServiceNow is never involved in any of these routes.

// 1. Get all users available to chat with
app.get('/api/chat/users', async (req, res) => {
  try {
    const users = await User.find({}, '_id username email role profileImageUrl').lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get all conversations for a user
app.get('/api/chat/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'username email role profileImageUrl')
      .sort({ lastMessageAt: -1 })
      .lean();

    // Attach unread count for this user
    const withUnread = await Promise.all(conversations.map(async (conv) => {
      const unread = await Message.countDocuments({
        conversationId: conv._id,
        senderId: { $ne: userId },
        read: false
      });
      return { ...conv, unread };
    }));

    res.json(withUnread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Create or retrieve an existing conversation between two users
app.post('/api/chat/conversations', async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;
    if (!userId1 || !userId2) return res.status(400).json({ error: 'userId1 and userId2 required' });

    // Look for an existing conversation with exactly these two participants
    let conv = await Conversation.findOne({
      participants: { $all: [userId1, userId2], $size: 2 }
    }).populate('participants', 'username email role profileImageUrl');

    if (!conv) {
      conv = await new Conversation({ participants: [userId1, userId2] }).save();
      conv = await conv.populate('participants', 'username email role profileImageUrl');
    }

    res.json(conv);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get messages in a conversation
app.get('/api/chat/messages/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { since } = req.query; // optional: ISO timestamp for polling

    const filter = { conversationId };
    if (since) filter.createdAt = { $gt: new Date(since) };

    const msgs = await Message.find(filter)
      .populate('senderId', 'username profileImageUrl')
      .sort({ createdAt: 1 })
      .lean();

    res.json(msgs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Send a message
app.post('/api/chat/messages', async (req, res) => {
  try {
    const { conversationId, senderId, content } = req.body;
    if (!conversationId || !senderId || !content?.trim()) {
      return res.status(400).json({ error: 'conversationId, senderId and content required' });
    }

    const msg = await new Message({ conversationId, senderId, content: content.trim() }).save();
    await msg.populate('senderId', 'username profileImageUrl');

    // Update the conversation snapshot
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content.trim(),
      lastMessageAt: new Date()
    });

    // Mark all previous messages from the OTHER user as read
    await Message.updateMany(
      { conversationId, senderId: { $ne: senderId }, read: false },
      { read: true }
    );

    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Get total unread message count for a user
app.get('/api/chat/unread/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all conversations the user is part of
    const convos = await Conversation.find({ participants: userId }, '_id').lean();
    const convoIds = convos.map(c => c._id);

    // Count unread messages in those conversations NOT sent by the user
    const count = await Message.countDocuments({
      conversationId: { $in: convoIds },
      senderId: { $ne: userId },
      read: false
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Proxies â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.use('/ai-vision', createProxyMiddleware({
  target: 'http://localhost:5007',
  changeOrigin: true,
  pathRewrite: { '^/ai-vision': '' },
  onError: (err, req, res) => {
    console.error('AI Vision proxy error:', err.message);
    res.status(503).json({ error: 'AI Vision service unavailable' });
  }
}));

app.use('/speech', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
  pathRewrite: { '^/speech': '' },
  onError: (err, req, res) => {
    console.error('Speech service proxy error:', err.message);
    res.status(503).json({ error: 'Speech service unavailable' });
  }
}));

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Static / Logout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.get('/logout', (req, res) => {
  res.sendFile(path.join(__dirname, '../logout.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=================================================================`);
  console.log(`ðŸš€ Server running on port ${PORT}`);
  console.log(`=================================================================`);
  console.log(`ðŸ“¡ API Endpoints: http://localhost:${PORT}/api`);
  console.log(`ðŸ¤– AI Vision: http://localhost:${PORT}/ai-vision`);
  console.log(`ðŸŽ¤ Speech: http://localhost:${PORT}/speech`);
  console.log(`=================================================================\n`);
});
