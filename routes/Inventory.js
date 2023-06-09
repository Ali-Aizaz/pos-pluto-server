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
const { protect } = require('../middleware/Protect');

const router = require('express').Router();

router.get('/inventory', protect, getInventory);
router.get('/sold', protect, getSoldItems);
router.get('/returned', protect, getReturnedProducts);
router.get('/warranty', protect, getWarranty);

router.post('/inventory', protect, createInventory);
router.post('/inventory/sell', protect, sellProduct);
router.post('/inventory/return', protect, returnProduct);
router.post('/inventory/warrenty', protect, claimWarrenty);

router.patch('/inventory', protect, updateInventory);

router.delete('/inventory/:id', protect, deleteInventory);

module.exports = router;
