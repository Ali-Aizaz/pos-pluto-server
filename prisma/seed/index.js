const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const user = require('./user');
const product = require('./product&category');
const inventory = require('./inventory');

async function main() {
  await user(prisma);
  await product(prisma);
  await inventory(prisma);
}
main()
  .then(async () => {
    console.log('seeded successfully');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
