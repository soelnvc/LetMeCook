const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    emailVerified: {
      type: Boolean,
      default: false
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    mobileVerified: {
      type: Boolean,
      default: false
    },
    passwordHash: {
      type: String,
      required: true,
      select: false // Never returned in public queries
    },
    avatar: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      maxlength: 160,
      default: ''
    },
    pronouns: {
      type: String,
      default: 'He/Him'
    },
    interests: {
      type: [String],
      default: []
    },
    institute: {
      name: { type: String, default: null },
      emailDomain: { type: String, default: null },
      course: { type: String, default: null },
      year: { type: Number, default: null },
      verified: { type: Boolean, default: false },
      verifiedAt: { type: Date, default: null }
    },
    secondaryInstitute: {
      name: { type: String, default: null },
      year: { type: Number, default: null }
    },
    verifiedInstitutes: [
      {
        name: { type: String, required: true },
        email: { type: String, default: null },
        course: { type: String, default: null },
        year: { type: Number, default: null },
        verifiedAt: { type: Date, default: Date.now },
        status: { type: String, default: 'verified' }
      }
    ],
    age: {
      type: Number,
      required: [true, 'Age is required during account creation'],
      min: [13, 'Minimum age is 13'],
      max: [120, 'Maximum age is 120']
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'men', 'women', 'other', 'prefer_not_to_say'],
      default: 'Prefer not to say'
    },
    address: {
      type: String,
      default: null,
      select: false // Sensitive field
    },
    verification: {
      mobile: { type: Boolean, default: false },
      email: { type: Boolean, default: false },
      institute: { type: Boolean, default: false },
      identity: { type: Boolean, default: false }
    },
    privacy: {
      bioVisibility: {
        type: String,
        enum: ['everyone', 'institute', 'connections', 'nobody'],
        default: 'everyone'
      },
      instituteVisibility: {
        type: String,
        enum: ['everyone', 'institute', 'nobody'],
        default: 'institute'
      },
      avatarVisibility: {
        type: String,
        enum: ['everyone', 'institute', 'connections', 'nobody'],
        default: 'everyone'
      },
      invitePermission: {
        type: String,
        enum: ['everyone', 'institute', 'connections', 'nobody'],
        default: 'everyone'
      },
      messagePermission: {
        type: String,
        enum: ['everyone', 'institute', 'connections', 'nobody'],
        default: 'everyone'
      },
      globalDiscovery: {
        type: Boolean,
        default: true
      },
      activityVisibility: {
        type: Boolean,
        default: true
      },
      locationPrivacy: {
        type: String,
        enum: ['never', 'approximate', 'on_start'],
        default: 'approximate'
      }
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    restrictedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    isDeactivated: {
      type: Boolean,
      default: false
    },
    deactivatedUntil: {
      type: Date,
      default: null
    },
    stats: {
      dishesCreated: { type: Number, default: 0 },
      dishesJoined: { type: Number, default: 0 },
      peopleCookedWith: { type: Number, default: 0 }
    },
    currentDish: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dish',
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', userSchema);
