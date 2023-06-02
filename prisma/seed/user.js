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
      user: {
        create: [
          {
            name: 'Tofu',
            email: 'tofu@gmail.com',
            password: bcrypt.hashSync('Tofu@123456', 10),
            provider: 'EMAIL',
            role: 'STOREOWNER',
            isEmailVerified: true,
          },
          {
            name: 'Jack',
            email: 'jack@gmail.com',
            password: bcrypt.hashSync('Jack@123456', 10),
            provider: 'EMAIL',
            role: 'STOREEMPLOYEE',
          },
          {
            name: 'Harry',
            email: 'harry@gmail.com',
            password: bcrypt.hashSync('Harry@123456', 10),
            provider: 'EMAIL',
            role: 'STOREEMPLOYEE',
          },
        ],
      },
    },
  });

  await store.create({
    data: {
      name: 'General Store',
      description: 'General Store for your everyday needs',
      user: {
        create: [
          {
            name: 'James',
            email: 'james@gmail.com',
            password: bcrypt.hashSync('James@123456', 10),
            provider: 'EMAIL',
            role: 'STOREOWNER',
          },
          {
            name: 'Ryan',
            email: 'ryan@gmail.com',
            password: bcrypt.hashSync('Ryan@123456', 10),
            provider: 'EMAIL',
            role: 'STOREEMPLOYEE',
          },
        ],
      },
    },
  });
};
