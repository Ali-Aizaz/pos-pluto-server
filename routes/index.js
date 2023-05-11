const productRouter = require('./Product');
const inventoryRouter = require('./Inventory');
const userRouter = require('./User');
const authRouter = require('./Auth');

module.exports = function (app) {
  app.use('api/v1', authRouter);
  app.use('api/v1', productRouter);
  app.use('api/v1', inventoryRouter);
  app.use('api/v1', userRouter);
};
