const bcrypt = require('bcrypt');
const asyncHandler = require('../middleware/AsyncHandler');
const { issueJWT } = require('../utils/issueJwt');
const { user, store } = require('../config');
const ErrorHandler = require('../middleware/ErrorHandler');
const sendEmail = require('../utils/sendEmail');
const { default: StatusCode } = require('status-code-enum');
const { z } = require('zod');
const { signUpSchema, resetPasswordSchema } = require('../utils/zodConfig');
const { saveImage } = require('../utils/saveImage');
const axios = require('axios');
const crypto = require('crypto');
const {
  getEmailVerificationToken,
  getResetPasswordToken,
} = require('../utils/tokens');

const signUpWithIdPassword = asyncHandler(async (req, res, next) => {
  const { storeName, storeDescription, name, email, password, image } =
    signUpSchema.parse(req.body);

  const isEmailPresent = await user.findUnique({ where: { email } });

  if (isEmailPresent)
    return res
      .status(StatusCode.ClientErrorConflict)
      .json('email is unavailable');

  let url;
  if (image) {
    url = await saveImage(image, 'product');
    if (url === null)
      return next(
        new ErrorHandler('invalid image', StatusCode.ClientErrorBadRequest)
      );
  }

  const newUser = await store.create({
    data: {
      name: storeName,
      description: storeDescription,
      imageUrl: url,
      user: {
        create: {
          name,
          email,
          password: bcrypt.hashSync(password, 10),
          provider: req.provider || 'EMAIL',
          resetPasswordExpire: new Date().toISOString(),
        },
      },
    },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          provider: true,
          createdAt: true,
          updatedAt: true,
          role: true,
          isEmailVerified: true,
        },
      },
    },
  });

  const jwt = issueJWT(newUser.user[0].id);

  res.set({ Authorization: jwt.token });

  return res.status(StatusCode.SuccessOK).json(newUser);
});

const logInWithIdPassword = asyncHandler(async (req, res, next) => {
  const { email, password } = z
    .object({
      email: z.string().email().min(3).max(50),
      password: z.string().min(8).max(50),
    })
    .parse(req.body);

  const result = await user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      provider: true,
      createdAt: true,
      updatedAt: true,
      password: true,
      isEmailVerified: true,
    },
  });

  if (!result) {
    return next(
      new ErrorHandler('Invalid Credentials', StatusCode.ClientErrorNotFound)
    );
  }

  const isValid = bcrypt.compareSync(password, result.password);

  if (!isValid)
    return next(
      new ErrorHandler(
        'Invalid Credentials',
        StatusCode.ClientErrorUnauthorized
      )
    );

  const jwt = issueJWT(result.id);
  res.set({
    Authorization: jwt.token,
  });

  delete result.password;

  return res.json(result);
});

const getEmailProvider = asyncHandler(async (req, res) => {
  const { email } = z
    .object({
      email: z.string().email().min(3).max(50),
    })
    .parse(req.body);

  const selectedUser = await user.findUnique({
    where: { email },
  });
  return res.json(selectedUser ? selectedUser.provider : null);
});

// Getting Login URL
const GoogleAuthURL = asyncHandler((req, res) => {
  const rootURL = 'https://accounts.google.com/o/oauth2/v2/auth';
  const options = {
    redirect_uri: `${process.env.CLIENT_ROOT_URI}`,
    client_id: process.env.GOOGLE_CLIENT_ID,

    access_type: 'offline',
    response_type: 'code',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
  };
  return res.json(`${rootURL}?${new URLSearchParams(options).toString()}`);
});

const getTokens = async (code) => {
  /*
   * Uses the code to get tokens
   * that can be used to fetch the user's profile
   */

  const url = 'https://oauth2.googleapis.com/token';

  const values = {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.CLIENT_ROOT_URI,
    grant_type: 'authorization_code',
  };
  console.log(new URLSearchParams(values).toString());
  try {
    const res = await axios.post(url, new URLSearchParams(values).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return res.data;
  } catch (error) {
    console.log(error.response.data.error);
    console.log(error, 'Failed to fetch Google Oauth Tokens');
    throw new Error(error.message);
  }
};

const GoogleUser = asyncHandler(async (req, res, next) => {
  const { code } = req.params;

  const { access_token, id_token } = await getTokens(code);

  const response = await axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
    {
      headers: {
        authorization: `Bearer ${id_token}`,
      },
    }
  );
  const googleUser = response.data;

  const userData = await user.findUnique({
    where: {
      email: googleUser.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      provider: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      isEmailVerified: true,
    },
  });

  if (userData)
    return res
      .set({
        authorization: issueJWT(userData.id).token,
      })
      .json(userData);

  const newUser = await store.create({
    data: {
      name: googleUser.name,
      description: '',
      user: {
        create: {
          name: googleUser.name,
          email: googleUser.email,
          provider: 'GOOGLE',
          isEmailVerified: googleUser.verified_email,
          password: bcrypt.hashSync(googleUser.id, 10),
          resetPasswordExpire: new Date().toISOString(),
        },
      },
    },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          provider: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          isEmailVerified: true,
        },
      },
    },
  });

  return res
    .set({
      authorization: issueJWT(newUser.user[0].id).token,
    })
    .json(newUser.user[0]);
});

const sendPasswordResetEmail = asyncHandler(async (req, res, next) => {
  const { email } = z
    .object({
      email: z.string().email().min(3).max(50),
    })
    .parse(req.body);

  const selectedUser = await user.findUnique({
    where: { email },
  });

  if (!selectedUser) {
    return next(
      new ErrorHandler(
        'There is no user with that email',
        StatusCode.ClientErrorNotFound
      )
    );
  }

  if (selectedUser.provider === 'google') {
    return next(
      new ErrorHandler(
        'That user is not associated with an email account',
        StatusCode.ClientErrorForbidden
      )
    );
  }

  // Get reset token
  const resetToken = getResetPasswordToken();

  await user.update({
    data: {
      resetPasswordExpire: resetToken.resetPasswordExpire,
      resetPasswordToken: resetToken.resetPasswordToken,
    },
    where: { email },
  });

  const message = `Hi ${selectedUser.name},
  You've requested to reset the password linked with your POS Pluto account.
  To confirm your request, please use the 6-digit code below:
    
  ${resetToken.resetPasswordToken}
  The verification code will be valid for 10 minutes. Please do not share this code with anyone.
    
  If you did not request a password reset, please ignore this email
  Thanks,
  POS Pluto Team
  This is an automated message, please do not reply.`;

  try {
    await sendEmail({
      email: selectedUser.email,
      subject: 'Reset Password Request',
      text: message,
    });
    return res.json({ success: true });
  } catch (err) {
    console.log(err);
    await user.update({
      data: {
        resetPasswordToken: null,
        resetPasswordExpire: null,
      },
      where: { email },
    });

    return next(
      new ErrorHandler(
        'Email could not be sent',
        StatusCode.ServerErrorInternal
      )
    );
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { newPassword, resetPasswordToken } = resetPasswordSchema.parse(
    req.body
  );

  const hash = await bcrypt.hash(newPassword, 10);

  const selectedUser = await user.findFirst({
    where: {
      resetPasswordToken,
      resetPasswordExpire: {
        gt: new Date(Date.now()),
      },
    },
  });

  if (!selectedUser) {
    return next(
      new ErrorHandler('Invalid token', StatusCode.ClientErrorUnauthorized)
    );
  }

  const updatedUser = await user.update({
    data: {
      password: hash,
      lastCredentialChange: new Date(Date.now()),
      resetPasswordToken: undefined,
      resetPasswordExpire: undefined,
    },

    where: {
      id: selectedUser.id,
    },
  });

  const jwt = issueJWT(updatedUser.id);
  res.set({
    'content-type': 'application/json',
    'content-length': '10000',
    Authorization: jwt.token,
  });
  return res.json('success');
});

const sendVerificationEmail = asyncHandler(async (req, res, next) => {
  const { user: userData } = req;
  if (userData.isEmailVerified) {
    return next(new ErrorHandler('That email is already verified', 403));
  }

  // Get reset token
  const verifications = getEmailVerificationToken();

  await user.update({
    data: {
      emailVerificationToken: verifications.emailVerificationToken,
    },
    where: {
      id: userData.id,
    },
  });

  const verificationUrl = `${process.env.SERVER_ROOT_URI}/api/v1/auth/verify-email/${verifications.verificationToken}`;

  try {
    await sendEmail({
      email: userData.email,
      subject: 'Email Verification Request',
      text: `Verification Url: ${verificationUrl}`,
    });

    return res.json({ success: true });
  } catch (err) {
    console.log(err);

    await user.update({
      data: {
        emailVerificationToken: null,
      },
      where: {
        id: userData.id,
      },
    });

    return next(new ErrorHandler('Email could not be sent', 500));
  }
});

const verifyEmail = asyncHandler(async (req, res, next) => {
  const emailVerificationToken = crypto
    .createHash('sha256')
    .update(req.params.verificationToken)
    .digest('hex');

  const selectUser = await user.findFirst({
    where: { emailVerificationToken },
  });

  if (!selectUser) {
    return next(new ErrorResponse('Invalid token', 401));
  }

  await user.update({
    where: {
      id: selectUser.id,
    },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
    },
  });

  return res.redirect(process.env.CLIENT_ROOT_URI);
});

module.exports = {
  signUpWithIdPassword,
  logInWithIdPassword,
  GoogleAuthURL,
  getEmailProvider,
  resetPassword,
  sendPasswordResetEmail,
  GoogleUser,
  sendVerificationEmail,
  verifyEmail,
};
