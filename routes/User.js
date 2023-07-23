const {
  currentUser,
  getUserByEmail,
  getEmployees,
  createEmployee,
  deleteEmployee,
  changePassword,
  updateStore,
  getStore,
} = require('../controller/User');
const { protect, isStoreOwner } = require('../middleware/Protect');

const router = require('express').Router();

router.get('/users/me', protect, currentUser);
router.get('/users/store', protect, getStore);
router.get('/users/employees', protect, isStoreOwner, getEmployees);
router.get('/users/:email', protect, isStoreOwner, getUserByEmail);

router.post('/users/employees', protect, isStoreOwner, createEmployee);
router.post('/users/change-password', protect, changePassword);

router.patch('/users/store', protect, isStoreOwner, updateStore);

router.delete('/users/employees/:id', protect, isStoreOwner, deleteEmployee);

module.exports = router;
