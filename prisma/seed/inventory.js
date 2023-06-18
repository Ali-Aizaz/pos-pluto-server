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
        price: 150000,
        warranty: 6,
        count: 7,
      },
      {
        storeId: stores[1].id,
        productId: products[0].id,
        price: 150000,
        warranty: 6,
        count: 15,
      },
      {
        storeId: stores[0].id,
        productId: products[1].id,
        price: 15000,
        warranty: 6,
        count: 71,
      },
      {
        storeId: stores[0].id,
        productId: products[7].id,
        price: 17000,
        warranty: 6,
        count: 7,
      },
      {
        storeId: stores[0].id,
        productId: products[5].id,
        price: 23000,
        warranty: 6,
        count: 20,
      },
      {
        storeId: stores[1].id,
        productId: products[3].id,
        price: 42000,
        warranty: 6,
        count: 18,
      },
    ],
  });
};
