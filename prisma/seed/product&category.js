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
            imageUrl:
              'https://pluto-uploads.s3.amazonaws.com/16e3adbd17f6607b0533bc1b0b3811cb4d1dcb86.jpeg?AWSAccessKeyId=AKIASIXNQ5QA3LDBZ2IR&Expires=1689870779&Signature=Cnqxq%2FtoXMJJCD0XI%2Bo3npkrA0s%3D',
            details: {
              type: 'Air Conditioner',
              brand: 'Gree',
              modal: 'GREE123',
              year: '2019',
            },
          },
          {
            name: 'Gree 1.0 ton Invertor',
            imageUrl:
              'https://pluto-uploads.s3.amazonaws.com/16e3adbd17f6607b0533bc1b0b3811cb4d1dcb86.jpeg?AWSAccessKeyId=AKIASIXNQ5QA3LDBZ2IR&Expires=1689870779&Signature=Cnqxq%2FtoXMJJCD0XI%2Bo3npkrA0s%3D',
            details: {
              type: 'Air Conditioner',
              brand: 'Gree',
              modal: 'GREE124',
              year: '2019',
            },
          },
          {
            name: 'Dawlance 15 liter',
            imageUrl:
              'https://pluto-uploads.s3.ap-southeast-1.amazonaws.com/491527b014809b878de18c5df3d1e54944dfe63c.jpeg?AWSAccessKeyId=AKIASIXNQ5QA3LDBZ2IR&Expires=1689871096&Signature=N1BlGcHQ7qvDnD6tHZ%2FNak%2B2Smw%3D',
            details: {
              type: 'Refrigerator',
              brand: 'Dawlance',
              modal: 'Modal 91996 Wb H-Zone',
              year: '2020',
            },
          },
          {
            name: 'Homage 15 liter',
            imageUrl:
              'https://pluto-uploads.s3.ap-southeast-1.amazonaws.com/fea95663bd64c15b9d513e6e964336fff11e7715.jpeg?AWSAccessKeyId=AKIASIXNQ5QA3LDBZ2IR&Expires=1689871342&Signature=hop8s53eoakcRmWGFmg0eh%2BQ1JY%3D',
            details: {
              type: 'Microwave',
              brand: 'Homage',
              modal: 'Homage123',
              year: '2020',
            },
          },
          {
            name: 'Homage 19 liter',
            imageUrl:
              'https://pluto-uploads.s3.ap-southeast-1.amazonaws.com/0b42552ffc251191a7e1cfb1f46b8a1ff30a7005.jpeg?AWSAccessKeyId=AKIASIXNQ5QA3LDBZ2IR&Expires=1689871450&Signature=qVOgHHqlIw1713ugk9gfCV0uywg%3D',
            details: {
              type: 'Microwave',
              brand: 'Homage',
              modal: 'Homage124',
              year: '2022',
            },
          },
          {
            name: 'Homage 23 liter',
            imageUrl:
              'https://pluto-uploads.s3.ap-southeast-1.amazonaws.com/57632e1d5a149a381357cdfadf85c12138a1000d.jpeg?AWSAccessKeyId=AKIASIXNQ5QA3LDBZ2IR&Expires=1689871595&Signature=Wn7kALcH8w8X9AcXNnNvX2tgLn4%3D',
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
            imageUrl:
              'https://pluto-uploads.s3.ap-southeast-1.amazonaws.com/b48d26db7ad01d4d9097e6966cfb90ee32053b61.jpeg?AWSAccessKeyId=AKIASIXNQ5QA3LDBZ2IR&Expires=1689871689&Signature=21nJHJmTh%2Fw%2BZdqn06HVFsTFWvI%3D',
            details: {
              type: 'Headphones',
              brand: 'Beats',
              modal: 'A400',
              year: '2022',
            },
          },
          {
            name: 'Beats A400 headphones',
            imageUrl:
              'https://pluto-uploads.s3.ap-southeast-1.amazonaws.com/9ad5e704565d4c4b193b45cf6e49f5c735d25e2f.jpeg?AWSAccessKeyId=AKIASIXNQ5QA3LDBZ2IR&Expires=1689871861&Signature=mk%2FJvx5xqNX9uWCDqgSnM5%2BYAYA%3D',
            details: {
              type: 'Headphones',
              brand: 'Beats',
              modal: 'A400',
              year: '2022',
            },
          },
          {
            name: 'Beats A500 headphones',
            imageUrl:
              'https://pluto-uploads.s3.ap-southeast-1.amazonaws.com/bd1fa6f4b6f9d387176046d5db1f2c976cb4a0eb.jpeg?AWSAccessKeyId=AKIASIXNQ5QA3LDBZ2IR&Expires=1689871974&Signature=jX765I5dBPdbAlHJ5epX2ZAaQIo%3D',
            details: {
              type: 'Headphones',
              brand: 'Beats',
              modal: 'A500',
              year: '2022',
            },
          },
          {
            name: 'Logitek G502 Lightspeed wireless',
            imageUrl:
              'https://pluto-uploads.s3.ap-southeast-1.amazonaws.com/519da5dbc73cd04c95f3f383a2c5ac699fb8e25c.jpeg?AWSAccessKeyId=AKIASIXNQ5QA3LDBZ2IR&Expires=1689860132&Signature=dCADPkC%2F1AqzRYfYWGG8%2B6bF4ME%3D',
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
