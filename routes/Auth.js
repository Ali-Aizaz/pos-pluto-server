const {
  signUpWithIdPassword,
  logInWithIdPassword,
  resetPassword,
  sendPasswordResetEmail,
  getEmailProvider,
  GoogleAuthURL,
  GoogleUser,
  sendVerificationEmail,
  verifyEmail,
} = require('../controller/Auth');

const { protect } = require('../middleware/Protect');

const router = require('express').Router();

router.post('/auth/signup', signUpWithIdPassword);
router.post('/auth/signin', logInWithIdPassword);

router.get('/auth/verify-email/:verificationToken', verifyEmail);
router.get('/auth/get-email-provider', getEmailProvider);
router.get('/auth/google', GoogleAuthURL);
router.get('/auth/google/:code', GoogleUser);
router.get('/auth/send-verification-email', protect, sendVerificationEmail);

router.patch('/auth/reset-password', resetPassword);
router.patch('/auth/forget-password', sendPasswordResetEmail);

module.exports = router;
