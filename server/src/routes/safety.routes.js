const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safety.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/reports', safetyController.createReport);
router.post('/verifications/institute', safetyController.verifyInstitute);

module.exports = router;
