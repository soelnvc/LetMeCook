const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Connection = require('../models/Connection');
const Dish = require('../models/Dish');
const Report = require('../models/Report');
const { calculateUserStats } = require('./auth.service');

const updateProfile = async (userId, updateData) => {
  const existingUser = await User.findById(userId);
  if (!existingUser) {
    throw new Error('User not found');
  }

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
    'address',
    'verifiedInstitutes'
  ];
  const updatePayload = {};

  const verifiedNames = (existingUser.verifiedInstitutes || []).map((v) => v.name.toLowerCase());
  if (existingUser.institute?.name && existingUser.institute?.verified) {
    verifiedNames.push(existingUser.institute.name.toLowerCase());
  }

  for (const key of allowedUpdates) {
    if (updateData[key] !== undefined) {
      if (key === 'age') {
        const parsedAge = Number(updateData[key]);
        if (!isNaN(parsedAge) && parsedAge >= 13 && parsedAge <= 120) {
          updatePayload[key] = parsedAge;
        }
      } else if (key === 'privacy' && typeof updateData.privacy === 'object') {
        for (const [pKey, pVal] of Object.entries(updateData.privacy)) {
          updatePayload[`privacy.${pKey}`] = pVal;
        }
      } else if (key === 'institute') {
        if (!updateData.institute || !updateData.institute.name) {
          updatePayload['institute.name'] = null;
          updatePayload['institute.year'] = null;
          updatePayload['institute.verified'] = false;
        } else {
          const reqName = String(updateData.institute.name).trim();
          if (!verifiedNames.includes(reqName.toLowerCase())) {
            throw new Error(`You are not verified by ${reqName}. You can only select from your verified institutions.`);
          }
          const matched = (existingUser.verifiedInstitutes || []).find(
            (v) => v.name.toLowerCase() === reqName.toLowerCase()
          );
          updatePayload['institute.name'] = matched ? matched.name : reqName;
          updatePayload['institute.year'] = Number(updateData.institute.year) || (matched ? matched.year : null) || existingUser.institute?.year || null;
          updatePayload['institute.verified'] = true;
          updatePayload['verification.institute'] = true;
        }
      } else if (key === 'secondaryInstitute') {
        if (!updateData.secondaryInstitute || !updateData.secondaryInstitute.name) {
          updatePayload['secondaryInstitute.name'] = null;
          updatePayload['secondaryInstitute.year'] = null;
        } else {
          const reqName = String(updateData.secondaryInstitute.name).trim();
          if (!verifiedNames.includes(reqName.toLowerCase())) {
            throw new Error(`You are not verified by ${reqName}. You can only select from your verified institutions.`);
          }
          const matched = (existingUser.verifiedInstitutes || []).find(
            (v) => v.name.toLowerCase() === reqName.toLowerCase()
          );
          updatePayload['secondaryInstitute.name'] = matched ? matched.name : reqName;
          updatePayload['secondaryInstitute.year'] = Number(updateData.secondaryInstitute.year) || (matched ? matched.year : null) || null;
        }
      } else {
        updatePayload[key] = updateData[key];
      }
    }
  }

  const updatedUser = await User.findByIdAndUpdate(userId, { $set: updatePayload }, { new: true });
  const stats = await calculateUserStats(updatedUser._id);
  const userObj = updatedUser.toObject();
  userObj.stats = stats;
  return userObj;
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

  if (targetUser.isDeactivated && !isSelf) {
    throw new Error('This account is currently deactivated');
  }

  const privacy = targetUser.privacy || {};

  const canView = (setting) => {
    if (isSelf) return true;
    if (setting === 'everyone') return true;
    if (setting === 'institute' && (isSameInstitute || isConnection)) return true;
    if (setting === 'connections' && isConnection) return true;
    return false;
  };

  // Calculate real accurate counts from DB collections
  const [createdCount, joinedCount, connectionsCount] = await Promise.all([
    Dish.countDocuments({ creator: targetUser._id }),
    Dish.countDocuments({ 'participants.user': targetUser._id, creator: { $ne: targetUser._id } }),
    Connection.countDocuments({
      $or: [{ requester: targetUser._id }, { recipient: targetUser._id }],
      status: 'accepted'
    })
  ]);

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
    privacy: {
      locationPrivacy: privacy.locationPrivacy || 'approximate',
      activityVisibility: privacy.activityVisibility ?? true,
      invitePermission: privacy.invitePermission || 'everyone'
    },
    stats: {
      dishesCreated: createdCount,
      dishesJoined: joinedCount,
      connections: connectionsCount,
      peopleCookedWith: connectionsCount
    },
    currentDish: privacy.activityVisibility ? targetUser.currentDish : null
  };

  return publicProfile;
};

const exportUserData = async (userId) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) throw new Error('User not found');

  const createdDishes = await Dish.find({ creator: userId })
    .populate('participants.user', 'username name')
    .lean();

  const joinedDishes = await Dish.find({ 'participants.user': userId, creator: { $ne: userId } })
    .populate('creator', 'username name')
    .lean();

  const connections = await Connection.find({
    $or: [{ requester: userId }, { recipient: userId }],
    status: 'accepted'
  })
    .populate('requester', 'username name')
    .populate('recipient', 'username name')
    .lean();

  const safetyReports = await Report.find({ reporter: userId }).lean();

  return {
    exportDate: new Date().toISOString(),
    exportVersion: '1.0.0',
    account: {
      username: user.username,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      age: user.age,
      gender: user.gender,
      bio: user.bio,
      pronouns: user.pronouns,
      interests: user.interests,
      institute: user.institute,
      secondaryInstitute: user.secondaryInstitute,
      verification: user.verification,
      createdAt: user.createdAt
    },
    privacySettings: user.privacy,
    stats: user.stats,
    createdDishes,
    joinedDishes,
    connectionsCount: connections.length,
    safetyReports
  };
};

const deactivateAccount = async (userId, password) => {
  if (!password) {
    throw new Error('Password is required to deactivate your account');
  }

  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Incorrect password');
  }

  const deactivatedUntil = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  user.isDeactivated = true;
  user.deactivatedUntil = deactivatedUntil;
  await user.save();

  return {
    success: true,
    message: 'Account deactivated successfully for 14 days',
    deactivatedUntil
  };
};

const getSafetyLists = async (userId) => {
  const user = await User.findById(userId)
    .populate('blockedUsers', 'username name avatar')
    .populate('restrictedUsers', 'username name avatar');

  if (!user) {
    throw new Error('User not found');
  }

  return {
    blockedUsers: user.blockedUsers || [],
    restrictedUsers: user.restrictedUsers || []
  };
};

const blockUser = async (userId, targetUsername) => {
  if (!targetUsername) throw new Error('Username to block is required');
  const cleanUsername = targetUsername.replace(/^@/, '').trim().toLowerCase();

  const target = await User.findOne({ username: cleanUsername });
  if (!target) throw new Error(`User @${cleanUsername} not found`);
  if (target._id.toString() === userId.toString()) throw new Error('Cannot block yourself');

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { blockedUsers: target._id } },
    { new: true }
  ).populate('blockedUsers', 'username name avatar');

  return updatedUser.blockedUsers;
};

const unblockUser = async (userId, targetUsername) => {
  if (!targetUsername) throw new Error('Username to unblock is required');
  const cleanUsername = targetUsername.replace(/^@/, '').trim().toLowerCase();

  const target = await User.findOne({ username: cleanUsername });
  if (!target) return [];

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $pull: { blockedUsers: target._id } },
    { new: true }
  ).populate('blockedUsers', 'username name avatar');

  return updatedUser.blockedUsers;
};

const restrictUser = async (userId, targetUsername) => {
  if (!targetUsername) throw new Error('Username to restrict is required');
  const cleanUsername = targetUsername.replace(/^@/, '').trim().toLowerCase();

  const target = await User.findOne({ username: cleanUsername });
  if (!target) throw new Error(`User @${cleanUsername} not found`);
  if (target._id.toString() === userId.toString()) throw new Error('Cannot restrict yourself');

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { restrictedUsers: target._id } },
    { new: true }
  ).populate('restrictedUsers', 'username name avatar');

  return updatedUser.restrictedUsers;
};

const unrestrictUser = async (userId, targetUsername) => {
  if (!targetUsername) throw new Error('Username to unrestrict is required');
  const cleanUsername = targetUsername.replace(/^@/, '').trim().toLowerCase();

  const target = await User.findOne({ username: cleanUsername });
  if (!target) return [];

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $pull: { restrictedUsers: target._id } },
    { new: true }
  ).populate('restrictedUsers', 'username name avatar');

  return updatedUser.restrictedUsers;
};

const searchUsers = async (query, currentUserId) => {
  if (!query || typeof query !== 'string' || !query.trim()) {
    return [];
  }
  const cleanQuery = query.trim().replace(/^@/, '');
  const escapedQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedQuery, 'i');

  const filter = {
    $or: [{ username: regex }, { name: regex }],
    isDeactivated: { $ne: true }
  };

  if (currentUserId) {
    try {
      const currentUser = await User.findById(currentUserId).select('blockedUsers');
      if (currentUser?.blockedUsers?.length > 0) {
        filter._id = { $nin: currentUser.blockedUsers };
      }
    } catch {
      // Proceed without blocked filter if query fails
    }
  }

  const users = await User.find(filter)
    .select('username name avatar institute pronouns bio interests')
    .limit(15)
    .lean();

  return users;
};

module.exports = {
  updateProfile,
  getPublicProfile,
  exportUserData,
  deactivateAccount,
  getSafetyLists,
  blockUser,
  unblockUser,
  restrictUser,
  unrestrictUser,
  searchUsers
};

