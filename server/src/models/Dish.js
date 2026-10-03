const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['regular', 'chefs_special'],
      default: 'regular'
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    category: {
      type: String,
      enum: ['sport', 'study', 'travel', 'food', 'gaming', 'social', 'help', 'learning', 'other'],
      required: true,
      index: true
    },
    status: {
      type: String,
      enum: ['lets_cook', 'cooking', 'cooked'],
      default: 'lets_cook',
      index: true
    },
    timing: {
      cookStart: { type: Date, default: Date.now },
      cookEnd: { type: Date, default: null },
      cookingStart: { type: Date, default: null },
      cookingEnd: { type: Date, default: null }
    },
    capacity: {
      max: { type: Number, default: 4 },
      unlimited: { type: Boolean, default: false }
    },
    joinMode: {
      type: String,
      enum: ['auto', 'approval', 'invite_only'],
      default: 'auto'
    },
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        joinedAt: { type: Date, default: Date.now },
        role: { type: String, enum: ['creator', 'participant'], default: 'participant' }
      }
    ],
    requests: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['pending', 'approved', 'rejected', 'cancelled'], default: 'pending' },
        createdAt: { type: Date, default: Date.now },
        respondedAt: { type: Date, default: null }
      }
    ],
    location: {
      scope: { type: String, default: 'nearby' },
      areaName: { type: String, default: null },
      latitude: { type: Number, select: false },
      longitude: { type: Number, select: false },
      radius: { type: Number, default: 2000 }
    },
    visibility: {
      type: String,
      enum: ['institute', 'global'],
      default: 'global',
      index: true
    },
    eligibility: {
      gender: { type: String, enum: ['men', 'women', 'any'], default: 'any' },
      age: {
        min: { type: Number, default: null },
        max: { type: Number, default: null }
      },
      instituteOnly: { type: Boolean, default: false },
      skillLevel: { type: String, default: null }
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DishChat',
      default: null
    },
    cookedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Dish', dishSchema);
