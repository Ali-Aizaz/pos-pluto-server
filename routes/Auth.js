const {
  signUpWithIdPassword,
  logInWithIdPassword,
  resetPassword,
  sendPasswordResetEmail,
  getEmailProvider,
} = require('../controller/Auth');

const router = require('express').Router();

router.post('/auth/signup', signUpWithIdPassword);
router.post('/auth/signin', logInWithIdPassword);

router.get('/auth/get-email-provider', getEmailProvider);

router.patch('/auth/reset-password', resetPassword);
router.put('/auth/forget-password', sendPasswordResetEmail);

module.exports = router;
