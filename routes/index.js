const productRouter = require('./Product');

module.exports = function (app) {
  app.use('api/v1', productRouter);
};
