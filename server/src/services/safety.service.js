const Report = require('../models/Report');
const Verification = require('../models/Verification');
const User = require('../models/User');
const universityService = require('./university.service');
const emailService = require('./email.service');

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

/**
 * Step 1: Request 6-digit OTP for institutional email verification.
 * Enforces:
 * - Valid accredited university domain from Hipo database
 * - Unique 1:1 Account-to-University-Email mapping across all users
 * - 45-second resend cooldown
 */
const requestInstituteOtp = async (userId, { instituteEmail, course, year }) => {
  if (!instituteEmail || typeof instituteEmail !== 'string' || !instituteEmail.includes('@')) {
    throw new Error('A valid institutional email is required.');
  }

  const cleanEmail = instituteEmail.trim().toLowerCase();

  // 1. Enforce 1 Account : 1 Uni Email
  const existingUser = await User.findOne({
    $or: [
      { instituteEmail: cleanEmail },
      { 'institute.email': cleanEmail },
      { 'verifiedInstitutes.email': cleanEmail }
    ]
  });

  if (existingUser && String(existingUser._id) !== String(userId)) {
    throw new Error(
      'This institutional email is already linked to another LetMeCook account. Each university email can only verify one account.'
    );
  }

  // 2. Validate domain against university registry
  const matchedUni = universityService.findUniversityByDomain(cleanEmail);
  if (!matchedUni) {
    throw new Error(
      'The email domain is not recognized as an accredited university or college. Please use your official institutional email (e.g. .edu, .ac.in, etc.).'
    );
  }

  // 3. Rate-limit / resend cooldown (45 seconds)
  const recent = await Verification.findOne({
    user: userId,
    type: 'institute',
    status: 'pending',
    submittedAt: { $gt: new Date(Date.now() - 45 * 1000) }
  });

  if (recent) {
    const elapsedSec = Math.floor((Date.now() - new Date(recent.submittedAt).getTime()) / 1000);
    const waitSec = Math.max(1, 45 - elapsedSec);
    throw new Error(`Please wait ${waitSec} second${waitSec === 1 ? '' : 's'} before requesting another verification code.`);
  }

  // 4. Generate secure 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Expire previous pending verifications for this user
  await Verification.updateMany(
    { user: userId, type: 'institute', status: 'pending' },
    { status: 'expired' }
  );

  // 5. Store pending verification
  await Verification.create({
    user: userId,
    type: 'institute',
    status: 'pending',
    provider: 'institutional_email',
    instituteEmail: cleanEmail,
    otp,
    otpExpiresAt,
    attempts: 0,
    submittedAt: new Date(),
    metadata: {
      instituteName: matchedUni.name,
      country: matchedUni.country,
      emailDomain: matchedUni.domain,
      matchedDomain: matchedUni.matchedDomain || matchedUni.domain,
      course: course ? course.trim() : null,
      year: year ? Number(year) : null
    }
  });

  // 6. Send email via email service
  await emailService.sendInstituteOtpEmail({
    toEmail: cleanEmail,
    otp,
    instituteName: matchedUni.name
  });

  return {
    success: true,
    message: `Verification code sent to ${cleanEmail}`,
    instituteName: matchedUni.name,
    country: matchedUni.country,
    emailDomain: matchedUni.domain,
    expiresInSeconds: 600,
    // Provide devOtp during development mode for immediate verification without SMTP setup
    ...(process.env.NODE_ENV === 'development' ? { devOtp: otp } : {})
  };
};

/**
 * Step 2: Confirm 6-digit OTP and commit verified status.
 */
const verifyInstituteOtp = async (userId, { instituteEmail, otp, course, year }) => {
  if (!instituteEmail || !otp) {
    throw new Error('Institutional email and verification code are required.');
  }

  const cleanEmail = instituteEmail.trim().toLowerCase();
  const cleanOtp = String(otp).trim();

  // Find latest pending verification
  const verification = await Verification.findOne({
    user: userId,
    type: 'institute',
    instituteEmail: cleanEmail,
    status: 'pending'
  }).select('+otp');

  if (!verification) {
    throw new Error('No pending verification found for this email. Please request a new code.');
  }

  // Check expiration
  if (verification.otpExpiresAt && new Date() > verification.otpExpiresAt) {
    verification.status = 'expired';
    await verification.save();
    throw new Error('Verification code has expired. Please request a new code.');
  }

  // Check attempts
  if (verification.attempts >= 5) {
    verification.status = 'rejected';
    await verification.save();
    throw new Error('Too many failed attempts. Please request a new verification code.');
  }

  // Check OTP match
  if (verification.otp !== cleanOtp) {
    verification.attempts += 1;
    await verification.save();
    const remaining = 5 - verification.attempts;
    throw new Error(`Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
  }

  // Re-verify uniqueness before saving
  const existingUser = await User.findOne({
    $or: [
      { instituteEmail: cleanEmail },
      { 'institute.email': cleanEmail },
      { 'verifiedInstitutes.email': cleanEmail }
    ]
  });

  if (existingUser && String(existingUser._id) !== String(userId)) {
    throw new Error('This institutional email is already linked to another LetMeCook account.');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const matchedUni = universityService.findUniversityByDomain(cleanEmail);
  const uniName = matchedUni ? matchedUni.name : verification.metadata?.instituteName || 'Verified Institution';
  const emailDomain = matchedUni ? matchedUni.domain : cleanEmail.split('@')[1];
  const parsedYear = year ? Number(year) : verification.metadata?.year || user.institute?.year || null;
  const parsedCourse = course || verification.metadata?.course || user.institute?.course || null;

  if (!user.verifiedInstitutes) {
    user.verifiedInstitutes = [];
  }

  const existingIdx = user.verifiedInstitutes.findIndex(
    (vi) => vi.name.toLowerCase() === uniName.toLowerCase() || (vi.email && vi.email.toLowerCase() === cleanEmail)
  );

  const verifiedItem = {
    name: uniName,
    email: cleanEmail,
    emailDomain: emailDomain,
    course: parsedCourse,
    year: parsedYear,
    verifiedAt: new Date(),
    status: 'verified'
  };

  if (existingIdx >= 0) {
    user.verifiedInstitutes[existingIdx] = verifiedItem;
  } else {
    user.verifiedInstitutes.push(verifiedItem);
  }

  user.institute = {
    name: uniName,
    email: cleanEmail,
    emailDomain: emailDomain,
    course: parsedCourse,
    year: parsedYear,
    verified: true,
    verifiedAt: new Date()
  };

  user.instituteEmail = cleanEmail;
  user.verification = user.verification || {};
  user.verification.institute = true;

  await user.save();

  verification.status = 'verified';
  verification.verifiedAt = new Date();
  await verification.save();

  const userObj = user.toObject();
  return {
    verification,
    user: userObj
  };
};

/**
 * Domain lookup helper for live UI recognition
 */
const lookupInstituteDomain = (emailOrDomain) => {
  const match = universityService.findUniversityByDomain(emailOrDomain);
  if (!match) {
    return { recognized: false };
  }
  return {
    recognized: true,
    name: match.name,
    country: match.country,
    domain: match.domain
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
  requestInstituteOtp,
  verifyInstituteOtp,
  lookupInstituteDomain,
  getMyReports
};
