const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connection.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/:userId', connectionController.sendRequest);
router.get('/', connectionController.getConnections);
router.post('/:id/respond', connectionController.respond);
router.post('/:userId/block', connectionController.block);

module.exports = router;
