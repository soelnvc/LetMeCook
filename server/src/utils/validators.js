const { body, query, param } = require('express-validator');

const registerValidator = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain alphanumeric characters and underscores'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 60 })
    .withMessage('Name cannot exceed 60 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail(),
  body('mobile')
    .trim()
    .isLength({ min: 7, max: 15 })
    .withMessage('A valid mobile phone number is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('age')
    .notEmpty()
    .withMessage('Age must be entered during account creation')
    .isInt({ min: 13, max: 120 })
    .withMessage('Age must be a valid number between 13 and 120')
];

const loginValidator = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const createDishValidator = [
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Dish description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('category')
    .isIn(['sport', 'study', 'travel', 'food', 'gaming', 'social', 'help', 'learning', 'other'])
    .withMessage('Invalid Dish category'),
  body('type')
    .optional()
    .isIn(['regular', 'chefs_special'])
    .withMessage('Type must be either regular or chefs_special'),
  body('joinMode')
    .optional()
    .isIn(['auto', 'approval', 'invite_only'])
    .withMessage('Invalid joinMode')
];

const messageValidator = [
  body('receiverId')
    .notEmpty()
    .withMessage('Receiver user ID is required'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content cannot be empty')
    .isLength({ max: 2000 })
    .withMessage('Message cannot exceed 2000 characters')
];

module.exports = {
  registerValidator,
  loginValidator,
  createDishValidator,
  messageValidator
};
