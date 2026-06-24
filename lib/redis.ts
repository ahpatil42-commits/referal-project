import Redis from 'ioredis';

const globalForRedis = global as unknown as { redis: Redis | undefined };

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = globalForRedis.redis || new Redis(redisUrl, {
  lazyConnect: true,
});

// Suppress unhandled error events during Next.js build times
redis.on('error', (error) => {
  if (process.env.NODE_ENV === 'development') {
    // console.warn('Redis connection warning:', error.message);
  }
});

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
