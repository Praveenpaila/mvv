const { getRedisClient } = require("../config/redis");

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch (_) {
    return null;
  }
}

function cacheJson({ keyBuilder, ttlSeconds = 60 }) {
  return async (req, res, next) => {
    const redis = await getRedisClient();
    if (!redis) return next();

    let cacheKey;
    try {
      cacheKey = await keyBuilder(req);
    } catch (_) {
      return next();
    }

    if (!cacheKey) return next();

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const body = safeJsonParse(cached);
        if (body) {
          res.setHeader("X-Cache", "HIT");
          return res.status(200).json(body);
        }
      }
    } catch (_) {
      // ignore cache read errors
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      try {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis
            .setEx(cacheKey, ttlSeconds, JSON.stringify(body))
            .catch(() => {});
        }
      } catch (_) {
        // ignore cache write errors
      }
      res.setHeader("X-Cache", "MISS");
      return originalJson(body);
    };

    next();
  };
}

module.exports = { cacheJson };

