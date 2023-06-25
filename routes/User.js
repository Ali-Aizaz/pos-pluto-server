const {
  currentUser,
  getUserByEmail,
  getEmployees,
} = require('../controller/User');
const { protect } = require('../middleware/Protect');

const router = require('express').Router();

router.get('/users/me', protect, currentUser);
router.get('/users/email', protect, getUserByEmail);
router.get('/users/employees', protect, getEmployees);

module.exports = router;
