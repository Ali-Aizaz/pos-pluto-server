class ErrorHandler extends Error {
  constructor(message, errorCode) {
    super(message);
    this.message = message;
    this.code = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = ErrorHandler;
