const bcrypt = require('bcrypt');
const { user } = require('../config');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorHandler = require('../middleware/errorHandler');
const sendEmail = require('../utils/sendEmail');
const { issueJWT } = require('../utils/issueJwt');

const verifyEmail = asyncHandler(async (req, res, next) => {
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(req.params.verificationToken)
    .digest('hex');
  const updatedUser = await user.update({
    where: { emailVerificationToken },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
    },
  });
  if (!updatedUser) {
    return next(new ErrorHandler('Invalid token', 401));
  }

  return res
    .status(200)
    .json({ success: true, result: 'Email is successfully verified ' });
});

const getUser = asyncHandler(async (req, res, next) => {
  if (!req.params.email) {
    return next(new ErrorHandler('Please provide an email', 400));
  }

  const selectedUser = await user.findUnique({
    where: { email: req.params.email },
    select: {
      email: true,
      id: true,
      createdAt: true,
      isEmailVerified: true,
      name: true,
    },
  });

  if (!selectedUser) {
    return next(new ErrorHandler('User not found', 404));
  }

  return res.status(200).json({
    success: true,
    result: selectedUser,
  });
});

const getEmailVerificationToken = () => {
  // Generate token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Hash token and set to resetPasswordToken field
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  return { verificationToken, emailVerificationToken };
};

const sendVerificationEmail = asyncHandler(async (req, res, next) => {
  const { isEmailVerified, email, id, name } = req.user;
  if (isEmailVerified) {
    return next(new ErrorHandler('That email is already verified', 409));
  }

  // Get reset token
  const verifications = getEmailVerificationToken();

  await user.update(
    {
      validateBeforeSave: false,
      emailVerificationToken: verifications.emailVerificationToken,
    },
    {
      where: {
        id,
      },
    }
  );
  const verificationUrl = `${process.env.SERVER_ROOT_URI}/api/v1/verify-email/${verifications.verificationToken}`;

  try {
    await sendEmail({
      email,
      subject: 'Email Verification Request',
      text: `Hi ${name}, your Verification Url: ${verificationUrl}`,
    });

    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    await user.update({
      where: { id },
      data: { emailVerificationToken: null, validateBeforeSave: false },
    });
    return next(new ErrorHandler('Email could not be sent', 400));
  }
});

const isEmailAvailable = asyncHandler(async (req, res) => {
  const result = await user.findUnique({
    where: { email: req.params.email },
  });
  return res.status(200).json({ success: true, result: !result });
});

const changePassword = asyncHandler(async (req, res, next) => {
  const selectedUser = await user.findUnique({ email: req.email });
  let isValid = true;
  if (!req.user.role === 'ADMIN') {
    isValid = await bcrypt.compare(
      req.body.currentPassword,
      selectedUser.password
    );
  }
  if (isValid) {
    const hash = await bcrypt.hash(req.body.newPassword, 10);
    await user.update({
      where: { id: req.user.id },
      data: {
        lastCredentialChange: Date.now(),
        password: hash,
      },
    });
    const jwt = issueJWT(req.user);
    res.set({
      'content-type': 'application/json',
      'content-length': '10000',
      authorization: jwt.token,
    });
    return res.json({
      success: true,
    });
  }
  return next(new ErrorHandler('Invalid Password'), 401);
});

module.exports = {
  isEmailAvailable,
  sendVerificationEmail,
  getUser,
  verifyEmail,
  changePassword,
};
