const {
  getInventory,
  getSoldItems,
  getWarranty,
  getReturnedProducts,
  sellProduct,
  claimWarrenty,
  returnProduct,
} = require('../controller/Inventory');
const { protect } = require('../middleware/Protect');

const router = require('express').Router();

router.get('/inventory', protect, getInventory);
router.get('/sold', protect, getSoldItems);
router.get('/returned', protect, getReturnedProducts);
router.get('/warranty', protect, getWarranty);

router.post('/inventory', protect, sellProduct);
router.post('/inventory/return', protect, returnProduct);
router.post('/inventory/warrenty', protect, claimWarrenty);

module.exports = router;
