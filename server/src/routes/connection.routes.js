const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connection.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/requests', connectionController.getRequests);
router.get('/sent', connectionController.getSentRequests);
router.get('/', connectionController.getConnections);
router.post('/:userId', connectionController.sendRequest);
router.delete('/:userId', connectionController.removeConnection);
router.post('/:id/respond', connectionController.respond);
router.post('/:userId/block', connectionController.block);

module.exports = router;
