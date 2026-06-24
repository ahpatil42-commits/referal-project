import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Edge-compatible rate limiter backed by Upstash Redis.
 *
 * Unlike the previous in-memory Map implementation, this limiter:
 * - Survives Vercel serverless cold starts (state lives in Redis, not memory)
 * - Works correctly across multiple concurrent function instances
 * - Uses a sliding window algorithm for accurate rate limiting
 *
 * Free tier: 10,000 requests/day — sufficient for early-stage traffic.
 *
 * If Upstash credentials are not configured, falls back to allowing all requests
 * (fail-open) so the app never breaks due to a missing rate-limit config.
 */

let upstashRatelimit: Ratelimit | null = null;

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  upstashRatelimit = new Ratelimit({
    redis: new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }),
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    analytics: true,
    prefix: "referralai:api",
  });
}

export const apiRateLimiter = {
  async check(
    identifier: string
  ): Promise<{ success: boolean; limit: number; remaining: number }> {
    if (!upstashRatelimit) {
      // Fail-open: allow request if Upstash is not configured
      return { success: true, limit: 20, remaining: 20 };
    }

    try {
      const result = await upstashRatelimit.limit(identifier);
      return {
        success: result.success,
        limit: result.limit,
        remaining: result.remaining,
      };
    } catch (error) {
      // Fail-open on network errors to avoid blocking legitimate users
      console.error("[RateLimit] Upstash error, failing open:", error);
      return { success: true, limit: 20, remaining: 20 };
    }
  },
};
