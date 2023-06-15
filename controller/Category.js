const { z } = require('zod');
const asyncHandler = require('../middleware/AsyncHandler');
const advancedResults = require('../middleware/AdvancedResults');
const { category } = require('../config');

const getCategories = asyncHandler(async (req, res, next) => {
  const { search, include } = z
    .object({
      search: z
        .string()
        .min(3, 'minimum 3 characters required')
        .max(32, 'maximum 32 characters are acceptable')
        .optional(),
      include: z.enum(['inventory', 'product']).optional(),
    })
    .parse(req.query);

  const query = name && {
    name: {
      search,
    },
  };

  const populate = {};

  if (include) populate[include] = { take: 10 };
  else
    query.select = {
      name: true,
      id: true,
    };

  const result = await advancedResults(category, query, populate);

  return res.json(result);
});

module.exports = {
  getCategories,
};
