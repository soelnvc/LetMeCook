const mongoose = require('mongoose');

const dishMessageSchema = new mongoose.Schema(
  {
    dish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
      trim: true
    },
    isSystem: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

dishMessageSchema.index({ dish: 1, createdAt: 1 });

module.exports = mongoose.model('DishMessage', dishMessageSchema);
