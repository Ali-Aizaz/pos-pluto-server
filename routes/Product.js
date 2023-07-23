const router = require('express').Router();
const {
  getProducts,
  getProductById,
  createProduct,
} = require('../controller/Product');
const { protect, isInvetoryManager } = require('../middleware/Protect');

router.get('/products', protect, isInvetoryManager, getProducts);
router.get('/products/:id', protect, isInvetoryManager, getProductById);

router.post('/products', protect, isInvetoryManager, createProduct);

module.exports = router;
