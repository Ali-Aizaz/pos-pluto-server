const crypto = require('crypto');

const getEmailVerificationToken = () => {
  // Generate token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  return {
    // Hash token and set to resetPasswordToken field
    emailVerificationToken: crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex'),
    verificationToken,
  };
};

const getResetPasswordToken = () => {
  return {
    // Generate token
    resetPasswordToken: crypto.randomInt(1000000).toString().padStart(6, '0'),
    // Set expire
    resetPasswordExpire: new Date(Date.now() + 10 * 60 * 1000),
  };
};

module.exports = {
  getEmailVerificationToken,
  getResetPasswordToken,
};
