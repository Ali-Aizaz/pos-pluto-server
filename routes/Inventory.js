const {
  getInventory,
  sellProduct,
  claimWarrenty,
  returnProduct,
} = require('../controller/Inventory');

const router = require('express').Router();

router.get('/inventory', protect, getInventory);
router.post('/inventory', protect, sellProduct);
router.patch('/inventory/return', protect, returnProduct);
router.patch('/inventory/warrenty', protect, claimWarrenty);

module.exports = router;
