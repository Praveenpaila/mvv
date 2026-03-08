const { getRedisClient } = require("../config/redis");

const PRODUCTS_VERSION_KEY = "cache:products:ver";

async function getProductsCacheVersion() {
  const redis = await getRedisClient();
  if (!redis) return 1;

  const existing = await redis.get(PRODUCTS_VERSION_KEY);
  if (existing) return Number(existing) || 1;

  await redis.set(PRODUCTS_VERSION_KEY, "1");
  return 1;
}

async function bumpProductsCacheVersion() {
  const redis = await getRedisClient();
  if (!redis) return;
  try {
    await redis.incr(PRODUCTS_VERSION_KEY);
  } catch (_) {
    // ignore cache failures
  }
}

module.exports = { getProductsCacheVersion, bumpProductsCacheVersion };

