const Report = require('../models/Report');
const Verification = require('../models/Verification');
const User = require('../models/User');

const createReport = async (reporterId, reportData) => {
  const { reportedUser, dish, message, reason, description } = reportData;

  if (!reason) {
    throw new Error('Reason is required to submit a report');
  }

  const report = await Report.create({
    reporter: reporterId,
    reportedUser: reportedUser || null,
    dish: dish || null,
    message: message || null,
    reason,
    description: description || ''
  });

  return report;
};

const submitInstituteVerification = async (userId, { instituteName, instituteEmail, course, year }) => {
  if (!instituteName || !instituteEmail) {
    throw new Error('Institute name and academic email are required');
  }

  const verification = await Verification.create({
    user: userId,
    type: 'institute',
    status: 'pending',
    metadata: {
      instituteName,
      instituteEmail,
      course: course || null,
      year: year || null
    }
  });

  // For development/initial prototype: auto-verify if valid email domain provided
  if (instituteEmail.includes('.edu') || instituteEmail.includes('.ac.')) {
    verification.status = 'verified';
    verification.verifiedAt = new Date();
    await verification.save();

    await User.findByIdAndUpdate(userId, {
      'verification.institute': true,
      'institute.name': instituteName,
      'institute.course': course || null,
      'institute.year': year || null,
      'institute.verified': true,
      'institute.verifiedAt': new Date()
    });
  }

  return verification;
};

module.exports = {
  createReport,
  submitInstituteVerification
};
