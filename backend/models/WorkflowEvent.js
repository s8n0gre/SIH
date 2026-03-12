const mongoose = require('mongoose');

const WorkflowEventSchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true, index: true },
  fromStatus: { type: String },
  toStatus: { type: String, required: true, enum: ['reported', 'acknowledged', 'assigned', 'in_progress', 'resolved', 'closed'] },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  metadata: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

WorkflowEventSchema.index({ reportId: 1, createdAt: -1 });

module.exports = mongoose.model('WorkflowEvent', WorkflowEventSchema);
