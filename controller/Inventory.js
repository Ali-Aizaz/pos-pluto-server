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

  const idList = inventoryData.map((i) => i.id);
  const selectedProducts = await inventory.findMany({
    where: {
      id: {
        in: idList,
      },
    },
  });

  const isValid =
    selectedProducts.length === inventoryData.length &&
    selectedProducts.every((product) => {
      const inventoryItem = inventoryData.find(
        (item) => item.id === product.id
      );
      return (
        inventoryItem.price === product.price &&
        inventoryItem.count <= product.count &&
        inventoryItem.warranty === product.warranty
      );
    });

  if (!isValid)
    return next(
      new ErrorHandler(
        'invalid productId or insuffiecent product count',
        StatusCode.ClientErrorNotFound
      )
    );

  return prisma.$transaction(async (tx) => {
    const soldItems = inventoryData.map((item) => {
      return {
        count: item.count,
        productId: item.productId,
        customerName: name,
        customerPhone: phone,
        price: item.price,
        warranty: item.warranty,
        storeId: req.user.storeId,
      };
    });

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
        data: soldItems,
      })
    );

    const [result] = await Promise.all(transactionArray);

    return res.json(result);
  });
});

const getStoreProducts = async (modal, req, res, next) => {
  const populate = {
    product: true,
  };
  try {
    const { categoryName, search, customerPhone } = z
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
        customerPhone: z
          .string()
          .regex(/^\+?\d{3,15}$/)
          .optional(),
      })
      .parse(req.query);

    const query = {
      storeId: req.user.storeId,
    };

    query.product = categoryName && {
      categoryName: {
        contains: categoryName,
        mode: 'insensitive',
      },
    };

    query.product = search && {
      name: {
        contains: search,
        mode: 'insensitive',
      },
    };

    query.customerPhone = customerPhone && {
      contains: customerPhone,
    };

    const result = await advancedResult(modal, query, populate);
    return res.json(result);
  } catch (e) {
    return next(e);
  }
};

const createInventory = asyncHandler(async (req, res, next) => {
  const { productId, count, price, warranty } = req.body;

  if (!productId || !count || !price)
    return next(
      new ErrorHandler('Incomplete Fields', StatusCode.ClientErrorBadRequest)
    );

  const newInventory = await inventory.create({
    data: {
      count,
      price,
      productId,
      warranty: warranty || 0,
      storeId: req.user.storeId,
    },
  });

  return res.json(newInventory);
});

const updateInventory = asyncHandler(async (req, res, next) => {
  const { id, count } = req.body;

  if (!id || !count)
    return next(
      new ErrorHandler('Incomplete Fields', StatusCode.ClientErrorBadRequest)
    );

  const result = await inventory.update({
    where: {
      id_storeId: {
        id,
        storeId: req.user.storeId,
      },
    },
    data: {
      count,
    },
  });

  return res.json(result);
});

const manageInventory = asyncHandler(async (req, res, next) => {
  const { id, count } = req.body;
  const { modal } = req;

  if (!id || !count)
    return next(
      new ErrorHandler('Incomplete Fields', StatusCode.ClientErrorBadRequest)
    );

  const selectSold = await sold.findUnique({
    where: {
      id,
    },
  });

  if (!selectSold || selectSold.storeId !== req.user.storeId)
    return next(
      ErrorHandler(
        'No such product was sold',
        StatusCode.ClientErrorPreconditionFailed
      )
    );

  const [result] = prisma.$transaction([
    modal.create({
      data: {
        count,
        productId: selectSold.productId,
        warranty: selectSold.warranty,
        price: selectSold.price,
        customerName: selectSold.customerName,
        customerPhone: selectSold.customerPhone,
        storeId: selectSold.storeId,
      },
    }),
    count === selectSold.count
      ? sold.delete({
          where: { id },
        })
      : sold.update({
          data: {
            count: {
              decrement: count,
            },
          },
        }),
  ]);

  return res.json(result);
});

const returnProduct = asyncHandler(async (req, res, next) => {
  req.modal = returned;
  manageInventory(req, res, next);
});

const claimWarrenty = asyncHandler(async (req, res, next) => {
  req.modal = warranty;
  manageInventory(req, res, next);
});

const getInventory = asyncHandler(async (req, res, next) =>
  getStoreProducts(inventory, req, res, next)
);

const getSoldItems = asyncHandler(async (req, res, next) => {
  getStoreProducts(sold, req, res, next);
});

const getWarranty = asyncHandler(async (req, res, next) =>
  getStoreProducts(warranty, req, res, next)
);

const getReturnedProducts = asyncHandler(async (req, res, next) =>
  getStoreProducts(returned, req, res, next)
);

const deleteInventory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await inventory.delete({
    where: {
      id_storeId: {
        id,
        storeId: req.user.storeId,
      },
    },
  });

  return res.json('');
});

module.exports = {
  getInventory,
  getSoldItems,
  getWarranty,
  getReturnedProducts,
  sellProduct,
  returnProduct,
  claimWarrenty,
  createInventory,
  deleteInventory,
  updateInventory,
};
