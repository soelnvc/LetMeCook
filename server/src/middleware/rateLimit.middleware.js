const rateLimit = require('express-rate-limit');
const isDev = process.env.NODE_ENV !== 'production';

// General API limiter to prevent denial of service
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 100000 : 2500, // High ceiling in development to prevent lockouts
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Never rate-limit in local development or for chat polling
    if (isDev) return true;
    const ip = req.ip || req.connection.remoteAddress;
    return ip === '127.0.0.1' || ip === '::1' || req.originalUrl?.includes('/chat');
  },
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Stricter limiter for authentication routes (login / register) to prevent brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 1000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes'
  }
});

// Limiter for user creation of messages and reports to prevent spam
const messageLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: isDev ? 1000 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
  message: {
    success: false,
    message: 'Message rate limit exceeded. Please slow down.'
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  messageLimiter
};
