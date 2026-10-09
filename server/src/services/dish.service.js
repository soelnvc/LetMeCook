const Dish = require('../models/Dish');
const User = require('../models/User');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');
const DishMessage = require('../models/DishMessage');

const createDish = async (creatorId, dishData) => {
  const {
    type = 'regular',
    description,
    category,
    capacity,
    joinMode = 'auto',
    timing,
    location,
    visibility = 'global',
    eligibility
  } = dishData;

  if (!description || !category) {
    throw new Error('Description and category are required to create a Dish');
  }

  const creator = await User.findById(creatorId);
  let effectiveVisibility = visibility;
  // Underaged users cannot create global dishes
  if (creator && creator.age && creator.age < 18 && visibility === 'global') {
    effectiveVisibility = 'institute';
  }

  const dish = await Dish.create({
    creator: creatorId,
    type,
    description,
    category,
    capacity: capacity || { max: 4, unlimited: false },
    joinMode,
    timing: timing || { cookStart: new Date() },
    location: {
      scope: location?.scope || (effectiveVisibility === 'global' ? 'nearby' : 'institute'),
      areaName: location?.areaName || 'Campus Zone'
    },
    visibility: effectiveVisibility,
    eligibility: eligibility || { gender: 'any', instituteOnly: false },
    participants: [
      {
        user: creatorId,
        joinedAt: new Date(),
        role: 'creator'
      }
    ]
  });

  await User.findByIdAndUpdate(creatorId, {
    $inc: { 'stats.dishesCreated': 1 },
    currentDish: dish._id
  });

  // Automatically initialize Dish Chat with welcome message
  try {
    await DishMessage.create({
      dish: dish._id,
      sender: creatorId,
      content: `🎉 Group chat started for "${dish.description.slice(0, 60)}" • Welcome!`,
      isSystem: true
    });
  } catch (err) {
    console.error('[DishChat] Error creating initial system message:', err);
  }

  return dish;
};

const getDishes = async (userId, query = {}) => {
  const { scope, category, status } = query;

  const filter = {};

  if (status && status !== 'all') {
    filter.status = status;
  } else if (!status) {
    filter.status = { $in: ['lets_cook', 'cooking'] };
  }

  if (category) {
    filter.category = category;
  }

  if (scope) {
    filter.visibility = scope;
  }

  let currentUser = null;
  if (userId) {
    currentUser = await User.findById(userId);
  }

  // Underage users (< 18) must not see global tickets
  if (currentUser && currentUser.age && currentUser.age < 18) {
    if (scope === 'global') {
      return [];
    }
    filter.visibility = { $ne: 'global' };
  }

  const dishes = await Dish.find(filter)
    .populate('creator', 'username name avatar institute verification privacy isDeactivated blockedUsers')
    .populate('participants.user', 'username name avatar')
    .sort({ createdAt: -1 })
    .limit(50);

  // Filter deactivated, blocked users, chef's special, and sanitize location privacy
  return dishes
    .filter((dish) => {
      // Omit dishes from deactivated creators
      if (dish.creator?.isDeactivated) {
        return false;
      }

      // Omit dishes if creator is blocked or has blocked currentUser
      if (currentUser && dish.creator) {
        const creatorIdStr = dish.creator._id.toString();
        const currentUserIdStr = currentUser._id.toString();

        if (currentUser.blockedUsers && currentUser.blockedUsers.some((b) => b.toString() === creatorIdStr)) {
          return false;
        }
        if (dish.creator.blockedUsers && dish.creator.blockedUsers.some((b) => b.toString() === currentUserIdStr)) {
          return false;
        }
      }

      // Underaged users (< 18) must not see global tickets
      if (currentUser && currentUser.age && currentUser.age < 18) {
        if (dish.visibility === 'global' || dish.location?.scope === 'nearby') {
          return false;
        }
      }

      if (dish.type !== 'chefs_special') return true;
      if (!currentUser) return false;

      if (dish.eligibility?.gender && dish.eligibility.gender !== 'any') {
        if (currentUser.gender !== dish.eligibility.gender) return false;
      }

      if (dish.eligibility?.instituteOnly) {
        if (!currentUser.institute?.name || currentUser.institute?.name !== dish.creator?.institute?.name) {
          return false;
        }
      }

      return true;
    })
    .map((dish) => {
      // Enforce location privacy
      const locPrivacy = dish.creator?.privacy?.locationPrivacy || 'approximate';
      const isConfirmed =
        currentUser &&
        dish.participants?.some(
          (p) =>
            (p.user?._id || p.user)?.toString() === currentUser._id.toString()
        );

      if (locPrivacy === 'never') {
        dish.location.areaName = dish.creator?.institute?.name || 'Campus Network';
      } else if (locPrivacy === 'on_start' && !isConfirmed) {
        dish.location.areaName = `${dish.creator?.institute?.name || 'Campus'} • Spot revealed when accepted`;
      }
      return dish;
    });
};

const getDishById = async (dishId) => {
  const dish = await Dish.findById(dishId)
    .populate('creator', 'username name avatar institute verification')
    .populate('participants.user', 'username name avatar');

  if (!dish) {
    throw new Error('Dish not found');
  }
  return dish;
};

const joinDish = async (dishId, userId) => {
  const dish = await Dish.findById(dishId);
  if (!dish) {
    throw new Error('Dish not found');
  }

  if (dish.status === 'cooked') {
    throw new Error('Cannot join a completed Dish');
  }

  const alreadyParticipant = dish.participants.some(
    (p) => p.user.toString() === userId.toString()
  );
  if (alreadyParticipant) {
    throw new Error('You are already part of this Dish');
  }

  // Atomic capacity prevention
  if (!dish.capacity.unlimited && dish.participants.length >= dish.capacity.max) {
    throw new Error('This Dish is full');
  }

  if (dish.joinMode === 'auto') {
    dish.participants.push({
      user: userId,
      joinedAt: new Date(),
      role: 'participant'
    });
    await dish.save();

    await User.findByIdAndUpdate(userId, {
      $inc: { 'stats.dishesJoined': 1 },
      currentDish: dish._id
    });

    try {
      const joiner = await User.findById(userId).select('username');
      await DishMessage.create({
        dish: dish._id,
        sender: userId,
        content: `@${joiner?.username || 'user'} joined the dish`,
        isSystem: true
      });
    } catch (err) {
      console.error('[DishChat] Join notification error:', err);
    }

    return { joined: true, status: 'participant' };
  } else if (dish.joinMode === 'approval') {
    const existingReq = dish.requests.find(
      (r) => r.user.toString() === userId.toString() && r.status === 'pending'
    );
    if (existingReq) {
      throw new Error('Request already pending');
    }

    dish.requests.push({
      user: userId,
      status: 'pending',
      createdAt: new Date()
    });
    await dish.save();

    return { joined: false, status: 'pending_approval' };
  } else {
    throw new Error('This Dish is invite only');
  }
};

const transitionDishStatus = async (dishId, creatorId, newStatus) => {
  const dish = await Dish.findById(dishId);
  if (!dish) {
    throw new Error('Dish not found');
  }

  if (dish.creator.toString() !== creatorId.toString()) {
    throw new Error('Only the creator can change the status of this Dish');
  }

  const validTransitions = {
    lets_cook: ['cooking', 'cooked'],
    cooking: ['cooked'],
    cooked: []
  };

  if (!validTransitions[dish.status] || !validTransitions[dish.status].includes(newStatus)) {
    throw new Error(`Invalid status transition from ${dish.status} to ${newStatus}`);
  }

  dish.status = newStatus;
  if (newStatus === 'cooked') {
    dish.cookedAt = new Date();
    // Post chat expiration system message
    try {
      await DishMessage.create({
        dish: dish._id,
        sender: creatorId,
        content: '🍽️ Dish marked as Cooked! This ticket and chat are now closed.',
        isSystem: true
      });
    } catch (err) {
      console.error('[DishChat] Status notification error:', err);
    }
  }
  await dish.save();

  return dish;
};

const leaveDish = async (dishId, userId) => {
  const dish = await Dish.findById(dishId);
  if (!dish) {
    throw new Error('Dish not found');
  }

  const isCreator = dish.creator.toString() === userId.toString();
  if (isCreator) {
    throw new Error('The creator cannot leave their own Dish. You can mark it as cooked or delete it.');
  }

  const participantIndex = dish.participants.findIndex(
    (p) => p.user.toString() === userId.toString()
  );
  if (participantIndex === -1) {
    throw new Error('You are not a participant in this Dish');
  }

  dish.participants.splice(participantIndex, 1);
  await dish.save();

  await User.findByIdAndUpdate(userId, {
    $inc: { 'stats.dishesJoined': -1 },
    currentDish: null
  });

  try {
    const leaver = await User.findById(userId).select('username');
    await DishMessage.create({
      dish: dish._id,
      sender: userId,
      content: `@${leaver?.username || 'user'} left the dish`,
      isSystem: true
    });
  } catch (err) {
    console.error('[DishChat] Leave notification error:', err);
  }

  return { success: true, message: 'Successfully left Dish' };
};

const respondToJoinRequest = async (dishId, creatorId, requestId, action) => {
  const dish = await Dish.findById(dishId);
  if (!dish) {
    throw new Error('Dish not found');
  }

  if (dish.creator.toString() !== creatorId.toString()) {
    throw new Error('Only the creator can approve or reject join requests');
  }

  const request = dish.requests.id(requestId);
  if (!request) {
    throw new Error('Join request not found');
  }

  if (request.status !== 'pending') {
    throw new Error(`Request has already been ${request.status}`);
  }

  if (action === 'approve') {
    // Capacity check
    if (!dish.capacity.unlimited && dish.participants.length >= dish.capacity.max) {
      throw new Error('Cannot approve: Dish capacity is already full');
    }

    request.status = 'approved';
    request.respondedAt = new Date();

    dish.participants.push({
      user: request.user,
      joinedAt: new Date(),
      role: 'participant'
    });

    await dish.save();

    await User.findByIdAndUpdate(request.user, {
      $inc: { 'stats.dishesJoined': 1 },
      currentDish: dish._id
    });

    return { success: true, status: 'approved', user: request.user };
  } else if (action === 'reject') {
    request.status = 'rejected';
    request.respondedAt = new Date();
    await dish.save();

    return { success: true, status: 'rejected' };
  } else {
    throw new Error('Invalid request action. Must be approve or reject');
  }
};

const inviteToDish = async (dishId, inviterId, targetUsername) => {
  if (!targetUsername) throw new Error('Target username is required');
  const cleanUsername = targetUsername.replace(/^@/, '').trim().toLowerCase();

  const dish = await Dish.findById(dishId);
  if (!dish) throw new Error('Dish not found');

  const inviter = await User.findById(inviterId);
  const target = await User.findOne({ username: cleanUsername });
  if (!target) throw new Error(`User @${cleanUsername} not found`);
  if (target.isDeactivated) throw new Error(`User @${cleanUsername} is currently deactivated`);

  // Check if inviter is part of the dish
  const isParticipant = dish.participants.some(
    (p) => (p.user?._id || p.user).toString() === inviterId.toString()
  );
  if (!isParticipant) throw new Error('You must be a participant to invite someone');

  // Check blocked
  if (
    (inviter.blockedUsers && inviter.blockedUsers.includes(target._id)) ||
    (target.blockedUsers && target.blockedUsers.includes(inviter._id))
  ) {
    throw new Error('Unable to invite this user');
  }

  // Check target user's invitePermission
  const permission = target.privacy?.invitePermission || 'everyone';
  if (permission === 'nobody') {
    throw new Error(`@${cleanUsername} does not accept dish invitations`);
  }

  if (permission === 'institute') {
    if (!inviter.institute?.name || inviter.institute.name !== target.institute?.name) {
      throw new Error(`@${cleanUsername} only accepts dish invitations from ${target.institute?.name || 'their institute'}`);
    }
  }

  if (permission === 'connections') {
    const conn = await Connection.findOne({
      $or: [
        { requester: inviterId, recipient: target._id, status: 'accepted' },
        { requester: target._id, recipient: inviterId, status: 'accepted' }
      ]
    });
    if (!conn) {
      throw new Error(`@${cleanUsername} only accepts invitations from connected peers`);
    }
  }

  // Create notification
  await Notification.create({
    recipient: target._id,
    actor: inviterId,
    type: 'dish_invite',
    dish: dish._id,
    content: `${inviter.name || inviter.username} invited you to join "${dish.description.slice(0, 40)}..."`
  });

  return { success: true, message: `Invitation sent to @${cleanUsername}` };
};

const getDishChat = async (dishId, userId) => {
  const dish = await Dish.findById(dishId)
    .populate('creator', 'username name avatar institute verification')
    .populate('participants.user', 'username name avatar institute verification');

  if (!dish) {
    throw new Error('Dish not found');
  }

  const isExpired = dish.status === 'cooked';

  // Ensure initial system message exists if chat was not initialized
  let messages = await DishMessage.find({ dish: dishId })
    .populate('sender', 'username name avatar institute verification')
    .sort({ createdAt: 1 });

  if (messages.length === 0) {
    try {
      const initMsg = await DishMessage.create({
        dish: dish._id,
        sender: dish.creator._id,
        content: `🎉 Group chat started for "${dish.description.slice(0, 60)}" • Welcome!`,
        isSystem: true
      });
      await initMsg.populate('sender', 'username name avatar institute verification');
      messages = [initMsg];
    } catch (e) {
      // Ignore race condition on init message
    }
  }

  return {
    dish,
    isExpired,
    messages
  };
};

const sendDishChatMessage = async (dishId, senderId, content) => {
  if (!content || !content.trim()) {
    throw new Error('Message content cannot be empty');
  }

  const dish = await Dish.findById(dishId);
  if (!dish) {
    throw new Error('Dish not found');
  }

  if (dish.status === 'cooked') {
    throw new Error('Cannot send message: Dish ticket has expired (Cooked)');
  }

  const isParticipant =
    dish.creator.toString() === senderId.toString() ||
    dish.participants.some(
      (p) => (p.user?._id || p.user).toString() === senderId.toString()
    );

  if (!isParticipant) {
    throw new Error('You must be a confirmed participant of this dish to send messages');
  }

  const message = await DishMessage.create({
    dish: dishId,
    sender: senderId,
    content: content.trim().slice(0, 2000),
    isSystem: false
  });

  await message.populate('sender', 'username name avatar institute verification');
  return message;
};

const deleteDish = async (dishId, creatorId) => {
  const dish = await Dish.findById(dishId);
  if (!dish) {
    throw new Error('Dish not found');
  }

  if (dish.creator.toString() !== creatorId.toString()) {
    throw new Error('Only the creator can delete this dish');
  }

  // Clean up messages
  await DishMessage.deleteMany({ dish: dishId });

  // Update stats
  await User.findByIdAndUpdate(creatorId, {
    $inc: { 'stats.dishesCreated': -1 },
    currentDish: null
  });

  // Remove currentDish for participants
  for (const p of dish.participants) {
    if (p.user.toString() !== creatorId.toString()) {
      await User.findByIdAndUpdate(p.user, {
        $inc: { 'stats.dishesJoined': -1 },
        currentDish: null
      });
    }
  }

  await Dish.findByIdAndDelete(dishId);

  return { success: true, message: 'Dish deleted successfully' };
};

module.exports = {
  createDish,
  getDishes,
  getDishById,
  joinDish,
  leaveDish,
  respondToJoinRequest,
  transitionDishStatus,
  inviteToDish,
  getDishChat,
  sendDishChatMessage,
  deleteDish
};

