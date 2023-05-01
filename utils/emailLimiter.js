const rateLimit = require('express-rate-limit');
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to send 5 emails per hour
  message: 'Too many emails sent',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
exports.emailLimiter = emailLimiter;
