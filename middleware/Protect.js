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

    delete user.password;
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

// exports.isActive = async (req, res, next) => {
//   if (!req.user.isAdmin) {
//     if (!req.user.isEmailVerified) {
//       return next(new ErrorHandler("Email not verified", 401));
//     } else if (!req.user.isActive) {
//       return next(new ErrorHandler("Payment not active", 401));
//     }
//   }
//   next();
// };

// exports.setEmail = async (req, res, next) => {
//   if (req.user.isAdmin && req.body.email) {
//     req.email = req.body.email;
//   } else {
//     req.email = req.user.email;
//   }
//   next();
// };
exports.protect = protect;
