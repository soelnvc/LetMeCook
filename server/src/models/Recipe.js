const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Recipe name is required'],
      trim: true,
      maxlength: [60, 'Recipe name cannot exceed 60 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category: {
      type: String,
      enum: ['sport', 'study', 'travel', 'food', 'gaming', 'social', 'help', 'learning', 'other'],
      required: [true, 'Category is required']
    },
    type: {
      type: String,
      enum: ['regular', 'chefs_special'],
      default: 'regular'
    },
    joinMode: {
      type: String,
      enum: ['auto', 'approval', 'invite_only'],
      default: 'auto'
    },
    capacity: {
      max: { type: Number, default: 4 },
      unlimited: { type: Boolean, default: false }
    },
    location: {
      areaName: { type: String, default: 'Campus Court', trim: true }
    },
    eligibility: {
      gender: { type: String, default: 'any' },
      age: {
        min: { type: Number, default: null },
        max: { type: Number, default: null }
      },
      instituteOnly: { type: Boolean, default: false },
      skillLevel: { type: String, default: null }
    }
  },
  { timestamps: true }
);

// Compound index to enforce unique recipe names per user account
recipeSchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Recipe', recipeSchema);
