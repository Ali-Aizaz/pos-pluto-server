const { currentUser, getUserByEmail } = require('../controller/User');
const { protect } = require('../middleware/Protect');

const router = require('express').Router();

router.get('/users/me', protect, currentUser);
router.get('/users/email', protect, getUserByEmail);

module.exports = router;
