const bcrypt = require('bcrypt');
const { Prisma } = require('@prisma/client');

/**
 * @param { {inventory: Prisma.InventoryDelegate, product: Prisma.ProductDelegate, store: Prisma.StoreDelegate} } {inventory, product, store}
 * @return {void}
 */

module.exports = async function ({ inventory, product, store }) {
  const [products, stores] = await Promise.all([
    product.findMany({}),
    store.findMany({}),
  ]);

  await inventory.createMany({
    data: [
      {
        storeId: stores[0].id,
        productId: products[0].id,
        count: 7,
      },
      {
        storeId: stores[1].id,
        productId: products[0].id,
        count: 15,
      },
      {
        storeId: stores[0].id,
        productId: products[1].id,
        count: 71,
      },
      {
        storeId: stores[0].id,
        productId: products[7].id,
        count: 7,
      },
      {
        storeId: stores[0].id,
        productId: products[5].id,
        count: 20,
      },
      { storeId: stores[1].id, productId: products[3].id, count: 18 },
    ],
  });
};
