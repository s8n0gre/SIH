const mongoose = require('mongoose');

// ── Conversation ─────────────────────────────────────────────────────────────
// A conversation is simply between two participants.
// ServiceNow never sees this collection.
const ConversationSchema = new mongoose.Schema({
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    ],
    lastMessage: { type: String, default: '' },
    lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Prevent duplicate conversations between the same two users
ConversationSchema.index({ participants: 1 });

// ── Message ──────────────────────────────────────────────────────────────────
const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: { type: String, required: true },
    read: { type: Boolean, default: false }
}, { timestamps: true });

const Conversation = mongoose.model('Conversation', ConversationSchema);
const Message = mongoose.model('Message', MessageSchema);

module.exports = { Conversation, Message };
