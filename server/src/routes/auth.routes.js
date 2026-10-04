const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const validate = require('../middleware/validator.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const { registerValidator, loginValidator } = require('../utils/validators');

router.post('/register', authLimiter, validate(registerValidator), authController.register);
router.post('/login', authLimiter, validate(loginValidator), authController.login);
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
