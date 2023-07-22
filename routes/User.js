const { GoogleAuthURL, GoogleUser } = require('../controller/Auth');
const {
  currentUser,
  getUserByEmail,
  getEmployees,
  createEmployee,
  deleteEmployee,
  updateStore,
  getStore,
} = require('../controller/User');
const { protect } = require('../middleware/Protect');

const router = require('express').Router();

router.get('/users/me', protect, currentUser);
router.get('/users/email', protect, getUserByEmail);
router.get('/users/employees', protect, getEmployees);
router.get('/users/store', protect, getStore);
router.get('/users/google', GoogleAuthURL);
router.get('/users/google/:code', GoogleUser);

router.post('/users/employees', protect, createEmployee);

router.patch('/users/store', protect, updateStore);

router.delete('/users/employees/:id', protect, deleteEmployee);
module.exports = router;
