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
      default: 'institutional_email'
    },
    instituteEmail: {
      type: String,
      default: null,
      trim: true,
      lowercase: true,
      index: true
    },
    otp: {
      type: String,
      default: null,
      select: false
    },
    otpExpiresAt: {
      type: Date,
      default: null
    },
    attempts: {
      type: Number,
      default: 0
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
