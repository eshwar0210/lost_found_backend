const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientUid: {
      type: String,
      required: true,
      index: true,
    },
    fromUid: {
      type: String,
    },
    fromName: {
      type: String,
    },
    type: {
      type: String,
      enum: ['comment', 'chat'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    postId: {
      type: String,
    },
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
