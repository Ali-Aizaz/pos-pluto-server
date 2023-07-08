const {
  currentUser,
  getUserByEmail,
  getEmployees,
  createEmployee,
} = require('../controller/User');
const { protect } = require('../middleware/Protect');

const router = require('express').Router();

router.get('/users/me', protect, currentUser);
router.get('/users/email', protect, getUserByEmail);
router.get('/users/employees', protect, getEmployees);

router.post('/users/employees', protect, createEmployee);

module.exports = router;
