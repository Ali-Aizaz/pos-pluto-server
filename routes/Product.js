const router = require('express').Router();
const {
  getProducts,
  getProductById,
  createProduct,
} = require('../controller/Product');
const { protect } = require('../middleware/Protect');

router.get('/products', protect, getProducts);
router.get('/products/:id', protect, getProductById);

router.post('/products', protect, createProduct);

module.exports = router;
