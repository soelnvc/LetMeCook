const mongoose = require('mongoose');

const verificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['institute', 'identity'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected', 'expired'],
      default: 'pending'
    },
    provider: {
      type: String,
      default: 'manual'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      select: false // Sensitive verification metadata kept out of public responses
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Verification', verificationSchema);
