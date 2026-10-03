const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    conversationId: {
      type: String,
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000
    },
    isRequest: {
      type: Boolean,
      default: false
    },
    requestStatus: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'none'],
      default: 'none'
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
