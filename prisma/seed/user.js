const bcrypt = require('bcrypt');
const { Prisma } = require('@prisma/client');

/**
 * @param { { store: Prisma.StoreDelegate} } {store}
 * @return {void}
 */

module.exports = async function ({ store }) {
  await store.create({
    data: {
      name: 'Aslam Store',
      description: 'Electronics Store',
      imageUrl: 'de0e85e99ff41c085d786008f36ad84725b2a83e.jpeg',
      employeeCount: 2,
      user: {
        create: [
          {
            name: 'Ali Aizaz',
            email: 'aliaizaz420@gmail.com',
            password: bcrypt.hashSync('AliAizaz@123456', 10),
            provider: 'EMAIL',
            role: 'STOREOWNER',
            isEmailVerified: true,
          },
          {
            name: 'Owais Ali',
            email: 'aliaizaz124124@gmail.com',
            password: bcrypt.hashSync('AliAizaz@123456', 10),
            provider: 'EMAIL',
            role: 'SALESMANAGER',
          },
          {
            name: 'Ayaan',
            email: 'aliaizazco@gmail.com',
            password: bcrypt.hashSync('AliAizaz@123456', 10),
            provider: 'EMAIL',
            role: 'INVENTORYMANAGER',
          },
        ],
      },
    },
  });

  await store.create({
    data: {
      name: 'General Store',
      description: 'General Store for your everyday needs',
      imageUrl: '8a916e2059588322eba9628c161922b23bb6370b.jpeg',
      employeeCount: 1,
      user: {
        create: [
          {
            name: 'Raheel Hussain',
            email: 'raheelhussainco@gmail.com',
            password: bcrypt.hashSync('James@123456', 10),
            provider: 'EMAIL',
            role: 'STOREOWNER',
          },
          {
            name: 'Owais Ali',
            email: 'owais@gmail.com',
            password: bcrypt.hashSync('Ryan@123456', 10),
            provider: 'EMAIL',
            role: 'SALESMANAGER',
          },
        ],
      },
    },
  });
};
