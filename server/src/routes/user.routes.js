const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.patch('/me', authMiddleware, userController.updateProfile);
router.get('/me/export-data', authMiddleware, userController.exportUserData);
router.post('/me/deactivate', authMiddleware, userController.deactivateAccount);
router.get('/me/safety-lists', authMiddleware, userController.getSafetyLists);
router.post('/me/block', authMiddleware, userController.blockUser);
router.delete('/me/block/:username', authMiddleware, userController.unblockUser);
router.post('/me/restrict', authMiddleware, userController.restrictUser);
router.delete('/me/restrict/:username', authMiddleware, userController.unrestrictUser);

// Public profile retrieval with optional auth context to resolve view permissions
router.get('/:username', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  }
  next();
}, userController.getPublicProfile);

module.exports = router;
