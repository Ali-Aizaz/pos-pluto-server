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
      imageUrl:
        'https://pluto-uploads.s3.ap-southeast-1.amazonaws.com/de0e85e99ff41c085d786008f36ad84725b2a83e.jpeg?AWSAccessKeyId=AKIASIXNQ5QA3LDBZ2IR&Expires=1689872144&Signature=m0o067y12Inrd2LYyK3Powdu8gM%3D',
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
      imageUrl:
        'https://pluto-uploads.s3.ap-southeast-1.amazonaws.com/8a916e2059588322eba9628c161922b23bb6370b.jpeg?AWSAccessKeyId=AKIASIXNQ5QA3LDBZ2IR&Expires=1689874405&Signature=qPm7CVnNE1qoFN2aod9JjEf4iMw%3D',
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
