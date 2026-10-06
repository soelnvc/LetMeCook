const User = require('../models/User');
const Connection = require('../models/Connection');

const updateProfile = async (userId, updateData) => {
  const allowedUpdates = [
    'name',
    'pronouns',
    'bio',
    'interests',
    'avatar',
    'institute',
    'secondaryInstitute',
    'privacy',
    'age',
    'gender',
    'mobile',
    'email',
    'address'
  ];
  const updatePayload = {};

  for (const key of allowedUpdates) {
    if (updateData[key] !== undefined) {
      if (key === 'age') {
        const parsedAge = Number(updateData[key]);
        if (!isNaN(parsedAge) && parsedAge >= 13 && parsedAge <= 120) {
          updatePayload[key] = parsedAge;
        }
      } else {
        updatePayload[key] = updateData[key];
      }
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, { $set: updatePayload }, { new: true });
  return updatedUser;
};

const getPublicProfile = async (username, requesterId) => {
  const targetUser = await User.findOne({ username: username.toLowerCase() });
  if (!targetUser) {
    throw new Error('User not found');
  }

  // Determine relationship between requester and targetUser
  let isSelf = false;
  let isConnection = false;
  let isSameInstitute = false;

  if (requesterId) {
    isSelf = requesterId.toString() === targetUser._id.toString();

    if (!isSelf) {
      const conn = await Connection.findOne({
        $or: [
          { requester: requesterId, recipient: targetUser._id, status: 'accepted' },
          { requester: targetUser._id, recipient: requesterId, status: 'accepted' }
        ]
      });
      isConnection = !!conn;

      const requester = await User.findById(requesterId);
      if (requester && requester.institute?.name && targetUser.institute?.name) {
        isSameInstitute = requester.institute.name === targetUser.institute.name;
      }
    }
  }

  const privacy = targetUser.privacy || {};

  const canView = (setting) => {
    if (isSelf) return true;
    if (setting === 'everyone') return true;
    if (setting === 'institute' && (isSameInstitute || isConnection)) return true;
    if (setting === 'connections' && isConnection) return true;
    return false;
  };

  // Build sanitized profile respecting privacy settings
  const publicProfile = {
    _id: targetUser._id,
    username: targetUser.username,
    name: targetUser.name,
    pronouns: targetUser.pronouns || 'He/Him',
    avatar: canView(privacy.avatarVisibility) ? targetUser.avatar : null,
    bio: canView(privacy.bioVisibility) ? targetUser.bio : '',
    interests: targetUser.interests,
    institute: canView(privacy.instituteVisibility) ? targetUser.institute : null,
    secondaryInstitute: canView(privacy.instituteVisibility) ? targetUser.secondaryInstitute : null,
    verification: {
      institute: targetUser.verification?.institute || false
    },
    stats: {
      dishesCreated: targetUser.stats?.dishesCreated || 0,
      dishesJoined: targetUser.stats?.dishesJoined || 0,
      peopleCookedWith: targetUser.stats?.peopleCookedWith || 0
    },
    currentDish: privacy.activityVisibility ? targetUser.currentDish : null
  };

  return publicProfile;
};

module.exports = {
  updateProfile,
  getPublicProfile
};
