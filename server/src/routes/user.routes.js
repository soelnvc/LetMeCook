const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.patch('/me', authMiddleware, userController.updateProfile);

// Public profile retrieval with optional auth context to resolve view permissions
router.get('/:username', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  }
  next();
}, userController.getPublicProfile);

module.exports = router;
