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

const verifyInstitute = async (req, res, next) => {
  try {
    const verification = await safetyService.submitInstituteVerification(req.user.userId, req.body);
    res.status(200).json({
      success: true,
      data: verification
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
  verifyInstitute,
  getMyReports
};
