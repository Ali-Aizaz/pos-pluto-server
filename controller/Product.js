const { default: StatusCode } = require('status-code-enum');
const asyncHandler = require('../middleware/AsyncHandler');
const { product, category } = require('../config');
const advancedResults = require('../middleware/AdvancedResults');
const ErrorHandler = require('../middleware/ErrorHandler');
const { productGetSchema } = require('../utils/zodConfig');
const { saveImage } = require('../utils/saveImage');

const getProducts = asyncHandler(async (req, res) => {
  const { categoryName, include, search, all } = productGetSchema.parse(
    req.query
  );

  const populate = include && {
    category: true,
  };

  req.query.categoryName = categoryName && {
    search: categoryName,
  };
  req.query.name = search && {
    contains: search,
    mode: 'insensitive',
  };

  req.query.inventory = !all && {
    none: {
      storeId: req.user.storeId,
    },
  };

  delete req.query.all;
  delete req.query.search;

  const result = await advancedResults(product, req.query, populate);
  return res.json(result);
});

const getProductById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) return next('product id required', StatusCode.ClientErrorBadRequest);

  const result = await product.findUnique({
    where: {
      id,
    },
    include: {
      category: true,
    },
  });

  return res.json(result);
});

const createProduct = asyncHandler(async (req, res, next) => {
  const { name, content, category: providedCategory, image } = req.body;
  const contentKeys = Object.keys(content);

  if (!name || !content)
    return next(
      new ErrorHandler(
        'product name and content required',
        StatusCode.ClientErrorBadRequest
      )
    );

  if (contentKeys.length > 10)
    return next(
      new ErrorHandler(
        'too many product fields only 10 fields are required',
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

  const selectedCategory = await category.findUnique({
    where: {
      name: providedCategory,
    },
  });

  let url;
  if (image) {
    url = await saveImage(image);
    if (url === null)
      return next(
        new ErrorHandler('invalid image', StatusCode.ClientErrorBadRequest)
      );
  }

  if (!selectedCategory) {
    const newProduct = await category.create({
      data: {
        name: providedCategory,
        categoryData: contentKeys,
        product: {
          create: {
            name,
            details: content,
            imageUrl: url,
          },
        },
      },
      select: { product: true },
    });

    return res.json(newProduct.product);
  }

  if (
    JSON.stringify(selectedCategory.categoryData) !==
    JSON.stringify(contentKeys)
  )
    return next(
      new ErrorHandler(
        'invalid product fields',
        StatusCode.ClientErrorBadRequest
      )
    );

  const newProduct = await product.create({
    data: {
      name,
      details: content,
      categoryName: selectedCategory.name,
      imageUrl: url,
    },
  });

  return res.json(newProduct);
});

module.exports = { getProducts, getProductById, createProduct };
