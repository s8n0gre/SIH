const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: {
        type: String,
        enum: ['friend_request', 'friend_accepted', 'like', 'comment', 'message', 'system'],
        required: true
    },
    message: { type: String, required: true },
    link: { type: String, default: null },  // optional deep-link
    read: { type: Boolean, default: false },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} } // e.g. { friendshipId, reportId }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
