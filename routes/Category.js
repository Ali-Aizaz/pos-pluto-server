const { getCategories } = require('../controller/Category');
const { protect } = require('../middleware/Protect');

const router = require('express').Router();

router.get('/category', protect, getCategories);

module.exports = router;
