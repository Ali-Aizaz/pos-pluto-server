const router = require('express').Router();
const {
  getProducts,
  getProductById,
  createProduct,
} = require('../controller/Product');

router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products', createProduct);

module.exports = router;
