const safetyService = require('../services/safety.service');

const createReport = async (req, res, next) => {
  try {
    const report = await safetyService.createReport(req.user.userId, req.body);
    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

const requestInstituteOtp = async (req, res, next) => {
  try {
    const result = await safetyService.requestInstituteOtp(req.user.userId, req.body);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const verifyInstituteOtp = async (req, res, next) => {
  try {
    const result = await safetyService.verifyInstituteOtp(req.user.userId, req.body);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const lookupInstitute = async (req, res, next) => {
  try {
    const emailOrDomain = req.query.email || req.query.domain || req.query.q;
    const result = safetyService.lookupInstituteDomain(emailOrDomain);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

const getMyReports = async (req, res, next) => {
  try {
    const reports = await safetyService.getMyReports(req.user.userId);
    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  requestInstituteOtp,
  verifyInstituteOtp,
  lookupInstitute,
  getMyReports
};
