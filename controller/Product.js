const { default: StatusCode } = require('status-code-enum');
const asyncHandler = require('../middleware/AsyncHandler');
const { product, category } = require('../config');
const advancedResults = require('../middleware/AdvancedResults');
const ErrorHandler = require('../middleware/ErrorHandler');
const { z } = require('zod');

const getProducts = asyncHandler(async (req, res) => {
  const { categoryName, include, search } = z
    .object({
      categoryName: z
        .string()
        .min(3, 'category name must be at least 3 characters long')
        .max(50, 'category name must be at most 50 characters long')
        .optional(),
      search: z
        .string()
        .min(3, 'product name must be at least 3 characters long')
        .max(50, 'product name must be at most 50 characters long')
        .optional(),
      include: z.enum(['category']).optional(),
    })
    .parse(req.query);

  const populate = include && {
    category: true,
  };

  req.query.categoryName = categoryName && {
    search: categoryName,
  };
  req.query.name = {
    search,
  };

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

  const selectedCategory = await category.findUnique({
    where: {
      name: providedCategory,
    },
  });

  if (!selectedCategory) {
    const newProduct = await category.create({
      data: {
        name: providedCategory,
        categoryData: Object.keys(content),
        product: {
          create: {
            name,
            details: content,
            count,
            categoryId: categoryId.id,
            price,
          },
        },
      },
      select: { product: true },
    });

    return res.json(newProduct.product);
  } else {
    if (selectedCategory.categoryData !== Object.keys(content))
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
        count,
        categoryId: categoryId.id,
        price,
      },
    });

    return res.json(newProduct);
  }
});

module.exports = { getProducts, getProductById, createProduct };
