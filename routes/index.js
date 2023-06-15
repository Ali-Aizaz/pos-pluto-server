const productRouter = require('./Product');
const inventoryRouter = require('./Inventory');
const userRouter = require('./User');
const authRouter = require('./Auth');
const categoryRouter = require('./Category');

/**
 * @param {Express} app
 */
const router = (app) => {
  app.use('/api/v1', authRouter);
  app.use('/api/v1', productRouter);
  app.use('/api/v1', inventoryRouter);
  app.use('/api/v1', userRouter);
  app.use('/api/v1', categoryRouter);
};

module.exports = router;
