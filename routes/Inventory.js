const {
  getInventory,
  getSoldItems,
  getWarranty,
  getReturnedProducts,
  sellProduct,
  claimWarrenty,
  returnProduct,
  createInventory,
  deleteInventory,
  updateInventory,
} = require('../controller/Inventory');
const {
  protect,
  isInvetoryManager,
  isSalesManager,
} = require('../middleware/Protect');

const router = require('express').Router();

router.get('/inventory', protect, getInventory);
router.get('/sold', protect, isSalesManager, getSoldItems);
router.get('/returned', protect, isSalesManager, getReturnedProducts);
router.get('/warranty', protect, isSalesManager, getWarranty);

router.post('/inventory', protect, isInvetoryManager, createInventory);
router.post('/inventory/sell', protect, isSalesManager, sellProduct);
router.post('/inventory/return', protect, isSalesManager, returnProduct);
router.post('/inventory/warrenty', protect, isSalesManager, claimWarrenty);

router.patch('/inventory', protect, isInvetoryManager, updateInventory);

router.delete('/inventory/:id', protect, isSalesManager, deleteInventory);

module.exports = router;
