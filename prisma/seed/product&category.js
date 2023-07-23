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
            imageUrl: '16e3adbd17f6607b0533bc1b0b3811cb4d1dcb86.jpeg',
            details: {
              type: 'Air Conditioner',
              brand: 'Gree',
              modal: 'GREE123',
              year: '2019',
            },
          },
          {
            name: 'Gree 1.0 ton Invertor',
            imageUrl: '16e3adbd17f6607b0533bc1b0b3811cb4d1dcb86.jpeg',
            details: {
              type: 'Air Conditioner',
              brand: 'Gree',
              modal: 'GREE124',
              year: '2019',
            },
          },
          {
            name: 'Dawlance 15 liter',
            imageUrl: '491527b014809b878de18c5df3d1e54944dfe63c.jpeg',
            details: {
              type: 'Refrigerator',
              brand: 'Dawlance',
              modal: 'Modal 91996 Wb H-Zone',
              year: '2020',
            },
          },
          {
            name: 'Homage 15 liter',
            imageUrl: 'fea95663bd64c15b9d513e6e964336fff11e7715.jpeg',
            details: {
              type: 'Microwave',
              brand: 'Homage',
              modal: 'Homage123',
              year: '2020',
            },
          },
          {
            name: 'Homage 19 liter',
            imageUrl: '0b42552ffc251191a7e1cfb1f46b8a1ff30a7005.jpeg',
            details: {
              type: 'Microwave',
              brand: 'Homage',
              modal: 'Homage124',
              year: '2022',
            },
          },
          {
            name: 'Homage 23 liter',
            imageUrl: '57632e1d5a149a381357cdfadf85c12138a1000d.jpeg',
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
            imageUrl: 'b48d26db7ad01d4d9097e6966cfb90ee32053b61.jpeg',
            details: {
              type: 'Headphones',
              brand: 'Beats',
              modal: 'A400',
              year: '2022',
            },
          },
          {
            name: 'Beats A400 headphones',
            imageUrl: '9ad5e704565d4c4b193b45cf6e49f5c735d25e2f.jpeg',
            details: {
              type: 'Headphones',
              brand: 'Beats',
              modal: 'A400',
              year: '2022',
            },
          },
          {
            name: 'Beats A500 headphones',
            imageUrl: 'bd1fa6f4b6f9d387176046d5db1f2c976cb4a0eb.jpeg',
            details: {
              type: 'Headphones',
              brand: 'Beats',
              modal: 'A500',
              year: '2022',
            },
          },
          {
            name: 'Logitek G502 Lightspeed wireless',
            imageUrl: '519da5dbc73cd04c95f3f383a2c5ac699fb8e25c.jpeg',
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
