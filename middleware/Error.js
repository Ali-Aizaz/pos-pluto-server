const { fromZodError } = require('zod-validation-error');

const { default: StatusCode } = require('status-code-enum');
const errorHandler = (err, req, res, next) => {
  const error = { ...err };
  const response = {
    success: false,
    error: 'Server Error',
  };
  let errorCode = error.statusCode || 400;
  error.message = err.message;
  // Log to console for dev

  console.log(err);

  if (error.name === 'ZodError')
    return res
      .status(StatusCode.ClientErrorBadRequest)
      .json(fromZodError(err).message);

  if (error.code === 'P2002') {
    response.error = `There is a unique constraint violation, ${error.meta.target}`;
  } else if (error.meta) {
    if (error.meta.message) response.error = error.meta.message;
    else if (error.meta.cause) response.error = error.meta.cause;
  } else if (error.message) {
    response.error = error.message;
  }

  if (error.code) errorCode = error.code;
  else errorCode = StatusCode.ServerErrorInternal;

  return res.status(errorCode).json(response);
};

module.exports = errorHandler;
