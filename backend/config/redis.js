const { createClient } = require("redis");

let redisClient = null;
let redisConnectPromise = null;

function getRedisUrlFromEnv() {
  if (process.env.REDIS_URL) return process.env.REDIS_URL;
  if (process.env.REDIS_HOST) {
    const port = process.env.REDIS_PORT || "6379";
    return `redis://${process.env.REDIS_HOST}:${port}`;
  }
  return null;
}

async function getRedisClient() {
  const url = getRedisUrlFromEnv();
  if (!url) return null;

  if (redisClient) return redisClient;

  redisClient = createClient({ url });
  redisClient.on("error", (err) => {
    if (process.env.NODE_ENV !== "test") {
      // eslint-disable-next-line no-console
      console.error("[redis] error", err?.message || err);
    }
  });

  if (!redisConnectPromise) {
    redisConnectPromise = redisClient
      .connect()
      .then(() => {
        if (process.env.NODE_ENV !== "test") {
          // eslint-disable-next-line no-console
          console.log("[redis] connected");
        }
      })
      .catch((err) => {
        if (process.env.NODE_ENV !== "test") {
          // eslint-disable-next-line no-console
          console.warn("[redis] connect failed; caching disabled");
        }
        try {
          redisClient?.quit();
        } catch (_) {}
        redisClient = null;
        redisConnectPromise = null;
        return null;
      });
  }

  await redisConnectPromise;
  return redisClient;
}

module.exports = { getRedisClient };

