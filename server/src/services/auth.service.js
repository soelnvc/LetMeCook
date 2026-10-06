const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async ({ username, name, email, mobile, password, age, institute }) => {
  if (!username || !name || !email || !mobile || !password || age === undefined || age === null || age === '') {
    throw new Error('All required fields must be provided (username, name, email, mobile, password, age)');
  }

  const parsedAge = Number(age);
  if (isNaN(parsedAge) || parsedAge < 13 || parsedAge > 120) {
    throw new Error('Age must be a valid number between 13 and 120');
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
    age: parsedAge,
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
      age: newUser.age,
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

  // Auto-reactivate if account was deactivated
  let wasReactivated = false;
  if (user.isDeactivated) {
    user.isDeactivated = false;
    user.deactivatedUntil = null;
    await user.save();
    wasReactivated = true;
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
      age: user.age,
      gender: user.gender,
      mobile: user.mobile,
      avatar: user.avatar,
      institute: user.institute,
      verification: user.verification,
      privacy: user.privacy,
      stats: user.stats,
      isDeactivated: user.isDeactivated
    },
    token,
    wasReactivated
  };
};

const changePassword = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) {
    throw new Error('Current password and new password are required');
  }

  if (newPassword.length < 8) {
    throw new Error('New password must be at least 8 characters long');
  }

  const user = await User.findById(userId).select('+passwordHash');
  if (!user) {
    throw new Error('User not found');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  return { success: true, message: 'Password updated successfully' };
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
  getCurrentUser,
  changePassword
};
