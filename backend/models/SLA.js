const mongoose = require('mongoose');

const SLASchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true, unique: true, index: true },
  acknowledgeDeadline: { type: Date, required: true },
  resolutionDeadline: { type: Date, required: true },
  acknowledgedAt: { type: Date },
  resolvedAt: { type: Date },
  slaStatus: { type: String, enum: ['on_track', 'at_risk', 'breached'], default: 'on_track' },
  breachReason: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('SLA', SLASchema);
