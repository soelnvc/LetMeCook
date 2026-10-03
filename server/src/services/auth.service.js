const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async ({ username, name, email, mobile, password, institute }) => {
  if (!username || !name || !email || !mobile || !password) {
    throw new Error('All required fields must be provided (username, name, email, mobile, password)');
  }

  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw new Error('Email is already registered');
  }

  const existingUsername = await User.findOne({ username: username.toLowerCase() });
  if (existingUsername) {
    throw new Error('Username is already taken');
  }

  const existingMobile = await User.findOne({ mobile });
  if (existingMobile) {
    throw new Error('Mobile number is already registered');
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const newUser = await User.create({
    username: username.toLowerCase(),
    name,
    email: email.toLowerCase(),
    mobile,
    passwordHash,
    institute: institute || {}
  });

  const token = jwt.sign(
    { userId: newUser._id, username: newUser.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    user: {
      _id: newUser._id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
      institute: newUser.institute,
      verification: newUser.verification,
      privacy: newUser.privacy,
      stats: newUser.stats
    },
    token
  };
};

const login = async ({ identifier, password }) => {
  if (!identifier || !password) {
    throw new Error('Identifier and password are required');
  }

  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier.toLowerCase() }]
  }).select('+passwordHash');

  if (!user) {
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = jwt.sign(
    { userId: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    user: {
      _id: user._id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      institute: user.institute,
      verification: user.verification,
      privacy: user.privacy,
      stats: user.stats
    },
    token
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

module.exports = {
  register,
  login,
  getCurrentUser
};
