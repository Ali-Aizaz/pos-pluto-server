const { default: StatusCode } = require('status-code-enum');
const { inventory, product } = require('../config');
const asyncHandler = require('../middleware/AsyncHandler');
const ErrorHandler = require('../middleware/ErrorHandler');
const advancedResult = require('../middleware/AdvancedResults');

const sellProduct = asyncHandler(async (req, res, next) => {
  const { productId, count } = req.query;

  if (!productId)
    return next(
      new ErrorHandler('productId required', StatusCode.ClientErrorBadRequest)
    );

  const selectedProduct = await product.findUnique({
    where: { id: productId },
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

  const result = await inventory.create({
    data: {
      count,
      productId,
      ownerId: req.user.id,
    },
    include: {
      product,
    },
  });

  await product.update({
    where: {
      id: productId,
    },
    data: {
      count: {
        decrement: count,
      },
    },
  });

  return res.json(result);
});

const getInventory = asyncHandler(async (req, res) => {
  const populate = {
    product: true,
  };

  req.query.ownerId = req.user.id;

  const inventory = await advancedResult(inventory, req.query, populate);

  res.json(inventory);
});

const manageInventory = asyncHandler(async (req, res, next) => {
  const { inventoryId, count } = req.query;

  const givenCount = count || 1;

  if (!inventoryId)
    return next(
      new ErrorHandler('Incomplete Fields', StatusCode.ClientErrorBadRequest)
    );

  const selectedInventory = await inventory.findUnique({
    where: { id: inventoryId },
  });

  if (!selectedInventory)
    return next(
      new ErrorHandler(
        'this invoice does not exist',
        StatusCode.ClientErrorNotFound
      )
    );

  if (selectedInventory.count < givenCount)
    return next(
      new ErrorHandler(
        'Incorrect product return count',
        StatusCode.ClientErrorForbidden
      )
    );

  await inventory.create({
    data: {
      parentId: selectedInventory.id,
      count: givenCount,
      state: req.returnType,
      ownerId: req.user.id,
    },
  });

  return;
});

const returnProduct = asyncHandler(async (req, res, next) => {
  req.returnType = 'RETURNED';
  await manageInventory(req, res, next);
  await product.update({
    where: {
      id: selectedInventory.productId,
    },
    data: {
      count: {
        increment: givenCount,
      },
    },
  });

  res.status(StatusCode.SuccessOK).end();
});

const claimWarrenty = asyncHandler(async (req, res, next) => {
  req.returnType = 'WARRANTY';

  await manageInventory(req, res, next);

  res.status(StatusCode.SuccessOK).end();
});

module.exports = {
  getInventory,
  sellProduct,
  returnProduct,
  claimWarrenty,
};
