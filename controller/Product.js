const { default: StatusCode } = require('status-code-enum');
const asyncHandler = require('../middleware/AsyncHandler');
const { product, productData, category } = require('../config');
const advancedResults = require('../middleware/AdvancedResults');
const ErrorHandler = require('../middleware/ErrorHandler');

const getProducts = asyncHandler(async (req, res) => {
  req.query.userId = req.user.id;

  const populate = {
    productData: { name: true },
  };

  const result = await advancedResults(product, req.query, populate);
  return res.json(result);
});

const getProductById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next('product id required', StatusCode.ClientErrorBadRequest);

  const result = await product({
    where: {
      id,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      product: true,
    },
  });

  return res.json(result);
});

const createProduct = asyncHandler(async (req, res, next) => {
  const { name, content, count, category: providedCategory, price } = req.query;

  if (!name || !content)
    return next(
      new ErrorHandler(
        'product name and content required',
        StatusCode.ClientErrorBadRequest
      )
    );

  for (const key in content) {
    if (typeof content[key] === 'object')
      return next(
        new ErrorHandler(
          'object value cannot be of type object',
          StatusCode.ClientErrorBadRequest
        )
      );
  }

  const categoryId = await category.upsert({
    where: { name: providedCategory },
    create: {
      name: providedCategory,
    },
    select: { id: true },
  });

  const newProduct = await product.create({
    data: {
      name,
      details: content,
      count,
      categoryId: categoryId.id,
      price,
    },
  });

  productData.createMany({
    data: Object.keys(content).map((key) => {
      return { productId: newProduct.id, name: key };
    }),
  });

  return res.json(newProduct);
});

module.exports = { getProducts, getProductById, createProduct };
