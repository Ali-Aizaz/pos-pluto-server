const advancedResults = async (model, request, populate) => {
  let query = {};
  // Copy request
  const reqQuery = { ...request };

  if (reqQuery.select) {
    query.select = reqQuery.select;
    delete reqQuery['select'];
  }
  // Sort
  if (reqQuery.order) {
    const orderBy = reqQuery.order.split(',');
    query.orderBy = { [orderBy[0]]: orderBy[1] };
    delete reqQuery['order'];
  } else {
    query.orderBy = { createdAt: 'desc' };
  }
  if (populate && Object.keys(populate).length !== 0) {
    query.include = populate;
  }

  // Pagination
  const page = parseInt(reqQuery.page, 10) || 1;
  delete reqQuery['page'];
  const limit = parseInt(reqQuery.limit, 10) || 25;
  delete reqQuery['limit'];
  const startIndex = (page - 1) * limit;

  // Create query.where object
  // Create operators ($gt, $gte, etc)
  for (const key in reqQuery) {
    if (/\b(gt|gte|lt|lte|in)\b/g.test(reqQuery[key])) {
      const operator = reqQuery[key].split(',');
      reqQuery[key] = {
        [operator[0]]: parseInt(operator[1]),
      };
    }
  }

  query.where = { ...reqQuery };
  const { orderBy, ...rest } = { ...query };
  // const total = await model.count(rest);
  query.skip = startIndex;
  query.take = limit;
  // Executing query
  try {
    const results = await model.findMany(query);

    // Pagination result
    const pagination = {
      currentPage: page,
      totalPages: Math.ceil(1 / limit),
      limit: limit,
    };

    return {
      success: true,
      count: results.length,
      pagination,
      result: results,
    };
  } catch (error) {
    console.log(error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = advancedResults;
