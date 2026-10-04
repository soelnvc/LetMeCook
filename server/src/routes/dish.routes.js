const express = require('express');
const router = express.Router();
const dishController = require('../controllers/dish.controller');
const authMiddleware = require('../middleware/auth.middleware');

const validate = require('../middleware/validator.middleware');
const { createDishValidator } = require('../utils/validators');

// Public/optional-auth discovery
router.get('/', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, next);
  }
  next();
}, dishController.getDishes);

router.get('/:id', dishController.getDishById);

// Protected actions
router.post('/', authMiddleware, validate(createDishValidator), dishController.createDish);
router.post('/:id/join', authMiddleware, dishController.joinDish);
router.post('/:id/leave', authMiddleware, dishController.leaveDish);
router.post('/:id/requests/:requestId/approve', authMiddleware, dishController.approveRequest);
router.post('/:id/requests/:requestId/reject', authMiddleware, dishController.rejectRequest);
router.patch('/:id/status', authMiddleware, dishController.updateStatus);

module.exports = router;
