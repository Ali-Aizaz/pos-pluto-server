const bcrypt = require('bcrypt');
const { default: StatusCode } = require('status-code-enum');
const { user, store } = require('../config');
const asyncHandler = require('../middleware/AsyncHandler');
const ErrorHandler = require('../middleware/ErrorHandler');
const { issueJWT } = require('../utils/issueJwt');
const advanceResults = require('../middleware/AdvancedResults');
const { employeeSchema, storeUpdateSchema } = require('../utils/zodConfig');
const { saveImage } = require('../utils/saveImage');
const prisma = require('../config');

const getUserByEmail = asyncHandler(async (req, res, next) => {
  const { email } = req.params;
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
      role: true,
      provider: true,
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

const isEmailAvailable = asyncHandler(async (req, res) => {
  const result = await user.findUnique({
    where: { email: req.params.email },
  });
  return res
    .status(result ? StatusCode.ClientErrorConflict : StatusCode.SuccessOK)
    .json('');
});

const changePassword = asyncHandler(async (req, res, next) => {
  const selectedUser = await user.findUnique({
    where: { email: req.user.email },
  });
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
        lastCredentialChange: new Date(Date.now()),
        password: hash,
      },
    });

    const jwt = issueJWT(req.user);
    res.set({
      'content-type': 'application/json',
      'content-length': '10000',
      authorization: jwt.token,
    });

    return res.status(StatusCode.SuccessOK).json('');
  }

  return next(
    new ErrorHandler('Invalid Password'),
    StatusCode.ClientErrorBadRequest
  );
});

const currentUser = asyncHandler(async (req, res) => {
  res.json(req.user);
});

const getEmployees = asyncHandler(async (req, res) => {
  req.query = {
    storeId: req.user.storeId,
    OR: [{ role: 'SALESMANAGER' }, { role: 'INVENTORYMANAGER' }],
  };

  const result = await advanceResults(user, req.query);

  return res.json(result);
});

const createEmployee = asyncHandler(async (req, res, next) => {
  const { name, password, email, role } = employeeSchema.parse(req.body);

  const [result] = await prisma.$transaction([
    user.create({
      data: {
        name,
        email,
        password: bcrypt.hashSync(password, 10),
        resetPasswordExpire: new Date(Date.now()),
        provider: 'EMAIL',
        role,
        storeId: req.user.storeId,
      },
    }),
    store.update({
      where: { id: req.user.storeId },
      data: {
        employeeCount: {
          increment: 1,
        },
      },
    }),
  ]);

  return res.json(result);
});

const updateStore = asyncHandler(async (req, res) => {
  const { name, image, description } = storeUpdateSchema.parse(req.body);

  const myStore = await store.findUnique({
    where: { id: req.user.storeId },
  });

  let url;
  let query = {
    name: myStore.name,
    description: myStore.description,
    imageUrl: myStore.imageUrl,
  };

  if (image) {
    url = await saveImage(image, myStore.imageUrl);
    if (url === null)
      return next(
        new ErrorHandler('invalid image', StatusCode.ClientErrorBadRequest)
      );
    query.imageUrl = url;
  }

  if (name) query.name = name;
  if (description) query.description = description;

  const result = await store.update({
    where: {
      id: req.user.storeId,
    },
    data: query,
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

const getStore = asyncHandler(async (req, res) => {
  const result = await store.findUnique({
    where: {
      id: req.user.storeId,
    },
  });
  return res.json(result);
});

module.exports = {
  isEmailAvailable,
  getUserByEmail,
  changePassword,
  currentUser,
  getEmployees,
  createEmployee,
  deleteEmployee,
  updateStore,
  getStore,
};
