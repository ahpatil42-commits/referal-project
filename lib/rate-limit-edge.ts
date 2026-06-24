// In-memory rate limiter for Edge Runtime (Middleware)
export class EdgeRateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(identifier: string): { success: boolean; limit: number; remaining: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetTime) {
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

export const apiRateLimiter = new EdgeRateLimiter(60 * 1000, 20); // Edge-compatible
