const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    required: true,
    enum: ['Roads & Infrastructure', 'Water Services', 'Electricity', 'Waste Management', 'Parks & Recreation', 'Public Safety', 'Other']
  },
  location: {
    address: { type: String, required: true },
    coordinates: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true }
    }
  },
  images: [{ type: String }], // URLs to uploaded images
  status: { 
    type: String, 
    enum: ['open', 'assigned', 'in_progress', 'resolved', 'rejected'], 
    default: 'open' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  reportedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  department: { 
    type: String,
    enum: ['Roads Department', 'Water Department', 'Electricity Department', 'Sanitation Department', 'Parks Department', 'Public Safety Department', 'Roads & Infrastructure', 'Water Services', 'Electricity', 'Waste Management', 'Parks & Recreation', 'Public Safety']
  },
  votes: {
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    voters: [{ 
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      vote: { type: String, enum: ['up', 'down'] }
    }]
  },
  views: { type: Number, default: 0 },
  trending: { type: Boolean, default: false },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  aiAnalysis: {
    confidence: Number,
    detectedObjects: [String],
    detectedIssues: [String]
  },
  timeline: [{
    action: String,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    notes: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

reportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Report', reportSchema);