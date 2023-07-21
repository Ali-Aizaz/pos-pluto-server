const bcrypt = require('bcrypt');
const asyncHandler = require('../middleware/AsyncHandler');
const { issueJWT } = require('../utils/issueJwt');
const { user, store } = require('../config');
const ErrorHandler = require('../middleware/ErrorHandler');
const { sendEmail } = require('../utils/sendEmail');
const { default: StatusCode } = require('status-code-enum');
const { z } = require('zod');
const { signUpSchema } = require('../utils/zodConfig');
const { saveImage } = require('../utils/saveImage');

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
      user: true,
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
// const GoogleAuthURL = asyncHandler((req, res) => {
//   const rootURL = 'https://accounts.google.com/o/oauth2/v2/auth';
//   const options = {
//     redirect_uri: `${process.env.SERVER_ROOT_URI}/api/v1/google/callback`,
//     client_id: process.env.GOOGLE_CLIENT_ID,

//     access_type: 'offline',
//     response_type: 'code',
//     prompt: 'consent',
//     scope: [
//       'https://www.googleapis.com/auth/userinfo.profile',
//       'https://www.googleapis.com/auth/userinfo.email',
//     ].join(' '),
//   };
//   return res.json(`${rootURL}?${querystring.stringify(options)}`);
// });

// const getTokens = asyncHandler(
//   async ({ code, clientId, clientSecret, redirectUri }) => {
//     /*
//      * Uses the code to get tokens
//      * that can be used to fetch the user's profile
//      */
//     const url = 'https://oauth2.googleapis.com/token';
//     const values = {
//       code,
//       client_id: clientId,
//       client_secret: clientSecret,
//       redirect_uri: redirectUri,
//       grant_type: 'authorization_code',
//     };
//     const response = await axios.post(url, querystring.stringify(values), {
//       headers: {
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//     });
//     return response.data;
//   }
// );

// const GoogleUser = asyncHandler(async (req, res, next) => {
//   const { code } = req.query;

//   const props = await getTokens({
//     code,
//     clientId: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     redirectUri: `${process.env.SERVER_ROOT_URI}/api/v1/google`,
//   });
//   req.body.access_token = props.access_token;
//   req.body.id_token = props.id_token;
//   return mobileGoogleLogin(req, res, next);
// });

const getResetPasswordToken = () => {
  // Generate token
  const resetPasswordToken = crypto
    .randomInt(1000000)
    .toString()
    .padStart(6, '0');

  // Set expire
  const resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return { resetPasswordToken, resetPasswordExpire };
};

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
  await user.update(
    {
      validateBeforeSave: false,
      resetPasswordExpire: resetToken.resetPasswordExpire,
      resetPasswordToken: resetToken.resetPasswordToken,
    },
    { where: { email } }
  );
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
    await user.update(
      {
        validateBeforeSave: false,
        resetPasswordToken: null,
        resetPasswordExpire: null,
      },
      { where: { email } }
    );

    return next(
      new ErrorHandler(
        'Email could not be sent',
        StatusCode.ServerErrorInternal
      )
    );
  }
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { newPassword, resetPasswordToken } = z
    .object({
      newPassword: z
        .string()
        .regex(
          /^(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z])(?=D*d)(?=[^!#%]*[!#%])[A-Za-z0-9!#%]{8,32}$/
        ),
      resetPasswordToken: z.string(),
    })
    .parse(req.body);

  const hash = await bcrypt.hash(newPassword, 10);
  const updatedUser = await user.update(
    {
      password: hash,
      lastCredentialChange: Date.now(),
      resetPasswordToken: null,
      resetPasswordExpire: null,
    },
    {
      where: {
        AND: [
          { resetPasswordToken },
          { resetPasswordExpire: { gt: Date.now() } },
        ],
      },
    }
  );

  if (!updatedUser) {
    return next(
      new ErrorHandler('Invalid token', StatusCode.ClientErrorUnauthorized)
    );
  }

  const jwt = issueJWT(updatedUser.id);
  res.set({
    'content-type': 'application/json',
    'content-length': '10000',
    Authorization: jwt.token,
  });
  return res.json('success');
});

// const sendVerificationEmail = asyncHandler(async (req, res, next) => {
//   const user = req.user;
//   if (user.isEmailVerified) {
//     return next(new ErrorHandler("That email is already verified", 403));
//   }

//   // Get reset token
//   const verifications = getEmailVerificationToken();

//   await user.update(
//     {
//       validateBeforeSave: false,
//       emailVerificationToken: verifications.emailVerificationToken,
//     },
//     {
//       where: {
//         id: user.id,
//       },
//     }
//   );
//   const verificationUrl = `${process.env.SERVER_ROOT_URI}/api/v1/verify-email/${verifications.verificationToken}`;
//   verificationUrl;

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: "Email Verification Request",
//       text: `Verification Url: ${verificationUrl}`,
//     });

//     return res.json({ success: true });
//   } catch (err) {
//     console.log(err);
//     user.emailVerificationToken = null;

//     await user.save({ validateBeforeSave: false });

//     return next(new ErrorHandler("Email could not be sent", 500));
//   }
// });

module.exports = {
  signUpWithIdPassword,
  logInWithIdPassword,
  // GoogleAuthURL,
  getEmailProvider,
  resetPassword,
  sendPasswordResetEmail,
  // GoogleUser,
};
