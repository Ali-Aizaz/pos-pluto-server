const { Prisma } = require('@prisma/client');

/**
 * @param { { category: Prisma.CategoryDelegate } } {category}
 * @return {void}
 */

module.exports = async function ({ category }) {
  await category.create({
    data: {
      name: 'Home Appliance',
      categoryData: ['type', 'brand', 'modal', 'year'],
      product: {
        create: [
          {
            name: 'Gree 1.5 ton Invertor',
            price: 150000,
            details: {
              type: 'Air Conditioner',
              brand: 'Gree',
              modal: 'GREE123',
              year: '2019',
            },
          },
          {
            name: 'Gree 1.0 ton Invertor',
            price: 150000,
            details: {
              type: 'Air Conditioner',
              brand: 'Gree',
              modal: 'GREE124',
              year: '2019',
            },
          },
          {
            name: 'Dawlance 15 liter',
            price: 14000,
            details: {
              type: 'Microwave',
              brand: 'Dawlance',
              modal: 'Dawlance123',
              year: '2020',
            },
          },
          {
            name: 'Homage 15 liter',
            price: 13000,
            details: {
              type: 'Microwave',
              brand: 'Homage',
              modal: 'Homage123',
              year: '2020',
            },
          },
          {
            name: 'Homage 19 liter',
            price: 17000,
            details: {
              type: 'Microwave',
              brand: 'Homage',
              modal: 'Homage124',
              year: '2022',
            },
          },
          {
            name: 'Homage 23 liter',
            price: 20000,
            details: {
              type: 'Microwave',
              brand: 'Homage',
              modal: 'Homage111',
              year: '2022',
            },
          },
        ],
      },
    },
  });

  await category.create({
    data: {
      name: 'Electronics',
      categoryData: ['type', 'brand', 'modal', 'year'],
      product: {
        create: [
          {
            name: 'Beats A400 headphones',
            price: 20000,
            details: {
              type: 'Headphones',
              brand: 'Beats',
              modal: 'A400',
              year: '2022',
            },
          },
          {
            name: 'Beats A400 headphones',
            price: 19000,
            details: {
              type: 'Headphones',
              brand: 'Beats',
              modal: 'A400',
              year: '2022',
            },
          },
          {
            name: 'Beats A500 headphones',
            price: 22000,
            details: {
              type: 'Headphones',
              brand: 'Beats',
              modal: 'A500',
              year: '2022',
            },
          },
          {
            name: 'Razor G660 Gaming X',
            price: 23000,
            details: {
              type: 'Keyboard',
              brand: 'Razor',
              modal: 'G660',
              year: '2018',
            },
          },
        ],
      },
    },
  });
};
