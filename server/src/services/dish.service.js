const Dish = require('../models/Dish');
const User = require('../models/User');

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

  const dish = await Dish.create({
    creator: creatorId,
    type,
    description,
    category,
    capacity: capacity || { max: 4, unlimited: false },
    joinMode,
    timing: timing || { cookStart: new Date() },
    location: {
      scope: location?.scope || 'nearby',
      areaName: location?.areaName || 'Nearby'
    },
    visibility,
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

  return dish;
};

const getDishes = async (userId, query = {}) => {
  const { scope, category, status } = query;

  const filter = {};

  if (status) {
    filter.status = status;
  } else {
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

  const dishes = await Dish.find(filter)
    .populate('creator', 'username name avatar institute verification')
    .populate('participants.user', 'username name avatar')
    .sort({ createdAt: -1 })
    .limit(50);

  // Server-authoritative Chef's Special eligibility filtering
  return dishes.filter((dish) => {
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
  }
  await dish.save();

  return dish;
};

module.exports = {
  createDish,
  getDishes,
  getDishById,
  joinDish,
  transitionDishStatus
};
