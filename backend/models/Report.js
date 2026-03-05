const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Identification
  ticketNumber: { type: String, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true }, // HTML

  // Categorisation
  domain: { type: String }, // e.g. "Core Infrastructure Services"
  category: {
    type: String,
    required: true,
    enum: [
      // Core Infrastructure Services
      'Roads & Infrastructure',
      'Water Services',
      'Electricity Services',
      // Sanitation and Environmental Services
      'Waste Management',
      // Transport and Urban Mobility
      'Public Transport Operations',
      'Parking Administration',
      // Urban Planning and Asset Administration
      'Estate and Land Management',
      'Procurement and Stores',
      'Mechanical and Workshop Services',
      // Governance, Citizen Interface and Administration
      'Public Grievance Redressal',
      'Internal Audit',
      // Social and Community Development
      'Parks & Recreation',
      'Gender and Child Development',
      // Public Safety and Regulatory Enforcement
      'Public Safety',
      // Fallback
      'Other'
    ]
  },
  subCategory: { type: String },

  // Routing references (String IDs for ServiceNow compatibility)
  departmentId: { type: String },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wardId: { type: String },
  zoneId: { type: String },
  municipalityId: { type: String },

  // Location (flat)
  locationAddress: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },

  // Prioritisation
  impact: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Status & Assignment
  status: { type: String, default: 'open' },
  assignmentGroupId: { type: String },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // SLA
  slaId: { type: String },
  slaDeadline: { type: Date },
  escalationLevel: { type: Number, default: 0 },

  // Media
  images: [{ type: String }],
  attachments: [{ type: String }],

  // AI Analysis (flat)
  aiDetectedCategory: { type: String },
  aiSeverityPrediction: { type: String },
  aiConfidenceScore: { type: Number },
  aiRecommendation: { type: String }, // HTML
  aiModelVersion: { type: String },

  // Engagement (flat)
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  uniqueVoterIds: [{ type: String }], // Glide List of user ID strings
  views: { type: Number, default: 0 },
  engagementScore: { type: Number, default: 0 },

  // Activity logs
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  timeline: [{
    action: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    notes: String
  }],

  // Resolution
  resolutionNotes: { type: String }, // HTML
  resolutionCategory: { type: String },
  closureCode: { type: String },
  resolvedAt: { type: Date },
  closedAt: { type: Date },
  citizenSatisfactionRating: { type: Number, min: 1, max: 5 },
  reopenedCount: { type: Number, default: 0 },

  // Flags
  isAnonymous: { type: Boolean, default: false },
  trending: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-generate ticket number before first save
reportSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  if (!this.ticketNumber) {
    this.ticketNumber = 'TKT-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Report', reportSchema);