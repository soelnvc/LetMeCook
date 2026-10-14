const express = require('express');
const router = express.Router();
const safetyController = require('../controllers/safety.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/reports', safetyController.createReport);
router.get('/my-reports', safetyController.getMyReports);

// University verification endpoints
router.get('/verifications/institute/lookup', safetyController.lookupInstitute);
router.post('/verifications/institute/request-otp', safetyController.requestInstituteOtp);
router.post('/verifications/institute/verify-otp', safetyController.verifyInstituteOtp);
// Backward compatibility fallback routes to request OTP
router.post('/verifications/institute', safetyController.requestInstituteOtp);

module.exports = router;
