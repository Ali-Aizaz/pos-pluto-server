const { default: StatusCode } = require('status-code-enum');
const { inventory, product, returned, warranty, sold } = require('../config');
const asyncHandler = require('../middleware/AsyncHandler');
const ErrorHandler = require('../middleware/ErrorHandler');
const advancedResult = require('../middleware/AdvancedResults');
const prisma = require('../config');
const { z } = require('zod');

const sellProduct = asyncHandler(async (req, res, next) => {
  const { productId, count } = req.query;

  if (!productId)
    return next(
      new ErrorHandler('productId required', StatusCode.ClientErrorBadRequest)
    );

  const selectedProduct = await inventory.findUnique({
    where: { productId_storeId: { productId, storeId: req.user.storeId } },
  });

  if (!selectedProduct)
    return next(
      new ErrorHandler('invalid productId', StatusCode.ClientErrorNotFound)
    );

  if (selectedProduct.count < count)
    return next(
      new ErrorHandler(
        'Insufficient Stock',
        StatusCode.ClientErrorPreconditionFailed
      )
    );

  const [result] = await prisma.$transaction([
    sold.create({
      data: {
        count,
        productId,
        storeId: req.user.storeId,
      },
      include: {
        product,
      },
    }),
    inventory.update({
      where: { productId_storeId: { productId, storeId: req.user.storeId } },
      data: {
        count: {
          decrement: count,
        },
      },
    }),
  ]);

  return res.json(result);
});

const getInventory = asyncHandler(async (req, res) => {
  const populate = {
    product: true,
  };

  const { categoryName } = z
    .object({
      categoryName: z
        .string()
        .min(3, 'category name must be at least 3 characters long')
        .max(50, 'category name must be at most 50 characters long')
        .optional(),
    })
    .parse(req.query);

  const query = {
    storeId: req.user.storeId,
  };

  query.product = categoryName && {
    categoryName: {
      search: categoryName,
    },
  };

  const result = await advancedResult(inventory, query, populate);

  res.json(result);
});

const createStoreListing = asyncHandler(async (req, res, next) => {
  const { productId, count, price } = req.body;
  const { modal } = req;

  if (!productId || !count || !price)
    return next(
      new ErrorHandler('Incomplete Fields', StatusCode.ClientErrorBadRequest)
    );

  const newInventory = await modal.create({
    data: {
      count,
      price,
      productId,
      storeId: req.user.storeId,
    },
  });

  return res.json(newInventory);
});

const manageInventory = asyncHandler(async (req, res, next) => {
  const { productId, count } = req.body;
  const { modal } = req;

  if (!productId || !count)
    return next(
      new ErrorHandler('Incomplete Fields', StatusCode.ClientErrorBadRequest)
    );

  const selectSold = await sold.findUnique({
    where: {
      productId_storeId: {
        productId,
        storeId: req.user.storeId,
      },
    },
  });

  if (!selectSold)
    return next(
      ErrorHandler(
        'No such product was sold',
        StatusCode.ClientErrorPreconditionFailed
      )
    );

  const updateInventory = await modal.upsert({
    where: {
      productId_storeId: {
        productId,
        storeId: req.user.storeId,
      },
    },
    update: {
      count: {
        increment: count,
      },
    },
    create: {
      count,
      price: selectSold.price,
      productId,
      storeId: req.user.storeId,
    },
  });

  return res.json(updateInventory);
});

const returnProduct = asyncHandler(async (req, res, next) => {
  req.modal = returned;
  manageInventory(req, res, next);
});

const claimWarrenty = asyncHandler(async (req, res, next) => {
  req.modal = warranty;
  manageInventory(req, res, next);
});

const createInventory = asyncHandler(async (req, res, next) => {
  req.modal = inventory;
  createStoreListing(req, res, next);
});

const createSold = asyncHandler(async (req, res, next) => {
  req.modal = sold;
  createStoreListing(req, res, next);
});

const createWarrent = asyncHandler(async (req, res, next) => {
  req.modal = warranty;
  createStoreListing(req, res, next);
});

module.exports = {
  getInventory,
  sellProduct,
  returnProduct,
  claimWarrenty,
};
