const {
  currentUser,
  getUserByEmail,
  getEmployees,
  createEmployee,
  deleteEmployee,
  updateStore,
  getStore,
} = require('../controller/User');
const { protect, isStoreOwner } = require('../middleware/Protect');

const router = require('express').Router();

router.get('/users/me', protect, currentUser);
router.get('/users/store', protect, getStore);
router.get('/users/employees', protect, getEmployees);
router.get('/users/:email', protect, getUserByEmail);

router.post('/users/employees', protect, isStoreOwner, createEmployee);

router.patch('/users/store', protect, updateStore);

router.delete('/users/employees/:id', protect, isStoreOwner, deleteEmployee);
module.exports = router;
