const { default: StatusCode } = require('status-code-enum');
const { inventory, returned, warranty, sold } = require('../config');
const asyncHandler = require('../middleware/AsyncHandler');
const ErrorHandler = require('../middleware/ErrorHandler');
const advancedResult = require('../middleware/AdvancedResults');
const prisma = require('../config');
const { z } = require('zod');

const sellProduct = asyncHandler(async (req, res, next) => {
  const { inventoryData, name, phone } = req.body;

  if (!inventoryData)
    return next(
      new ErrorHandler(
        'inventory data is required',
        StatusCode.ClientErrorBadRequest
      )
    );

  const selectedProduct = await inventory.findMany({
    where: {
      id: {
        in: inventoryData.map((i) => i.id),
      },
    },
  });

  if (
    selectedProduct.length !== inventoryData.length ||
    selectedProduct.every((o1) => {
      const o2 = inventoryData.find((o2) => o2.id === o1.id);
      return (
        o2.price !== o1.price ||
        o1.count < o2.count ||
        o2.warranty !== o1.warranty
      );
    })
  )
    return next(
      new ErrorHandler(
        'invalid productId or insuffiecent product count',
        StatusCode.ClientErrorNotFound
      )
    );

  return prisma.$transaction(async (tx) => {
    const newCustomer = name
      ? await tx.customer.create({
          data: {
            name,
            phone,
          },
        })
      : {
          id: null,
        };

    const transactionArray = inventoryData.map((x) =>
      tx.inventory.update({
        where: {
          id: x.id,
        },
        data: {
          count: {
            decrement: x.count,
          },
        },
      })
    );

    transactionArray.unshift(
      tx.sold.createMany({
        data: inventoryData.map((x) => {
          return {
            count: x.count,
            productId: x.productId,
            customerId: newCustomer.id,
            price: x.price,
            warranty: x.warranty,
            storeId: req.user.storeId,
          };
        }),
      })
    );

    const [result] = await Promise.all(transactionArray);

    return res.json(result);
  });
});

const getInventory = asyncHandler(async (req, res) => {
  const populate = {
    product: true,
  };

  const { categoryName, search } = z
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

  query.product = search && {
    name: {
      search,
    },
  };

  const result = await advancedResult(inventory, query, populate);

  res.json(result);
});

const createInventory = asyncHandler(async (req, res, next) => {
  const { productId, count, price, warranty } = req.body;

  if (!productId || !count || !price || !warranty)
    return next(
      new ErrorHandler('Incomplete Fields', StatusCode.ClientErrorBadRequest)
    );

  const newInventory = await inventory.create({
    data: {
      count,
      price,
      productId,
      warranty,
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
      productId,
      warranty: selectSold.warranty,
      price: selectSold.price,
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

module.exports = {
  getInventory,
  sellProduct,
  returnProduct,
  claimWarrenty,
  createInventory,
};
