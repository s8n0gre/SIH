const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const User = require('./models/User');
const Report = require('./models/Report');
const Stats = require('./models/Stats');
const { Thread, ThreadMessage } = require('./models/Thread');
const WorkflowEvent = require('./models/WorkflowEvent');
const SLA = require('./models/SLA');
const Notification = require('./models/Notification');

// Chat models
const Conversation = mongoose.model('Conversation', new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessage: String,
  lastMessageAt: Date,
  createdAt: { type: Date, default: Date.now }
}));

const ChatMessage = mongoose.model('ChatMessage', new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}));

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Real-time upload progress logging middleware
app.use((req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    let receivedBytes = 0;
    const contentLength = parseInt(req.headers['content-length'] || '0');
    
    if (contentLength > 0) {
      console.log(`\n📥 [${new Date().toISOString()}] Incoming ${req.method} ${req.path}`);
      console.log(`📦 Expected payload size: ${(contentLength / 1024).toFixed(2)} KB`);
      
      req.on('data', (chunk) => {
        receivedBytes += chunk.length;
        const width = 30;
        const percentage = Math.floor((receivedBytes / contentLength) * 100);
        const progress = Math.floor((receivedBytes / contentLength) * width);
        const bar = '━'.repeat(progress) + '─'.repeat(width - progress);
        const sizeStr = `${(receivedBytes / 1024 / 1024).toFixed(2)}MB / ${(contentLength / 1024 / 1024).toFixed(2)}MB`;
        
        process.stdout.write(`\r \x1b[32m${bar}\x1b[0m \x1b[1m${percentage}%\x1b[0m | ${sizeStr} | \x1b[90mReceiving Data\x1b[0m`);
      });
      
      req.on('end', () => {
        const sizeMB = (receivedBytes / 1024 / 1024).toFixed(2);
        console.log(`\n \x1b[92m✅ Final Intake:\x1b[0m ${sizeMB} MB received successfully.\n`);
      });
    }
  }
  next();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ─────────────────────────────── Multer Configuration ──────────────────────────
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`));
    }
  }
});

app.use('/uploads', express.static(uploadsDir));

// MongoDB Connection
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civic-reports';
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
};

let dbConnected = false;
connectDB().then(connected => { dbConnected = connected; });

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ─────────────────────────────── Auth Middleware ─────────────────────────────
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

// ─────────────────────────────── Auth Routes ─────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, role, departmentId, phoneNumber, address } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const user = new User({ username, email, password, role, departmentId, phoneNumber, address });
    await user.save();

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret');
    res.status(201).json({
      token,
      user: {
        id: user._id, username: user.username, email: user.email, role: user.role,
        isApproved: user.isApproved, isActive: user.isActive
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

    await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date(), failedLoginAttempts: 0 });
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET || 'fallback_secret');

    res.json({
      token,
      user: {
        id: user._id, username: user.username, email: user.email, role: user.role,
        departmentId: user.departmentId, isApproved: user.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────── Report Routes ───────────────────────────────
app.post('/api/reports', upload.array('images', 10), optionalAuth, async (req, res) => {
  try {
    console.log(`\n📝 Processing report submission...`);
    console.log(`📦 Multipart payload size: ${req.headers['content-length'] || 'unknown'} bytes`);
    console.log(`🖼️ Files received: ${req.files?.length || 0}`);
    
    if (req.files && req.files.length > 0) {
      const totalFileSize = req.files.reduce((sum, file) => sum + file.size, 0);
      console.log(`📊 Total file size: ${(totalFileSize / 1024 / 1024).toFixed(2)} MB`);
      req.files.forEach((file, idx) => {
        console.log(`   [${idx + 1}] ${file.originalname} (${(file.size / 1024).toFixed(2)} KB) → /uploads/${file.filename}`);
      });
    }

    let reportData = { ...req.body };
    
    if (reportData.location && typeof reportData.location === 'string') {
      try {
        reportData.location = JSON.parse(reportData.location);
      } catch (e) {
        console.warn('⚠️ Could not parse location JSON');
      }
    }
    
    if (reportData.isAnonymous === 'true') reportData.isAnonymous = true;
    if (reportData.isAnonymous === 'false') reportData.isAnonymous = false;
    
    if (reportData.latitude) reportData.latitude = parseFloat(reportData.latitude);
    if (reportData.longitude) reportData.longitude = parseFloat(reportData.longitude);
    if (reportData.aiConfidenceScore) reportData.aiConfidenceScore = parseFloat(reportData.aiConfidenceScore);
    if (reportData.upvotes) reportData.upvotes = parseInt(reportData.upvotes);
    if (reportData.downvotes) reportData.downvotes = parseInt(reportData.downvotes);
    if (reportData.views) reportData.views = parseInt(reportData.views);
    
    const imageUrls = req.files?.map(file => `/uploads/${file.filename}`) || [];
    
    let reportedBy = req.user?.userId;
    if (!reportedBy) {
      let anonymousUser = await User.findOne({ username: 'anonymous' });
      if (!anonymousUser) {
        anonymousUser = await new User({
          username: 'anonymous', email: 'anonymous@system.local',
          password: 'anonymous123', role: 'citizen'
        }).save();
      }
      reportedBy = anonymousUser._id;
    }

    const finalReportData = {
      ...reportData,
      images: imageUrls,
      reportedBy,
      status: 'reported',
      locationAddress: reportData.locationAddress || reportData.location?.address || 'Unknown',
      latitude: reportData.latitude ?? reportData.location?.coordinates?.latitude ?? 23.3441,
      longitude: reportData.longitude ?? reportData.location?.coordinates?.longitude ?? 85.3096
    };

    console.log(`📦 Saving report to database...`);
    const report = new Report(finalReportData);
    await report.save();
    console.log(`✅ Report saved successfully with ID: ${report._id}`);
    console.log(`📸 Images stored: ${imageUrls.length}`);

    await new Thread({ reportId: report._id, participantIds: [reportedBy] }).save();

    const now = new Date();
    await new SLA({
      reportId: report._id,
      acknowledgeDeadline: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      resolutionDeadline: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    }).save();

    await new WorkflowEvent({
      reportId: report._id,
      toStatus: 'reported',
      performedBy: reportedBy,
      notes: 'Initial report submission'
    }).save();

    await updateStats();
    console.log(`📤 Sending response back to client...\n`);
    res.status(201).json(report);
  } catch (error) {
    console.error(`❌ Error creating report:`, error.message);
    
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        const filePath = path.join(uploadsDir, file.filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error(`Failed to delete file: ${file.filename}`);
        });
      });
    }
    
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports', optionalAuth, async (req, res) => {
  try {
    const { status, category, departmentId } = req.query;
    let filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (departmentId) filter.departmentId = departmentId;

    if (req.user && req.user.role === 'department_admin') {
      const user = await User.findById(req.user.userId);
      filter.departmentId = user.departmentId;
    }

    const reports = await Report.find(filter)
      .populate('reportedBy', 'username email')
      .populate('assignedTo', 'username email')
      .sort({ updatedAt: -1 });

    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports/user', authenticateToken, async (req, res) => {
  try {
    const reports = await Report.find({ reportedBy: req.user.userId })
      .populate('reportedBy', 'username email')
      .populate('assignedTo', 'username email')
      .sort({ createdAt: -1 });

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports/:id', async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('reportedBy', 'username email')
      .populate('assignedTo', 'username email');
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────── Workflow Routes ─────────────────────────────
app.put('/api/reports/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    const oldStatus = report.status;
    report.status = status;
    report.updatedAt = new Date();

    if (status === 'acknowledged' && !report.acknowledgedAt) {
      report.acknowledgedAt = new Date();
      const sla = await SLA.findOne({ reportId: report._id });
      if (sla) {
        sla.acknowledgedAt = new Date();
        await sla.save();
      }
    }
    if (status === 'resolved' && !report.resolvedAt) {
      report.resolvedAt = new Date();
      const sla = await SLA.findOne({ reportId: report._id });
      if (sla) {
        sla.resolvedAt = new Date();
        await sla.save();
      }
    }
    if (status === 'closed' && !report.closedAt) report.closedAt = new Date();

    await report.save();

    await new WorkflowEvent({
      reportId: report._id,
      fromStatus: oldStatus,
      toStatus: status,
      performedBy: req.user.userId,
      notes
    }).save();

    await updateStats();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reports/:id/history', async (req, res) => {
  try {
    const events = await WorkflowEvent.find({ reportId: req.params.id })
      .populate('performedBy', 'username email')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reports/:id/vote', optionalAuth, async (req, res) => {
  try {
    const { vote } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    if (vote === 'up') report.upvotes = (report.upvotes || 0) + 1;
    else if (vote === 'down') report.downvotes = (report.downvotes || 0) + 1;

    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/reports/:id', authenticateToken, requireRole(['system_admin', 'department_admin']), async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    if (report.images && report.images.length > 0) {
      report.images.forEach(imageUrl => {
        const filename = imageUrl.split('/').pop();
        const filePath = path.join(uploadsDir, filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error(`Failed to delete file: ${filename}`);
        });
      });
    }

    await Thread.deleteMany({ reportId: report._id });
    await ThreadMessage.deleteMany({ threadId: { $in: await Thread.find({ reportId: report._id }).select('_id') } });
    await WorkflowEvent.deleteMany({ reportId: report._id });
    await SLA.deleteMany({ reportId: report._id });
    await Report.findByIdAndDelete(req.params.id);

    await updateStats();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/reports/:id/assign', authenticateToken, requireRole(['department_admin', 'system_admin']), async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found' });

    report.assignedTo = assignedTo;
    if (report.status === 'reported') report.status = 'assigned';
    await report.save();

    await new WorkflowEvent({
      reportId: report._id,
      fromStatus: report.status,
      toStatus: 'assigned',
      performedBy: req.user.userId,
      notes: `Assigned to user ${assignedTo}`
    }).save();

    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────── Thread Routes ───────────────────────────────
app.get('/api/threads/:reportId', async (req, res) => {
  try {
    let thread = await Thread.findOne({ reportId: req.params.reportId });
    if (!thread) {
      thread = await new Thread({ reportId: req.params.reportId, participantIds: [] }).save();
    }
    res.json(thread);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/threads/:reportId/messages', async (req, res) => {
  try {
    const thread = await Thread.findOne({ reportId: req.params.reportId });
    if (!thread) return res.json([]);

    const messages = await ThreadMessage.find({ threadId: thread._id })
      .populate('senderId', 'username email profileImageUrl')
      .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/threads/:reportId/messages', optionalAuth, async (req, res) => {
  try {
    const { content, attachments, isAnonymous } = req.body;
    let thread = await Thread.findOne({ reportId: req.params.reportId });
    if (!thread) {
      thread = await new Thread({ reportId: req.params.reportId, participantIds: [] }).save();
    }

    const senderType = req.user?.role === 'department_admin' || req.user?.role === 'system_admin' ? 'authority' : 'citizen';
    const senderId = isAnonymous ? null : req.user?.userId;

    const message = await new ThreadMessage({
      threadId: thread._id,
      senderType,
      senderId,
      content,
      attachments: attachments || []
    }).save();

    thread.lastMessageAt = new Date();
    if (senderId && !thread.participantIds.includes(senderId)) {
      thread.participantIds.push(senderId);
    }
    await thread.save();

    await message.populate('senderId', 'username email profileImageUrl');
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────── SLA Routes ──────────────────────────────────
app.get('/api/sla/:reportId', async (req, res) => {
  try {
    const sla = await SLA.findOne({ reportId: req.params.reportId });
    if (!sla) return res.status(404).json({ error: 'SLA not found' });
    res.json(sla);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────── User Management ─────────────────────────────
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id/approve', authenticateToken, requireRole(['system_admin']), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id/role', authenticateToken, requireRole(['system_admin']), async (req, res) => {
  try {
    const { role, department } = req.body;
    const updateData = { role };
    if (department) updateData.departmentId = department;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────── Stats ───────────────────────────────────────
const updateStats = async () => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalReports, reportsToday, allReports] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ createdAt: { $gte: startOfToday } }),
      Report.find({}, 'status priority category createdAt resolvedAt')
    ]);

    const reportsByStatus = {};
    const reportsByPriority = {};
    const reportsByCategory = {};

    allReports.forEach(r => {
      reportsByStatus[r.status] = (reportsByStatus[r.status] || 0) + 1;
      reportsByPriority[r.priority] = (reportsByPriority[r.priority] || 0) + 1;
      if (r.category) reportsByCategory[r.category] = (reportsByCategory[r.category] || 0) + 1;
    });

    await Stats.findOneAndUpdate({}, {
      totalReports,
      reportsToday,
      reportsByStatus,
      reportsByPriority,
      reportsByCategory,
      lastUpdated: new Date()
    }, { upsert: true });
  } catch (error) {
    console.error('Stats update error:', error);
  }
};

app.get('/api/stats/global', async (req, res) => {
  try {
    await updateStats();
    const stats = await Stats.findOne() || { totalReports: 0, reportsToday: 0 };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────── Chat Routes ────────────────────────────────
app.get('/api/chat/users', async (req, res) => {
  try {
    const users = await User.find().select('username email role');
    res.json(users);
  } catch { res.status(500).json({ error: 'Failed to load users' }); }
});

app.get('/api/chat/conversations/:userId', async (req, res) => {
  try {
    const convs = await Conversation.find({ participants: req.params.userId })
      .populate('participants', 'username email role')
      .sort({ lastMessageAt: -1 });
    
    const result = await Promise.all(convs.map(async (c) => {
      const unread = await ChatMessage.countDocuments({
        conversationId: c._id,
        senderId: { $ne: req.params.userId },
        read: false
      });
      return { ...c.toObject(), unread };
    }));
    res.json(result);
  } catch { res.json([]); }
});

app.post('/api/chat/conversations', async (req, res) => {
  try {
    const { userId1, userId2 } = req.body;
    let conv = await Conversation.findOne({
      participants: { $all: [userId1, userId2] }
    }).populate('participants', 'username email role');
    
    if (!conv) {
      conv = await new Conversation({
        participants: [userId1, userId2],
        lastMessageAt: new Date()
      }).save();
      await conv.populate('participants', 'username email role');
    }
    res.json(conv);
  } catch { res.status(500).json({ error: 'Failed to create conversation' }); }
});

app.delete('/api/chat/conversations/:id', async (req, res) => {
  try {
    await ChatMessage.deleteMany({ conversationId: req.params.id });
    await Conversation.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch { res.status(500).json({ error: 'Failed to delete' }); }
});

app.get('/api/chat/messages/:conversationId', async (req, res) => {
  try {
    const { since, userId } = req.query;
    const filter = { conversationId: req.params.conversationId };
    if (since) filter.createdAt = { $gt: new Date(since) };
    
    const msgs = await ChatMessage.find(filter)
      .populate('senderId', 'username email')
      .sort({ createdAt: 1 });
    
    if (userId) {
      await ChatMessage.updateMany(
        { conversationId: req.params.conversationId, senderId: { $ne: userId }, read: false },
        { read: true }
      );
    }
    res.json(msgs);
  } catch { res.json([]); }
});

app.post('/api/chat/messages', async (req, res) => {
  try {
    const { conversationId, senderId, content } = req.body;
    const msg = await new ChatMessage({ conversationId, senderId, content }).save();
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: content,
      lastMessageAt: new Date()
    });
    await msg.populate('senderId', 'username email');
    res.json(msg);
  } catch { res.status(500).json({ error: 'Failed to send' }); }
});

// ─────────────────────────────── Notifications ───────────────────────────────
app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const notifs = await Notification.find({ userId: req.params.userId })
      .populate('fromUserId', 'username profileImageUrl')
      .sort({ createdAt: -1 })
      .limit(40);
    res.json(notifs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────── Proxies ─────────────────────────────────────
app.use('/ai-vision', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: { '^/ai-vision': '' },
  on: {
    error: (err, req, res) => res.status(503).json({ error: 'AI Vision service unavailable' })
  }
}));

app.use('/speech', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
  pathRewrite: { '^/speech': '' },
  on: {
    error: (err, req, res) => res.status(503).json({ error: 'Speech service unavailable' })
  }
}));

// ─────────────────────────────── Static ──────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n=================================================================`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`=================================================================\n`);
});

// ─────────────────────────────── SLA Background Job ──────────────────────────
setInterval(async () => {
  try {
    const now = new Date();
    const slas = await SLA.find({ slaStatus: { $ne: 'breached' } });
    
    for (const sla of slas) {
      if (!sla.acknowledgedAt && now > sla.acknowledgeDeadline) {
        sla.slaStatus = 'breached';
        sla.breachReason = 'Acknowledgement deadline exceeded';
        await sla.save();
      } else if (!sla.resolvedAt && now > sla.resolutionDeadline) {
        sla.slaStatus = 'breached';
        sla.breachReason = 'Resolution deadline exceeded';
        await sla.save();
      } else if (now > new Date(sla.resolutionDeadline.getTime() - 24 * 60 * 60 * 1000)) {
        sla.slaStatus = 'at_risk';
        await sla.save();
      }
    }
  } catch (error) {
    console.error('SLA check error:', error);
  }
}, 60000);
