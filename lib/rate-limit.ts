import { redis } from './redis';



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
        await redis.pexpire(key, this.windowMs);
      }

      if (current > this.maxRequests) {
        return { success: false, limit: this.maxRequests, remaining: 0 };
      }

      return { success: true, limit: this.maxRequests, remaining: this.maxRequests - current };
    } catch (error) {
      console.error("Redis Rate Limiter Error:", error);
      // Fallback to allow on redis failure
      return { success: true, limit: this.maxRequests, remaining: 1 };
    }
  }
}

// Global instances
export const actionRateLimiter = new RedisRateLimiter(60 * 1000, 5); // Node-only (Redis)
export const authRateLimiter = new RedisRateLimiter(15 * 60 * 1000, 5); // Node-only (Redis)
