const DEFAULT_MAX_LIMIT = 100;

function toInt(value) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number.parseInt(String(value), 10);
  return Number.isFinite(n) ? n : null;
}

function parsePagination(query, { maxLimit = DEFAULT_MAX_LIMIT } = {}) {
  const page = toInt(query?.page);
  const limit = toInt(query?.limit);

  const paginating = Number.isInteger(page) || Number.isInteger(limit);
  if (!paginating) {
    return { paginating: false, page: null, limit: null, skip: 0 };
  }

  const safePage = Math.max(1, page || 1);
  const safeLimit = Math.max(1, Math.min(maxLimit, limit || 10));
  const skip = (safePage - 1) * safeLimit;

  return { paginating: true, page: safePage, limit: safeLimit, skip };
}

module.exports = { parsePagination };

