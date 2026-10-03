const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/', messageController.sendMessage);
router.get('/conversations', messageController.getConversations);
router.get('/conversations/:conversationId', messageController.getMessages);
router.post('/requests/:conversationId/respond', messageController.respondToRequest);

module.exports = router;
