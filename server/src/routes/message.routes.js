const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middleware/auth.middleware');

const validate = require('../middleware/validator.middleware');
const { messageLimiter } = require('../middleware/rateLimit.middleware');
const { messageValidator } = require('../utils/validators');

router.use(authMiddleware);

router.post('/', messageLimiter, validate(messageValidator), messageController.sendMessage);
router.get('/conversations', messageController.getConversations);
router.get('/conversations/:conversationId', messageController.getMessages);
router.post('/requests/:conversationId/respond', messageController.respondToRequest);

module.exports = router;
