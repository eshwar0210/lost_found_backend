const getPagination = (req, defaultLimit = 20) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || defaultLimit, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const buildPaginationResponse = (docs, total, page, limit) => ({
  docs,
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasMore: page * limit < total,
});

module.exports = { getPagination, buildPaginationResponse };
