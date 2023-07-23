const { user } = require('../config');
const ErrorHandler = require('./ErrorHandler');
const { verifyToken } = require('../utils/issueJwt');
const asyncHandler = require('./AsyncHandler');
const { default: StatusCode } = require('status-code-enum');

const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization) {
    token = req.headers.authorization;
  }
  if (!token)
    return next(
      new ErrorHandler(
        'Not authorized to access this route',
        StatusCode.ClientErrorUnauthorized
      )
    );
  try {
    const decoded = verifyToken(token);
    req.user = await user.findFirst({
      where: {
        id: decoded.sub,
        lastCredentialChange: {
          lte: new Date(decoded.iat).toISOString(),
        },
      },
    });
    if (!req.user) {
      return next(new ErrorHandler('Invalid Tokens', 401));
    }

    if (req.user.isEmailVerified === false)
      return next(
        new ErrorHandler(
          'email is not verified',
          StatusCode.ClientErrorForbidden
        )
      );

    delete req.user.password;
    return next();
  } catch (err) {
    console.log(err);
    return next(
      new ErrorHandler(
        'Not authorized to access this route',
        StatusCode.ClientErrorUnauthorized
      )
    );
  }
});

exports.isAdmin = (req, res, next) => {
  if (req.user.roles !== 'ADMIN') {
    return next(new ErrorHandler('Not authorized to access this route', 401));
  }
  return next();
};

exports.isSalesManager = (req, res, next) => {
  if (req.user.roles === 'INVENTORYMANAGER')
    return next(
      new ErrorHandler(
        'Not authorized to access this route',
        StatusCode.ClientErrorUnauthorized
      )
    );

  return next();
};

exports.isInvetoryManager = (req, res, next) => {
  if (req.user.roles === 'SALESMANAGER')
    return next(
      new ErrorHandler(
        'Not authorized to access this route',
        StatusCode.ClientErrorUnauthorized
      )
    );

  return next();
};

exports.isStoreOwner = (req, res, next) => {
  exports.isInvetoryManager = (req, res, next) => {
    if (
      req.user.roles === 'SALESMANAGER' ||
      req.user.roles === 'INVENTORYMANAGER'
    )
      return next(
        new ErrorHandler(
          'Not authorized to access this route',
          StatusCode.ClientErrorUnauthorized
        )
      );

    return next();
  };
};

exports.protect = protect;
