type RateLimitEntry = {
  count: number;
  resetTime: number;
};

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(identifier: string): { success: boolean; limit: number; remaining: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry) {
      this.store.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return { success: true, limit: this.maxRequests, remaining: this.maxRequests - 1 };
    }

    if (now > entry.resetTime) {
      this.store.set(identifier, { count: 1, resetTime: now + this.windowMs });
      return { success: true, limit: this.maxRequests, remaining: this.maxRequests - 1 };
    }

    if (entry.count >= this.maxRequests) {
      return { success: false, limit: this.maxRequests, remaining: 0 };
    }

    entry.count += 1;
    return { success: true, limit: this.maxRequests, remaining: this.maxRequests - entry.count };
  }
}

// Global instances for different use cases
export const apiRateLimiter = new RateLimiter(60 * 1000, 20); // 20 requests per minute
export const actionRateLimiter = new RateLimiter(60 * 1000, 5); // 5 actions per minute
