const errorHandler = (err, req, res) => {
  const error = { ...err };
  const response = {
    success: false,
    error: 'Server Error',
  };
  let errorCode = error.statusCode || 400;
  error.message = err.message;
  // Log to console for dev

  console.log(error);
  if (error.code === 'P2002') {
    response.error = `There is a unique constraint violation, ${error.meta.target}`;
  } else if (error.meta) {
    if (error.meta.message) response.error = error.meta.message;
    else if (error.meta.cause) response.error = error.meta.cause;
  } else if (error.message) {
    response.error = error.message;
  } else if (error.code) {
    errorCode = error.code;
  } else {
    errorCode = 500;
  }

  res.status(errorCode).json(response);
};

module.exports = errorHandler;
