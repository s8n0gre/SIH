const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  threadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread', required: true, index: true },
  senderType: { type: String, enum: ['citizen', 'authority'], required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  content: { type: String, required: true },
  attachments: [{ url: String, type: String, name: String }],
  read: { type: Boolean, default: false }
}, { timestamps: true });

const ThreadSchema = new mongoose.Schema({
  reportId: { type: mongoose.Schema.Types.ObjectId, ref: 'Report', required: true, unique: true, index: true },
  participantIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Thread = mongoose.model('Thread', ThreadSchema);
const ThreadMessage = mongoose.model('ThreadMessage', MessageSchema);

module.exports = { Thread, ThreadMessage };
