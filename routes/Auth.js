const {
  signUpWithIdPassword,
  signInWithIdPassword,
  resetPassword,
  sendPasswordResetEmail,
  getEmailProvider,
} = require('../controller/auth');

const router = require('express').Router();

router.post('/auth/signup', signUpWithIdPassword);
router.post('/auth/signin', signInWithIdPassword);

router.get('/auth/get-email-provider', getEmailProvider);

router.patch('/auth/reset-password', resetPassword);
router.put('/auth/forget-password', sendPasswordResetEmail);

module.exports = router;
