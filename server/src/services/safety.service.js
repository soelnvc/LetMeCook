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

  const cleanName = instituteName.trim();
  const cleanEmail = instituteEmail.trim().toLowerCase();
  const parsedYear = year ? Number(year) : null;
  const emailDomain = cleanEmail.includes('@') ? cleanEmail.split('@')[1] : null;

  const verification = await Verification.create({
    user: userId,
    type: 'institute',
    status: 'verified',
    provider: 'institutional_email',
    submittedAt: new Date(),
    verifiedAt: new Date(),
    metadata: {
      instituteName: cleanName,
      instituteEmail: cleanEmail,
      course: course || null,
      year: parsedYear
    }
  });

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Ensure verifiedInstitutes array exists
  if (!user.verifiedInstitutes) {
    user.verifiedInstitutes = [];
  }

  const existingIdx = user.verifiedInstitutes.findIndex(
    (vi) => vi.name.toLowerCase() === cleanName.toLowerCase()
  );

  const verifiedItem = {
    name: cleanName,
    email: cleanEmail,
    course: course || null,
    year: parsedYear || user.institute?.year || null,
    verifiedAt: new Date(),
    status: 'verified'
  };

  if (existingIdx >= 0) {
    user.verifiedInstitutes[existingIdx] = verifiedItem;
  } else {
    user.verifiedInstitutes.push(verifiedItem);
  }

  // Set as primary institute if user has no verified primary institute or if updating current
  user.institute = {
    name: cleanName,
    emailDomain: emailDomain,
    course: course || user.institute?.course || null,
    year: parsedYear || user.institute?.year || null,
    verified: true,
    verifiedAt: new Date()
  };

  user.verification = user.verification || {};
  user.verification.institute = true;

  await user.save();

  const userObj = user.toObject();
  return {
    verification,
    user: userObj
  };
};

const getMyReports = async (userId) => {
  const reports = await Report.find({ reporter: userId })
    .populate('reportedUser', 'name username avatar')
    .populate('dish', 'description category')
    .sort({ createdAt: -1 });

  return reports.map((r) => {
    let target = 'Campus Ticket';
    if (r.reportedUser?.username) {
      target = `@${r.reportedUser.username}`;
    } else if (r.dish?.description) {
      target = r.dish.description.slice(0, 30) + '...';
    }

    const createdDate = new Date(r.createdAt);
    const dateStr = createdDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    let displayStatus = 'Under Review';
    if (r.status === 'resolved') displayStatus = 'Resolved • Action Taken';
    else if (r.status === 'dismissed') displayStatus = 'Dismissed • Standard Upheld';
    else if (r.status === 'reviewing') displayStatus = 'In Review';

    return {
      id: r._id,
      target,
      date: dateStr,
      status: displayStatus,
      reason: r.reason,
      createdAt: r.createdAt
    };
  });
};

module.exports = {
  createReport,
  submitInstituteVerification,
  getMyReports
};
