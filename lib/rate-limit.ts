import { Redis } from "@upstash/redis";

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Redis-backed rate limiter for Node Runtime (Server Actions/APIs)
export class RedisRateLimiter {
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  async check(identifier: string): Promise<{ success: boolean; limit: number; remaining: number }> {
    try {
      const key = `rate_limit:${identifier}`;
      const current = await redis.incr(key);

      if (current === 1) {
        // pexpire not available on @upstash/redis — use expire (seconds)
        await redis.expire(key, Math.ceil(this.windowMs / 1000));
      }

      if (current > this.maxRequests) {
        return { success: false, limit: this.maxRequests, remaining: 0 };
      }

      return { success: true, limit: this.maxRequests, remaining: this.maxRequests - current };
    } catch (error) {
      console.error("Redis Rate Limiter Error:", error);
      // Fallback: allow on redis failure
      return { success: true, limit: this.maxRequests, remaining: 1 };
    }
  }
}

// Global instances
export const actionRateLimiter = new RedisRateLimiter(60 * 1000, 5);        // 5 req/min
export const authRateLimiter   = new RedisRateLimiter(15 * 60 * 1000, 5);  // 5 req/15 min
