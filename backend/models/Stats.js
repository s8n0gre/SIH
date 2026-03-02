const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
  // Volume
  totalReports: { type: Number, default: 0 },
  reportsToday: { type: Number, default: 0 },
  reportsThisWeek: { type: Number, default: 0 },
  reportsThisMonth: { type: Number, default: 0 },
  reportsLastMonth: { type: Number, default: 0 },
  growthRate: { type: Number, default: 0 }, // Decimal — month-on-month %

  // Breakdowns (JSON / Mixed)
  reportsByStatus: { type: mongoose.Schema.Types.Mixed, default: {} },
  reportsByPriority: { type: mongoose.Schema.Types.Mixed, default: {} },
  reportsByDepartment: { type: mongoose.Schema.Types.Mixed, default: {} },
  reportsByCategory: { type: mongoose.Schema.Types.Mixed, default: {} },
  reportsByWard: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Priority counts
  highPriorityCount: { type: Number, default: 0 },
  mediumPriorityCount: { type: Number, default: 0 },
  lowPriorityCount: { type: Number, default: 0 },

  // SLA & overdue
  overdueReports: { type: Number, default: 0 },
  slaBreachedCount: { type: Number, default: 0 },

  // Time metrics (in hours, Decimal)
  averageResponseTime: { type: Number, default: 0 },
  averageResolutionTime: { type: Number, default: 0 },
  medianResolutionTime: { type: Number, default: 0 },

  // Trends
  topTrendingCategory: { type: String },

  // Engagement totals
  totalComments: { type: Number, default: 0 },
  totalVotes: { type: Number, default: 0 },
  activeUsers: { type: Number, default: 0 },

  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Stats', statsSchema);