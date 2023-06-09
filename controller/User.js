const bcrypt = require('bcrypt');
const { default: StatusCode } = require('status-code-enum');
const { user } = require('../config');
const asyncHandler = require('../middleware/AsyncHandler');
const ErrorHandler = require('../middleware/ErrorHandler');
const sendEmail = require('../utils/sendEmail');
const { issueJWT } = require('../utils/issueJwt');
const advanceResults = require('../middleware/AdvancedResults');
const { employeeSchema } = require('../utils/zodConfig');

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
    return next(
      new ErrorHandler('Invalid token', StatusCode.ClientErrorUnauthorized)
    );
  }

  return res.json({ result: 'Email is successfully verified ' });
});

const getUserByEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(
      new ErrorHandler(
        'Please provide an email',
        StatusCode.ClientErrorBadRequest
      )
    );
  }

  const selectedUser = await user.findUnique({
    where: { email },
    select: {
      email: true,
      image: true,
      id: true,
      createdAt: true,
      isEmailVerified: true,
      name: true,
    },
  });

  if (!selectedUser) {
    return next(
      new ErrorHandler('User not found', StatusCode.ClientErrorNotFound)
    );
  }

  return res.json(selectedUser);
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
    return next(
      new ErrorHandler(
        'That email is already verified',
        StatusCode.ClientErrorConflict
      )
    );
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

    return res.status(StatusCode.SuccessOK).end();
  } catch (err) {
    console.log(err);
    await user.update({
      where: { id },
      data: { emailVerificationToken: null, validateBeforeSave: false },
    });

    return next(
      new ErrorHandler(
        'Email could not be sent',
        StatusCode.ClientErrorBadRequest
      )
    );
  }
});

const isEmailAvailable = asyncHandler(async (req, res) => {
  const result = await user.findUnique({
    where: { email: req.params.email },
  });
  return res
    .status(result ? StatusCode.ClientErrorConflict : StatusCode.SuccessOK)
    .end();
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

    return res.status(StatusCode.SuccessOK).end();
  }

  return next(
    new ErrorHandler('Invalid Password'),
    StatusCode.ClientErrorUnauthorized
  );
});

const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

const getEmployees = asyncHandler(async (req, res) => {
  req.query = {
    storeId: req.user.storeId,
    role: 'STOREEMPLOYEE',
  };

  const result = await advanceResults(user, req.query);

  return res.json(result);
});

const createEmployee = asyncHandler(async (req, res, next) => {
  const { name, password, email } = employeeSchema.parse(req.body);

  const result = await user.create({
    data: {
      name,
      email,
      password,
      resetPasswordExpire: new Date().toISOString(),
      provider: 'EMAIL',
      role: 'STOREEMPLOYEE',
      storeId: req.user.storeId,
    },
  });

  return res.json(result);
});

const deleteEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await user.delete({
    where: {
      id_storeId: {
        id,
        storeId: req.user.storeId,
      },
    },
  });

  return res.json('');
});

module.exports = {
  isEmailAvailable,
  sendVerificationEmail,
  getUserByEmail,
  verifyEmail,
  changePassword,
  currentUser,
  getEmployees,
  createEmployee,
  deleteEmployee,
};
